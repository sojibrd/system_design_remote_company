"use client";

import Link from "next/link";
import type { Day } from "../lib/plan";
import { dayDate, toBnDigits } from "../lib/dates";
import CheckQuestion from "./CheckQuestion";
import ProgressReadout from "./ProgressReadout";
import TaskItem from "./TaskItem";
import { useMounted, useProgress } from "../hooks/useProgress";

/**
 * একটা দিনের panel: breadcrumb, শিরোনাম, অগ্রগতি, কাজ, দিন-শেষের যাচাই। আজ ও
 * দিনের পাতা দুটোই এটা দেখায়। তারিখ দেখায় শুধু শুরুর তারিখ বসানো থাকলে।
 */
export default function DayBody({
  day,
  blockName,
  blockSlug,
  totalDays,
}: {
  day: Day;
  blockName: string;
  blockSlug: string;
  totalDays: number;
}) {
  const mounted = useMounted();
  const { start, doneCount } = useProgress();

  const total = day.tasks.length;
  const done = mounted ? doneCount(day.tasks.map((task) => task.id)) : 0;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  const minutes = day.tasks.reduce((sum, task) => sum + (task.minutes ?? 0), 0);
  const date = mounted && start ? dayDate(start, day.num) : null;

  return (
    <section className="surface-panel flex flex-col gap-6 p-4 sm:p-6 md:p-8">
      <div className="flex flex-col gap-1">
        <div className="t-label flex flex-wrap items-center gap-2">
          <Link href={`/block/${blockSlug}/`} className="t-accent">
            {blockName}
          </Link>
          <span>•</span>
          <span>
            দিন {day.label}/{toBnDigits(totalDays)}
          </span>
          {date && (
            <>
              <span>•</span>
              <span>{toBnDigits(date)}</span>
            </>
          )}
        </div>
        <h2 className="t-title text-xl sm:text-2xl md:text-3xl">{day.title}</h2>
      </div>

      {total === 0 ? (
        /* plan-এর ঐ দিনে এই সাইটের ঘর নেই — ফাঁকা তালিকা নয়, কেন ফাঁকা সেটা */
        <p className="surface-well t-caption p-4 text-center">
          আজ এই সাইটে নতুন কাজ নেই — plan-এর দিনটা অন্য কাজের। হোমে ঝালাই থাকলে শুধু সেটুকু। 🧠 It pays to be not busy
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-3">
              <span className="t-label">এই দিনের কাজ · মোট {toBnDigits(minutes)}′</span>
              <span className="t-mono t-accent text-sm" suppressHydrationWarning>
                {toBnDigits(done)}/{toBnDigits(total)} ({toBnDigits(percent)}%)
              </span>
            </div>
            <ProgressReadout percent={percent} label="এই দিনের অগ্রগতি" />
          </div>

          <ul className="seam-t flex flex-col gap-3 pt-6">
            {day.tasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </ul>
        </>
      )}

      {day.check && (
        <div className="seam-t pt-6">
          <CheckQuestion
            storageKey={`d${day.code}`}
            label="দিন শেষে — নিজেকে যাচাই"
            question={day.check}
            recall="উত্তরের আগে উপরের কাজ না দেখে মনে করুন এই দিনে কী কী করেছেন।"
          />
        </div>
      )}
    </section>
  );
}
