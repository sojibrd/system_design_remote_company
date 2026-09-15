import React from "react";

/** A divider between two regions of a panel. */
export const Rule: React.FC<{
  weight?: "hair" | "heavy";
  className?: string;
}> = ({ weight = "hair", className = "" }) => (
  <div className={`${weight === "heavy" ? "seam-b-heavy" : "seam"} ${className}`} />
);

const CORNERS = ["tl", "tr", "bl", "br"] as const;

/**
 * The decoration in a unit corners. Deliberately meaningless in itself — this
 * is the slot a theme uses to give a unit its character: registration ticks on
 * a drawing, screws on a rack panel, or nothing at all. The DOM never changes;
 * only `--t-ornament-*` does.
 */
export const Ornament: React.FC<{ color?: string }> = ({ color }) => (
  <>
    {CORNERS.map((corner) => (
      <span
        key={corner}
        aria-hidden
        data-corner={corner}
        className="ornament-mark"
        style={color ? ({ "--t-ornament-color": color } as React.CSSProperties) : undefined}
      />
    ))}
  </>
);
