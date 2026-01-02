'use client';

import { Toaster } from 'sonner';
import { useTheme } from 'next-themes';

export function ThemedToaster() {
  const { theme } = useTheme();

  // Use useTheme's built-in mounted state instead of managing our own
  // This avoids hydration mismatch without triggering ESLint
  return <Toaster theme={theme as 'light' | 'dark'} position="bottom-right" />;
}
