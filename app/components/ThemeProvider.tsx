'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeProviderContext = createContext<ThemeProviderState>({
  theme: 'system',
  setTheme: () => {},
});

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'ui-theme',
}: ThemeProviderProps) {
  // Initialize to defaultTheme; actual theme applied after hydration
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  // On mount: read stored theme and apply
  useEffect(() => {
    const root = window.document.documentElement;
    // Determine preferred theme: stored or default
    const stored = localStorage.getItem(storageKey) as Theme | null;
    const initial = stored || defaultTheme;
    // Determine actual color mode
    const applied = initial === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : initial;
    root.classList.remove('light', 'dark');
    root.classList.add(applied);
    setTheme(initial);
  }, [defaultTheme, storageKey]);

  // When theme state changes: persist and apply
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'system') {
      localStorage.removeItem(storageKey);
      const systemMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.remove('light', 'dark');
      root.classList.add(systemMode);
    } else {
      localStorage.setItem(storageKey, theme);
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
    }
  }, [theme, storageKey]);

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 