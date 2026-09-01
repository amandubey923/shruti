'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  variant?: 'segmented' | 'icon';
}

export function ThemeToggle({ className = '', variant = 'segmented' }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className={`w-10 h-10 rounded-full border border-background-border bg-background-elevated hover:bg-background-hover text-foreground transition-all flex items-center justify-center active:scale-95 shadow-sm ${className}`}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? (
          <Sun className="w-4 h-4 text-accent" />
        ) : (
          <Moon className="w-4 h-4 text-accent" />
        )}
      </button>
    );
  }

  return (
    <div
      role="group"
      aria-label="Color theme selector"
      className={`inline-flex items-center p-1 rounded-full bg-background-elevated border border-background-border text-xs font-medium shadow-inner ${className}`}
    >
      <button
        type="button"
        onClick={() => setTheme('light')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 ${
          theme === 'light'
            ? 'bg-background text-foreground font-bold shadow-sm border border-background-border/80 ring-1 ring-black/5'
            : 'text-foreground-subtle hover:text-foreground'
        }`}
        aria-pressed={theme === 'light'}
      >
        <Sun className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-accent' : ''}`} />
        <span className="hidden sm:inline">Light</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme('dark')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 ${
          theme === 'dark'
            ? 'bg-background text-foreground font-bold shadow-sm border border-background-border/80 ring-1 ring-white/5'
            : 'text-foreground-subtle hover:text-foreground'
        }`}
        aria-pressed={theme === 'dark'}
      >
        <Moon className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-accent' : ''}`} />
        <span className="hidden sm:inline">Dark</span>
      </button>
    </div>
  );
}
