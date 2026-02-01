import type { Theme } from "./common";

export interface ThemeState {
  readonly current: Theme;
  readonly systemPreference: "light" | "dark";
  readonly isInitialized: boolean;
}

export interface ThemeContextValue {
  readonly theme: Theme;
  readonly effectiveTheme: "light" | "dark";
  readonly setTheme: (theme: Theme) => void;
  readonly toggleTheme: () => void;
  readonly isSystemDark: boolean;
}

export interface ThemeConfig {
  readonly storageKey: string;
  readonly attribute: string;
  readonly defaultTheme: Theme;
  readonly enableSystemDetection: boolean;
}

export type ThemeChangeHandler = (
  theme: Theme,
  effectiveTheme: "light" | "dark"
) => void;
