"use client";

import React from "react";
import {
  EdgeLabelRenderer,
  EdgeProps,
  getSmoothStepPath,
} from "@xyflow/react";
import type { SimulationEdgeData, SignalKind } from "@/app/lib/types";
import { useThemeNumber } from "@/app/hooks/useThemeNumber";
import { usePrefersReducedMotion } from "@/app/hooks/useMediaQuery";

// Data files name the MEANING of a hop; the theme supplies its colour.
const signalColor: Record<SignalKind, string> = {
  request: "var(--t-signal-request)",
  write: "var(--t-signal-write)",
  read: "var(--t-signal-read)",
  success: "var(--t-signal-success)",
  cache: "var(--t-signal-cache)",
  event: "var(--t-signal-event)",
  error: "var(--t-signal-error)",
  meta: "var(--t-signal-meta)",
};

export const AnimatedFlowEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}) => {
  const edgeData = (data as unknown as SimulationEdgeData) || {};
  const isActive = Boolean(edgeData.isActive);
  // The stylesheet neutralises every CSS animation under reduced motion, but
  // the packet below is an <animateMotion> — SMIL, which those rules cannot
  // touch. So it is dropped from the DOM instead. The lit wire and its label
  // still say which hop is live; only the travelling dot goes.
  const reducedMotion = usePrefersReducedMotion();
  // Highlight stays on after the flow finishes, but the motion stops.
  const isAnimated = isActive && edgeData.isAnimated !== false && !reducedMotion;
  const isReverse = Boolean(edgeData.isReverse);
  const color = signalColor[edgeData.particleColor ?? "request"];

  const cornerRadius = useThemeNumber("--t-wire-corner-radius", 4);
  const packetSize = useThemeNumber("--t-packet-size", 7);
  const haloSize = useThemeNumber("--t-packet-halo-size", 14);

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: cornerRadius,
  });

  // Calculate label anchor position: for left-to-right edges, bias towards 38% from source to ensure complete clearance from target node
  let renderLabelX = labelX;
  if (targetX > sourceX + 60) {
    renderLabelX = sourceX + (targetX - sourceX) * 0.38;
  } else if (sourceX > targetX + 60) {
    renderLabelX = targetX + (sourceX - targetX) * 0.38;
  }

  const motion = (
    <animateMotion
      path={edgePath}
      dur="1.2s"
      repeatCount="indefinite"
      calcMode="linear"
      keyPoints={isReverse ? "1;0" : "0;1"}
      keyTimes="0;1"
    />
  );

  return (
    <>
      {/* The wire itself — inert until this step energises it. */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={isActive ? color : undefined}
        strokeOpacity={isActive ? 0.35 : 1}
        className={`wire ${isActive ? "wire--live" : "wire--dormant"}`}
      />

      {/* The energised run, drawn over the dormant wire. */}
      {isActive && (
        <path
          d={edgePath}
          fill="none"
          stroke={color}
          className={`wire wire--live ${
            isAnimated
              ? isReverse
                ? "animated-edge-active-reverse"
                : "animated-edge-active"
              : ""
          }`}
        />
      )}

      {/* The signal travelling the wire. Its shape is a theme value: `rx` is a
          CSS geometry property, so round vs square needs no DOM change. */}
      {isAnimated && (
        <g>
          <rect
            className="packet-halo"
            x={-haloSize / 2}
            y={-haloSize / 2}
            width={haloSize}
            height={haloSize}
            fill={color}
          >
            {motion}
          </rect>
          <rect
            className="packet-core"
            x={-packetSize / 2}
            y={-packetSize / 2}
            width={packetSize}
            height={packetSize}
            fill={color}
          >
            {motion}
          </rect>
        </g>
      )}

      {/* Edge Label Badge — only the hop that is live in this step carries a
          label, so the canvas never shows more than one at a time. */}
      {isActive && edgeData.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -100%) translate(${renderLabelX}px,${labelY - 8}px)`,
              pointerEvents: "all",
              color,
            }}
            className="edge-tag select-none max-w-[170px] truncate"
          >
            {edgeData.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};
