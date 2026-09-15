import fs from "node:fs";
import path from "node:path";
import { findGuideDoc } from "./guide";
import { findSim, simHref } from "./sources";

/**
 * server-only — `fs` দিয়ে build-এর সময় `docs/` পড়ে। client component এখান থেকে
 * শুধু `import type` নিতে পারে; মান import করলে `fs` bundle-এ ঢুকে build ভাঙবে।
 *
 * সত্যের উৎস `docs/`-এর `^\d\d-.*\.md` ফাইলগুলো: `00-rules.md` নিয়ম, বাকিগুলো
 * ব্লক। ব্লক, দিন, কাজ — কিছুই কোডে হার্ডকোড নেই। ফাইলে **তারিখ নেই**, শুধু দিনের
 * নম্বর; তারিখ আসে ব্যবহারকারীর বসানো শুরুর দিন থেকে (`lib/dates.ts`)।
 */
const DOCS_DIR = path.join(process.cwd(), "docs");
const RULES_FILE = "00-rules.md";
const DOC_RE = /^(\d\d)-(.+)\.md$/;

/** কাজের লেখায় `(ডক ১৩)` বা `(sim url-shortener · functional)` — এই সাইটের কোন ডক পড়বেন বা কোন simulation চালাবেন */
export type TaskSource =
  | { kind: "doc"; num: number; code: string; title: string; href: string }
  | { kind: "sim"; id: string; name: string; level: string; href: string };

export type Task = {
  /**
   * progress-এর key — দিন + কাজের **লেখা** থেকে hash। একই লেখা দুই দিনে থাকলেও
   * key আলাদা; কাজ আগে-পরে যোগ করলে টিক টেকে, কিন্তু লেখা বদলালে ঐ টিক হারায়।
   */
  id: string;
  /** মিনিট, ⚑, 🔁 আর 🧠 (…) বাদে বাকি markdown */
  text: string;
  /** শুরুর `৩০′` — না থাকলে `null` */
  minutes: number | null;
  /** 🧠-এর বন্ধনীর নীতিগুলো */
  principles: string[];
  /** ⚑ — নির্ধারিত দিনে না হলে হোমে জমে থাকে */
  milestone: boolean;
  /** 🔁 — শেষ করার দিন থেকে ১/৩/৭/২১ দিনে ঝালাই */
  repeat: boolean;
  /** লেখার ক্রমে, একই ডক দুবার নয় */
  sources: TaskSource[];
};

export type Day = {
  /** ১ থেকে — শুরুর তারিখ + (num − ১) = এই দিনের তারিখ */
  num: number;
  /** ASCII তিন অঙ্ক — route ও key, e.g. "007" */
  code: string;
  /** ফাইলে যেমন লেখা, e.g. "০০৭" */
  label: string;
  title: string;
  /** ফাঁকা হতে পারে — plan-এর ঐ দিনে এই সাইটের ঘর নেই */
  tasks: Task[];
  /** `> **দিন শেষে:**`-এর প্রশ্ন */
  check: string;
};

export type Block = {
  num: number;
  /** ফাইলনাম থেকে, নম্বর বাদে — `01-own-project.md` → "own-project" */
  slug: string;
  /** H1 হুবহু, e.g. "ব্লক ১ — নিজের প্রজেক্ট" */
  title: string;
  /** H1-এর "— "-এর পরের অংশ */
  name: string;
  /** H1-এর নিচের italic লাইন, "· dip" বাদে */
  range: string;
  /** italic লাইনের শেষে "· dip" — ছেড়ে দেওয়ার ঝুঁকির সময় */
  dip: boolean;
  /** H1 আর প্রথম দিনের মাঝের markdown, ব্লক-শেষের প্রশ্ন বাদে */
  intro: string;
  /** `> **ব্লক শেষে:**`-এর প্রশ্ন */
  check: string;
  days: Day[];
};

export type Rules = {
  title: string;
  subtitle: string;
  /** প্রথম `> ` লাইন — লক্ষ্য */
  goal: string;
  body: string;
};

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

export function toAsciiDigits(value: string): string {
  return value.replace(/[০-৯]/g, (digit) => String(BN_DIGITS.indexOf(digit)));
}

/** djb2 — ছোট, স্থির, dependency ছাড়া */
function hash(value: string): string {
  let h = 5381;
  for (let i = 0; i < value.length; i++) h = ((h << 5) + h + value.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

const H1_RE = /^#\s+(.+)$/;
const ITALIC_RE = /^\*[^*].*\*$/;
const DAY_RE = /^###\s+দিন\s+([০-৯0-9]+)\s+·\s+(.+)$/;
const TASK_RE = /^-\s+\[[ xX]\]\s+(.+)$/;
const DAY_CHECK_RE = /^>\s*\*\*দিন শেষে:\*\*\s*(.+)$/;
const BLOCK_CHECK_RE = /^>\s*\*\*ব্লক শেষে:\*\*\s*(.+)$/;
const BRAIN_RE = /\s*🧠\s*(?:\(([^)]*)\))?\s*$/;
const MINUTES_RE = /^([০-৯0-9]+)′\s*/;
const DIP_RE = /\s*·\s*dip\s*$/;
/** `(ডক ১৩)`, `(ডক ১১ · ডক ১৩)` */
const DOC_GROUP_RE = /\((ডক\s+[০-৯0-9]+(?:\s*·\s*ডক\s+[০-৯0-9]+)*)\)/g;
const DOC_NUM_RE = /ডক\s+([০-৯0-9]+)/g;
/** `(sim url-shortener · functional)` */
const SIM_RE = /\(sim\s+([a-z-]+)\s*·\s*([a-z]+)\)/g;

function parseSources(dayCode: string, raw: string): TaskSource[] {
  const sources: TaskSource[] = [];

  for (const group of raw.matchAll(DOC_GROUP_RE)) {
    for (const match of group[1].matchAll(DOC_NUM_RE)) {
      const doc = findGuideDoc(Number(toAsciiDigits(match[1])));
      /* ভুল নম্বর build-এই ধরা পড়ুক — সাইটে ভাঙা লিংক নয় */
      if (!doc) throw new Error(`docs: দিন ${dayCode}-এ ${group[0]} — এই নম্বরের ডক guide/-এ নেই`);
      if (sources.some((item) => item.kind === "doc" && item.num === doc.num)) continue;
      sources.push({ kind: "doc", num: doc.num, code: doc.code, title: doc.title, href: `/doc/${doc.code}/` });
    }
  }

  for (const match of raw.matchAll(SIM_RE)) {
    const sim = findSim(match[1]);
    if (!sim) throw new Error(`docs: দিন ${dayCode}-এ ${match[0]} — এই simulation নেই`);
    if (!sim.levels.includes(match[2])) {
      throw new Error(`docs: দিন ${dayCode}-এ ${match[0]} — ${sim.name}-এ "${match[2]}" লেভেল নেই`);
    }
    sources.push({ kind: "sim", id: sim.id, name: sim.name, level: match[2], href: simHref(sim) });
  }

  return sources;
}

function parseTask(dayCode: string, raw: string): Task {
  const brain = BRAIN_RE.exec(raw);
  const principles = brain?.[1]
    ? brain[1]
        .split("·")
        .map((name) => name.trim())
        .filter(Boolean)
    : [];

  let text = raw.replace(BRAIN_RE, "");
  const minutes = MINUTES_RE.exec(text);
  text = text.replace(MINUTES_RE, "");

  return {
    id: `d${dayCode}-${hash(raw)}`,
    text: text.replace(/\s*⚑\s*/g, " ").replace(/\s*🔁/g, "").trim(),
    minutes: minutes ? Number(toAsciiDigits(minutes[1])) : null,
    principles,
    milestone: raw.includes("⚑"),
    repeat: raw.includes("🔁"),
    sources: parseSources(dayCode, raw),
  };
}

function readDoc(file: string): string[] {
  return fs.readFileSync(path.join(DOCS_DIR, file), "utf8").split(/\r?\n/);
}

function parseBlock(file: string, num: number, slug: string): Block {
  let title = "";
  let range = "";
  let dip = false;
  let check = "";
  const intro: string[] = [];
  const days: Day[] = [];
  let day: Day | null = null;

  for (const line of readDoc(file)) {
    if (!title) {
      const h1 = H1_RE.exec(line);
      if (h1) {
        title = h1[1].trim();
        continue;
      }
    }

    const dayMatch = DAY_RE.exec(line);
    if (dayMatch) {
      const code = toAsciiDigits(dayMatch[1]).padStart(3, "0");
      day = {
        num: Number(code),
        code,
        label: dayMatch[1],
        title: dayMatch[2].trim(),
        tasks: [],
        check: "",
      };
      days.push(day);
      continue;
    }

    if (day) {
      const task = TASK_RE.exec(line);
      if (task) {
        day.tasks.push(parseTask(day.code, task[1]));
        continue;
      }
      const dayCheck = DAY_CHECK_RE.exec(line);
      if (dayCheck) day.check = dayCheck[1].trim();
      continue;
    }

    const blockCheck = BLOCK_CHECK_RE.exec(line);
    if (blockCheck) {
      check = blockCheck[1].trim();
      continue;
    }

    if (title && !range && ITALIC_RE.test(line.trim())) {
      const meta = line.trim().slice(1, -1);
      dip = DIP_RE.test(meta);
      range = meta.replace(DIP_RE, "");
      continue;
    }

    intro.push(line);
  }

  return {
    num,
    slug,
    title,
    name: title.split("—").at(-1)?.trim() || title,
    range,
    dip,
    intro: intro.join("\n").trim(),
    check,
    days,
  };
}

let blocksCache: Block[] | null = null;

export function getBlocks(): Block[] {
  if (blocksCache) return blocksCache;

  blocksCache = fs
    .readdirSync(DOCS_DIR)
    .filter((file) => DOC_RE.test(file) && file !== RULES_FILE)
    .sort()
    .map((file) => {
      const [, num, slug] = DOC_RE.exec(file)!;
      return parseBlock(file, Number(num), slug);
    });

  /* দিনের নম্বর পরপর না হলে তারিখের হিসাব ভুল হবে — build-এই থামুক */
  blocksCache
    .flatMap((block) => block.days.map((day) => day.num))
    .forEach((num, i) => {
      if (num !== i + 1) throw new Error(`docs: দিনের নম্বর পরপর নয় — ${i + 1} হওয়ার কথা, পাওয়া গেছে ${num}`);
    });
  return blocksCache;
}

export function getRules(): Rules {
  let title = "";
  let subtitle = "";
  let goal = "";
  const body: string[] = [];

  for (const line of readDoc(RULES_FILE)) {
    if (!title) {
      const h1 = H1_RE.exec(line);
      if (h1) {
        title = h1[1].trim();
        continue;
      }
    }
    if (title && !subtitle && ITALIC_RE.test(line.trim())) {
      subtitle = line.trim().slice(1, -1);
      continue;
    }
    if (!goal && line.startsWith("> ")) goal = line.slice(2).trim();
    body.push(line);
  }

  return { title, subtitle, goal, body: body.join("\n").trim() };
}

/** সব দিন এক সারিতে, প্রতিটার সাথে তার ব্লক */
export type TimelineDay = Day & { blockSlug: string; blockName: string; dip: boolean };

export function getDays(): TimelineDay[] {
  return getBlocks().flatMap((block) =>
    block.days.map((day) => ({ ...day, blockSlug: block.slug, blockName: block.name, dip: block.dip })),
  );
}

export function getBlock(slug: string): Block | undefined {
  return getBlocks().find((block) => block.slug === slug);
}

/** ঝালাইয়ের পাতার জন্য — শুধু 🔁 কাজ, যেটুকু client-এ পাঠানো দরকার */
export type RepeatTask = { id: string; text: string; dayCode: string; dayLabel: string };

export function getRepeatTasks(): RepeatTask[] {
  return getDays().flatMap((day) =>
    day.tasks
      .filter((task) => task.repeat)
      .map((task) => ({ id: task.id, text: task.text, dayCode: day.code, dayLabel: day.label })),
  );
}

/** ডকের key (`"13"`) → plan-এর যে দিনের যে কাজে ডকটা আছে, ডকের পাতার জন্য */
export type DocUse = { dayCode: string; dayLabel: string; dayTitle: string; text: string };

export function getDocUses(): Record<string, DocUse[]> {
  const map: Record<string, DocUse[]> = {};
  for (const day of getDays()) {
    for (const task of day.tasks) {
      for (const source of task.sources) {
        if (source.kind !== "doc") continue;
        (map[source.code] ??= []).push({ dayCode: day.code, dayLabel: day.label, dayTitle: day.title, text: task.text });
      }
    }
  }
  return map;
}

/** Rail-এর সূচি — কাজের লেখা ছাড়া */
export type IndexDay = { num: number; code: string; label: string; title: string; taskIds: string[] };

export type IndexBlock = {
  num: number;
  slug: string;
  name: string;
  range: string;
  dip: boolean;
  check: string;
  days: IndexDay[];
};

export function getPlanIndex(): IndexBlock[] {
  return getBlocks().map((block) => ({
    num: block.num,
    slug: block.slug,
    name: block.name,
    range: block.range,
    dip: block.dip,
    check: block.check,
    days: block.days.map((day) => ({
      num: day.num,
      code: day.code,
      label: day.label,
      title: day.title,
      taskIds: day.tasks.map((task) => task.id),
    })),
  }));
}
