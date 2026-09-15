import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "../components/icons";
import { getDocUses } from "../lib/plan";
import { DOCS, docHref } from "../lib/sources";
import { toBnDigits } from "../lib/dates";

export const metadata: Metadata = { title: "ডক" };

/**
 * `system_design`-এর ২৫টা ডক, এই পথে কোনটা কোন দিনে আসে। রেফারেন্স — রোজ এখান
 * থেকে শুরু নয়, শুরু "আজ" থেকে। plan-এ নেই এমন ডক আলাদা নিচে, যাতে বাকিগুলো যে
 * জেনেশুনে বাদ, সেটা চোখে পড়ে। 🧠 Pareto principle
 */
export default function DocsPage() {
  const uses = getDocUses();
  const inPlan = DOCS.filter((doc) => uses[doc.code]);
  const outside = DOCS.filter((doc) => !uses[doc.code]);

  return (
    <>
      <header className="flex flex-col gap-2">
        <h1 className="t-title text-2xl sm:text-3xl">ডক</h1>
        <p className="t-body measure text-sm">
          ডকগুলো `system_design` সাইটে — এখানে শুধু কোনটা এই পথের কোন দিনে লাগে। ডক পড়া ইনপুট; গোনা হয় লেখা আর বলা।
          plan-এর বাইরের ডক অসম্পূর্ণ কাজ নয় — এই পথের জন্য দরকার নেই।
        </p>
      </header>

      <section className="surface-panel flex flex-col gap-3 p-4 sm:p-6">
        <h2 className="t-title text-base sm:text-lg">এই পথে · {toBnDigits(inPlan.length)}টা</h2>
        <ul className="flex flex-col gap-1">
          {inPlan.map((doc) => (
            <li key={doc.code}>
              <Link href={`/doc/${doc.code}/`} className="row flex items-center gap-3 px-3 py-2 text-sm">
                <span className="t-mono shrink-0 text-xs">{doc.code}</span>
                <span className="min-w-0 flex-1 truncate">{doc.title}</span>
                <span className="chip chip--accent shrink-0">plan-এ {toBnDigits(uses[doc.code].length)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {outside.length > 0 && (
        <section className="surface-panel flex flex-col gap-3 p-4 sm:p-6">
          <h2 className="t-title text-base sm:text-lg">এই পথে নেই · {toBnDigits(outside.length)}টা</h2>
          <ul className="flex flex-col gap-1">
            {outside.map((doc) => (
              <li key={doc.code}>
                <a href={docHref(doc)} target="_blank" rel="noreferrer" className="row flex items-center gap-3 px-3 py-2 text-sm">
                  <span className="t-mono shrink-0 text-xs">{doc.code}</span>
                  <span className="min-w-0 flex-1 truncate">{doc.title}</span>
                  <ArrowUpRight size={12} />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
