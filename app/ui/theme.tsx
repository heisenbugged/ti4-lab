import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "dark" | "light";
const KEY = "ti4lab-theme";
const Ctx = createContext<{ theme: Theme; setTheme: (t: Theme) => void; toggle: () => void }>({ theme: "dark", setTheme: () => {}, toggle: () => {} });

/** Inline script for <head>: applies the saved theme before first paint. */
export const themeScript = `try{var t=localStorage.getItem("${KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t;}catch(e){}`;

export function ThemeProvider({ forced, children }: { forced?: Theme | null; children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(forced ?? "dark");
  useEffect(() => {
    if (forced) return;
    const t = document.documentElement.dataset.theme;
    if (t === "light" || t === "dark") setThemeState(t);
  }, [forced]);
  const setTheme = useCallback(
    (t: Theme) => {
      if (forced) return;
      setThemeState(t);
      document.documentElement.dataset.theme = t;
      try {
        localStorage.setItem(KEY, t);
      } catch {
        /* ignore */
      }
    },
    [forced],
  );
  const toggle = useCallback(() => setTheme(theme === "dark" ? "light" : "dark"), [setTheme, theme]);
  return <Ctx.Provider value={{ theme, setTheme, toggle }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);
