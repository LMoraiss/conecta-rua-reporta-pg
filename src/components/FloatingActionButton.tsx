
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FloatingActionButtonProps {
  onClick: () => void;
  className?: string;
}

const FloatingActionButton = ({ onClick, className = '' }: FloatingActionButtonProps) => {
  return (
    <Button
      onClick={onClick}
      className={`
        fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full
        bg-accent-blue hover:bg-accent-blue/90
        shadow-lg hover:shadow-xl
        transition-all duration-300 ease-out
        animate-pulse-soft hover:animate-none
        group
        ${className}
      `}
      size="icon"
    >
      <Plus className="h-6 w-6 text-white transition-transform duration-200 group-hover:scale-110" />
      <span className="sr-only">Criar Relatório</span>
    </Button>
  );
};

export default FloatingActionButton;
