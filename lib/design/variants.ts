/**
 * Component Variants - Using Class Variance Authority
 *
 * ALL component styling must be defined here.
 * Components should ONLY use these variants, never inline className strings.
 */

import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Button Variants
 * Usage: <button className={buttonVariants({ variant: 'primary', size: 'lg' })}>
 */
export const buttonVariants = cva(
  // Base styles (always applied)
  'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 touch-manipulation',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground shadow hover:opacity-90 active:scale-95',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-95',
        outline:
          'border-2 border-border bg-background hover:bg-accent hover:text-accent-foreground active:scale-95',
        ghost:
          'hover:bg-accent hover:text-accent-foreground active:scale-95',
        danger:
          'bg-destructive text-destructive-foreground shadow hover:opacity-90 active:scale-95',
        success:
          'shadow active:scale-95',
        link:
          'text-primary underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-4 text-base min-h-[44px]', // iOS touch-safe
        lg: 'h-14 px-6 text-lg min-h-[44px]',
        icon: 'h-11 w-11 min-h-[44px] min-w-[44px]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

/**
 * Card Variants
 * Usage: <div className={cardVariants({ variant: 'primary', padding: 'md' })}>
 */
export const cardVariants = cva(
  // Base styles
  'rounded-xl border bg-card text-card-foreground transition-all',
  {
    variants: {
      variant: {
        default: 'border-border',
        primary:
          'border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5',
        success:
          'bg-gradient-to-br',
        warning:
          'bg-gradient-to-br',
        danger:
          'bg-gradient-to-br',
        info:
          'bg-gradient-to-br',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      hover: {
        true: 'hover:shadow-lg hover:scale-[1.02] cursor-pointer active:scale-[0.98]',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      hover: false,
    },
  }
);

export type CardVariants = VariantProps<typeof cardVariants>;

/**
 * Badge Variants
 * Usage: <span className={badgeVariants({ variant: 'success' })}>
 */
export const badgeVariants = cva(
  // Base styles
  'inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:
          'border border-primary/30',
        success:
          'border',
        warning:
          'border',
        danger:
          'border',
        info:
          'border',
        outline: 'border border-border bg-background',
        secondary: 'bg-secondary text-secondary-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;

/**
 * Input Variants
 * Usage: <input className={inputVariants({ size: 'lg' })} />
 */
export const inputVariants = cva(
  // Base styles
  'flex w-full rounded-lg border border-border bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all touch-manipulation',
  {
    variants: {
      size: {
        sm: 'h-9 text-sm',
        md: 'h-11 text-base min-h-[44px]', // iOS touch-safe, prevents zoom
        lg: 'h-14 text-lg min-h-[44px]',
      },
      state: {
        default: '',
        error: 'border-destructive focus-visible:ring-destructive',
        success: '',
      },
    },
    defaultVariants: {
      size: 'md',
      state: 'default',
    },
  }
);

export type InputVariants = VariantProps<typeof inputVariants>;

/**
 * Skeleton Variants (for loading states)
 * Usage: <div className={skeletonVariants()} />
 */
export const skeletonVariants = cva(
  'animate-pulse rounded-md bg-muted',
  {
    variants: {
      variant: {
        default: '',
        text: 'h-4 w-full',
        circle: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export type SkeletonVariants = VariantProps<typeof skeletonVariants>;

/**
 * Container Variants (for page layouts)
 * Usage: <div className={containerVariants({ size: 'md' })}>
 */
export const containerVariants = cva(
  'mx-auto w-full',
  {
    variants: {
      size: {
        sm: 'max-w-screen-sm',
        md: 'max-w-screen-md',
        lg: 'max-w-screen-lg',
        xl: 'max-w-screen-xl',
        '2xl': 'max-w-screen-2xl',
        full: 'max-w-full',
      },
      padding: {
        none: 'px-0',
        sm: 'px-4',
        md: 'px-6',
        lg: 'px-8',
      },
    },
    defaultVariants: {
      size: 'lg',
      padding: 'md',
    },
  }
);

export type ContainerVariants = VariantProps<typeof containerVariants>;
