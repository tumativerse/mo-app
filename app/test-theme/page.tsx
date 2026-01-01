'use client';

import { useTheme } from 'next-themes';
import { useAccentColor } from '@/lib/contexts/theme-provider';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sun, Moon } from 'lucide-react';

/**
 * Theme Test Page
 *
 * Tests all components in both light and dark themes.
 * Verifies that the design system is working correctly.
 */
export default function ThemeTestPage() {
  const { theme, setTheme } = useTheme();
  const { accentColor } = useAccentColor();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header with theme toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">
              Theme System Test
            </h1>
            <p className="text-muted-foreground mt-2">
              Current theme: {theme} | Accent color: {accentColor}
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>

        {/* Button Variants */}
        <Card>
          <CardHeader>
            <CardTitle>Button Variants</CardTitle>
            <CardDescription>All button styles and sizes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="success">Success</Button>
              <Button variant="link">Link</Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="primary" size="sm">Small</Button>
              <Button variant="primary" size="md">Medium</Button>
              <Button variant="primary" size="lg">Large</Button>
              <Button variant="primary" size="icon">
                <Sun className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Card Variants */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card variant="default">
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
              <CardDescription>Standard card style</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This is a default card with standard styling.
              </p>
            </CardContent>
          </Card>

          <Card variant="primary">
            <CardHeader>
              <CardTitle>Primary Card</CardTitle>
              <CardDescription>Highlighted with gradient</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This card has a primary gradient background.
              </p>
            </CardContent>
          </Card>

          <Card variant="success">
            <CardHeader>
              <CardTitle>Success Card</CardTitle>
              <CardDescription>Success state</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This card indicates a successful state.
              </p>
            </CardContent>
          </Card>

          <Card variant="warning">
            <CardHeader>
              <CardTitle>Warning Card</CardTitle>
              <CardDescription>Warning state</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This card shows a warning message.
              </p>
            </CardContent>
          </Card>

          <Card variant="danger">
            <CardHeader>
              <CardTitle>Danger Card</CardTitle>
              <CardDescription>Error or danger state</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This card indicates an error or danger.
              </p>
            </CardContent>
          </Card>

          <Card variant="info">
            <CardHeader>
              <CardTitle>Info Card</CardTitle>
              <CardDescription>Informational state</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This card displays informational content.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Hover Card */}
        <Card variant="default" hover>
          <CardHeader>
            <CardTitle>Hover Card</CardTitle>
            <CardDescription>Hover over this card</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This card has hover effects enabled. It will scale and show shadow on hover.
            </p>
          </CardContent>
        </Card>

        {/* Badge Variants */}
        <Card>
          <CardHeader>
            <CardTitle>Badge Variants</CardTitle>
            <CardDescription>Status indicators and labels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Default</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="danger">Danger</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="secondary">Secondary</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Loading States */}
        <Card>
          <CardHeader>
            <CardTitle>Loading States</CardTitle>
            <CardDescription>Skeleton components for loading</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton variant="text" />
              <Skeleton variant="text" className="w-4/5" />
              <Skeleton variant="text" className="w-3/5" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton variant="circle" className="h-12 w-12" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Touch Targets */}
        <Card>
          <CardHeader>
            <CardTitle>Mobile Touch Targets</CardTitle>
            <CardDescription>All interactive elements meet 44px minimum</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button size="md">Touch Safe (44px min)</Button>
              <Button size="lg">Large Touch (56px)</Button>
              <Button size="icon">Icon (44px)</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
