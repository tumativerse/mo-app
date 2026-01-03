'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

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
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true); // This is the recommended pattern by next-themes to prevent hydration mismatch
  }, []);

  // Use systemTheme as fallback for SSR
  const currentTheme = theme === 'system' ? systemTheme : theme;

  // Show nothing on server to prevent hydration mismatch
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" aria-label="Toggle theme">
        <div className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
      aria-label={`Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} theme`}
    >
      {currentTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}
