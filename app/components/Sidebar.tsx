"use client";

import Link from "next/link";
import type { IndexBlock } from "../lib/plan";
import { toBnDigits } from "../lib/dates";
import { SITE } from "../lib/site";
import { useMounted, useProgress } from "../hooks/useProgress";
import ProgressReadout from "./ProgressReadout";
import { PanelLeftClose, X } from "./icons";

const PAGES = [
  { href: "/", label: "আজ" },
  { href: "/review/", label: "ঝালাই" },
  { href: "/docs/", label: "ডক" },
  { href: "/simulation/", label: "sim" },
  { href: "/rules/", label: "নিয়ম" },
];

function isPageActive(path: string, href: string): boolean {
  if (href === "/") return path === "/";
  /* একটা ডকের পাতাও "ডক" ট্যাবের ভেতরে */
  if (href === "/docs/") return path.startsWith("/doc");
  return path.startsWith(href);
}

type SidebarProps = {
  blocks: IndexBlock[];
  /** শেষে `/` সহ pathname */
  path: string;
  /** যে দিন এখন পাতায় দেখানো — rail-এ জ্বলে */
  selectedCode?: string;
  /** আজকের দিন — "আজ" chip */
  todayCode?: string;
  /** আজকের ব্লক — "এখন" chip */
  todaySlug?: string;
  /** যে ব্লকের দিনগুলো খোলা — একবারে একটাই */
  openSlug?: string;
  percent: number;
  done: number;
  total: number;
  dayCount: number;
  /** শুধু drawer-এ — বেরোনোর পথ */
  onClose?: () => void;
  /** শুধু স্থায়ী rail-এ — ভাঁজ করা যায় */
  onCollapse?: () => void;
};

/**
 * ব্লক → দিন সূচি, পাতার লিংক আর plan-এর gauge।
 *
 * একই কম্পোনেন্ট rail আর drawer দুই জায়গায় — পার্থক্য শুধু বেরোনোর পথে।
 * সব ব্লক সবসময় দেখা যায়; দিনগুলো শুধু খোলা ব্লকের। 🧠 Create a roadmap
 */
export default function Sidebar({
  blocks,
  path,
  selectedCode,
  todayCode,
  todaySlug,
  openSlug,
  percent,
  done,
  total,
  dayCount,
  onClose,
  onCollapse,
}: SidebarProps) {
  const mounted = useMounted();
  const { doneCount } = useProgress();

  return (
    <div className="flex h-full flex-col">
      <div className="seam-b flex shrink-0 items-center justify-between gap-2 px-4 py-3">
        <Link href="/" onClick={onClose} className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-xl">{SITE.emoji}</span>
          <span className="t-title truncate text-sm">{SITE.short}</span>
        </Link>

        <div className="flex shrink-0 items-center gap-1.5">
          {onClose && (
            <button type="button" onClick={onClose} className="control control--quiet p-1.5" aria-label="সাইডবার বন্ধ করুন">
              <X />
            </button>
          )}
          {onCollapse && (
            <button
              type="button"
              onClick={onCollapse}
              className="control control--quiet p-1.5"
              aria-label="সূচিপত্র লুকান"
              aria-expanded
              aria-controls="site-sidebar"
            >
              <PanelLeftClose />
            </button>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-4 px-4 pt-4">
        <nav className="grid grid-cols-5 gap-1" aria-label="পাতা">
          {PAGES.map((page) => {
            const active = isPageActive(path, page.href);
            return (
              <Link
                key={page.href}
                href={page.href}
                onClick={onClose}
                className="tab px-1 py-1.5 text-xs"
                aria-selected={active}
                aria-current={active ? "page" : undefined}
              >
                {page.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-2">
            <span className="t-label">{toBnDigits(dayCount)} দিনের কাজ</span>
            <span className="t-mono t-accent text-xs" suppressHydrationWarning>
              {toBnDigits(done)}/{toBnDigits(total)} ({toBnDigits(percent)}%)
            </span>
          </div>
          <ProgressReadout percent={percent} label={`${toBnDigits(dayCount)} দিনের অগ্রগতি`} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-4">
          {blocks.map((block) => {
            const blockIds = block.days.flatMap((day) => day.taskIds);
            const blockDone = mounted ? doneCount(blockIds) : 0;
            const blockHref = `/block/${block.slug}/`;

            return (
              <div key={block.slug} className="topic-group pb-4">
                <Link
                  href={blockHref}
                  onClick={onClose}
                  aria-current={path === blockHref ? "true" : undefined}
                  className="row mb-2 flex items-center justify-between gap-2 px-2 py-1.5 text-sm"
                >
                  <span className="min-w-0 truncate">
                    {toBnDigits(block.num)} · {block.name}
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5">
                    {block.slug === todaySlug && <span className="chip chip--accent">এখন</span>}
                    <span className="chip" suppressHydrationWarning>
                      {toBnDigits(blockDone)}/{toBnDigits(blockIds.length)}
                    </span>
                  </span>
                </Link>

                {block.slug === openSlug && (
                  <div className="seam-l ml-1 flex flex-col gap-1 pl-2">
                    {block.days.map((day) => {
                      const dayDone = mounted ? doneCount(day.taskIds) : 0;
                      return (
                        <Link
                          key={day.code}
                          id={`day-row-${day.code}`}
                          href={`/day/${day.code}/`}
                          onClick={onClose}
                          aria-current={day.code === selectedCode ? "true" : undefined}
                          className="row flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-xs"
                        >
                          <span className="truncate">
                            {day.label} {day.title}
                          </span>
                          <span className="flex shrink-0 items-center gap-1.5">
                            {day.code === todayCode && <span className="chip chip--accent">আজ</span>}
                            <span className="text-[10px]" suppressHydrationWarning>
                              ({toBnDigits(dayDone)}/{toBnDigits(day.taskIds.length)})
                            </span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
