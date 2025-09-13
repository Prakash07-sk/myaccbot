import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
    console.log('Theme toggled to:', !isDark ? 'dark' : 'light');
  };

  return (
    <Button
      onClick={toggleTheme}
      size="icon"
      variant="ghost"
      className="rounded-full hover-elevate"
      data-testid="button-theme-toggle"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-yellow-500" />
      ) : (
        <Moon className="w-4 h-4 text-blue-400" />
      )}
    </Button>
  );
}