"use client";

import React from "react";
import type { LevelConfig } from "@/app/lib/types";
import {
  Calculator,
  GitCompare,
  Lightbulb,
  X,
} from "lucide-react";
import { Badge, IconButton, Panel } from "@/app/components/ui";

/**
 * Everything that describes the LEVEL rather than the current step: what this
 * tier is, the concepts it introduces, the numbers it is sized for, and the
 * decisions that have no hop to animate. Kept out of the walkthrough panel
 * because that panel is step-scoped — it is replaced every time the step
 * advances, while these facts belong to the whole architecture.
 *
 * It used to be a collapsible row under the level tabs, which cost the canvas
 * a permanent row just to hold a tagline and a chevron. Now it shares the
 * walkthrough's slot: one panel, opened from the controls bar by either
 * `Steps` or `Notes`, never both at once. Which means this component owns no
 * open/close state — the page does — and the tagline it used to show while
 * closed rides along as the panel's subtitle.
 */
export const DesignNotes: React.FC<{
  level: LevelConfig;
  /** Dismisses the sheet. Only acted on for phones, where it overlays the canvas. */
  onClose?: () => void;
}> = ({ level, onClose }) => {
  const { scaleEstimate, tradeOffs, keyConcepts, tagline } = level;

  // Four universal figures, then whatever this particular system also needs.
  const rows = scaleEstimate
    ? [
        { label: "Write QPS", value: scaleEstimate.writeQps },
        { label: "Read QPS", value: scaleEstimate.readQps },
        { label: "Read : Write", value: scaleEstimate.readWriteRatio },
        { label: "Storage (৫ বছর)", value: scaleEstimate.storage5y },
        ...(scaleEstimate.extras ?? []),
      ]
    : [];

  return (
    <Panel className="flex flex-col h-full p-3 sm:p-4 md:p-5 overflow-hidden">
      <div className="flex items-start justify-between gap-2 pb-2 seam-b-heavy">
        <div className="flex items-center gap-2 min-w-0">
          <Calculator className="t-muted w-3.5 h-3.5 shrink-0" />
          <span className="t-mono t-strong text-xs shrink-0">NOTE</span>
        </div>

        {/* Phones only — on a wide screen the panel is a column, not an overlay. */}
        {onClose && (
          <IconButton
            variant="ghost"
            onClick={onClose}
            aria-label="ডিজাইন নোট বন্ধ করুন"
            className="lg:hidden"
          >
            <X className="w-4 h-4" />
          </IconButton>
        )}
      </div>

      {/* The tagline is the level's one-line identity; it led the old row and
          still leads here. */}
      <p className="t-body text-xs mt-2">{tagline}</p>

      <div className="flex-1 min-h-0 overflow-y-auto mt-3 flex flex-col gap-4">
        {/* Lightest first: what this tier introduces, before the numbers. */}
        {keyConcepts && keyConcepts.length > 0 && (
          <section>
            <h4 className="t-label t-accent mb-2 flex items-center gap-1.5">
              <Lightbulb className="w-3 h-3" />
              Key Concepts
            </h4>
            <div className="flex items-center gap-1.5 flex-wrap">
              {keyConcepts.map((concept) => (
                <Badge key={concept}>{concept}</Badge>
              ))}
            </div>
          </section>
        )}

        {scaleEstimate && (
          <section>
            <h4 className="t-label t-accent mb-2">
              Capacity Estimate
            </h4>
            <dl className="grid grid-cols-2 gap-2">
              {rows.map((row) => (
                <div
                  key={row.label}
                  className="surface-well px-2 py-1.5"
                >
                  <dt className="t-label truncate">
                    {row.label}
                  </dt>
                  <dd className="t-title text-xs mt-0.5">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {tradeOffs && tradeOffs.length > 0 && (
          <section>
            <h4 className="t-label t-accent mb-2 flex items-center gap-1.5">
              <GitCompare className="w-3 h-3" />
              Design Trade-offs
            </h4>
            <div className="flex flex-col gap-3">
              {tradeOffs.map((tradeOff) => (
                <article
                  key={tradeOff.question}
                  className="surface-well px-2.5 py-2"
                >
                  <h5 className="t-title text-xs mb-1.5">
                    {tradeOff.question}
                  </h5>

                  <ul className="flex flex-col gap-1 mb-2">
                    {tradeOff.options.map((option) => {
                      const isChosen = option.name === tradeOff.chosen;
                      return (
                        <li
                          key={option.name}
                          /* Chosen or not is a STATE; how a chosen branch
                             reads is the theme's decision. */
                          data-chosen={isChosen}
                          className="option text-[11px] pl-2"
                        >
                          <span className="t-mono t-strong">
                            {option.name}
                          </span>
                          {isChosen && (
                            <span className="ml-1.5">
                              <Badge tone="confirm">এই ধাপে নির্বাচিত</Badge>
                            </span>
                          )}
                          <span> — {option.note}</span>
                        </li>
                      );
                    })}
                  </ul>

                  <p className="t-body text-[11px]">
                    <span className="t-label t-accent">
                      কেন:{" "}
                    </span>
                    {tradeOff.why}
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </Panel>
  );
};

/** Whether this level has anything worth opening the notes panel for. */
export const hasDesignNotes = (level: LevelConfig): boolean =>
  Boolean(
    level.scaleEstimate ||
      level.tradeOffs?.length ||
      level.keyConcepts?.length
  );
