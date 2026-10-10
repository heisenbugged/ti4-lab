import { useCallback, useEffect, useRef, useState } from "react";

/** Join class names, skipping falsy values. */
export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export type Space = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export const space = (n: Space | undefined) =>
  n === undefined ? undefined : n === 0 ? "0" : `var(--space-${n})`;

/** Open/close state, same shape the old Mantine hook returned. */
export function useDisclosure(initial = false) {
  const [opened, setOpened] = useState(initial);
  const open = useCallback(() => setOpened(true), []);
  const close = useCallback(() => setOpened(false), []);
  const toggle = useCallback(() => setOpened((o) => !o), []);
  return [opened, { open, close, toggle, set: setOpened }] as const;
}

export function useMediaQuery(query: string, initial = false) {
  const [matches, setMatches] = useState(initial);
  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const onChange = () => setMatches(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

/** Breakpoints used across the app, in px. */
export const breakpoints = { xs: 576, sm: 768, md: 992, lg: 1200, xl: 1408 } as const;

export function useLocalStorage<T>({
  key,
  defaultValue,
}: {
  key: string;
  defaultValue: T;
}) {
  const [value, setValue] = useState<T>(defaultValue);
  const loaded = useRef(false);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw));
    } catch {
      /* storage blocked: keep the default */
    }
    loaded.current = true;
  }, [key]);
  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const v = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(v));
        } catch {
          /* ignore */
        }
        return v;
      });
    },
    [key],
  );
  return [value, set] as const;
}

export function useClipboard({ timeout = 1600 } = {}) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(
    (text: string) => {
      navigator.clipboard?.writeText(text).then(
        () => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), timeout);
        },
        () => setCopied(false),
      );
    },
    [timeout],
  );
  return { copied, copy };
}
