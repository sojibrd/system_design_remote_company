"use client";

import { useEffect, useRef, useState } from "react";
import { getSupabase } from "../lib/supabase";
import { useSyncKey } from "./useSyncKey";
import { SITE } from "../lib/site";

export type SyncStatus = "off" | "syncing" | "synced" | "error";

const PUSH_DEBOUNCE_MS = 1500;

type Meta = { updatedAt: string };
type Setter<V> = (value: V | ((prev: V) => V)) => void;

/**
 * local-first sync — localStorage-এই সবসময় progress থাকে (offline-এও কাজ
 * করে); sync key বসানো থাকলে background-এ Supabase-এ push/pull হয়।
 * conflict: পুরো blob-এর last-write-wins, `updated_at` দিয়ে — একজনই
 * ব্যবহারকারী, field-level merge-এর দরকার নেই।
 *
 * ব্যবহার: useProgress()-এর ভেতর থেকে, এর raw state + setter-গুলো দিয়ে।
 * এভাবে progress-এর "একমাত্র মালিক" useProgress.ts-ই থাকে — এই হুক শুধু
 * সেটার/getter ধার নেয়, নিজে localStorage ছোঁয় না (`meta` বাদে)।
 */
export function useProgressSync<T extends Record<string, unknown>>(
  blob: T,
  setters: { [K in keyof T]: Setter<T[K]> },
  meta: Meta,
  setMeta: Setter<Meta>,
): SyncStatus {
  const { key } = useSyncKey();
  const [status, setStatus] = useState<SyncStatus>("off");
  /** যে key-এর জন্য pull শেষ হয়েছে — push effect-কে re-run করানোর জন্য `status`-এর মাধ্যমে re-render আসে, তাই এটা ref-ই যথেষ্ট */
  const pulledKeyRef = useRef<string | null>(null);
  const skipNextPushRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* key বদলালে একবার pull — remote নতুন হলে local overwrite হয় */
  useEffect(() => {
    if (!key) return;
    const supabase = getSupabase();
    if (!supabase) return;

    let cancelled = false;

    supabase
      .from("progress_sync")
      .select("data, updated_at")
      .eq("sync_key", key)
      .eq("site_prefix", SITE.storagePrefix)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setStatus("error");
          return;
        }
        if (data && (!meta.updatedAt || data.updated_at > meta.updatedAt)) {
          skipNextPushRef.current = true;
          const remote = data.data as T;
          (Object.keys(setters) as (keyof T)[]).forEach((field) => setters[field](remote[field]));
          setMeta({ updatedAt: data.updated_at });
        }
        pulledKeyRef.current = key;
        setStatus("synced");
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  /* local বদল হলে debounce করে push — এই key-এর জন্য pull শেষ না হওয়া পর্যন্ত না */
  useEffect(() => {
    if (!key || pulledKeyRef.current !== key) return;
    const supabase = getSupabase();
    if (!supabase) return;

    if (skipNextPushRef.current) {
      skipNextPushRef.current = false;
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const updatedAt = new Date().toISOString();
      setStatus("syncing");
      supabase
        .from("progress_sync")
        .upsert({ sync_key: key, site_prefix: SITE.storagePrefix, data: blob, updated_at: updatedAt })
        .then(({ error }) => {
          /* meta শুধু সফল push-এই এগোয় — ব্যর্থ push-কে "synced" ধরে নিলে ভবিষ্যতে আসল remote update pull না-ও হতে পারে */
          if (!error) setMeta({ updatedAt });
          setStatus(error ? "error" : "synced");
        });
    }, PUSH_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, JSON.stringify(blob)]);

  return key ? status : "off";
}
