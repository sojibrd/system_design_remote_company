"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  FlowKind,
  FlowDefinition,
  LevelConfig,
  CustomNodeType,
  CustomEdgeType,
  SimulationStep,
} from "@/app/lib/types";

export type SpeedOption = 0.5 | 1 | 2;

/** How long one step holds the screen at 1x. */
const BASE_STEP_MS = 3200;

export interface UseSimulationReturn {
  currentStepIndex: number;
  isPlaying: boolean;
  isFinished: boolean;
  speed: SpeedOption;
  flowType: FlowKind;
  /** The flows this level declares, in selector order. */
  availableFlows: FlowDefinition[];
  totalSteps: number;
  currentStep: SimulationStep | null;
  currentSteps: SimulationStep[];
  nodes: CustomNodeType[];
  edges: CustomEdgeType[];
  play: () => void;
  pause: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  reset: () => void;
  setSpeed: (speed: SpeedOption) => void;
  setFlowType: (flow: FlowKind) => void;
}

export function useSimulation(levelConfig: LevelConfig): UseSimulationReturn {
  const [flowType, setFlowTypeState] = useState<FlowKind>(
    levelConfig.flows[0].id
  );
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<SpeedOption>(1);

  // A level only declares the flows that make sense for it — the functional
  // level has no cache, so it has no cache-miss flow. Falling back to the first
  // flow keeps the selector honest when switching between levels.
  const steps = useMemo(() => {
    const flow =
      levelConfig.flows.find((f) => f.id === flowType) ?? levelConfig.flows[0];
    return flow?.steps ?? [];
  }, [levelConfig, flowType]);

  const totalSteps = steps.length;
  const currentStep = currentStepIndex >= 0 ? steps[currentStepIndex] || null : null;

  // Sitting on the last step with playback stopped means the flow is done —
  // the diagram keeps its highlight but all motion is switched off.
  const isFinished =
    !isPlaying && totalSteps > 0 && currentStepIndex === totalSteps - 1;

  // Switching level starts a fresh run: back to the first flow, before step
  // one, paused. Adjusted during render rather than in an effect so the
  // diagram never paints one frame of the old level's state.
  //
  // The guard compares the config OBJECT, not `levelConfig.id`: a LevelId is
  // only unique WITHIN a simulation, so two systems that both open on their
  // "functional" tier would have slipped past an id check and carried one
  // system's step index and flow into the other. Level configs are module
  // constants, so identity is stable across renders and unique across systems.
  const [lastLevel, setLastLevel] = useState<LevelConfig>(levelConfig);
  if (lastLevel !== levelConfig) {
    setLastLevel(levelConfig);
    setCurrentStepIndex(-1);
    setIsPlaying(false);
    setFlowTypeState(levelConfig.flows[0].id);
  }

  // How much of the CURRENT step has already been watched. The timer effect
  // below re-runs whenever speed or playback changes, and without this its
  // clock would restart from zero every time — a step you were most of the way
  // through would begin again on a speed change, or on pause-then-resume.
  //
  // `consumed` is the time banked from earlier viewing spells of this step;
  // `runningSince` is when the spell now in progress began. Both are seeded by
  // effects rather than at declaration: reading the clock during render is not
  // a pure thing to do, and these effects always run before the timer's.
  const consumed = useRef(0);
  const runningSince = useRef(0);

  // A new step starts its clock from scratch.
  useEffect(() => {
    consumed.current = 0;
    runningSince.current = Date.now();
  }, [currentStepIndex]);

  // Pausing banks the spell just watched; resuming opens a new one.
  useEffect(() => {
    if (isPlaying) {
      runningSince.current = Date.now();
    } else {
      consumed.current += Date.now() - runningSince.current;
    }
  }, [isPlaying]);

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying || totalSteps === 0) return;

    const elapsed = consumed.current + (Date.now() - runningSince.current);
    const delay = Math.max(0, BASE_STEP_MS / speed - elapsed);

    const timer = setTimeout(() => {
      setCurrentStepIndex((prev) => {
        if (prev + 1 < totalSteps) {
          return prev + 1;
        } else {
          // Finished flow — reset to initial state (-1) so diagram matches before-starting situation
          setIsPlaying(false);
          return -1;
        }
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, totalSteps, speed]);

  const play = useCallback(() => {
    // An empty flow would otherwise "play" forever with nothing on screen.
    if (totalSteps === 0) return;
    if (currentStepIndex < 0 || currentStepIndex >= totalSteps - 1) {
      // Restarting from the top: the clock starts over even when the index is
      // already 0 — a one-step flow would otherwise resume with the whole step
      // banked as watched and skip straight past it.
      consumed.current = 0;
      runningSince.current = Date.now();
      setCurrentStepIndex(0);
    }
    setIsPlaying(true);
  }, [currentStepIndex, totalSteps]);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const nextStep = useCallback(() => {
    if (totalSteps === 0) return;
    setIsPlaying(false);
    setCurrentStepIndex((prev) => (prev < 0 ? 0 : prev + 1 < totalSteps ? prev + 1 : -1));
  }, [totalSteps]);

  const prevStep = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex((prev) => (prev > 0 ? prev - 1 : -1));
  }, []);

  const goToStep = useCallback(
    (index: number) => {
      setIsPlaying(false);
      if (index >= 0 && index < totalSteps) {
        setCurrentStepIndex(index);
      }
    },
    [totalSteps]
  );

  const reset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex(-1);
  }, []);

  const setFlowType = useCallback((flow: FlowKind) => {
    setFlowTypeState(flow);
    setCurrentStepIndex(-1);
    setIsPlaying(false);
  }, []);

  // Compute active state on nodes and edges
  const nodes = useMemo(() => {
    const activeNodes = currentStep?.activeNodeIds || [];
    const focusedNodeId = activeNodes[0];
    const statusMsgs = currentStep?.nodeStatusMessages || {};

    return levelConfig.nodes.map((node) => {
      const isActive = activeNodes.includes(node.id);
      const isFocused = node.id === focusedNodeId;
      const statusMessage = statusMsgs[node.id];

      return {
        ...node,
        data: {
          ...node.data,
          isActive,
          isFocused,
          isAnimated: isActive && !isFinished,
          statusMessage,
        },
      };
    });
  }, [levelConfig.nodes, currentStep, isFinished]);

  const edges = useMemo(() => {
    const activeEdges = currentStep?.activeEdgeIds || [];
    const edgeOverrides = currentStep?.edgeOverrides || {};

    return levelConfig.edges.map((edge) => {
      const isActive = activeEdges.includes(edge.id);
      const override = edgeOverrides[edge.id] || {};
      return {
        ...edge,
        data: {
          ...edge.data,
          isActive,
          isAnimated: isActive && !isFinished,
          ...override,
        },
      };
    });
  }, [levelConfig.edges, currentStep, isFinished]);

  return {
    currentStepIndex,
    isPlaying,
    isFinished,
    speed,
    flowType,
    availableFlows: levelConfig.flows,
    totalSteps,
    currentStep,
    currentSteps: steps,
    nodes,
    edges,
    play,
    pause,
    nextStep,
    prevStep,
    goToStep,
    reset,
    setSpeed,
    setFlowType,
  };
}
