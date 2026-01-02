'use client';

/**
 * Theme Provider using next-themes
 *
 * Provides:
 * - Light/dark theme switching (SSR-safe via next-themes)
 * - Custom accent color support
 * - Loads user preferences from API
 */

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

interface ThemeContextType {
  accentColor: string;
  setAccentColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface CustomThemeProviderProps {
  children: ReactNode;
  defaultAccentColor?: string;
}

export function ThemeProvider({
  children,
  defaultAccentColor = '#f97316', // Orange default
  ...props
}: CustomThemeProviderProps & Omit<ThemeProviderProps, 'children'>) {
  const [accentColor, setAccentColorState] = useState<string>(defaultAccentColor);

  // Load user's saved theme and accent color preference on mount
  useEffect(() => {
    async function loadPreferences() {
      try {
        const res = await fetch('/api/preferences');
        if (res.ok) {
          const data = await res.json();
          const savedAccentColor = data.preferences?.accentColor;

          if (savedAccentColor) {
            setAccentColorState(savedAccentColor);
          }
        }
      } catch {
        // Silently fail and use defaults
        console.log('Could not load accent color preference, using default');
      }
    }

    loadPreferences();
  }, []);

  // Apply accent color as CSS custom property
  useEffect(() => {
    // useEffect only runs on client, safe to modify DOM
    const root = document.documentElement;
    root.style.setProperty('--user-accent-color', accentColor);
  }, [accentColor]);

  const setAccentColor = useCallback((color: string) => {
    setAccentColorState(color);
  }, []);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange={false}
      {...props}
    >
      <ThemeContext.Provider
        value={{
          accentColor,
          setAccentColor,
        }}
      >
        {children}
      </ThemeContext.Provider>
    </NextThemesProvider>
  );
}

/**
 * Hook to access accent color context
 * Use next-themes useTheme() hook for theme switching
 */
export function useAccentColor() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useAccentColor must be used within a ThemeProvider');
  }
  return context;
}
