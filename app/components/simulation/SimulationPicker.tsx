"use client";

import React, { useEffect, useRef, useState } from "react";
import type { SimulationSummary } from "@/app/lib/types";
import { Check, ChevronDown, Cpu } from "lucide-react";

/**
 * Picks which system to walk through.
 *
 * A dropdown rather than a second row of tabs: the level tabs work BECAUSE
 * their order carries meaning (functional → global is a story). Simulations
 * have no such order, and twenty of them would never fit on one row — two rows
 * of tabs would just leave the reader guessing which row means what.
 */
export const SimulationPicker: React.FC<{
  simulations: SimulationSummary[];
  currentId: string;
  onSelect: (id: string) => void;
}> = ({ simulations, currentId, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const current =
    simulations.find((simulation) => simulation.id === currentId) ?? simulations[0];

  // Close on outside click and on Escape — a menu that traps the reader is worse
  // than no menu.
  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  // With a single system there is nothing to pick — show the plate, not a menu.
  if (simulations.length < 2) {
    return (
      <div className="chip hidden sm:flex px-2.5 py-1 text-xs">
        <Cpu className="w-3.5 h-3.5 t-accent" />
        <span>{current.name}</span>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="সিমুলেশন নির্বাচন করুন"
        className="chip flex items-center gap-2 px-2.5 py-1 text-xs"
      >
        <Cpu className="w-3.5 h-3.5 t-accent" />
        <span className="truncate max-w-[160px]">{current.name}</span>
        <ChevronDown className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="surface-panel absolute right-0 top-full mt-1.5 z-50 w-72 max-h-[60vh] overflow-y-auto p-1"
        >
          {simulations.map((simulation) => {
            const isCurrent = simulation.id === current.id;
            return (
              <button
                key={simulation.id}
                type="button"
                role="option"
                aria-selected={isCurrent}
                onClick={() => {
                  onSelect(simulation.id);
                  setIsOpen(false);
                }}
                className="row w-full text-left px-2 py-1.5 flex items-start gap-2"
              >
                <span className="w-3.5 shrink-0 pt-0.5">
                  {isCurrent && <Check className="w-3.5 h-3.5" />}
                </span>
                <span className="min-w-0">
                  <span className="t-strong block text-xs">{simulation.name}</span>
                  <span className="t-caption block">{simulation.tagline}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
