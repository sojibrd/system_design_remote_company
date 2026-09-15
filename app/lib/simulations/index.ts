import type { SimulationConfig, SimulationSummary } from "../types";

/**
 * Every system this simulator can walk through.
 *
 * Adding one is still a data-only change — write its levels, then add a line
 * here and a line to `loaders` below.
 *
 * Two lists rather than one, on purpose: the picker is a client component and
 * needs every simulation's NAME, while a page renders exactly one simulation's
 * DATA. Keeping the summaries separate means the name costs a line of text and
 * the data is fetched by the route that actually shows it.
 *
 * The first entry is what `/simulation/` opens on.
 */
export const simulationIndex: SimulationSummary[] = [
  {
    id: "url-shortener",
    name: "URL Shortener",
    tagline: "একটা লম্বা লিংককে ছোট কোডে বদলে, ক্লিক পড়লে আবার ফিরিয়ে দেওয়া",
  },
  {
    id: "rate-limiter",
    name: "Rate Limiter",
    tagline: "কে কতবার ডাকতে পারবে তার হিসাব রেখে ভেতরের সার্ভিসকে বাঁচানো",
  },
];

export const defaultSimulationId = simulationIndex[0].id;

/**
 * Server-side only. Each entry is its own dynamic import, so the build gives
 * every simulation its own chunk and a route pulls in nothing but its own.
 */
const loaders: Record<string, () => Promise<SimulationConfig>> = {
  "url-shortener": () =>
    import("./url-shortener").then((m) => m.urlShortenerSimulation),
  "rate-limiter": () =>
    import("./rate-limiter").then((m) => m.rateLimiterSimulation),
};

export const isSimulationId = (id: string): boolean => id in loaders;

/** An unknown slug falls back to the default rather than failing the build. */
export const loadSimulation = (id: string): Promise<SimulationConfig> =>
  (loaders[id] ?? loaders[defaultSimulationId])();

export const getSummary = (id: string): SimulationSummary =>
  simulationIndex.find((simulation) => simulation.id === id) ?? simulationIndex[0];
