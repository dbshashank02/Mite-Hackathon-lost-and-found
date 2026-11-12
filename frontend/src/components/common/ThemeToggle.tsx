'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    if (localStorage.getItem('findit-theme') === 'light') {
      root.classList.remove('dark');
      setIsDark(false);
    } else {
      root.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove('dark');
      localStorage.setItem('findit-theme', 'light');
      setIsDark(false);
    } else {
      root.classList.add('dark');
      localStorage.setItem('findit-theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle Theme"
      className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white dark:hover:text-white transition-colors border border-hairline hover:bg-white/10 dark:hover:bg-white/10"
      title={isDark ? 'Switch to Studio Light' : 'Switch to Deep Obsidian'}
    >
      {isDark ? (
        <Sun className="w-3.5 h-3.5 text-amber-400" />
      ) : (
        <Moon className="w-3.5 h-3.5 text-slate-800" />
      )}
    </button>
  );
};
