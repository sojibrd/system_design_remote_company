"use client";

import { useEffect, useState } from "react";

/**
 * Reads a numeric value out of the active theme.
 *
 * Most theme values reach the DOM as CSS, but a few things — SVG geometry, a
 * canvas grid spacing — are props React has to pass as numbers. Rather than
 * hardcoding those in a component (which would break the theme contract), the
 * theme still owns the value and the component reads it back at runtime.
 */
export const useThemeNumber = (name: string, fallback: number) => {
  const [value, setValue] = useState(fallback);

  useEffect(() => {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(name);
    const parsed = Number.parseFloat(raw);
    // Reading computed style is only possible after paint, and the server has
    // no theme to read — so the first render must use the fallback and correct
    // itself once. That is exactly one extra render, on mount only.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!Number.isNaN(parsed) && parsed !== value) setValue(parsed);
  }, [name, value]);

  return value;
};
