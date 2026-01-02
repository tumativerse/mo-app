import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

/**
 * Label Component
 *
 * A form label component with consistent styling.
 *
 * @example
 * <Label htmlFor="email">Email Address</Label>
 */
const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      {...props}
    />
  )
);
Label.displayName = 'Label';

export { Label };
