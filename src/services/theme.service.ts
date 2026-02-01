import type {
  Theme,
  ThemeChangeHandler,
  ThemeConfig,
  ThemeState,
} from "../types";

class ThemeService {
  private readonly config: ThemeConfig = {
    storageKey: "theme",
    attribute: "data-bs-theme",
    defaultTheme: "auto",
    enableSystemDetection: true,
  } as const;

  private state: ThemeState = {
    current: this.config.defaultTheme,
    systemPreference: "light",
    isInitialized: false,
  };

  private readonly changeHandlers = new Set<ThemeChangeHandler>();
  private mediaQuery: MediaQueryList | null = null;

  constructor() {
    this.initializeMediaQuery();
    this.initializeTheme();
  }

  public initialize(): void {
    if (this.state.isInitialized) {
      return;
    }

    this.initializeTheme();
    this.state = { ...this.state, isInitialized: true };
  }

  public getCurrentTheme(): Theme {
    return this.state.current;
  }

  public getEffectiveTheme(): "light" | "dark" {
    if (this.state.current === "auto") {
      return this.state.systemPreference;
    }
    return this.state.current;
  }

  public getSystemPreference(): "light" | "dark" {
    return this.state.systemPreference;
  }

  public setTheme(theme: Theme): void {
    if (theme === this.state.current) {
      return;
    }

    this.state = { ...this.state, current: theme };
    this.persistTheme(theme);
    this.applyTheme();
    this.notifyChangeHandlers();
  }

  public toggleTheme(): void {
    const currentEffective = this.getEffectiveTheme();
    const newTheme: Theme = currentEffective === "light" ? "dark" : "light";
    this.setTheme(newTheme);
  }

  public subscribe(handler: ThemeChangeHandler): () => void {
    this.changeHandlers.add(handler);

    return () => {
      this.changeHandlers.delete(handler);
    };
  }

  public isSystemDark(): boolean {
    return this.state.systemPreference === "dark";
  }

  private initializeMediaQuery(): void {
    if (!this.config.enableSystemDetection || typeof window === "undefined") {
      return;
    }

    try {
      this.mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      this.updateSystemPreference();

      this.mediaQuery.addEventListener(
        "change",
        this.handleSystemPreferenceChange
      );
    } catch (error) {
      console.warn(
        "Failed to initialize media query for theme detection:",
        error
      );
    }
  }

  private readonly handleSystemPreferenceChange = (): void => {
    this.updateSystemPreference();

    if (this.state.current === "auto") {
      this.applyTheme();
      this.notifyChangeHandlers();
    }
  };

  private updateSystemPreference(): void {
    const prefersDark = this.mediaQuery?.matches ?? false;
    this.state = {
      ...this.state,
      systemPreference: prefersDark ? "dark" : "light",
    };
  }

  private initializeTheme(): void {
    const savedTheme = this.loadTheme();
    this.state = { ...this.state, current: savedTheme };
    this.applyTheme();
  }

  private loadTheme(): Theme {
    if (typeof window === "undefined") {
      return this.config.defaultTheme;
    }

    try {
      const saved = localStorage.getItem(this.config.storageKey);
      if (saved && this.isValidTheme(saved)) {
        return saved as Theme;
      }
    } catch (error) {
      console.warn("Failed to load theme from localStorage:", error);
    }

    return this.config.defaultTheme;
  }

  private persistTheme(theme: Theme): void {
    if (typeof window === "undefined") {
      return;
    }

    try {
      localStorage.setItem(this.config.storageKey, theme);
    } catch (error) {
      console.warn("Failed to persist theme to localStorage:", error);
    }
  }

  private applyTheme(): void {
    if (typeof document === "undefined") {
      return;
    }

    const effectiveTheme = this.getEffectiveTheme();
    document.documentElement.setAttribute(
      this.config.attribute,
      effectiveTheme
    );
  }

  private notifyChangeHandlers(): void {
    const theme = this.state.current;
    const effectiveTheme = this.getEffectiveTheme();

    this.changeHandlers.forEach(handler => {
      try {
        handler(theme, effectiveTheme);
      } catch (error) {
        console.error("Error in theme change handler:", error);
      }
    });
  }

  private isValidTheme(value: string): value is Theme {
    return ["light", "dark", "auto"].includes(value);
  }

  public destroy(): void {
    if (this.mediaQuery) {
      this.mediaQuery.removeEventListener(
        "change",
        this.handleSystemPreferenceChange
      );
      this.mediaQuery = null;
    }
    this.changeHandlers.clear();
  }
}

export const themeService = new ThemeService();

export { ThemeService };
