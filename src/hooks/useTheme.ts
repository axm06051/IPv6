import { useCallback, useEffect, useState } from "react";
import { themeService } from "../services";
import type { Theme, ThemeContextValue } from "../types";

export function useTheme(): ThemeContextValue {
  const [theme, setThemeState] = useState<Theme>(() =>
    themeService.getCurrentTheme()
  );
  const [effectiveTheme, setEffectiveTheme] = useState<"light" | "dark">(() =>
    themeService.getEffectiveTheme()
  );

  const setTheme = useCallback((newTheme: Theme): void => {
    themeService.setTheme(newTheme);
  }, []);

  const toggleTheme = useCallback((): void => {
    themeService.toggleTheme();
  }, []);

  const isSystemDark = themeService.isSystemDark();

  useEffect(() => {
    themeService.initialize();

    const unsubscribe = themeService.subscribe(
      (newTheme, newEffectiveTheme) => {
        setThemeState(newTheme);
        setEffectiveTheme(newEffectiveTheme);
      }
    );

    return unsubscribe;
  }, []);

  return {
    theme,
    effectiveTheme,
    setTheme,
    toggleTheme,
    isSystemDark,
  } as const;
}
