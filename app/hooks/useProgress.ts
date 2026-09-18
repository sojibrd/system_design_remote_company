"use client";

import { useCallback, useSyncExternalStore } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { useProgressSync, type SyncStatus } from "./useSync";
import { REVIEW_DAYS, isISODate, type ReviewState } from "../lib/dates";
import { SITE } from "../lib/site";

/**
 * Progress-এর একমাত্র মালিক। কোনো কম্পোনেন্ট সরাসরি `localStorage` ছোঁবে না —
 * সব পড়া-লেখা এখান দিয়ে, যাতে key-স্কিমা এক জায়গায় থাকে এবং static export-এ
 * hydration mismatch না ঘটে।
 *
 * Key স্কিমা (`<prefix>` = `SITE.storagePrefix`; `v1` — আকার বদলালে migrate):
 *   <prefix>:v1:start   → "YYYY-MM-DD"   plan-এর দিন ০০১ কোন তারিখে
 *   <prefix>:v1:task    → { [taskId]: "YYYY-MM-DD" }   কাজ শেষের স্থানীয় তারিখ
 *   <prefix>:v1:check   → { ["d007" | "b1"]: "yes" | "no" }   দিন-শেষ / ব্লক-শেষ
 *   <prefix>:v1:review  → { [taskId]: ReviewState }
 *   <prefix>:v1:meta    → { updatedAt: ISOString }   সর্বশেষ sync-এর timestamp
 *
 * নোটের key নেই, ইচ্ছাকৃত — design doc-এর লেখা প্রজেক্টের নিজের repo-তে (`srdtube`-এর
 * `DESIGN.md`), সাইটে দ্বিতীয় কপি রাখলে দুই জায়গা আলাদা হয়ে যায়।
 *
 * ঝালাইয়ের অবস্থা শুধু "মনে ছিল" / "আটকে গেছি" চাপলে লেখা হয়। তার আগে পর্যন্ত
 * অবস্থা = { base: কাজ শেষের তারিখ, step: 0 } — তাই টিক দিলেই ঝালাই চালু।
 */
const START_KEY = `${SITE.storagePrefix}:v1:start`;
const TASK_KEY = `${SITE.storagePrefix}:v1:task`;
const CHECK_KEY = `${SITE.storagePrefix}:v1:check`;
const REVIEW_KEY = `${SITE.storagePrefix}:v1:review`;
const META_KEY = `${SITE.storagePrefix}:v1:meta`;

export type Answer = "yes" | "no";

type DoneMap = Record<string, string>;
type Answers = Record<string, Answer>;
type Reviews = Record<string, ReviewState>;
type Meta = { updatedAt: string };

const neverChanges = () => () => {};

/** server snapshot `false`, client `true` — mount-এর আগে কোনো progress UI নয় */
export function useMounted(): boolean {
  return useSyncExternalStore(
    neverChanges,
    () => true,
    () => false,
  );
}

export function useProgress() {
  const [startRaw, setStartRaw] = useLocalStorage<string>(START_KEY, "");
  const [tasks, setTasks] = useLocalStorage<DoneMap>(TASK_KEY, {});
  const [answers, setAnswers] = useLocalStorage<Answers>(CHECK_KEY, {});
  const [reviews, setReviews] = useLocalStorage<Reviews>(REVIEW_KEY, {});
  const [meta, setMeta] = useLocalStorage<Meta>(META_KEY, { updatedAt: "" });

  const sync = useProgressSync(
    { start: startRaw, tasks, answers, reviews },
    { start: setStartRaw, tasks: setTasks, answers: setAnswers, reviews: setReviews },
    meta,
    setMeta,
  );

  /** বসানো না থাকলে বা নষ্ট হলে `null` */
  const start = isISODate(startRaw) ? startRaw : null;

  const setStart = useCallback((iso: string) => setStartRaw(isISODate(iso) ? iso : ""), [setStartRaw]);

  const isTaskDone = useCallback((id: string) => Boolean(tasks[id]), [tasks]);

  const taskDoneDate = useCallback((id: string): string | null => tasks[id] ?? null, [tasks]);

  /** টিক দিলে `today` জমা; তুলে দিলে তারিখ আর ঝালাইয়ের অবস্থা দুটোই মোছে */
  const toggleTask = useCallback(
    (id: string, today: string) => {
      setTasks((prev) => {
        const next = { ...prev };
        if (next[id]) delete next[id];
        else next[id] = today;
        return next;
      });
      /* ঝালাই গোনা হয় টিকের তারিখ থেকে — নতুন টিকে পুরনো অবস্থা অর্থহীন */
      setReviews((prev) => {
        if (!(id in prev)) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      });
    },
    [setTasks, setReviews],
  );

  const doneCount = useCallback(
    (ids: string[]) => ids.reduce((sum, id) => sum + (tasks[id] ? 1 : 0), 0),
    [tasks],
  );

  const answerFor = useCallback((key: string): Answer | undefined => answers[key], [answers]);

  /** একই উত্তরে আবার চাপলে উত্তর মুছে যায় */
  const setAnswer = useCallback(
    (key: string, answer: Answer) =>
      setAnswers((prev) => {
        const next = { ...prev };
        if (next[key] === answer) delete next[key];
        else next[key] = answer;
        return next;
      }),
    [setAnswers],
  );

  /** শেষ না হওয়া কাজের ঝালাই নেই → `null` */
  const reviewState = useCallback(
    (id: string): ReviewState | null => {
      const doneOn = tasks[id];
      if (!doneOn) return null;
      return reviews[id] ?? { base: doneOn, step: 0 };
    },
    [tasks, reviews],
  );

  /** "মনে ছিল" — পরের ধাপে; চারটা শেষ হলে স্থির */
  const remembered = useCallback(
    (id: string) =>
      setReviews((prev) => {
        const doneOn = tasks[id];
        const current = prev[id] ?? (doneOn ? { base: doneOn, step: 0 } : null);
        if (!current) return prev;
        return { ...prev, [id]: { ...current, step: Math.min(current.step + 1, REVIEW_DAYS.length) } };
      }),
    [tasks, setReviews],
  );

  /** "আটকে গেছি" — শাস্তি নয়, তথ্য: আজ থেকে আবার ১ দিনের ধাপে */
  const stuck = useCallback(
    (id: string, today: string) => setReviews((prev) => ({ ...prev, [id]: { base: today, step: 0 } })),
    [setReviews],
  );

  return {
    start,
    setStart,
    isTaskDone,
    taskDoneDate,
    toggleTask,
    doneCount,
    answerFor,
    setAnswer,
    reviewState,
    remembered,
    stuck,
    sync,
  };
}

export type { SyncStatus };
