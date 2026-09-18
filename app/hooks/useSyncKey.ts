"use client";

import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";

/**
 * একই ব্রাউজারের সব সাইটে একটাই key — GitHub Pages-এ প্রতিটা প্রজেক্ট
 * `sojibrd.github.io`-র আলাদা path, কিন্তু origin এক, তাই localStorage-ও
 * শেয়ার্ড। key-এর নামে তাই সাইটের prefix নেই — একবার বসালেই সব সাইটে চলে।
 */
const SYNC_KEY = "sync:v1:key";

function randomKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function useSyncKey() {
  const [raw, setRaw] = useLocalStorage<string>(SYNC_KEY, "");

  /** key না থাকলে একটা বানিয়ে বসায়, থাকলে সেটাই ফেরত দেয় */
  const ensureKey = useCallback(() => {
    if (raw) return raw;
    const next = randomKey();
    setRaw(next);
    return next;
  }, [raw, setRaw]);

  const setKey = useCallback((next: string) => setRaw(next.trim()), [setRaw]);

  return { key: raw || null, ensureKey, setKey };
}
