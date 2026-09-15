import type { Metadata } from "next";
import { SimulationView } from "@/app/components/simulation/SimulationView";
import {
  defaultSimulationId,
  getSummary,
  loadSimulation,
  simulationIndex,
} from "@/app/lib/simulations";

/**
 * `/simulation/` is the default system, not a menu.
 *
 * A static export cannot redirect, and a landing page listing one entry would
 * be a click that teaches nothing — so this route simply IS the first
 * simulation. Every system also has its own linkable URL under `[sim]`.
 */
export const metadata: Metadata = {
  title: `আর্কিটেকচার সিমুলেটর — ${getSummary(defaultSimulationId).name}`,
  description: getSummary(defaultSimulationId).tagline,
};

export default async function SimulationPage() {
  const simulation = await loadSimulation(defaultSimulationId);
  return <SimulationView simulation={simulation} index={simulationIndex} />;
}
