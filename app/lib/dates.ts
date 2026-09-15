/**
 * তারিখের ছোট, বিশুদ্ধ helper — কোনো `fs` নেই, তাই client-এও চলে।
 *
 * সব তারিখ ব্যবহারকারীর **স্থানীয়** "YYYY-MM-DD"। static export-এ build-এর দিন
 * আর পড়ার দিন আলাদা, তাই "আজ" সবসময় client-এ mount-এর পরে হিসাব হয়।
 *
 * plan-এর ফাইলে শুধু দিনের নম্বর — তারিখ = ব্যবহারকারীর বসানো শুরুর তারিখ +
 * (দিন − ১)। শুরু যেদিনই হোক, plan একই থাকে।
 */

export function todayISO(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return todayISO(new Date(y, m - 1, d + days));
}

/** `to` − `from`, দিনে */
export function daysBetween(from: string, to: string): number {
  const toUtc = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUtc(to) - toUtc(from)) / 86_400_000);
}

export function isISODate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

export function toBnDigits(value: string | number): string {
  return String(value).replace(/[0-9]/g, (digit) => BN_DIGITS[Number(digit)]);
}

/** দিন `num` (১ থেকে) কোন তারিখে পড়ে */
export function dayDate(start: string, num: number): string {
  return addDays(start, num - 1);
}

/**
 * আজকের দিন — ক্যালেন্ডার ধরে, plan পেছায় না। শুরুর আগে প্রথম দিন, শেষের পরে
 * শেষ দিন — কখনো ফাঁকা পাতা নয়।
 */
export function currentDayIndex(days: { num: number }[], start: string, today = todayISO()): number {
  if (days.length === 0) return -1;
  const offset = daysBetween(start, today) + 1;
  let index = 0;
  days.forEach((day, i) => {
    if (day.num <= offset) index = i;
  });
  return index;
}

/** ১, ৩, ৭, ২১ দিন — `learning_to_learn`-এর Spaced repetition revisited */
export const REVIEW_DAYS = [1, 3, 7, 21] as const;

/**
 * একটা 🔁 কাজের ঝালাইয়ের অবস্থা। `base` থেকে `REVIEW_DAYS[step]` দিন পরে পরের
 * ঝালাই। শুরুতে `base` = কাজ শেষের **আসল** তারিখ; "আটকে গেছি" হলে `base` = সেদিন,
 * `step` = ০।
 */
export type ReviewState = { base: string; step: number };

export function nextReviewDate(state: ReviewState): string | null {
  if (state.step >= REVIEW_DAYS.length) return null;
  return addDays(state.base, REVIEW_DAYS[state.step]);
}

export function isReviewDue(state: ReviewState, today: string): boolean {
  const next = nextReviewDate(state);
  return next !== null && next <= today;
}
