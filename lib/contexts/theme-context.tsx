"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

type Theme = "light" | "dark";

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
  defaultTheme = "dark",
  defaultAccentColor = "#0BA08B",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [accentColor, setAccentColorState] = useState<string>(defaultAccentColor);
  const [isLoading, setIsLoading] = useState(true);

  // Load user's saved theme preference on mount
  useEffect(() => {
    async function loadThemePreference() {
      try {
        const res = await fetch("/api/preferences");
        if (res.ok) {
          const data = await res.json();
          const savedTheme = data.preferences?.theme || defaultTheme;
          const savedAccentColor = data.preferences?.accentColor || defaultAccentColor;

          setThemeState(savedTheme);
          setAccentColorState(savedAccentColor);
        }
      } catch (error) {
        // Silently fail and use defaults
        console.log("Could not load theme preference, using defaults");
      } finally {
        setIsLoading(false);
      }
    }

    loadThemePreference();
  }, [defaultTheme, defaultAccentColor]);

  // Apply theme class to HTML element
  useEffect(() => {
    if (!isLoading) {
      const root = document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(theme);
    }
  }, [theme, isLoading]);

  // Apply accent color as CSS custom property
  useEffect(() => {
    if (!isLoading) {
      const root = document.documentElement;
      root.style.setProperty("--user-accent-color", accentColor);
    }
  }, [accentColor, isLoading]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const setAccentColor = useCallback((color: string) => {
    setAccentColorState(color);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "light" ? "dark" : "light"));
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
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
