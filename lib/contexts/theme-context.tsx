'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  accentColor: string;
  setTheme: (theme: Theme) => void;
  setAccentColor: (color: string) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  defaultAccentColor?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
  defaultAccentColor = '#0BA08B',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [accentColor, setAccentColorState] = useState<string>(defaultAccentColor);

  // Load user's saved theme preference on mount
  useEffect(() => {
    async function loadThemePreference() {
      try {
        const res = await fetch('/api/preferences');
        if (res.ok) {
          const data = await res.json();
          const savedTheme = data.preferences?.theme;
          const savedAccentColor = data.preferences?.accentColor;

          // Only update if values exist in database
          if (savedTheme) setThemeState(savedTheme);
          if (savedAccentColor) setAccentColorState(savedAccentColor);
        }
      } catch {
        // Silently fail and use defaults
        console.log('Could not load theme preference, using defaults');
      }
    }

    loadThemePreference();
  }, []);

  // Apply theme class to HTML element - runs immediately and on theme change
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  // Apply accent color as CSS custom property - runs immediately and on color change
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--user-accent-color', accentColor);
  }, [accentColor]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const setAccentColor = useCallback((color: string) => {
    setAccentColorState(color);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        accentColor,
        setTheme,
        setAccentColor,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
