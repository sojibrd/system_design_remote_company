/**
 * কাজের লেখায় `(sim url-shortener · functional)` কোথায় নামে — এই সাইটের
 * simulator (`app/lib/simulations/`)-এর ঐ সিস্টেম, ঐ লেভেল।
 *
 * লেভেলের তালিকা হাতে লেখা: simulation-এর পুরো ডেটা dynamic import-এ আসে, আর
 * plan পড়া হয় সাথে সাথে। plan-এ তালিকার বাইরের নাম বা লেভেল লিখলে build ভাঙে;
 * `lib/simulations/`-এ সিস্টেম বা লেভেল যোগ করলে এখানেও যোগ করুন।
 *
 * ডকের তালিকা এখানে নেই — ওটা `guide/` থেকে পড়া (`lib/guide.ts`)।
 *
 * কোনো `fs` নেই — client-এও চলে।
 */
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
  return `/simulation/${sim.id}/`;
}
