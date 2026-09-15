"use client";

import React, { useRef } from "react";
import type { LevelId, LevelConfig } from "@/app/lib/types";
import { Layers } from "lucide-react";

/**
 * The id the stage carries, so each tab can point at the panel it controls.
 * Exported because the panel and the tabs have to agree on it.
 */
export const LEVEL_PANEL_ID = "level-panel";
export const levelTabId = (levelId: LevelId) => `level-tab-${levelId}`;

export const LevelTabs: React.FC<{
  currentLevelId: LevelId;
  levels: LevelConfig[];
  onSelectLevel: (levelId: LevelId) => void;
}> = ({ currentLevelId, levels, onSelectLevel }) => {
  const listRef = useRef<HTMLDivElement>(null);

  // A tablist is expected to move between its tabs with the arrow keys; Tab
  // itself leaves the group. Without this the roles below would be a promise
  // the widget does not keep.
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
    if (!keys.includes(event.key)) return;

    const index = levels.findIndex((level) => level.id === currentLevelId);
    const last = levels.length - 1;
    const next =
      event.key === "ArrowLeft"
        ? index <= 0
          ? last
          : index - 1
        : event.key === "ArrowRight"
          ? index >= last
            ? 0
            : index + 1
          : event.key === "Home"
            ? 0
            : last;

    event.preventDefault();
    onSelectLevel(levels[next].id);
    listRef.current
      ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      [next]?.focus();
  };

  return (
    /* Revision tabs — the drafts of the same system, A / B / C. The level
       tagline used to sit under these in its own row; it now shares the design
       notes row below, which was carrying a static subtitle anyway. */
    <div
      ref={listRef}
      role="tablist"
      aria-label="আর্কিটেকচার লেভেল"
      onKeyDown={onKeyDown}
      /* A simulation declares only the levels that teach it something — two
         is valid, four (once a `global` tier exists) is valid. A row of equal
         flex children shares the width for ANY count, where a grid would have
         needed the column count as a literal Tailwind class. */
      className="flex gap-2 w-full"
    >
      {levels.map((level, index) => {
        const isSelected = level.id === currentLevelId;

        return (
          <button
            key={level.id}
            id={levelTabId(level.id)}
            type="button"
            onClick={() => onSelectLevel(level.id)}
            aria-selected={isSelected}
            aria-controls={LEVEL_PANEL_ID}
            role="tab"
            /* Roving tabindex: the group is one stop, the arrows move inside it. */
            tabIndex={isSelected ? 0 : -1}
            className="tab relative flex-1 basis-0 min-w-0 min-h-11 sm:min-h-0 py-1.5 px-1.5 sm:px-2 md:px-4"
          >
            {/* On a phone only the level name survives — the ident and the
                component count are context, not navigation. */}
            <span className="t-label hidden sm:inline">
              CFG {String.fromCharCode(65 + index)}
            </span>
            <span className="t-title text-xs md:text-sm truncate">
              {level.name}
            </span>
            <span
              className="t-label hidden md:flex items-center gap-1"
              title={`${level.componentCount}টি কম্পোনেন্ট`}
              aria-label={`${level.componentCount}টি কম্পোনেন্ট`}
            >
              <Layers className="w-3 h-3" />
              {level.componentCount}
            </span>
          </button>
        );
      })}
    </div>
  );
};
