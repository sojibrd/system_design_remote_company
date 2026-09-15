"use client";

import Link from "next/link";
import { toBnDigits } from "../lib/dates";
import { SITE } from "../lib/site";
import { Menu } from "./icons";

/**
 * সরু স্ক্রিনের top bar। `lg:` থেকে rail-ই পরিচয় আর অগ্রগতি বহন করে, তখন
 * এটা পুরো লুকায় — স্ক্রিনে brand সবসময় একটাই।
 */
export default function Navbar({
  done,
  total,
  percent,
  range,
  onOpenSidebar,
}: {
  done: number;
  total: number;
  percent: number;
  range: string;
  onOpenSidebar: () => void;
}) {
  return (
    <header className="surface-app seam-b flex w-full shrink-0 items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:hidden">
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" onClick={onOpenSidebar} className="control control--quiet shrink-0 p-2" aria-label="নেভিগেশন খুলুন">
          <Menu />
        </button>
        <span className="shrink-0 text-2xl">{SITE.emoji}</span>
        <div className="min-w-0">
          <Link href="/" className="t-title block truncate text-base sm:text-xl">
            {SITE.short}
          </Link>
          <p className="t-caption hidden sm:block">{range}</p>
        </div>
      </div>

      <div className="surface-raised hidden shrink-0 items-center gap-2 px-3 py-1.5 sm:flex sm:gap-3 sm:px-4">
        <span className="t-label hidden md:inline">অগ্রগতি</span>
        <span className="t-mono t-accent text-xs sm:text-sm" suppressHydrationWarning>
          {toBnDigits(done)}/{toBnDigits(total)}
          <span className="hidden md:inline"> ({toBnDigits(percent)}%)</span>
        </span>
        <div
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="plan-এর অগ্রগতি"
          className="gauge h-2 w-16 sm:w-20"
        >
          <div className="gauge-fill" style={{ width: `${percent}%` }} />
        </div>
      </div>
    </header>
  );
}
