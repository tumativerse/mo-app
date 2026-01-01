import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils/cn';
import { skeletonVariants } from '@/lib/design/variants';

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

/**
 * Skeleton Component
 *
 * A loading placeholder component that animates to indicate content is loading.
 * Supports different variants for text, circles, and custom shapes.
 *
 * @example
 * <Skeleton variant="text" />
 * <Skeleton variant="circle" className="w-12 h-12" />
 * <Skeleton className="h-4 w-full" />
 */
function Skeleton({ className, variant, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(skeletonVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Skeleton, skeletonVariants };
