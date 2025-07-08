
import React, { useState } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnimatedButtonProps extends ButtonProps {
  loading?: boolean;
  success?: boolean;
  children: React.ReactNode;
}

const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ className, loading, success, children, ...props }, ref) => {
    const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (props.disabled || loading) return;
      
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const newRipple = { x, y, id: Date.now() };
      
      setRipples(prev => [...prev, newRipple]);
      
      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
      }, 600);
      
      props.onClick?.(e);
    };

    return (
      <Button
        ref={ref}
        className={cn(
          'relative overflow-hidden transition-all duration-200',
          'hover:scale-105 hover:shadow-glow',
          'active:scale-95',
          success && 'bg-green-600 hover:bg-green-700',
          className
        )}
        {...props}
        onClick={handleClick}
      >
        {ripples.map(ripple => (
          <span
            key={ripple.id}
            className="absolute rounded-full bg-white/30 animate-ripple pointer-events-none"
            style={{
              left: ripple.x - 2,
              top: ripple.y - 2,
              width: 4,
              height: 4,
            }}
          />
        ))}
        
        <span className="relative flex items-center gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {success && <Check className="h-4 w-4 animate-check-in" />}
          {!loading && !success && children}
          {(loading || success) && (
            <span className={cn(
              'transition-opacity duration-200',
              (loading || success) ? 'opacity-0' : 'opacity-100'
            )}>
              {children}
            </span>
          )}
        </span>
      </Button>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';

export default AnimatedButton;
