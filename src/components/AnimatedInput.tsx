
import React, { useState } from 'react';
import { Input, InputProps } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface AnimatedInputProps extends InputProps {
  label?: string;
  error?: string;
}

const AnimatedInput = React.forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ className, label, error, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false);
      setHasValue(!!e.target.value);
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value);
      props.onChange?.(e);
    };

    return (
      <div className="relative">
        <div className="relative">
          <Input
            ref={ref}
            className={cn(
              'peer transition-all duration-200',
              'focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue',
              'hover:border-accent-blue/50',
              label && 'pt-6 pb-2',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
              className
            )}
            {...props}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            placeholder={label ? '' : props.placeholder}
          />
          
          {label && (
            <Label
              className={cn(
                'absolute left-3 transition-all duration-200 pointer-events-none',
                'peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-muted-foreground',
                (focused || hasValue) 
                  ? 'top-1.5 text-xs text-accent-blue font-medium' 
                  : 'top-3 text-base text-muted-foreground'
              )}
            >
              {label}
            </Label>
          )}
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-red-600 animate-fade-in">
            {error}
          </p>
        )}
      </div>
    );
  }
);

AnimatedInput.displayName = 'AnimatedInput';

export default AnimatedInput;
