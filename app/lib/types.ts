import type { Node, Edge } from "@xyflow/react";

export type ComponentCategory =
  | "client"
  | "compute"
  | "storage"
  | "network"
  | "queue"
  | "security"
  | "analytics";

export interface SimulationNodeData extends Record<string, unknown> {
  label: string;
  subLabel?: string;
  category: ComponentCategory;
  emoji: string;
  analogy: string;
  description: string;
  techSpecs?: string;
  isActive?: boolean;
  isFocused?: boolean;
  /** False once the flow has finished — highlight stays, motion stops. */
  isAnimated?: boolean;
  statusMessage?: string;
}

/**
 * Semantic name for the ink a flowing packet is drawn in. Data files name the
 * MEANING of a hop; `AnimatedEdge` resolves it to a token colour.
 */
export type SignalKind =
  | "request"
  | "write"
  | "read"
  | "success"
  | "cache"
  | "event"
  | "error"
  | "meta";

export interface SimulationEdgeData extends Record<string, unknown> {
  label?: string;
  isActive?: boolean;
  /** False once the flow has finished — highlight stays, motion stops. */
  isAnimated?: boolean;
  isReverse?: boolean;
  particleColor?: SignalKind;
  highlightText?: string;
}

export type CustomNodeType = Node<SimulationNodeData, "simulationNode">;
export type CustomEdgeType = Edge<SimulationEdgeData, "animatedFlowEdge">;

/**
 * Which scenario a flow depicts. Cache hit and cache miss are ALTERNATIVES to
 * each other, not consecutive moments, so each gets its own timeline instead of
 * being spliced into one.
 */
export type FlowKind =
  | "shorten"
  | "redirect"
  | "redirect-miss"
  | "failover"
  | "analytics"
  // Rate limiter: the two answers a limiter can give, and what it does when
  // the thing holding the count is unreachable.
  | "allowed"
  | "throttled"
  | "limiter-down";

/** Name of a lucide icon the controls bar renders for a flow. */
export type FlowIcon =
  | "link"
  | "redirect"
  | "miss"
  | "failover"
  | "analytics"
  | "allow"
  | "block";

export interface FlowDefinition {
  id: FlowKind;
  /** Short label on the flow selector button. */
  name: string;
  icon: FlowIcon;
  steps: SimulationStep[];
}

export interface SimulationStep {
  id: string;
  flowType: FlowKind;
  stepNumber: number;
  title: string;
  whatHappens: string; // Kid-friendly bold summary in Bangla
  whyItMatters: string; // Technical reasoning
  analogy: string; // Real-world analogy with emoji
  activeNodeIds: string[];
  activeEdgeIds: string[];
  edgeOverrides?: Record<string, { label?: string; isReverse?: boolean; particleColor?: SignalKind }>;
  nodeStatusMessages?: Record<string, string>;
  payloadSnippet?: string;
}

/**
 * A level is a PROMISE the architecture keeps, not a difficulty rating. The
 * order cannot be shuffled: you only reach for replicas after you have split
 * reads out, and you only think about geography once one region is solid.
 *
 * - functional — it works, in the fewest components possible
 * - scalable   — it survives load; the first bottleneck has been removed
 * - reliable   — it stays CORRECT when machines die AND when writers collide
 * - global     — it survives distance (optional: meaningless for a system that
 *                is inherently single-region, e.g. a per-city dispatch service)
 */
export type LevelId = "functional" | "scalable" | "reliable" | "global";

/**
 * The back-of-the-envelope numbers this level is sized for. These are what
 * justify the component count — without them each tier looks like an arbitrary
 * pile of boxes.
 *
 * Only the four universal figures are fields. Anything system-specific (a URL
 * shortener's code length, a chat system's fan-out, a feed's follower ceiling)
 * goes in `extras`, so this type never grows a column that most simulations
 * would have to leave blank.
 */
export interface ScaleEstimate {
  /** e.g. "১০০ writes/sec" */
  writeQps: string;
  readQps: string;
  /** e.g. "১০০ : ১" */
  readWriteRatio: string;
  /** Storage needed after five years. */
  storage5y: string;
  /** System-specific figures, rendered after the four universal ones. */
  extras?: { label: string; value: string }[];
}

/**
 * A decision that shaped this architecture but has no hop to animate — the
 * "why", as opposed to the "what happens".
 */
export interface TradeOff {
  /** The question being settled, e.g. "301 না 302?" */
  question: string;
  options: { name: string; note: string }[];
  /** Which option this level takes, and why. */
  chosen: string;
  why: string;
}

export interface LevelConfig {
  id: LevelId;
  /** Display name — normally the level's own word ("Scalable"). */
  name: string;
  badge: string;
  tagline: string;
  componentCount: number;
  conceptSummary: string;
  keyConcepts: string[];
  scaleEstimate?: ScaleEstimate;
  tradeOffs?: TradeOff[];
  nodes: CustomNodeType[];
  edges: CustomEdgeType[];
  /** First entry is the flow selected when the level opens. */
  flows: FlowDefinition[];
}

/**
 * One complete system design problem. A simulation declares only the levels
 * that teach it something — three is a perfectly valid architecture story, and
 * an empty "Global" tab would be worse than no tab at all.
 */
export interface SimulationConfig extends SimulationSummary {
  /** Ordered functional → global. First entry is the default level. */
  levels: LevelConfig[];
}

/**
 * What the picker needs to list a simulation — and nothing more.
 *
 * A full config carries every node, edge and step of every level; one system
 * is well over a hundred kilobytes of it. The picker has to know about ALL of
 * them while the page renders exactly ONE, so the list it reads is this
 * summary instead. That is what keeps a tenth simulation from being paid for
 * on the first load of the other nine.
 */
export interface SimulationSummary {
  /** Stable slug — also the route segment: `/simulation/<id>/`. */
  id: string;
  name: string;
  /** One line describing the problem, shown in the picker. */
  tagline: string;
}
