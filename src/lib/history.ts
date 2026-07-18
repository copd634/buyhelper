import { useEffect, useState } from "react";
import type { Payment, Place } from "./settings";

export interface HistoryItem {
  id: string;
  ts: number;
  usd: number;
  payment: Payment;
  place: Place;
  jpyCost: number;
  sellJpy: number;
  marginPct: number;
  verdict: "BUY" | "PASS";
  profit: number;
}

const KEY = "buyhelper.history.v1";
let cache: HistoryItem[] | null = null;
const listeners = new Set<() => void>();

function read(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}
function write(v: HistoryItem[]) {
  try { localStorage.setItem(KEY, JSON.stringify(v)); } catch {}
}

export function useHistory() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  useEffect(() => {
    if (!cache) cache = read();
    setItems(cache);
    const fn = () => setItems(cache!);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);

  const add = (item: Omit<HistoryItem, "id" | "ts">) => {
    const next: HistoryItem = { ...item, id: crypto.randomUUID(), ts: Date.now() };
    cache = [next, ...(cache ?? read())].slice(0, 100);
    write(cache);
    listeners.forEach((l) => l());
  };
  const clear = () => { cache = []; write(cache); listeners.forEach((l) => l()); };
  const remove = (id: string) => {
    cache = (cache ?? read()).filter((x) => x.id !== id);
    write(cache);
    listeners.forEach((l) => l());
  };
  return { items, add, clear, remove };
}
