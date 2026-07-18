import { useEffect, useState } from "react";

export type Payment = "cash" | "card";
export type Place = "flea" | "store";

export interface Settings {
  cashRate: number;       // JPY per USD (cash)
  cardFeePct: number;     // % 海外決済手数料 (現金レートに上乗せ)
  apiFetchOn: boolean;    // future auto-fetch
  storeTaxPct: number;    // %
  defaultMarginPct: number; // %
  theme: "light" | "dark";
  lastRateUpdated: string; // ISO
}

const DEFAULTS: Settings = {
  cashRate: 162.00,
  cardFeePct: 3.5,
  apiFetchOn: false,
  storeTaxPct: 9.75,
  defaultMarginPct: 40,
  theme: "dark",
  lastRateUpdated: new Date().toISOString(),
};


const KEY = "buyhelper.settings.v1";

function read(): Settings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch { return DEFAULTS; }
}

function write(s: Settings) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
}

let cache: Settings | null = null;
const listeners = new Set<() => void>();

export function useSettings() {
  const [state, setState] = useState<Settings>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!cache) cache = read();
    setState(cache);
    setHydrated(true);
    const fn = () => setState(cache!);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);

  const update = (patch: Partial<Settings>) => {
    cache = { ...(cache ?? read()), ...patch };
    write(cache);
    listeners.forEach((l) => l());
  };

  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    if (state.theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [state.theme, hydrated]);

  return { settings: state, update, hydrated };
}

export function initThemeBeforePaint() {
  // called in a <script> in root — no-op in module land
}
