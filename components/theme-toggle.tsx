'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium opacity-50 cursor-not-allowed"
        disabled
        aria-label="Loading theme toggle"
      />
    );
  }

  const isDark = theme === "dark";

  const handleThemeChange = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      onClick={handleThemeChange}
      type="button"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="
        w-full h-10
        flex items-center gap-2
        rounded-md px-3
        border border-input 
        bg-background 
        hover:bg-accent hover:text-accent-foreground
        dark:bg-input/30 dark:border-input dark:hover:bg-input/50
        transition-colors cursor-pointer
      "
    >
      {isDark ? (
        <>
          <Sun className="h-4 w-4" />
          <span>Switch to Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4" />
          <span>Switch to Dark Mode</span>
        </>
      )}
    </button>
  );
}