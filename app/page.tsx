import Markdown from "./components/Markdown";
import TodayView from "./components/TodayView";
import { getDays, getRules } from "./lib/plan";
import { SITE } from "./lib/site";
import { slugify } from "./lib/slug";

export default function HomePage() {
  const rules = getRules();
  /* নিয়মের heading থেকেই anchor — heading বদলালে লিংক নিজে বদলায়; না থাকলে সতর্কতার লিংক নেই */
  const dipHeading = /^##\s+(Dip-এর নিয়ম.*)$/m.exec(rules.body)?.[1];

  return (
    <>
      <header className="flex flex-col gap-2">
        <h1 className="t-title text-2xl sm:text-3xl">{SITE.title}</h1>
        <Markdown inline className="t-body measure text-sm">
          {rules.goal}
        </Markdown>
      </header>
      <TodayView days={getDays()} dipHref={dipHeading ? `/rules/#${slugify(dipHeading)}` : null} />
    </>
  );
}
