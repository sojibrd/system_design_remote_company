"use client";

import { useState } from "react";
import { useSyncKey } from "../hooks/useSyncKey";
import { useProgress } from "../hooks/useProgress";
import { Check } from "./icons";

const STATUS_LABEL: Record<string, string> = {
  off: "sync বন্ধ — key বসালে চালু হবে",
  syncing: "sync হচ্ছে…",
  synced: "sync করা আছে",
  error: "sync ব্যর্থ হয়েছে — নেট থাকলে একটু পর আবার চেষ্টা হবে",
};

/**
 * Cross-device sync-এর settings। key-ই এখানে একমাত্র পরিচয় — কোনো
 * email/password নেই, তাই key কাউকে শেয়ার করা মানে তাকে নিজের progress
 * দেখা-বদলানোর অধিকার দেওয়া।
 */
export default function SyncSettings() {
  const { key, ensureKey, setKey } = useSyncKey();
  const { sync } = useProgress();
  const [draft, setDraft] = useState("");
  const [copied, setCopied] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [customDraft, setCustomDraft] = useState("");

  const copy = async () => {
    const value = key ?? ensureKey();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard ব্লক করা থাকলেও key নিচে দেখা যাচ্ছে, হাতে কপি করা যাবে
    }
  };

  const pair = () => {
    if (!draft.trim()) return;
    setKey(draft);
    setDraft("");
  };

  const useCustomKey = () => {
    if (!customDraft.trim()) return;
    setKey(customDraft);
    setCustomDraft("");
    setCustomMode(false);
  };

  return (
    <section className="surface-panel flex flex-col gap-5 p-4 sm:p-6">
      <div>
        <h2 className="t-title text-lg">একাধিক ডিভাইসে progress</h2>
        <p className="t-body text-sm">
          একটা device-এ নিচের key কপি করুন, অন্য device-এ পেস্ট করে &ldquo;যুক্ত করুন&rdquo; চাপুন — দুই
          জায়গার progress এক হয়ে যাবে। ইন্টারনেট না থাকলেও সাইট আগের মতোই কাজ করবে, নেট ফিরলে sync
          হয়ে যাবে।
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="t-label">এই ডিভাইসের key</span>
        <div className="flex flex-wrap items-center gap-2">
          <code className="surface-well t-mono min-w-0 break-all px-3 py-2 text-xs">
            {key ?? "এখনো তৈরি হয়নি"}
          </code>
          <button
            type="button"
            onClick={copy}
            className="control control--primary flex shrink-0 items-center gap-1.5 px-3 py-1.5 text-xs"
          >
            {copied && <Check size={12} />}
            {copied ? "কপি হয়েছে" : key ? "কপি করুন" : "key বানান"}
          </button>
          {!key && !customMode && (
            <button
              type="button"
              onClick={() => setCustomMode(true)}
              className="control control--quiet shrink-0 px-3 py-1.5 text-xs"
            >
              নিজের key লিখুন
            </button>
          )}
        </div>
        {!key && customMode && (
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={customDraft}
              onChange={(event) => setCustomDraft(event.target.value)}
              placeholder="নিজের পছন্দের key লিখুন"
              aria-label="নিজের sync key"
              className="surface-well t-mono min-w-0 flex-1 px-3 py-1.5 text-xs"
            />
            <button
              type="button"
              onClick={useCustomKey}
              disabled={!customDraft.trim()}
              className="control control--primary shrink-0 px-3 py-1.5 text-xs"
            >
              এটাই ব্যবহার করুন
            </button>
            <button
              type="button"
              onClick={() => {
                setCustomMode(false);
                setCustomDraft("");
              }}
              className="control control--quiet shrink-0 px-3 py-1.5 text-xs"
            >
              থাক
            </button>
          </div>
        )}
        {!key && customMode && (
          <p className="t-caption">
            যা মনে রাখা সহজ কিন্তু অন্য কেউ আন্দাজ করতে পারবে না এমন কিছু দিন — এই key-ই একমাত্র পরিচয়, ছোট
            বা সহজ key জানলে যে কেউ এই progress দেখতে/বদলাতে পারবে।
          </p>
        )}

      </div>

      <div className="flex flex-col gap-2">
        <span className="t-label">অন্য ডিভাইসের key বসান</span>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="ওই ডিভাইসে দেখানো key পেস্ট করুন"
            aria-label="অন্য ডিভাইসের sync key"
            className="surface-well t-mono min-w-0 flex-1 px-3 py-1.5 text-xs"
          />
          <button
            type="button"
            onClick={pair}
            disabled={!draft.trim()}
            className="control control--quiet shrink-0 px-3 py-1.5 text-xs"
          >
            যুক্ত করুন
          </button>
        </div>
      </div>

      <p className="t-caption" suppressHydrationWarning>
        অবস্থা: {STATUS_LABEL[sync] ?? sync}
      </p>
    </section>
  );
}
