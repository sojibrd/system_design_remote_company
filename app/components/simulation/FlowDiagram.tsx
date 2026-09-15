"use client";

import React, { useEffect, useMemo, useRef } from "react";
import {
  ReactFlow,
  ReactFlowInstance,
  Background,
  Controls,
  BackgroundVariant,
  NodeTypes,
  EdgeTypes,
} from "@xyflow/react";
import { SimulationNode } from "./SimulationNode";
import { AnimatedFlowEdge } from "./AnimatedEdge";
import type { CustomNodeType, CustomEdgeType } from "@/app/lib/types";
import { Lamp } from "@/app/components/ui";
import { useThemeNumber } from "@/app/hooks/useThemeNumber";

// Padding trimmed from 0.22: at the smallest level three units sat in a mostly
// empty field.
// minZoom is a FLOOR ON FITTING, and it was the reason a phone showed only a
// slice of the diagram: the widest level spans ~1780px against a ~350px canvas,
// which needs roughly 0.18 to fit — a 0.4 floor simply clipped it. It is set
// low enough that fitView can always frame the whole system; the cards go small
// at that zoom, but seeing the shape is the point of zooming out.
const FIT_VIEW_OPTIONS = { padding: 0.12, minZoom: 0.1, maxZoom: 1.5 };

/** Below this the canvas is the short upper row of a split phone stage, where
    the usual padding eats the little height there is. */
const SHORT_CANVAS_PX = 360;
const SHORT_FIT_VIEW_OPTIONS = { ...FIT_VIEW_OPTIONS, padding: 0.06 };

/** Long enough for the stage grid to settle at its new size before re-fitting. */
const RELAYOUT_SETTLE_MS = 260;

interface FlowDiagramProps {
  nodes: CustomNodeType[];
  edges: CustomEdgeType[];
  /** Changing this re-fits the viewport — used when the canvas width changes. */
  fitViewSignal?: unknown;
}

export const FlowDiagram: React.FC<FlowDiagramProps> = ({
  nodes,
  edges,
  fitViewSignal,
}) => {
  const instanceRef = useRef<ReactFlowInstance<
    CustomNodeType,
    CustomEdgeType
  > | null>(null);

  const shellRef = useRef<HTMLDivElement>(null);

  // Toggling the walkthrough panel resizes this canvas — narrower on a wide
  // screen, shorter on a phone, where the stage splits into rows. React Flow
  // measures its container, and the new size is not readable until the browser
  // has laid the grid out again — hence a beat before re-fitting, rather than
  // fitting into the size the canvas is about to stop being.
  useEffect(() => {
    const timer = setTimeout(() => {
      const isShort =
        (shellRef.current?.clientHeight ?? Infinity) < SHORT_CANVAS_PX;
      instanceRef.current?.fitView(
        isShort ? SHORT_FIT_VIEW_OPTIONS : FIT_VIEW_OPTIONS
      );
    }, RELAYOUT_SETTLE_MS);

    return () => clearTimeout(timer);
  }, [fitViewSignal]);

  const nodeTypes: NodeTypes = useMemo(
    () => ({
      simulationNode: SimulationNode,
    }),
    []
  );

  const canvasGap = useThemeNumber("--t-canvas-gap", 22);
  const canvasDotSize = useThemeNumber("--t-canvas-dot-size", 1);

  const edgeTypes: EdgeTypes = useMemo(
    () => ({
      animatedFlowEdge: AnimatedFlowEdge,
    }),
    []
  );

  return (
    <div
      ref={shellRef}
      className="surface-well w-full h-full min-h-0 overflow-hidden relative"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onInit={(instance) => {
          instanceRef.current = instance;
        }}
        fitView
        fitViewOptions={FIT_VIEW_OPTIONS}
        /* Matches the fit floor — otherwise React Flow would clamp the very
           fit it was just asked to perform, and pinch-out would stop short of
           the whole diagram on a phone. */
        minZoom={0.1}
        maxZoom={1.8}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        panOnDrag={true}
        panOnScroll={false}
        zoomOnScroll={true}
        proOptions={{ hideAttribution: true }}
      >
        {/* The backdrop the units sit on — the theme decides its texture. */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={canvasGap}
          size={canvasDotSize}
          color="var(--t-canvas-dot)"
        />
        {/* The stage itself. React Flow stacks its grid at z-index -1, edges at
            2 and nodes at 4, so z-0 puts this between the grid and the diagram
            — it dresses the floor without ever sitting over a unit or a wire. */}
        <div className="backplane absolute inset-0 z-0" aria-hidden />

        <Controls showInteractive={false} position="bottom-left" className="!m-3" />
      </ReactFlow>

      {/* Floating Canvas Hint */}
      <div className="chip absolute top-3 right-3 pointer-events-none">
        <Lamp lit color="var(--t-ok)" />
        <span>Pan &amp; Zoom</span>
      </div>
    </div>
  );
};
