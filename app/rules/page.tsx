import type { Metadata } from "next";
import Markdown from "../components/Markdown";
import { getRules } from "../lib/plan";

export const metadata: Metadata = { title: "নিয়ম" };

/**
 * দিনের বাইরের সব লেখা — লক্ষ্য, সপ্তাহের ছন্দ, শেখার নিয়ম, ঝালাই, Dip-এর নিয়ম,
 * যা করবেন না। `docs/00-rules.md`-এ যেমন, এখানে তেমনই।
 */
export default function RulesPage() {
  const rules = getRules();

  return (
    <>
      <header className="flex flex-col gap-2">
        <h1 className="t-title text-2xl sm:text-3xl">{rules.title}</h1>
        <p className="t-body measure text-sm">{rules.subtitle}</p>
      </header>
      <section className="surface-panel p-4 sm:p-6 md:p-8">
        <Markdown className="measure">{rules.body}</Markdown>
      </section>
    </>
  );
}
