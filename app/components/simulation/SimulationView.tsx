"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { LevelId, SimulationConfig, SimulationSummary } from "@/app/lib/types";
import { useSimulation } from "@/app/hooks/useSimulation";
import { Header } from "@/app/components/simulation/Header";
import {
  LevelTabs,
  LEVEL_PANEL_ID,
  levelTabId,
} from "@/app/components/simulation/LevelTabs";
import {
  DesignNotes,
  hasDesignNotes,
} from "@/app/components/simulation/DesignNotes";
import { FlowDiagram } from "@/app/components/simulation/FlowDiagram";
import {
  ControlsBar,
  type PanelKind,
} from "@/app/components/simulation/ControlsBar";
import { WalkthroughPanel } from "@/app/components/simulation/WalkthroughPanel";
import { Sheet } from "@/app/components/ui";

/**
 * The whole simulator, for ONE simulation.
 *
 * Which simulation that is belongs to the URL, not to this component's state:
 * a reader who has walked halfway through the chat system can send someone the
 * link and they land on the chat system. Picking another one is therefore a
 * navigation, and the next page arrives with its own data already loaded —
 * this component never holds more than the system on screen.
 */
export const SimulationView: React.FC<{
  simulation: SimulationConfig;
  index: SimulationSummary[];
}> = ({ simulation, index }) => {
  const router = useRouter();

  const [currentLevelId, setCurrentLevelId] = useState<LevelId>(
    simulation.levels[0].id
  );
  /* The side slot holds ONE thing: the step walkthrough or the level's design
     notes. Pressing the open panel's button closes it; pressing the other
     swaps. */
  const [activePanel, setActivePanel] = useState<PanelKind>(null);

  // A simulation need not offer the level that was selected on the previous one
  // — a per-city dispatch system has no global tier — so fall back to its first.
  const currentLevel =
    simulation.levels.find((level) => level.id === currentLevelId) ??
    simulation.levels[0];

  /* A level may have no notes to show — switching to one while its panel is
     open would otherwise leave an empty sheet on screen. */
  const levelHasNotes = hasDesignNotes(currentLevel);
  const openPanel: PanelKind =
    activePanel === "notes" && !levelHasNotes ? null : activePanel;

  const togglePanel = (panel: Exclude<PanelKind, null>) =>
    setActivePanel((open) => (open === panel ? null : panel));

  const {
    currentStepIndex,
    isPlaying,
    isFinished,
    speed,
    flowType,
    availableFlows,
    totalSteps,
    currentStep,
    currentSteps,
    nodes,
    edges,
    play,
    pause,
    nextStep,
    prevStep,
    goToStep,
    reset,
    setSpeed,
    setFlowType,
  } = useSimulation(currentLevel);

  // Keyboard navigation shortcuts (ArrowLeft / ArrowRight / Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevStep();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        nextStep();
      } else if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        if (isPlaying) {
          pause();
        } else {
          play();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevStep, nextStep, play, pause, isPlaying]);

  return (
    /* `h-full`, not `h-dvh`: the height this fills is what the site shell
       leaves after the sidebar and the mobile top bar, not the viewport. */
    <div className="h-full overflow-hidden flex flex-col">
      {/* Top Navigation Header */}
      <Header
        simulations={index}
        currentSimulationId={simulation.id}
        onSelectSimulation={(id) => router.push(`/simulation/${id}/`)}
      />

      {/* Stage Container — fills exactly what the header leaves behind */}
      <div
        role="region"
        aria-label="সিমুলেশন ভিউয়ার"
        className="flex-1 min-h-0 w-full px-2 sm:px-3 md:px-5 lg:px-6 py-2 md:py-3 flex flex-col gap-2 md:gap-3"
      >
        {/* Level Selector Tabs */}
        <div className="shrink-0">
          <LevelTabs
            currentLevelId={currentLevel.id}
            levels={simulation.levels}
            onSelectLevel={(levelId) => setCurrentLevelId(levelId)}
          />
        </div>

        {/* Simulation stage — takes every pixel the other rows do not need.
            Opening a panel SPLITS this box rather than layering over it: rows
            below `lg`, columns above. Nothing ever covers the canvas, because
            watching the animation while reading the step is the whole app. */}
        <div
          className={`flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 ${
            openPanel ? "grid-rows-[45%_minmax(0,1fr)] lg:grid-rows-1" : ""
          }`}
        >
          {/* Architecture Canvas */}
          <div
            /* The canvas IS the panel the level tabs control — saying so is
               what makes the tablist above a real widget rather than three
               buttons wearing the role. */
            id={LEVEL_PANEL_ID}
            role="tabpanel"
            aria-labelledby={levelTabId(currentLevel.id)}
            className={`min-h-0 h-full overflow-hidden ${
              openPanel ? "lg:col-span-7 xl:col-span-8" : "lg:col-span-12"
            }`}
          >
            <FlowDiagram
              key={`${simulation.id}-${currentLevel.id}`}
              nodes={nodes}
              edges={edges}
              fitViewSignal={openPanel !== null}
            />
          </div>

          {/* Step-by-step walkthrough: a column on desktop, the stage's lower
              row on a phone. */}
          <Sheet
            open={openPanel !== null}
            onClose={() => setActivePanel(null)}
            label={openPanel === "notes" ? "ডিজাইন নোট" : "ধাপে ধাপে ওয়াকথ্রু"}
            className="min-h-0 lg:col-span-5 xl:col-span-4"
          >
            {openPanel === "notes" ? (
              <DesignNotes
                level={currentLevel}
                onClose={() => setActivePanel(null)}
              />
            ) : (
              <WalkthroughPanel
                currentStep={currentStep}
                currentStepIndex={currentStepIndex}
                totalSteps={totalSteps}
                steps={currentSteps}
                onSelectStep={goToStep}
                conceptSummary={currentLevel.conceptSummary}
                onClose={() => setActivePanel(null)}
              />
            )}
          </Sheet>
        </div>

        {/* Playback & Flow Controls — always full width, pinned to the bottom */}
        <div className="shrink-0">
          <ControlsBar
            isPlaying={isPlaying}
            speed={speed}
            flowType={flowType}
            availableFlows={availableFlows}
            currentStepIndex={currentStepIndex}
            totalSteps={totalSteps}
            onPlay={play}
            onPause={pause}
            onNext={nextStep}
            onPrev={prevStep}
            onReset={reset}
            onSpeedChange={setSpeed}
            onFlowChange={setFlowType}
            onSelectStep={goToStep}
            isFinished={isFinished}
            activePanel={openPanel}
            onTogglePanel={togglePanel}
            hasNotes={levelHasNotes}
          />
        </div>
      </div>
    </div>
  );
};
