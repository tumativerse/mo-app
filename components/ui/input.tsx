import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils/cn';
import { inputVariants } from '@/lib/design/variants';

export interface InputProps
  extends
    Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {}

/**
 * Input Component
 *
 * A flexible input field with variants for different sizes and states.
 * Mobile-safe with 16px base font size to prevent iOS zoom.
 *
 * @example
 * <Input type="text" placeholder="Enter name" size="md" />
 * <Input type="email" state="error" />
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, size, state, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ size, state, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
