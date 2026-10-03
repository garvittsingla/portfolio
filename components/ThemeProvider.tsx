"use client";

import React, { createContext, useContext, useEffect, useSyncExternalStore } from "react";

export type Theme = "light" | "dark";
export type BackgroundStyle = "lined" | "dots";

export interface DotGridConfig {
  opacity: number; // 0.04 to 0.40
  size: number;    // 0.8 to 2.5 (px)
  spacing: number; // 16 to 40 (px)
}

const DEFAULT_LIGHT_CONFIG: DotGridConfig = {
  opacity: 0.12,
  size: 1.2,
  spacing: 24,
};

const DEFAULT_DARK_CONFIG: DotGridConfig = {
  opacity: 0.15,
  size: 1.2,
  spacing: 24,
};

interface StoreState {
  theme: Theme;
  dotConfig: DotGridConfig;
  backgroundStyle: BackgroundStyle;
}

let store: StoreState = {
  theme: "light",
  dotConfig: DEFAULT_LIGHT_CONFIG,
  backgroundStyle: "lined",
};

let isInitialized = false;

function initStoreIfNeeded() {
  if (typeof window === "undefined" || isInitialized) return;
  isInitialized = true;
  try {
    const storedTheme = localStorage.getItem("portfolio_theme") as Theme | null;
    const storedConfig = localStorage.getItem("portfolio_dot_config");
    const storedBgStyle = localStorage.getItem("portfolio_bg_style") as BackgroundStyle | null;

    let activeTheme: Theme = "light";
    if (storedTheme === "light" || storedTheme === "dark") {
      activeTheme = storedTheme;
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      activeTheme = "dark";
    }

    let config = activeTheme === "dark" ? DEFAULT_DARK_CONFIG : DEFAULT_LIGHT_CONFIG;
    if (storedConfig) {
      config = JSON.parse(storedConfig);
    }

    let bgStyle: BackgroundStyle = "lined";
    if (storedBgStyle === "lined" || storedBgStyle === "dots") {
      bgStyle = storedBgStyle;
    }

    store = { theme: activeTheme, dotConfig: config, backgroundStyle: bgStyle };
  } catch {
    // fallback
  }
}

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): StoreState {
  initStoreIfNeeded();
  return store;
}

function getServerSnapshot(): StoreState {
  return {
    theme: "light",
    dotConfig: DEFAULT_LIGHT_CONFIG,
    backgroundStyle: "lined",
  };
}

function persistStore() {
  try {
    localStorage.setItem("portfolio_theme", store.theme);
    localStorage.setItem("portfolio_dot_config", JSON.stringify(store.dotConfig));
    localStorage.setItem("portfolio_bg_style", store.backgroundStyle);
  } catch {
    // ignore
  }
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  backgroundStyle: BackgroundStyle;
  setBackgroundStyle: (style: BackgroundStyle) => void;
  dotConfig: DotGridConfig;
  setDotOpacity: (opacity: number) => void;
  setDotSize: (size: number) => void;
  setDotSpacing: (spacing: number) => void;
  resetDotConfig: () => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const { theme, dotConfig, backgroundStyle } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  // Synchronize document classes & CSS custom properties with external state
  useEffect(() => {
    if (!isHydrated) return;

    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.style.setProperty("--background", "#090a0f");
      root.style.setProperty("--foreground", "#fafafa");
      root.style.setProperty("--dot-color", `rgba(138, 175, 248, ${dotConfig.opacity})`);
    } else {
      root.classList.remove("dark");
      root.style.setProperty("--background", "#fdfbf7");
      root.style.setProperty("--foreground", "#09090b");
      root.style.setProperty("--dot-color", `rgba(108, 143, 224, ${dotConfig.opacity})`);
    }

    root.style.setProperty("--dot-size", `${dotConfig.size}px`);
    root.style.setProperty("--dot-spacing", `${dotConfig.spacing}px`);
  }, [theme, dotConfig, isHydrated]);

  const setTheme = (newTheme: Theme) => {
    store = { ...store, theme: newTheme };
    persistStore();
    notify();
  };

  const toggleTheme = () => {
    const nextTheme: Theme = store.theme === "light" ? "dark" : "light";
    store = { ...store, theme: nextTheme };
    persistStore();
    notify();
  };

  const setBackgroundStyle = (style: BackgroundStyle) => {
    store = { ...store, backgroundStyle: style };
    persistStore();
    notify();
  };

  const setDotOpacity = (opacity: number) => {
    const val = Math.max(0.02, Math.min(0.5, opacity));
    store = {
      ...store,
      dotConfig: { ...store.dotConfig, opacity: val },
    };
    persistStore();
    notify();
  };

  const setDotSize = (size: number) => {
    const val = Math.max(0.6, Math.min(3, size));
    store = {
      ...store,
      dotConfig: { ...store.dotConfig, size: val },
    };
    persistStore();
    notify();
  };

  const setDotSpacing = (spacing: number) => {
    const val = Math.max(12, Math.min(48, spacing));
    store = {
      ...store,
      dotConfig: { ...store.dotConfig, spacing: val },
    };
    persistStore();
    notify();
  };

  const resetDotConfig = () => {
    const reset = store.theme === "dark" ? DEFAULT_DARK_CONFIG : DEFAULT_LIGHT_CONFIG;
    store = {
      ...store,
      dotConfig: reset,
      backgroundStyle: "lined",
    };
    persistStore();
    notify();
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        backgroundStyle,
        setBackgroundStyle,
        dotConfig,
        setDotOpacity,
        setDotSize,
        setDotSpacing,
        resetDotConfig,
        mounted: isHydrated,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
