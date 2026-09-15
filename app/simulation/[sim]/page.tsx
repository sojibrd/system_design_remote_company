import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SimulationView } from "@/app/components/simulation/SimulationView";
import {
  getSummary,
  isSimulationId,
  loadSimulation,
  simulationIndex,
} from "@/app/lib/simulations";

export const dynamicParams = false;

export function generateStaticParams() {
  return simulationIndex.map((simulation) => ({ sim: simulation.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sim: string }>;
}): Promise<Metadata> {
  const { sim } = await params;
  const summary = getSummary(sim);
  return {
    title: `আর্কিটেকচার সিমুলেটর — ${summary.name}`,
    description: summary.tagline,
  };
}

export default async function SimulationPage({
  params,
}: {
  params: Promise<{ sim: string }>;
}) {
  const { sim } = await params;
  if (!isSimulationId(sim)) notFound();

  const simulation = await loadSimulation(sim);
  return <SimulationView simulation={simulation} index={simulationIndex} />;
}
