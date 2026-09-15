"use client";

import { useState } from "react";
import { findPrinciple, principleHref } from "../lib/principles";
import { ArrowUpRight } from "./icons";

/**
 * কাজের নিচে 🧠 chip। chip চাপলে এক লাইনে **কেন** কাজটা এভাবে — যাতে কাজের
 * সাথে নীতিটাও মনে থাকে, আলাদা করে মুখস্থ করতে না হয়।
 */
export default function PrincipleChips({ principles }: { principles: string[] }) {
  const [open, setOpen] = useState<string | null>(null);

  if (principles.length === 0) return null;

  const opened = open ? findPrinciple(open) : undefined;

  return (
    <div className="mt-2">
      <div className="flex flex-wrap gap-1.5">
        {principles.map((name) =>
          findPrinciple(name) ? (
            <button
              key={name}
              type="button"
              className="chip chip--accent"
              aria-expanded={open === name}
              onClick={() => setOpen(open === name ? null : name)}
            >
              🧠 {name}
            </button>
          ) : (
            <span key={name} className="chip">
              🧠 {name}
            </span>
          ),
        )}
      </div>

      {opened && (
        <div className="callout callout--accent mt-2 p-3">
          <div className="t-label mb-1">কেন — {opened.topic}</div>
          <p className="t-body text-xs md:text-sm">{opened.line}</p>
          <a
            href={principleHref(opened)}
            target="_blank"
            rel="noreferrer"
            className="t-accent mt-1.5 inline-flex items-center gap-1 text-xs"
          >
            learning_to_learn-এ পুরোটা
            <ArrowUpRight />
          </a>
        </div>
      )}
    </div>
  );
}
