'use client';

/**
 * Theme Provider using next-themes
 *
 * Provides:
 * - Light/dark theme switching (SSR-safe via next-themes)
 * - Custom accent color support
 * - Loads user preferences from API (only when authenticated)
 */

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { useUser } from '@clerk/nextjs';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';

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
  const { isLoaded, isSignedIn } = useUser();
  const [accentColor, setAccentColorState] = useState<string>(defaultAccentColor);
  const hasLoadedPreferences = useRef(false);

  // Load user's saved theme and accent color preference ONLY when authenticated
  useEffect(() => {
    // Don't call API until Clerk has loaded
    if (!isLoaded) return;

    // Don't call API if user is not signed in
    if (!isSignedIn) return;

    // Don't load preferences multiple times
    if (hasLoadedPreferences.current) return;

    hasLoadedPreferences.current = true;
    let mounted = true;

    async function loadPreferences() {
      try {
        const res = await fetch('/api/preferences', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!mounted) return; // Component unmounted during fetch

        if (res.ok) {
          const data = await res.json();
          const savedAccentColor = data.preferences?.accentColor;

          if (savedAccentColor && mounted) {
            setAccentColorState(savedAccentColor);
          }
        }
        // If API fails (404, 500, etc), just use defaults
      } catch {
        // Silently fail and use defaults
      }
    }

    loadPreferences();

    return () => {
      mounted = false;
    };
  }, [isLoaded, isSignedIn]);

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
