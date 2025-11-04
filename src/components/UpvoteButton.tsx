
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Session } from '@supabase/supabase-js';

interface UpvoteButtonProps {
  reportId: string;
  session: Session | null;
  onUpvoteChange?: (newCount: number) => void;
}

export const UpvoteButton = ({ reportId, session, onUpvoteChange }: UpvoteButtonProps) => {
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUpvoteData();
  }, [reportId, session]);

  const fetchUpvoteData = async () => {
    try {
      console.log('Fetching upvote data for report:', reportId);
      
      // Get upvote count using the database function
      const { data: countData, error: countError } = await supabase
        .rpc('get_upvote_count', { report_id_param: reportId });

      if (countError) {
        console.error('Error fetching upvote count:', countError);
        return;
      }

      setUpvoteCount(countData || 0);
      console.log('Upvote count:', countData);

      // Check if current user has upvoted (anonymous or logged in)
      let userId = session?.user?.id;
      if (!userId) {
        // Get or create anonymous user ID
        let anonymousUserId = localStorage.getItem('anonymous_user_id');
        if (!anonymousUserId) {
          anonymousUserId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem('anonymous_user_id', anonymousUserId);
        }
        userId = anonymousUserId;
      }

      const { data: hasUpvotedData, error: hasUpvotedError } = await supabase
        .rpc('check_user_upvote', { 
          report_id_param: reportId, 
          user_id_param: userId 
        });

      if (hasUpvotedError) {
        console.error('Error checking user upvote:', hasUpvotedError);
        return;
      }

      setHasUpvoted(hasUpvotedData || false);
      console.log('User has upvoted:', hasUpvotedData);
    } catch (error) {
      console.error('Error fetching upvote data:', error);
    }
  };

  const handleUpvote = async () => {
    // Generate anonymous user ID from localStorage or create new one
    let anonymousUserId = localStorage.getItem('anonymous_user_id');
    if (!anonymousUserId) {
      anonymousUserId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('anonymous_user_id', anonymousUserId);
    }

    const userId = session?.user?.id || anonymousUserId;

    setLoading(true);
    try {
      if (hasUpvoted) {
        // Remove upvote
        const { error } = await supabase
          .rpc('remove_upvote', { 
            report_id_param: reportId, 
            user_id_param: userId 
          });

        if (error) {
          console.error('Error removing upvote:', error);
          toast.error('Erro ao remover voto');
          return;
        }

        setUpvoteCount(prev => prev - 1);
        setHasUpvoted(false);
        toast.success('Voto removido');
        onUpvoteChange?.(upvoteCount - 1);
      } else {
        // Add upvote
        const { error } = await supabase
          .rpc('add_upvote', { 
            report_id_param: reportId, 
            user_id_param: userId 
          });

        if (error) {
          console.error('Error adding upvote:', error);
          toast.error('Erro ao votar');
          return;
        }

        setUpvoteCount(prev => prev + 1);
        setHasUpvoted(true);
        toast.success('Voto adicionado!');
        onUpvoteChange?.(upvoteCount + 1);
      }
    } catch (error) {
      console.error('Error toggling upvote:', error);
      toast.error('Erro ao votar');
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
      className={`flex items-center gap-1 transition-all duration-200 hover:scale-105 ${
        hasUpvoted 
          ? 'bg-accent-blue text-white hover:bg-accent-blue/90' 
          : 'hover:bg-accent-blue/10 hover:text-accent-blue'
      }`}
    >
      <ThumbsUp className={`h-4 w-4 ${loading ? 'animate-pulse' : ''}`} />
      <span className="text-sm font-medium">{upvoteCount}</span>
      {upvoteCount > 0 && (
        <span className="text-xs opacity-75">
          {upvoteCount === 1 ? 'pessoa' : 'pessoas'}
        </span>
      )}
    </Button>
  );
};
