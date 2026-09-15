/**
 * প্রতিটি সিমুলেশনের ভেতরের রেফারেন্স যাচাই করে।
 *
 * একটা step যে node বা edge-কে "active" বলছে, সেটা সত্যিই ওই লেভেলে আছে কিনা —
 * TypeScript এটা ধরতে পারে না, কারণ সবই স্ট্রিং। ভুল আইডি লিখলে build পাস করে,
 * কিন্তু ক্যানভাসে ওই ধাপে কিছুই জ্বলে না। এই স্ক্রিপ্ট সেটাই ধরে।
 *
 * চালান: npm run check:simulations
 */
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

/**
 * তালিকাটা হাতে লেখা নয় — `simulationIndex` থেকেই আসে। নইলে নতুন সিমুলেশন যোগ
 * করলে স্ক্রিপ্ট সেটা নীরবে বাদ দিয়ে "সব ঠিক" বলত, অর্থাৎ যে জালটা ভুল ধরার
 * জন্য, সেটাই মিথ্যা আশ্বাস দিত।
 */
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const registryPath = resolve(repoRoot, "app/lib/simulations/index.ts");
const { simulationIndex, loadSimulation } = await import(
  pathToFileURL(registryPath).href
);

let broken = 0;
let warnings = 0;

const fail = (msg) => {
  console.log(`✗ ${msg}`);
  broken++;
};

for (const summary of simulationIndex) {
  const sim = await loadSimulation(summary.id);

  if (!sim || !sim.levels) {
    fail(`${summary.id}: কোনো SimulationConfig পাওয়া যায়নি`);
    continue;
  }
  if (sim.id !== summary.id) {
    fail(`${summary.id}: config-এর id "${sim.id}" — registry-র slug-এর সাথে মিলছে না`);
  }

  for (const level of sim.levels) {
    const nodeIds = new Set(level.nodes.map((node) => node.id));
    const edgeIds = new Set(level.edges.map((edge) => edge.id));
    const where = `${sim.id}/${level.id}`;

    for (const edge of level.edges) {
      for (const end of ["source", "target"]) {
        if (!nodeIds.has(edge[end])) {
          fail(`${where} edge ${edge.id}: ${end} "${edge[end]}" নামে কোনো node নেই`);
        }
      }
    }

    const usedNodeIds = new Set();
    const usedEdgeIds = new Set();

    for (const flow of level.flows) {
      for (const step of flow.steps) {
        const at = `${where}/${step.id}`;

        if (step.flowType !== flow.id) {
          fail(`${at}: flowType "${step.flowType}" ≠ flow "${flow.id}"`);
        }
        for (const id of step.activeNodeIds ?? []) {
          usedNodeIds.add(id);
          if (!nodeIds.has(id)) fail(`${at}: activeNode "${id}" নেই`);
        }
        for (const id of step.activeEdgeIds ?? []) {
          usedEdgeIds.add(id);
          if (!edgeIds.has(id)) fail(`${at}: activeEdge "${id}" নেই`);
        }
        for (const id of Object.keys(step.edgeOverrides ?? {})) {
          if (!edgeIds.has(id)) fail(`${at}: edgeOverride "${id}" নেই`);
        }
        for (const id of Object.keys(step.nodeStatusMessages ?? {})) {
          if (!nodeIds.has(id)) fail(`${at}: nodeStatusMessage "${id}" নেই`);
        }
      }
    }

    // ক্যানভাসে আছে কিন্তু কোনো ধাপে কখনো জ্বলে না — ঝুলে থাকা বাক্স বা তার।
    const warn = (msg) => {
      console.log(`⚠ ${msg}`);
      warnings++;
    };

    for (const id of nodeIds) {
      if (!usedNodeIds.has(id)) warn(`${where}: node "${id}" কোনো ধাপে সক্রিয় হয় না`);
    }
    for (const id of edgeIds) {
      if (!usedEdgeIds.has(id)) warn(`${where}: edge "${id}" কোনো ধাপে সক্রিয় হয় না`);
    }

    // ভুল হলে build ভাঙার মতো নয়, কিন্তু ডিজাইন নোটে ভুল সংখ্যা দেখায়।
    if (level.componentCount !== level.nodes.length) {
      warn(
        `${where}: componentCount ${level.componentCount}, কিন্তু node আছে ${level.nodes.length}টি`
      );
    }
  }

  const steps = sim.levels.reduce(
    (total, level) =>
      total + level.flows.reduce((sum, flow) => sum + flow.steps.length, 0),
    0
  );
  console.log(`${sim.id}: ${sim.levels.length} লেভেল, ${steps} ধাপ যাচাই করা হলো`);
}

console.log(
  broken === 0
    ? `✓ সব রেফারেন্স ঠিক${warnings ? ` (${warnings}টি সতর্কতা)` : ""}`
    : `✗ ${broken}টি ভাঙা রেফারেন্স`
);

process.exit(broken === 0 ? 0 : 1);
