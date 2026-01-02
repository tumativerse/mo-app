'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Theme Toggle Component
 *
 * Allows users to switch between light and dark themes.
 * Uses next-themes for SSR-safe theme management.
 *
 * @example
 * <ThemeToggle />
 */
export function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();

  // Use systemTheme as fallback for SSR
  const currentTheme = theme === 'system' ? systemTheme : theme;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
      aria-label={`Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} theme`}
      suppressHydrationWarning
    >
      {currentTheme === 'dark' ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
}
