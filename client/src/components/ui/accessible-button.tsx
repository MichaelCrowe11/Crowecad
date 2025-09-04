/**
 * Accessible Button component using React Aria Components
 * Provides comprehensive accessibility features including:
 * - ARIA attributes
 * - Keyboard navigation
 * - Focus management
 * - Screen reader support
 */

import { Button as AriaButton, ButtonProps as AriaButtonProps } from 'react-aria-components';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface AccessibleButtonProps extends AriaButtonProps {
  variant?: 'default' | 'secondary' | 'ghost' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
}

const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ variant = 'default', size = 'md', className, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
    
    const variantStyles = {
      default: 'bg-blue-600 text-white hover:bg-blue-700',
      secondary: 'bg-slate-700 text-white hover:bg-slate-600',
      ghost: 'hover:bg-slate-800 hover:text-white',
      destructive: 'bg-red-600 text-white hover:bg-red-700',
      outline: 'border border-slate-700 bg-transparent hover:bg-slate-800'
    };
    
    const sizeStyles = {
      sm: 'h-9 px-3 text-sm',
      md: 'h-10 px-4 py-2',
      lg: 'h-11 px-8'
    };
    
    return (
      <AriaButton
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </AriaButton>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';

export { AccessibleButton };