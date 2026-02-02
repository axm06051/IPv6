import { useEffect } from 'react';

export function useTheme() {
  useEffect(() => {
    const determineTheme = (themeValue) => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return themeValue === 'auto' ? (prefersDark ? 'dark' : 'light') : themeValue;
    };

    const applyTheme = (themeValue) => {
      const theme = determineTheme(themeValue);
      document.documentElement.setAttribute('data-bs-theme', theme);
    };

    const getSavedTheme = () => localStorage.getItem('theme') || 'auto';

    const setupAutoThemeListener = () => {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme('auto');
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    };

    const savedTheme = getSavedTheme();
    applyTheme(savedTheme);

    if (savedTheme === 'auto') {
      return setupAutoThemeListener();
    }
  }, []);
}