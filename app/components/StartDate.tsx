"use client";

import { useState } from "react";
import { isISODate, todayISO, toBnDigits } from "../lib/dates";
import { SITE } from "../lib/site";
import { useProgress } from "../hooks/useProgress";

/**
 * plan-এর দিন ০০১ কোন তারিখে — ব্যবহারকারী একবার বসান। ফাইলে তারিখ লেখা নেই,
 * কারণ কোন পথ কবে শুরু হবে তা আগে থেকে জানা নেই; বানিয়ে বসানো যায় না।
 *
 * `compact` — শুরু বসানো থাকলে ছোট একটা "বদলান" লাইন; না থাকলে পুরো প্রশ্ন।
 */
export default function StartDate({ compact = false }: { compact?: boolean }) {
  const { start, setStart } = useProgress();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(start ?? SITE.suggestedStart ?? todayISO());

  if (compact && start && !editing) {
    return (
      <p className="t-caption flex flex-wrap items-center gap-2">
        <span>শুরু {toBnDigits(start)}</span>
        <button
          type="button"
          className="control control--quiet px-2 py-0.5 text-xs"
          onClick={() => {
            setDraft(start);
            setEditing(true);
          }}
        >
          বদলান
        </button>
      </p>
    );
  }

  const save = () => {
    if (!isISODate(draft)) return;
    setStart(draft);
    setEditing(false);
  };

  return (
    <section className="callout callout--accent flex flex-col gap-3 p-4">
      <div>
        <div className="t-label mb-1">কবে শুরু করবেন?</div>
        <p className="t-body text-xs md:text-sm">
          plan-এর দিন ০০১ যে তারিখে পড়বে। এরপর থেকে &ldquo;আজ&rdquo; = ক্যালেন্ডারের আজ — plan পেছায় না, বাদ পড়া
          দিন ফেরে না। 🧠 Have an endpoint
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="date"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          aria-label="শুরুর তারিখ"
          className="surface-well t-mono px-2 py-1.5 text-sm"
        />
        <button type="button" onClick={save} disabled={!isISODate(draft)} className="control control--primary px-3 py-1.5 text-xs">
          এই দিনে শুরু
        </button>
        {editing && (
          <button type="button" onClick={() => setEditing(false)} className="control control--quiet px-3 py-1.5 text-xs">
            থাক
          </button>
        )}
      </div>
    </section>
  );
}
