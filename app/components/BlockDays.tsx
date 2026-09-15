"use client";

import Link from "next/link";
import type { IndexBlock } from "../lib/plan";
import { dayDate, todayISO, toBnDigits } from "../lib/dates";
import ProgressReadout from "./ProgressReadout";
import { useMounted, useProgress } from "../hooks/useProgress";

/**
 * একটা ব্লকের দিনগুলো এক নজরে — কোথায় আছি, কোন দিনে "হ্যাঁ", কোথায় কাজ বাকি।
 * কাজের লেখা দিনের পাতায়। 🧠 Create a roadmap
 */
export default function BlockDays({ block }: { block: IndexBlock }) {
  const mounted = useMounted();
  const { start, doneCount, answerFor } = useProgress();

  const today = mounted ? todayISO() : "";
  const ids = block.days.flatMap((day) => day.taskIds);
  const done = mounted ? doneCount(ids) : 0;
  const percent = ids.length > 0 ? Math.round((done / ids.length) * 100) : 0;

  return (
    <section className="surface-panel flex flex-col gap-4 p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="t-title text-base sm:text-lg">দিনগুলো</h2>
        <span className="t-mono t-accent text-sm" suppressHydrationWarning>
          {toBnDigits(done)}/{toBnDigits(ids.length)} ({toBnDigits(percent)}%)
        </span>
      </div>
      <ProgressReadout percent={percent} label="এই ব্লকের অগ্রগতি" />

      <ul className="flex flex-col gap-1">
        {block.days.map((day) => {
          const dayDone = mounted ? doneCount(day.taskIds) : 0;
          const answer = mounted ? answerFor(`d${day.code}`) : undefined;
          const date = mounted && start ? dayDate(start, day.num) : null;
          const isToday = date === today;
          return (
            <li key={day.code}>
              <Link
                href={`/day/${day.code}/`}
                className="row flex items-center gap-3 px-3 py-2 text-sm"
                aria-current={isToday ? "true" : undefined}
              >
                <span className="shrink-0 text-xs">{day.label}</span>
                <span className="min-w-0 flex-1 truncate">{day.title}</span>
                {date && <span className="hidden shrink-0 text-xs sm:inline">{toBnDigits(date)}</span>}
                {isToday && <span className="chip chip--accent shrink-0">আজ</span>}
                {answer === "yes" && <span className="chip chip--ok shrink-0">হ্যাঁ</span>}
                {answer === "no" && <span className="chip chip--alert shrink-0">না</span>}
                <span className="shrink-0 text-xs" suppressHydrationWarning>
                  {toBnDigits(dayDone)}/{toBnDigits(day.taskIds.length)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
