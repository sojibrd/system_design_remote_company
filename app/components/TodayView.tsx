"use client";

import Link from "next/link";
import type { RepeatTask, TimelineDay } from "../lib/plan";
import { currentDayIndex, dayDate, daysBetween, todayISO, toBnDigits } from "../lib/dates";
import DayBody from "./DayBody";
import Pager from "./Pager";
import ProgressReadout from "./ProgressReadout";
import ReviewList from "./ReviewList";
import StartDate from "./StartDate";
import TaskItem from "./TaskItem";
import { TriangleAlert } from "./icons";
import { useMounted, useProgress } from "../hooks/useProgress";

/**
 * হোমপেজের মূল অংশ = **শুধু আজ।** পুরো plan একসাথে দেখালে মাথা কোনোটাই ধরে না
 * (working memory); পুরো পথ rail-এ আর ব্লকের পাতায়।
 *
 * ক্রম: শুরুর তারিখ (না থাকলে শুধু ওটাই) → dip-এর সতর্কতা → জমে থাকা ⚑ → আজকের
 * ঝালাই → আজকের দিন। সাধারণ বাদ পড়া কাজ এখানে ফেরে না — plan পেছায় না।
 *
 * "আজ" build-এর দিন নয়, পড়ার দিন — তাই সবকিছু mount-এর পরে।
 */
export default function TodayView({ days, dipHref }: { days: TimelineDay[]; dipHref: string | null }) {
  const mounted = useMounted();
  const { start, doneCount, isTaskDone } = useProgress();

  if (!mounted) {
    return <p className="t-caption">আজকের দিন খোঁজা হচ্ছে…</p>;
  }

  if (!start) return <StartDate />;

  const today = todayISO();
  const index = currentDayIndex(days, start, today);
  const day = days[index];
  if (!day) return null;

  const allIds = days.flatMap((item) => item.tasks.map((task) => task.id));
  const done = doneCount(allIds);
  const percent = allIds.length > 0 ? Math.round((done / allIds.length) * 100) : 0;

  const offset = daysBetween(start, today) + 1;
  const beforeStart = offset < days[0].num;
  const afterEnd = offset > days[days.length - 1].num;
  const total = toBnDigits(days.length);

  const overdue = days
    .filter((item) => dayDate(start, item.num) < today)
    .flatMap((item) =>
      item.tasks
        .filter((task) => task.milestone && !isTaskDone(task.id))
        .map((task) => ({ task, from: { code: item.code, label: item.label } })),
    );

  const repeatTasks: RepeatTask[] = days.flatMap((item) =>
    item.tasks
      .filter((task) => task.repeat)
      .map((task) => ({ id: task.id, text: task.text, dayCode: item.code, dayLabel: item.label })),
  );

  const prev = days[index - 1];
  const next = days[index + 1];

  return (
    <>
      <section className="surface-panel flex flex-col gap-3 p-5 sm:p-6">
        <div className="flex items-baseline justify-between gap-3">
          <span className="t-label">আজ · {toBnDigits(today)}</span>
          <span className="t-mono t-accent text-sm">
            দিন {day.label}/{total}
          </span>
        </div>
        <ProgressReadout percent={percent} label={`${total} দিনের অগ্রগতি`} />
        <p className="t-caption">
          {beforeStart ? `শুরু ${toBnDigits(start)} — প্রথম দিনটা দেখানো হচ্ছে। ` : ""}
          {afterEnd ? `${total} দিন শেষ — শেষ দিনটা দেখানো হচ্ছে; এরপর কী, নিয়মের শেষে লেখা। ` : ""}
          সব মিলিয়ে {toBnDigits(done)}/{toBnDigits(allIds.length)} কাজ ({toBnDigits(percent)}%)। এখানে শুধু আজ,
          কারণ মাথা একবারে অল্প কটা জিনিসই ধরে; পুরো পথ পাশের সূচিতে। 🧠 Long and short memory
        </p>
        <StartDate compact />
      </section>

      {day.dip && dipHref && (
        <div className="callout callout--alert p-4">
          <div className="t-label mb-1 flex items-center gap-1.5">
            <TriangleAlert />
            <span>Dip-এর সময়</span>
          </div>
          <p className="t-body text-xs md:text-sm">
            উত্তেজনা শেষ, ফল এখনো আসেনি — ছেড়ে দেওয়ার ঝুঁকি সবচেয়ে বেশি। মন খারাপ হলে সিদ্ধান্ত নয়, আগে থেকে লেখা
            নিয়মগুলো মানুন।{" "}
            <Link href={dipHref} className="t-accent">
              Dip-এর নিয়ম
            </Link>
          </p>
        </div>
      )}

      {overdue.length > 0 && (
        <section className="surface-panel flex flex-col gap-4 p-5 sm:p-6">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="t-title text-base sm:text-lg">⚑ জমে থাকা মাইলফলক</h2>
            <span className="chip chip--alert">{toBnDigits(overdue.length)}</span>
          </div>
          <p className="t-caption">
            নির্ধারিত দিন পেরিয়ে গেছে — আজকের কাজের আগে এগুলো। সাধারণ কাজ এখানে আসে না; ওগুলো সেদিনের সাথেই
            গেছে।
          </p>
          <ul className="flex flex-col gap-3">
            {overdue.map(({ task, from }) => (
              <TaskItem key={task.id} task={task} from={from} />
            ))}
          </ul>
        </section>
      )}

      <ReviewList items={repeatTasks} mode="today" />

      <DayBody day={day} blockName={day.blockName} blockSlug={day.blockSlug} totalDays={days.length} />

      <Pager
        label="দিন"
        prev={prev && { href: `/day/${prev.code}/`, label: `দিন ${prev.label} · ${prev.title}` }}
        next={next && { href: `/day/${next.code}/`, label: `দিন ${next.label} · ${next.title}` }}
      />
    </>
  );
}
