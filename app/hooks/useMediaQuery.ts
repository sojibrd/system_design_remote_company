"use client";

import { useEffect, useState } from "react";

/**
 * Subscribes to a CSS media query from React.
 *
 * Used only where a media query cannot do the job in CSS: an ARIA role that is
 * wrong on one breakpoint, or an SVG <animateMotion>, which is SMIL and so is
 * untouched by `prefers-reduced-motion` rules in the stylesheet.
 *
 * Always false on the first render — `output: "export"` means the HTML is
 * built with no viewport and no reader to ask, so the widest, least surprising
 * answer is the one that ships, corrected on mount.
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const list = window.matchMedia(query);
    const update = () => setMatches(list.matches);

    update();
    list.addEventListener("change", update);
    return () => list.removeEventListener("change", update);
  }, [query]);

  return matches;
};

/** The reader has asked their OS to stop things moving. Honour it. */
export const usePrefersReducedMotion = () =>
  useMediaQuery("(prefers-reduced-motion: reduce)");

