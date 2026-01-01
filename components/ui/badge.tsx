import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils/cn';
import { badgeVariants } from '@/lib/design/variants';

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

/**
 * Badge Component
 *
 * A small label component for displaying status, categories, or other metadata.
 * Supports different variants for different semantic meanings.
 *
 * @example
 * <Badge variant="success">Completed</Badge>
 * <Badge variant="warning">In Progress</Badge>
 * <Badge variant="danger">Failed</Badge>
 */
function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
