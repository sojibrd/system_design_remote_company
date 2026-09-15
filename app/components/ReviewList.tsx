"use client";

import Link from "next/link";
import type { RepeatTask } from "../lib/plan";
import {
  REVIEW_DAYS,
  daysBetween,
  isReviewDue,
  nextReviewDate,
  todayISO,
  toBnDigits,
  type ReviewState,
} from "../lib/dates";
import Markdown from "./Markdown";
import { ArrowRight, Check } from "./icons";
import { useMounted, useProgress } from "../hooks/useProgress";

type Row = { item: RepeatTask; state: ReviewState; next: string | null };

/**
 * ঝালাই — plan-এর প্রতিটা 🔁 কাজ, টিক দেওয়ার দিন থেকে ১, ৩, ৭, ২১ দিনে ফিরে
 * আসে। হাতে কিছু যোগ করতে হয় না: কী ঝালাই হবে plan ঠিক করে, কবে তা টিকের
 * আসল তারিখ।
 *
 * `today` — হোমে শুধু আজ বাকিগুলো (না থাকলে কিছুই নয়); `all` — ঝালাইয়ের পাতা।
 */
export default function ReviewList({ items, mode }: { items: RepeatTask[]; mode: "today" | "all" }) {
  const mounted = useMounted();
  const { reviewState, remembered, stuck } = useProgress();

  if (!mounted) return mode === "all" ? <p className="t-caption">লোড হচ্ছে…</p> : null;

  const today = todayISO();
  const rows: Row[] = items.flatMap((item) => {
    const state = reviewState(item.id);
    return state ? [{ item, state, next: nextReviewDate(state) }] : [];
  });
  const byNext = (a: Row, b: Row) => (a.next ?? "").localeCompare(b.next ?? "");
  const due = rows.filter((row) => isReviewDue(row.state, today)).sort(byNext);

  const actionable = (row: Row) => (
    <ReviewRow
      key={row.item.id}
      row={row}
      today={today}
      onRemembered={() => remembered(row.item.id)}
      onStuck={() => stuck(row.item.id, today)}
    />
  );

  if (mode === "today") {
    if (due.length === 0) return null;
    return (
      <section className="surface-panel flex flex-col gap-4 p-5 sm:p-6">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="t-title text-base sm:text-lg">আজকের ঝালাই</h2>
          <span className="chip chip--accent">{toBnDigits(due.length)}</span>
        </div>
        <Hint />
        <ul className="flex flex-col gap-2">{due.map(actionable)}</ul>
        <Link href="/review/" className="control control--quiet justify-between px-3 py-2 text-xs">
          <span>সব ঝালাই</span>
          <ArrowRight />
        </Link>
      </section>
    );
  }

  const upcoming = rows.filter((row) => row.next !== null && !isReviewDue(row.state, today)).sort(byNext);
  const finished = rows.filter((row) => row.next === null);
  const notStarted = items.length - rows.length;

  return (
    <>
      <Section title="আজ" count={due.length} empty="আজ কোনো ঝালাই বাকি নেই।" hint={<Hint />}>
        {due.map(actionable)}
      </Section>

      <Section title="সামনে" count={upcoming.length} empty="সামনে কিছু নেই — 🔁 কাজে টিক দিলে এখানে আসবে।">
        {upcoming.map((row) => (
          <ReviewRow key={row.item.id} row={row} today={today} />
        ))}
      </Section>

      {finished.length > 0 && (
        <Section title="চারটা ঝালাই শেষ — স্থির" count={finished.length} empty="">
          {finished.map((row) => (
            <ReviewRow key={row.item.id} row={row} today={today} />
          ))}
        </Section>
      )}

      <p className="t-caption">
        plan-এ 🔁 কাজ মোট {toBnDigits(items.length)}টা; এখনো টিক পড়েনি {toBnDigits(notStarted)}টায় — টিক দেওয়ার
        দিন থেকে ওগুলো এখানে আসবে।
      </p>
    </>
  );
}

function Hint() {
  return (
    <p className="t-caption">
      আগে নোট বন্ধ করে করুন — ফাঁকা পাতায় লিখুন বা জোরে বলুন। তারপর সৎভাবে চাপুন: আটকে গেলে ব্যবধান আবার ১
      দিন থেকে। 🧠 Test yourself · Spaced repetition
    </p>
  );
}

function Section({
  title,
  count,
  empty,
  hint,
  children,
}: {
  title: string;
  count: number;
  empty: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="surface-panel flex flex-col gap-4 p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="t-title text-base sm:text-lg">{title}</h2>
        <span className="chip">{toBnDigits(count)}</span>
      </div>
      {count === 0 ? (
        <div className="surface-well t-caption p-4 text-center">{empty}</div>
      ) : (
        <>
          {hint}
          <ul className="flex flex-col gap-2">{children}</ul>
        </>
      )}
    </section>
  );
}

function ReviewRow({
  row,
  today,
  onRemembered,
  onStuck,
}: {
  row: Row;
  today: string;
  onRemembered?: () => void;
  onStuck?: () => void;
}) {
  const { item, state, next } = row;
  const offset = next ? daysBetween(today, next) : 0;

  return (
    <li className="surface-raised flex flex-col gap-3 p-3 sm:p-4">
      <Markdown inline className="task-text text-sm">
        {item.text}
      </Markdown>

      <div className="flex flex-wrap items-center gap-1.5">
        <Link href={`/day/${item.dayCode}/`} className="chip chip--accent">
          দিন {item.dayLabel}
        </Link>
        <span className="chip">
          ঝালাই {toBnDigits(Math.min(state.step + 1, REVIEW_DAYS.length))}/{toBnDigits(REVIEW_DAYS.length)}
        </span>
        {next && offset > 0 && (
          <span className="chip">
            {toBnDigits(offset)} দিন পরে · {toBnDigits(next)}
          </span>
        )}
        {next && offset < 0 && <span className="chip chip--alert">{toBnDigits(-offset)} দিন দেরি</span>}
      </div>

      {onRemembered && onStuck && (
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onRemembered} className="control control--primary px-3 py-1.5 text-xs">
            <Check />
            মনে ছিল
          </button>
          <button type="button" onClick={onStuck} className="control px-3 py-1.5 text-xs">
            আটকে গেছি — কাল আবার
          </button>
        </div>
      )}
    </li>
  );
}
