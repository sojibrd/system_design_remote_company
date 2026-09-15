import fs from "node:fs";
import path from "node:path";
import { toBnDigits } from "./dates";

/**
 * server-only — `fs` দিয়ে build-এর সময় `guide/` পড়ে। client component এখান থেকে
 * শুধু `import type` নিতে পারে; মান import করলে `fs` bundle-এ ঢুকে build ভাঙবে।
 *
 * `guide/` = অবসরপ্রাপ্ত `system_design`-এর ২৫টা ডক হুবহু (`guide/<nn>-<slug>.md`)।
 * কাজের লেখায় `(ডক ১৩)` মানে `guide/13-*.md` — ফাইলটা না থাকলে build ভাঙে
 * (`plan.ts`)। তিন পথের `guide/` এক; কোনো ডক বদলালে তিন repo-তেই একই বদল।
 */
const GUIDE_DIR = path.join(process.cwd(), "guide");
const DOC_FILE_RE = /^(\d\d)-.+\.md$/;

export type GuideDoc = {
  num: number;
  /** ASCII দুই অঙ্ক — route ও key, e.g. "09" */
  code: string;
  /** কাজের টোকেনের মতো, e.g. "০৯" */
  label: string;
  /** ডকের H1 হুবহু */
  title: string;
  /** H1 বাদে বাকি markdown */
  body: string;
};

let docsCache: GuideDoc[] | null = null;

export function getGuideDocs(): GuideDoc[] {
  if (docsCache) return docsCache;

  docsCache = fs
    .readdirSync(GUIDE_DIR)
    .filter((file) => DOC_FILE_RE.test(file))
    .sort()
    .map((file) => {
      const code = file.slice(0, 2);
      const lines = fs.readFileSync(path.join(GUIDE_DIR, file), "utf8").split(/\r?\n/);
      /* প্রথম H1-ই শিরোনাম — পরের `# …` code block-এর ভেতরের comment হতে পারে */
      const h1 = lines.findIndex((line) => /^#\s+/.test(line));
      return {
        num: Number(code),
        code,
        label: toBnDigits(code),
        title: h1 === -1 ? file.replace(/\.md$/, "") : lines[h1].replace(/^#\s+/, "").trim(),
        body: lines
          .filter((_, i) => i !== h1)
          .join("\n")
          .trim(),
      };
    });
  return docsCache;
}

/** `(ডক ১৩)` → ডক ১৩ */
export function findGuideDoc(num: number): GuideDoc | undefined {
  return getGuideDocs().find((doc) => doc.num === num);
}
