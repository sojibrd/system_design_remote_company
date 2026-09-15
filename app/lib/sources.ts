/**
 * কাজের লেখার দুই রকম টোকেন কোথায় নামে — `system_design` সাইটের ২৫টা ডক আর
 * দুটো simulation।
 *
 *   `(ডক ১৩)` · `(ডক ১১ · ডক ১৩)`          → ঐ সাইটের ডক
 *   `(sim url-shortener · functional)`      → simulator-এর ঐ সিস্টেম, ঐ লেভেল
 *
 * ঐ repo থেকে হাতে তোলা, build-এর সময় পড়া নয় — CI-তে শুধু এই repo থাকে
 * (`principles.ts`-এর মতো)। plan-এ তালিকার বাইরের নম্বর বা নাম লিখলে build ভাঙে,
 * কিন্তু `system_design`-এ কোনো ডকের ফাইলনাম বদলালে এই তালিকাও হাতে বদলাতে হবে —
 * ওটা build ধরতে পারে না।
 *
 * কোনো `fs` নেই — client-এও চলে।
 */
export const SD_SITE = "https://sojibrd.github.io/system_design";

export type SdDoc = {
  num: number;
  /** ASCII দুই অঙ্ক — route ও key, e.g. "09" */
  code: string;
  /** `system_design/docs/<file>.md` — ঐ সাইটের route `/docs/<file>/` */
  file: string;
  /** ডকের H1 হুবহু */
  title: string;
};

const DOC_FILES: [file: string, title: string][] = [
  ["01-introduction", "Introduction"],
  ["02-performance-vs-scalability", "Performance vs Scalability"],
  ["03-latency-vs-throughput", "Latency vs Throughput"],
  ["04-availability-vs-consistency", "Availability vs Consistency"],
  ["05-consistency-patterns", "Consistency Patterns"],
  ["06-availability-patterns", "Availability Patterns"],
  ["07-background-jobs", "Background Jobs"],
  ["08-domain-name-system", "Domain Name System (DNS)"],
  ["09-content-delivery-networks", "Content Delivery Networks (CDN)"],
  ["10-application-layer", "Application Layer"],
  ["11-load-balancers", "Load Balancers"],
  ["12-databases", "Databases"],
  ["13-caching", "Caching"],
  ["14-asynchronism", "Asynchronism"],
  ["15-communication", "Communication"],
  ["16-idempotent-operations", "Idempotent Operations"],
  ["17-performance-antipatterns", "Performance Antipatterns"],
  ["18-monitoring", "Monitoring"],
  ["19-design-and-implementation-patterns", "Cloud Design Patterns — Design & Implementation"],
  ["20-data-management-patterns", "Cloud Design Patterns — Data Management"],
  ["21-messaging-patterns", "Cloud Design Patterns — Messaging"],
  ["22-availability", "Reliability Patterns — Availability"],
  ["23-high-availability", "Reliability Patterns — High Availability"],
  ["24-resiliency", "Reliability Patterns — Resiliency"],
  ["25-security", "Reliability Patterns — Security"],
];

export const DOCS: SdDoc[] = DOC_FILES.map(([file, title]) => ({
  num: Number(file.slice(0, 2)),
  code: file.slice(0, 2),
  file,
  title,
}));

export function findDoc(num: number): SdDoc | undefined {
  return DOCS.find((doc) => doc.num === num);
}

export function docHref(doc: SdDoc): string {
  return `${SD_SITE}/docs/${doc.file}/`;
}

export type SdSim = { id: string; name: string; levels: readonly string[] };

/** simulator-এ লেভেল URL-এ নেই, পাতার ভেতরের tab — লিংক তাই সিস্টেমের পাতায় */
export const SIMS: SdSim[] = [
  { id: "url-shortener", name: "URL Shortener", levels: ["functional", "reliable", "scalable"] },
  { id: "rate-limiter", name: "Rate Limiter", levels: ["functional", "reliable", "scalable"] },
];

export function findSim(id: string): SdSim | undefined {
  return SIMS.find((sim) => sim.id === id);
}

export function simHref(sim: SdSim): string {
  return `${SD_SITE}/simulation/${sim.id}/`;
}
