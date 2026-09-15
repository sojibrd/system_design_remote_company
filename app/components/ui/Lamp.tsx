import React from "react";

/**
 * A status indicator. The component only states whether it is lit and whether
 * it is blinking; the theme decides whether that reads as a glowing lamp, a
 * filled square, or a printed dot.
 */
export const Lamp: React.FC<{
  lit?: boolean;
  blink?: boolean;
  color?: string;
  className?: string;
}> = ({ lit = false, blink = false, color, className = "" }) => (
  <span
    aria-hidden
    data-lit={lit}
    data-blink={blink && lit}
    className={`lamp ${className}`}
    style={lit && color ? { color } : undefined}
  />
);
