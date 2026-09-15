"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { Handle, Position, NodeProps, useStore } from "@xyflow/react";
import type { SimulationNodeData, ComponentCategory } from "@/app/lib/types";
import {
  Info,
  Monitor,
  Server,
  Database,
  Network,
  ShieldCheck,
  Layers3,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { Badge, Lamp, Ornament } from "@/app/components/ui";

// The node names its category; the theme supplies the colour behind that name.
const categoryColor: Record<ComponentCategory, string> = {
  client: "var(--t-cat-client)",
  compute: "var(--t-cat-compute)",
  storage: "var(--t-cat-storage)",
  network: "var(--t-cat-network)",
  security: "var(--t-cat-security)",
  queue: "var(--t-cat-queue)",
  analytics: "var(--t-cat-analytics)",
};

/**
 * The node names its category; the component picks the glyph for that name.
 * The data files still carry an `emoji`, but a colour emoji is a fixed bitmap —
 * it would ignore the theme on paper stock or on a monochrome phosphor screen.
 * A lucide icon inherits `currentColor`, so the theme keeps the last word.
 */
const categoryIcon: Record<ComponentCategory, LucideIcon> = {
  client: Monitor,
  compute: Server,
  storage: Database,
  network: Network,
  security: ShieldCheck,
  queue: Layers3,
  analytics: BarChart3,
};

const HANDLE_SIDES = [
  { position: Position.Left, id: "l" },
  { position: Position.Right, id: "r" },
  { position: Position.Top, id: "t" },
  { position: Position.Bottom, id: "b" },
] as const;

/**
 * Assumed card height for the very first frame, before the card exists and can
 * be measured. Every frame after that uses its real height.
 */
const CARD_CLEARANCE = 260;

export const SimulationNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as unknown as SimulationNodeData;
  // The tooltip is opt-in only. The step narration already lives in the
  // walkthrough panel, so auto-opening it here just covered up the diagram.
  const [showTooltip, setShowTooltip] = useState(false);
  // The card normally hangs above the unit, but the canvas clips its own
  // bounds — a unit near the top of the stage would open into nothing.
  const [openUpwards, setOpenUpwards] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  // The info button has to be able to name the card it opens.
  const cardId = `unit-card-${useId()}`;

  // Panning or zooming the canvas moves this unit under a card that has
  // already picked its side, so the choice is re-made whenever the viewport
  // moves — not once, at open. Only while a card is actually open, though:
  // every unit on the stage runs this, and a live subscription would re-render
  // all of them on every frame of a pan for the sake of the one that is open.
  const transform = useStore((state) => (showTooltip ? state.transform : null));

  const placeCard = useCallback(() => {
    const unit = rootRef.current?.getBoundingClientRect();
    if (!unit) return;
    // Measured, not assumed: the card is as tall as its own content.
    const needed = cardRef.current?.offsetHeight ?? CARD_CLEARANCE;
    // Room is counted inside the canvas, not the window — the header owns the
    // strip above the stage, and a card opened into it would be clipped.
    const stage = rootRef.current?.closest(".react-flow")?.getBoundingClientRect();
    const above = unit.top - (stage?.top ?? 0);
    const below = (stage?.bottom ?? window.innerHeight) - unit.bottom;
    // Upwards is the default; downwards only when the card genuinely fits
    // there and not above. If neither side fits, take the roomier one.
    setOpenUpwards(above > needed || above >= below);
  }, []);

  useEffect(() => {
    if (showTooltip) placeCard();
  }, [showTooltip, transform, placeCard]);

  // Dismissable by tapping away or by Escape. This is also what keeps ONE card
  // open at a time: opening another unit's card is a pointer-down out here.
  useEffect(() => {
    if (!showTooltip) return;

    // `pointerdown`, not `mousedown`: a touch that React Flow handles as a
    // canvas gesture may never produce the emulated mouse event.
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setShowTooltip(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowTooltip(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [showTooltip]);

  const toggleTooltip = () => {
    // First guess from the assumed height so the card opens on the right side
    // immediately; the effect above corrects it against the real one.
    if (!showTooltip) placeCard();
    setShowTooltip((prev) => !prev);
  };

  const color = categoryColor[nodeData.category] ?? categoryColor.compute;
  const CategoryIcon = categoryIcon[nodeData.category] ?? categoryIcon.compute;
  const isActive = Boolean(nodeData.isActive);
  // Highlight stays on after the flow finishes, but the motion stops.
  const isAnimated = isActive && nodeData.isAnimated !== false;

  return (
    <div
      ref={rootRef}
      data-active={isActive}
      data-animated={isAnimated}
      data-selected={Boolean(selected)}
      /* The unit NAMES its category here; the theme paints the spine for it.
         The inline `color` below stays for the parts a stylesheet cannot reach
         (an SVG glyph, a lamp) — the edge of the card is not one of them. */
      data-category={nodeData.category}
      /* Denser than it was: at 440x176 a thirteen-unit tier could only be read
         by zooming out past legible. One size has to serve every tier. */
      className="unit relative group select-none w-84 min-h-32 flex flex-col justify-center"
    >
      {/* Whatever the theme puts in a unit corners. */}
      <Ornament color={color} />

      {/* Both a source and a target handle on every side, so each edge can name
          the exact pair it wants ("r-s" -> "l-t") instead of letting React Flow
          guess and send the line looping around the diagram. */}
      {HANDLE_SIDES.map(({ position, id }) => (
        <React.Fragment key={id}>
          <Handle type="target" position={position} id={`${id}-t`} className="terminal" />
          <Handle type="source" position={position} id={`${id}-s`} className="terminal" />
        </React.Fragment>
      ))}

      <div className="px-5 py-4 flex flex-col justify-center min-h-32">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3.5 min-w-0">
            <span
              className="surface-well shrink-0 w-11 h-11 flex items-center justify-center"
              style={{ color }}
            >
              <CategoryIcon className="w-6 h-6" aria-hidden />
            </span>
            <div className="min-w-0">
              <span className="flex items-center gap-2 min-w-0">
                <Lamp lit={isActive} blink={isAnimated} color={color} />
                <span className="t-label truncate" style={{ color }}>
                  {nodeData.category}
                </span>
              </span>
              <h4 className="t-title text-lg truncate">{nodeData.label}</h4>
              {nodeData.subLabel && (
                <p className="t-mono t-caption text-xs truncate leading-tight">
                  {nodeData.subLabel}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); toggleTooltip(); }}
            className="control control--quiet p-1 shrink-0"
            aria-expanded={showTooltip}
            aria-controls={showTooltip ? cardId : undefined}
            aria-label="কম্পোনেন্টের বিস্তারিত তথ্য"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>

        {/* Live status readout, shown only while this unit is engaged. */}
        {isActive && nodeData.statusMessage && (
          <div className="surface-well mt-3 px-2.5 py-1.5 flex items-center gap-2.5">
            <Lamp lit blink={isAnimated} color="var(--t-accent)" />
            <span className="t-mono t-accent text-sm truncate">
              {nodeData.statusMessage}
            </span>
          </div>
        )}
      </div>

      {/* Detail card on tap. */}
      {showTooltip && (
        <div
          ref={cardRef}
          id={cardId}
          /* A named region, so a screen reader announces what the info button
             just opened instead of leaving it as loose text on the canvas. */
          role="group"
          aria-label={`${nodeData.label} — বিস্তারিত`}
          className={`surface-raised absolute z-50 left-1/2 -translate-x-1/2 w-64 p-3 text-left pointer-events-none ${
            openUpwards ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          <div className="flex items-center gap-2 mb-1.5 pb-1 seam-b">
            <CategoryIcon className="w-4 h-4 shrink-0" style={{ color }} aria-hidden />
            <span className="t-title text-xs">{nodeData.label}</span>
            <span className="chip ml-auto" style={{ color, borderColor: color }}>
              {nodeData.category}
            </span>
          </div>
          <p className="t-body text-[11px] mb-2">{nodeData.description}</p>
          {nodeData.analogy && (
            <div className="surface-well p-1.5 text-[10px] mb-1.5">
              <span className="t-mono t-accent">Analogy: </span>
              <span className="t-body">{nodeData.analogy}</span>
            </div>
          )}
          {nodeData.techSpecs && <Badge>SPEC: {nodeData.techSpecs}</Badge>}
        </div>
      )}
    </div>
  );
};
