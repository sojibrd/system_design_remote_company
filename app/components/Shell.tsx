"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import type { IndexBlock } from "../lib/plan";
import { currentDayIndex, dayDate, todayISO, toBnDigits } from "../lib/dates";
import { useMounted, useProgress } from "../hooks/useProgress";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { PanelLeftOpen } from "./icons";

/**
 * সব পাতার chassis — বাঁয়ে rail (ব্লক, খোলা ব্লকের দিন), মোবাইলে drawer, আর
 * ডানের pane একা স্ক্রল হয়।
 *
 * Layout-এ থাকে, পাতায় নয় — তাই পাতা বদলালেও rail একটাই থাকে, ভাঁজ করা
 * অবস্থাও টিকে থাকে। হোমের মূল অংশে তবু শুধু আজ; পুরো পথ rail-এ।
 */
export default function Shell({ blocks, children }: { blocks: IndexBlock[]; children: React.ReactNode }) {
  const pathname = usePathname();
  const mounted = useMounted();
  const { start, doneCount } = useProgress();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const days = useMemo(
    () => blocks.flatMap((block) => block.days.map((day) => ({ ...day, blockSlug: block.slug }))),
    [blocks],
  );
  const allIds = useMemo(() => days.flatMap((day) => day.taskIds), [days]);

  const done = mounted ? doneCount(allIds) : 0;
  const percent = allIds.length > 0 ? Math.round((done / allIds.length) * 100) : 0;
  const last = days[days.length - 1];

  /* শুরুর তারিখ ব্রাউজারে থাকে — না থাকলে শুধু দিনের সংখ্যা */
  const range =
    mounted && start && last
      ? `${toBnDigits(start)} → ${toBnDigits(dayDate(start, last.num))}`
      : `${toBnDigits(days.length)} দিন`;

  /* "আজ" build-এর দিন নয়, পড়ার দিন — তাই mount-এর পরে */
  const todayDay = mounted && start ? days[currentDayIndex(days, start, todayISO())] : undefined;

  const path = pathname.endsWith("/") ? pathname : `${pathname}/`;
  const dayOnPage = /^\/day\/([^/]+)\/$/.exec(path)?.[1];
  const blockOnPage = /^\/block\/([^/]+)\/$/.exec(path)?.[1];
  /* হোম আজকের দিনটাই দেখায়, তাই rail-এ ওটাই জ্বলে */
  const selectedCode = dayOnPage ?? (path === "/" ? todayDay?.code : undefined);
  const openSlug =
    blockOnPage ?? days.find((day) => day.code === selectedCode)?.blockSlug ?? todayDay?.blockSlug ?? blocks[0]?.slug;

  // drawer পাতা ঢেকে দেয়; পেছনের পাতা স্ক্রল হবে না
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  // drawer খুললে জ্বলা দিনটা চোখের সামনে আনা
  useEffect(() => {
    if (!drawerOpen || !selectedCode) return;
    const timer = setTimeout(() => {
      document.getElementById(`day-row-${selectedCode}`)?.scrollIntoView({ block: "center" });
    }, 100);
    return () => clearTimeout(timer);
  }, [drawerOpen, selectedCode]);

  const sidebarProps = {
    blocks,
    path,
    selectedCode,
    todayCode: todayDay?.code,
    todaySlug: todayDay?.blockSlug,
    openSlug,
    percent,
    done,
    total: allIds.length,
    dayCount: days.length,
  };

  return (
    <div className="surface-app flex h-screen flex-col overflow-hidden">
      <Navbar
        done={done}
        total={allIds.length}
        percent={percent}
        range={range}
        onOpenSidebar={() => setDrawerOpen(true)}
      />

      <div className="flex min-h-0 flex-1">
        {collapsed && (
          <div className="surface-panel hidden shrink-0 flex-col items-center px-2 py-3 lg:flex">
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className="control control--quiet p-1.5"
              aria-label="সূচিপত্র খুলুন"
              aria-expanded={false}
              aria-controls="site-sidebar"
            >
              <PanelLeftOpen />
            </button>
          </div>
        )}

        <aside
          id="site-sidebar"
          className={`surface-panel hidden min-h-0 w-80 shrink-0 ${collapsed ? "" : "lg:block"}`}
        >
          <Sidebar {...sidebarProps} onCollapse={() => setCollapsed(true)} />
        </aside>

        <main id="main-content" className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 pb-16 md:p-6 lg:p-8">{children}</div>
        </main>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" aria-modal="true">
          <div className="overlay absolute inset-0" onClick={() => setDrawerOpen(false)} />
          <aside className="surface-panel animate-slide-in-left absolute left-0 top-0 h-full w-[300px] sm:w-[360px]">
            <Sidebar {...sidebarProps} onClose={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}
    </div>
  );
}
