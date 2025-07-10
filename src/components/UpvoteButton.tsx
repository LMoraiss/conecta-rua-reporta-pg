
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
      // Get total upvote count using raw SQL since report_upvotes is new
      const { data: countData, error: countError } = await supabase
        .rpc('get_upvote_count', { report_id_param: reportId })
        .single();

      if (!countError && countData) {
        const totalCount = countData || 0;
        setUpvoteCount(totalCount);
        onUpvoteChange?.(totalCount);
      }

      // Check if current user has upvoted
      if (session?.user?.id) {
        const { data: userUpvoteData, error: userError } = await supabase
          .rpc('check_user_upvote', { 
            report_id_param: reportId, 
            user_id_param: session.user.id 
          })
          .single();

        if (!userError) {
          setHasUpvoted(!!userUpvoteData);
        }
      }
    } catch (error) {
      console.error('Error in fetchUpvoteData:', error);
      // Fallback: just show 0 upvotes
      setUpvoteCount(0);
      setHasUpvoted(false);
    }
  };

  useEffect(() => {
    fetchUpvoteData();

    // Subscribe to real-time changes for this specific report
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
        // Remove upvote using RPC
        const { error } = await supabase.rpc('remove_upvote', {
          report_id_param: reportId,
          user_id_param: session.user.id
        });

        if (error) {
          console.error('Error removing upvote:', error);
          toast.error('Erro ao remover curtida');
        } else {
          toast.success('Curtida removida');
        }
      } else {
        // Add upvote using RPC
        const { error } = await supabase.rpc('add_upvote', {
          report_id_param: reportId,
          user_id_param: session.user.id
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
