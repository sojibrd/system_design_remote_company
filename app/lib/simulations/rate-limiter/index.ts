import type { SimulationConfig } from "../../types";
import { functionalLevel } from "./functional";
import { scalableLevel } from "./scalable";
import { reliableLevel } from "./reliable";

export const rateLimiterSimulation: SimulationConfig = {
  id: "rate-limiter",
  name: "Rate Limiter",
  tagline: "কে কতবার ডাকতে পারবে তার হিসাব রেখে ভেতরের সার্ভিসকে বাঁচানো",
  // No `global` level: the counter is the whole system here, and a counter
  // shared across regions is a different problem (CRDTs, per-region quotas)
  // than the one these three levels tell.
  levels: [functionalLevel, scalableLevel, reliableLevel],
};

export { functionalLevel, scalableLevel, reliableLevel };
