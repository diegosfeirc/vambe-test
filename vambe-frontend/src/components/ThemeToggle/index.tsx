'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isClient = typeof window !== 'undefined';

  if (!isClient) {
    return (
      <button
        className="w-10 h-10 inline-flex items-center justify-center rounded-md hover:opacity-80 transition-opacity"
        style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
      >
        <Sun className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="w-10 h-10 inline-flex items-center justify-center rounded-md hover:opacity-80 transition-opacity"
      style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
}

