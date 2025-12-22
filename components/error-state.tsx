'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retrying?: boolean;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'Failed to load data. Please try again.',
  onRetry,
  retrying = false,
  className = '',
}: ErrorStateProps) {
  return (
    <Card className={className}>
      <CardContent className="py-12 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
        <h2 className="mb-2 text-lg font-semibold">{title}</h2>
        <p className="text-muted-foreground mb-4">{message}</p>
        {onRetry && (
          <Button
            variant="outline"
            onClick={onRetry}
            disabled={retrying}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${retrying ? 'animate-spin' : ''}`} />
            {retrying ? 'Retrying...' : 'Try again'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
