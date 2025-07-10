
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface UpvoteButtonProps {
  reportId: string;
  session?: Session | null;
  onUpvoteChange?: (count: number) => void;
}

export const UpvoteButton = ({ reportId, session, onUpvoteChange }: UpvoteButtonProps) => {
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch upvote count and user's upvote status
  const fetchUpvoteData = async () => {
    try {
      // Get total upvote count
      const { count, error: countError } = await supabase
        .from('report_upvotes')
        .select('*', { count: 'exact', head: true })
        .eq('report_id', reportId);

      if (countError) {
        console.error('Error fetching upvote count:', countError);
        return;
      }

      const totalCount = count || 0;
      setUpvoteCount(totalCount);
      onUpvoteChange?.(totalCount);

      // Check if current user has upvoted
      if (session?.user?.id) {
        const { data: userUpvote, error: userError } = await supabase
          .from('report_upvotes')
          .select('id')
          .eq('report_id', reportId)
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (userError) {
          console.error('Error checking user upvote:', userError);
          return;
        }

        setHasUpvoted(!!userUpvote);
      }
    } catch (error) {
      console.error('Error in fetchUpvoteData:', error);
    }
  };

  useEffect(() => {
    fetchUpvoteData();

    // Subscribe to real-time changes
    const channel = supabase
      .channel(`upvotes_${reportId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'report_upvotes',
          filter: `report_id=eq.${reportId}`
        }, 
        () => {
          fetchUpvoteData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [reportId, session?.user?.id]);

  const handleUpvote = async () => {
    if (!session) {
      toast.error('Você precisa fazer login para curtir um relatório');
      return;
    }

    setLoading(true);

    try {
      if (hasUpvoted) {
        // Remove upvote
        const { error } = await supabase
          .from('report_upvotes')
          .delete()
          .eq('report_id', reportId)
          .eq('user_id', session.user.id);

        if (error) {
          console.error('Error removing upvote:', error);
          toast.error('Erro ao remover curtida');
        } else {
          toast.success('Curtida removida');
        }
      } else {
        // Add upvote
        const { error } = await supabase
          .from('report_upvotes')
          .insert({
            report_id: reportId,
            user_id: session.user.id
          });

        if (error) {
          console.error('Error adding upvote:', error);
          toast.error('Erro ao curtir relatório');
        } else {
          toast.success('Relatório curtido!');
        }
      }
    } catch (error) {
      console.error('Error in handleUpvote:', error);
      toast.error('Erro ao processar curtida');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={hasUpvoted ? "default" : "outline"}
      size="sm"
      onClick={handleUpvote}
      disabled={loading}
      className={`h-7 px-2 text-xs transition-all duration-200 ${
        hasUpvoted 
          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
          : 'hover:bg-blue-50 text-blue-600 border-blue-200'
      }`}
    >
      <ThumbsUp className={`h-3 w-3 mr-1 ${hasUpvoted ? 'fill-current' : ''}`} />
      {upvoteCount}
    </Button>
  );
};
