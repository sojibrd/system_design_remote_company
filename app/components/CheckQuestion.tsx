"use client";

import Markdown from "./Markdown";
import { useMounted, useProgress } from "../hooks/useProgress";

/**
 * দিন-শেষ বা ব্লক-শেষের হ্যাঁ/না। উত্তরের আগে তালিকা না দেখে মনে করতে বলা হয় —
 * মনে করার চেষ্টাটাই শেখা (Test yourself); "না" হলে দোষ নয়, plan পেছায় না।
 */
export default function CheckQuestion({
  storageKey,
  label,
  question,
  recall,
}: {
  /** "d007" বা "b1" */
  storageKey: string;
  label: string;
  question: string;
  recall: string;
}) {
  const mounted = useMounted();
  const { answerFor, setAnswer } = useProgress();

  if (!question) return null;

  const answer = mounted ? answerFor(storageKey) : undefined;

  return (
    <section className="callout callout--accent p-4">
      <div className="t-label mb-1">{label}</div>
      <Markdown inline className="t-body text-sm">
        {question}
      </Markdown>
      <p className="t-caption mt-1.5">{recall} 🧠 Test yourself</p>

      <div className="segment-group mt-3 inline-flex" role="group" aria-label="উত্তর">
        <button
          type="button"
          className="segment px-4 py-1.5 text-xs"
          aria-pressed={answer === "yes"}
          onClick={() => setAnswer(storageKey, "yes")}
        >
          হ্যাঁ
        </button>
        <button
          type="button"
          className="segment px-4 py-1.5 text-xs"
          aria-pressed={answer === "no"}
          onClick={() => setAnswer(storageKey, "no")}
        >
          না
        </button>
      </div>

      {answer === "no" && (
        <p className="t-body mt-2 text-xs md:text-sm">
          &ldquo;না&rdquo; মানে ব্যর্থতা নয় — plan পেছায় না, কাল কালকের কাজ। ⚑ মাইলফলক হলে সেটা হোমে জমে
          থাকবে; সাধারণ কাজ দ্বিগুণ করবেন না। 🧠 Failures don&apos;t count
        </p>
      )}
    </section>
  );
}
