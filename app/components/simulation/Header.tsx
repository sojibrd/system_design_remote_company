"use client";

import React from "react";
import { Cpu } from "lucide-react";
import type { SimulationSummary } from "@/app/lib/types";
import { SimulationPicker } from "./SimulationPicker";

export const Header: React.FC<{
  simulations: SimulationSummary[];
  currentSimulationId: string;
  onSelectSimulation: (id: string) => void;
}> = ({ simulations, currentSimulationId, onSelectSimulation }) => {
  return (
    /* The rack header plate: ident on the left, the unit under test on the right. */
    <header className="surface-panel w-full seam-b-heavy px-4 py-2 shrink-0 z-40">
      <div className="w-full flex items-center justify-between gap-3">
        {/* On a phone the site's own top bar already names where you are, so
            the rack ident is redundant width — the picker keeps the row. */}
        <div className="hidden md:flex items-center gap-2.5">
          <div className="surface-well t-accent w-8 h-8 flex items-center justify-center">
            <Cpu className="w-4 h-4" />
          </div>
          <h1 lang="en" className="t-title text-sm md:text-base">
            System Design Simulator
          </h1>
        </div>

        <SimulationPicker
          simulations={simulations}
          currentId={currentSimulationId}
          onSelect={onSelectSimulation}
        />
      </div>
    </header>
  );
};
