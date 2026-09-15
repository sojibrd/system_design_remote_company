"use client";

import React, { useState } from "react";
import type { FlowKind, FlowDefinition, FlowIcon } from "@/app/lib/types";
import type { SpeedOption } from "@/app/hooks/useSimulation";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Gauge,
  Link,
  CornerUpRight,
  PanelRight,
  Calculator,
  SearchX,
  ShieldAlert,
  BarChart3,
  CircleCheck,
  Ban,
  MoreHorizontal,
  type LucideIcon,
  PanelRightClose,
} from "lucide-react";
import { Button, IconButton, Panel } from "@/app/components/ui";

/** Flow definitions name an icon; the controls bar owns the mapping. */
const flowIcons: Record<FlowIcon, LucideIcon> = {
  link: Link,
  redirect: CornerUpRight,
  miss: SearchX,
  failover: ShieldAlert,
  analytics: BarChart3,
  allow: CircleCheck,
  block: Ban,
};

/** The side slot holds the walkthrough or the design notes — never both. */
export type PanelKind = "steps" | "notes" | null;

interface ControlsBarProps {
  isPlaying: boolean;
  speed: SpeedOption;
  flowType: FlowKind;
  availableFlows: FlowDefinition[];
  currentStepIndex: number;
  totalSteps: number;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
  onSpeedChange: (speed: SpeedOption) => void;
  onFlowChange: (flow: FlowKind) => void;
  /** Drives the always-visible progress ruler. */
  onSelectStep: (index: number) => void;
  /** Flow has run to the end — freeze the ruler's live indicator. */
  isFinished?: boolean;
  /** Which panel occupies the side slot, if any — one at a time. */
  activePanel: PanelKind;
  onTogglePanel: (panel: Exclude<PanelKind, null>) => void;
  /** Levels without capacity numbers, trade-offs or concepts have no notes. */
  hasNotes: boolean;
}

export const ControlsBar: React.FC<ControlsBarProps> = ({
  isPlaying,
  speed,
  flowType,
  availableFlows,
  currentStepIndex,
  totalSteps,
  onPlay,
  onPause,
  onNext,
  onPrev,
  onReset,
  onSpeedChange,
  onFlowChange,
  onSelectStep,
  isFinished = false,
  activePanel,
  onTogglePanel,
  hasNotes,
}) => {
  /**
   * Phones only. The controls split by WHEN they are used, not by importance:
   * flow, speed and reset are set once before a run, so on a phone they wait
   * behind the overflow button instead of costing the canvas a permanent row.
   * From `sm` up everything is on one line and this state is ignored.
   */
  const [isSetupOpen, setIsSetupOpen] = useState(false);

  const selectFlow = (flow: FlowKind) => {
    onFlowChange(flow);
    // Picking a scenario is the end of the setup errand — get out of the way.
    setIsSetupOpen(false);
  };

  // Rendered in the playback row on a phone and on the right on desktop, so
  // neither forces a second row just to exist. Both buttons drive ONE slot: the
  // open one closes on a second press, the other one swaps into its place.
  const stepsOpen = activePanel === "steps";
  const notesOpen = activePanel === "notes";

  const panelToggles = (
    <>
      <Button
        variant={notesOpen ? "primary" : "outline"}
        onClick={() => onTogglePanel("notes")}
        disabled={!hasNotes}
        className="px-3! py-2! text-xs! shrink-0 min-h-11 sm:min-h-0"
        title={
          hasNotes
            ? notesOpen
              ? "ডিজাইন নোট লুকান"
              : "ডিজাইন নোট দেখুন"
            : "এই লেভেলে কোনো নোট নেই"
        }
        aria-pressed={notesOpen}
        aria-label={notesOpen ? "ডিজাইন নোট বন্ধ করুন" : "ডিজাইন নোট খুলুন"}
      >
        <Calculator className="w-4 h-4" />
        <span className="hidden sm:inline">Notes</span>
      </Button>

      <Button
        variant={stepsOpen ? "primary" : "outline"}
        onClick={() => onTogglePanel("steps")}
        className="px-3! py-2! text-xs! shrink-0 min-h-11 sm:min-h-0"
        title={stepsOpen ? "ধাপের তালিকা লুকান" : "ধাপের তালিকা দেখুন"}
        aria-pressed={stepsOpen}
        aria-label={stepsOpen ? "ধাপের তালিকা বন্ধ করুন" : "ধাপের তালিকা খুলুন"}
      >
        {stepsOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRight className="w-4 h-4" />}
        <span className="hidden sm:inline">Steps</span>
      </Button>
    </>
  );

  /**
   * Where the run has got to, on the instrument itself. The steps panel carries
   * the same ruler, but that panel is dismissable — and a machine that hides
   * how far through its cycle it is stops being an instrument. This one is
   * always on, and it is the only readout that survives closing every panel.
   */
  const progressRuler = totalSteps > 0 && (
    <div
      className="flex items-end justify-center gap-1 flex-nowrap overflow-x-auto"
      role="group"
      aria-label={`ধাপ ${currentStepIndex + 1} / ${totalSteps}`}
    >
      {Array.from({ length: totalSteps }, (_, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => onSelectStep(idx)}
          data-state={
            idx === currentStepIndex ? "current" : idx < currentStepIndex ? "done" : "todo"
          }
          data-live={!isFinished}
          className="progress-mark shrink-0"
          title={`${idx + 1} নম্বর ধাপে যান`}
          aria-label={`${idx + 1} নম্বর ধাপে যান`}
        />
      ))}
    </div>
  );

  return (
    <Panel className="w-full p-2.5 md:p-3 overflow-x-auto">
      {/* Above the controls, spanning the whole bar: read the run at a glance
          before reaching for anything. */}
      {progressRuler && <div className="pb-2.5 mb-2.5 seam-b">{progressRuler}</div>}

      <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-2 sm:gap-3">
        {/* 1. Setup: flow selector. Built from what the level declares, so a
               tier can offer a cache-miss or failover scenario without touching
               this file. Hidden behind the overflow button on a phone. */}
        <div
          className={`sm:flex-1 items-center justify-center sm:justify-start min-w-0 ${
            isSetupOpen ? "flex" : "hidden sm:flex"
          }`}
        >
          <div className="segment-group max-w-full overflow-x-auto">
            {availableFlows.map((flow) => {
              const Icon = flowIcons[flow.icon];
              return (
                <button
                  key={flow.id}
                  type="button"
                  onClick={() => selectFlow(flow.id)}
                  aria-pressed={flowType === flow.id}
                  className="segment text-xs shrink-0 min-h-10 sm:min-h-0"
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="whitespace-nowrap">{flow.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Playback — the only row a phone always shows */}
        <div className="shrink-0 flex items-center justify-center gap-2">
          {/* Reset lives in the setup drawer on a phone: it is rare, and sitting
              next to Simulate it invites a mis-tap. */}
          <IconButton
            variant="ghost"
            onClick={onReset}
            title="পুনরায় শুরু"
            aria-label="সিমুলেশন পুনরায় শুরু করুন"
            className="hidden sm:inline-flex"
          >
            <RotateCcw className="w-4 h-4" />
          </IconButton>

          <IconButton
            onClick={onPrev}
            disabled={currentStepIndex < 0}
            title="পূর্ববর্তী ধাপ"
            aria-label="পূর্ববর্তী ধাপ"
            className="min-w-11 min-h-11 sm:min-w-0 sm:min-h-0"
          >
            <SkipBack className="w-4 h-4" />
          </IconButton>

          {isPlaying ? (
            <Button
              variant="alert"
              onClick={onPause}
              aria-label="সিমুলেশন থামান"
              className="min-w-11 min-h-11 px-3! sm:px-4! sm:min-w-0 sm:min-h-0"
            >
              <Pause className="w-4 h-4 fill-current" />
              {/* The glyph carries it on a phone; the word costs a third of the row. */}
              <span className="hidden sm:inline">Pause</span>
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={onPlay}
              aria-label="সিমুলেশন চালান"
              className="min-w-11 min-h-11 px-3! sm:px-4! sm:min-w-0 sm:min-h-0"
            >
              <Play className="w-4 h-4 fill-current" />
              <span className="hidden sm:inline">Simulate</span>
            </Button>
          )}

          <IconButton
            onClick={onNext}
            disabled={totalSteps === 0}
            title="পরবর্তী ধাপ"
            aria-label="পরবর্তী ধাপ"
            className="min-w-11 min-h-11 sm:min-w-0 sm:min-h-0"
          >
            <SkipForward className="w-4 h-4" />
          </IconButton>

          <span className="sm:hidden flex items-center gap-2">{panelToggles}</span>

          {/* Phone-only gateway to the setup row */}
          <IconButton
            onClick={() => setIsSetupOpen((open) => !open)}
            aria-expanded={isSetupOpen}
            aria-label="ফ্লো, গতি ও রিসেট অপশন"
            title="ফ্লো, গতি ও রিসেট"
            className="sm:hidden min-w-11 min-h-11"
          >
            <MoreHorizontal className="w-4 h-4" />
          </IconButton>
        </div>

        {/* 3. Setup: speed and reset. Collapsed on a phone; always shown from
               `sm` up, where it also carries the steps toggle. */}
        <div
          className={`sm:flex-1 items-center justify-center sm:justify-end gap-2 ${
            isSetupOpen ? "flex" : "hidden sm:flex"
          }`}
        >
          <div className="segment-group px-2 py-1 gap-1">
            <Gauge className="t-muted w-3.5 h-3.5 shrink-0" />
            <span className="t-label hidden md:inline mr-1">Speed</span>

            {([0.5, 1, 2] as SpeedOption[]).map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => onSpeedChange(val)}
                aria-pressed={speed === val}
                className="segment t-mono px-2 py-1 sm:px-1.5 sm:py-0.5 text-[11px]"
              >
                {val}x
              </button>
            ))}
          </div>

          <IconButton
            variant="ghost"
            onClick={onReset}
            title="পুনরায় শুরু"
            aria-label="সিমুলেশন পুনরায় শুরু করুন"
            className="min-w-11 min-h-11 sm:hidden"
          >
            <RotateCcw className="w-4 h-4" />
          </IconButton>

          <span className="hidden sm:inline-flex items-center gap-2">{panelToggles}</span>
        </div>
      </div>
    </Panel>
  );
};
