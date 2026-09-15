import type { SimulationConfig } from "../../types";
import { functionalLevel } from "./functional";
import { scalableLevel } from "./scalable";
import { reliableLevel } from "./reliable";

export const urlShortenerSimulation: SimulationConfig = {
  id: "url-shortener",
  name: "URL Shortener",
  tagline: "একটা লম্বা লিংককে ছোট কোডে বদলে, ক্লিক পড়লে আবার ফিরিয়ে দেওয়া",
  // No `global` level yet — a second region is a real design step for this
  // system, it simply has not been drawn.
  levels: [functionalLevel, scalableLevel, reliableLevel],
};

export { functionalLevel, scalableLevel, reliableLevel };
