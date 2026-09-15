"use client";

import Link from "next/link";
import type { Task } from "../lib/plan";
import { todayISO, toBnDigits } from "../lib/dates";
import Markdown from "./Markdown";
import PrincipleChips from "./PrincipleChips";
import { ArrowUpRight } from "./icons";
import { useMounted, useProgress } from "../hooks/useProgress";

/**
 * একটা কাজ: নেটিভ checkbox (`.check`), টিক দিলে লেখা কাটা, কবে শেষ হলো তার তারিখ,
 * আর মিনিট / ⚑ / 🔁 / 🧠 chip।
 *
 * কাজে `(ডক ১৩)` বা `(sim … · …)` থাকলে `system_design` সাইটের ঐ ডক বা simulator-এর
 * লিংক। লেখা এখানে নয় — design doc-এর ফাইল `system_design/designs/`-এ।
 *
 * `from` দিলে কাজটা অন্য দিনের — হোমের জমে থাকা মাইলফলকে দিনের লিংক দেখায়।
 */
export default function TaskItem({ task, from }: { task: Task; from?: { code: string; label: string } }) {
  const mounted = useMounted();
  const { isTaskDone, taskDoneDate, toggleTask } = useProgress();

  const checked = mounted && isTaskDone(task.id);
  const doneOn = checked ? taskDoneDate(task.id) : null;
  const doneToday = doneOn !== null && doneOn === todayISO();

  return (
    <li data-done={checked} className="surface-raised flex items-start gap-3 p-3 sm:p-4">
      {/* checkbox লেখার বাইরে — কাজের লেখায় লিংক থাকতে পারে, আর label-এর ভেতরে লিংক রাখা যায় না */}
      <input
        type="checkbox"
        checked={checked}
        onChange={() => toggleTask(task.id, todayISO())}
        aria-label={checked ? "সম্পন্ন — চিহ্ন তুলে দিন" : "সম্পন্ন হিসেবে চিহ্নিত করুন"}
        className="check mt-0.5"
      />

      <div className="min-w-0 flex-1">
        <Markdown inline className="task-text text-sm">
          {task.text}
        </Markdown>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {task.minutes !== null && <span className="chip">{toBnDigits(task.minutes)}′</span>}
          {task.milestone && (
            <span className="chip chip--alert" title="নির্ধারিত দিনে না হলে হোমে জমে থাকবে">
              ⚑ মাইলফলক
            </span>
          )}
          {task.repeat && (
            <span className="chip" title="শেষ করার দিন থেকে ১, ৩, ৭, ২১ দিনে না দেখে আবার">
              🔁 ঝালাই হবে
            </span>
          )}
          {task.sources.map((source) =>
            source.kind === "doc" ? (
              <a
                key={`doc-${source.code}`}
                href={source.href}
                target="_blank"
                rel="noreferrer"
                className="chip chip--accent"
                title="system_design সাইটে ঐ ডক"
              >
                ডক {toBnDigits(source.code)} · {source.title}
                <ArrowUpRight size={10} />
              </a>
            ) : (
              <a
                key={`sim-${source.id}-${source.level}`}
                href={source.href}
                target="_blank"
                rel="noreferrer"
                className="chip chip--accent"
                title="simulator-এ সিস্টেমটা খুলে উপরের tab থেকে লেভেল বাছুন"
              >
                sim · {source.name} · {source.level}
                <ArrowUpRight size={10} />
              </a>
            ),
          )}
          {checked && (
            <span className="chip chip--ok" title="কাজ শেষের তারিখ">
              ✓ {doneOn ? toBnDigits(doneOn) : "সম্পন্ন"}
            </span>
          )}
          {from && (
            <Link href={`/day/${from.code}/`} className="chip chip--accent">
              দিন {from.label}
            </Link>
          )}
        </div>

        {task.repeat && doneToday && (
          <p className="t-caption mt-2">
            এখনই না দেখে ৩ লাইনে লিখুন — যেখানে আটকাবেন, সেটাই ফাঁক। কাল থেকে ঝালাইয়ে ফিরবে। 🧠 Feynman
          </p>
        )}

        <PrincipleChips principles={task.principles} />
      </div>
    </li>
  );
}
