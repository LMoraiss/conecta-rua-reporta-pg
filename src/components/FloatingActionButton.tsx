
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface FloatingActionButtonProps {
  onClick: () => void;
}

const FloatingActionButton = ({ onClick }: FloatingActionButtonProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onClick}
            size="lg"
            className="fixed bottom-20 md:bottom-6 right-4 md:right-6 h-14 w-14 md:h-16 md:w-16 rounded-full shadow-lg bg-gradient-to-r from-primary to-secondary hover:shadow-xl transition-all duration-300 hover:scale-110 animate-pulse z-40 touch-manipulation"
            style={{ animationDuration: '3s' }}
          >
            <Plus className="h-6 w-6 md:h-7 md:w-7 text-white" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="hidden md:block">
          <p>Criar Novo Relatório</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default FloatingActionButton;
