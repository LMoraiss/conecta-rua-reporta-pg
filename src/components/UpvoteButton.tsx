
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
      // This will be implemented once we create the upvotes table
      // For now, showing placeholder functionality
      setUpvoteCount(Math.floor(Math.random() * 5)); // Placeholder
      setHasUpvoted(false);
    } catch (error) {
      console.error('Error fetching upvote data:', error);
    }
  };

  const handleUpvote = async () => {
    if (!session) {
      toast.error('Você precisa fazer login para votar');
      return;
    }

    setLoading(true);
    try {
      // This will be implemented once we create the upvotes table
      if (hasUpvoted) {
        // Remove upvote
        setUpvoteCount(prev => prev - 1);
        setHasUpvoted(false);
        toast.success('Voto removido');
      } else {
        // Add upvote
        setUpvoteCount(prev => prev + 1);
        setHasUpvoted(true);
        toast.success('Voto adicionado!');
      }
      
      onUpvoteChange?.(upvoteCount + (hasUpvoted ? -1 : 1));
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
