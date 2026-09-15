import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "../../components/Markdown";
import Pager from "../../components/Pager";
import { getGuideDocs } from "../../lib/guide";
import { getDocUses } from "../../lib/plan";

type Params = { code: string };

/** ২৫টাই — plan-এ না থাকলেও পাতা থাকে, যাতে লিংক কখনো ভাঙে না */
export function generateStaticParams(): Params[] {
  return getGuideDocs().map((doc) => ({ code: doc.code }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { code } = await params;
  const doc = getGuideDocs().find((item) => item.code === code);
  return { title: doc ? `ডক ${doc.code} · ${doc.title}` : "ডক" };
}

/**
 * একটা ডক: এই পথে কোন দিনের কোন কাজে আসে, তারপর `guide/`-এর লেখা হুবহু। ডক পড়া
 * ইনপুট — কাজ হলো পড়ে বন্ধ করে নিজের প্রজেক্ট দিয়ে লেখা বা বলা।
 */
export default async function DocPage({ params }: { params: Promise<Params> }) {
  const { code } = await params;
  const docs = getGuideDocs();
  const index = docs.findIndex((doc) => doc.code === code);
  if (index === -1) notFound();

  const doc = docs[index];
  const uses = getDocUses()[doc.code] ?? [];
  const prev = docs[index - 1];
  const next = docs[index + 1];

  return (
    <>
      <header className="flex flex-col gap-2">
        <div className="t-label flex flex-wrap items-center gap-2">
          <Link href="/docs/" className="t-accent">
            ডক
          </Link>
          <span>•</span>
          <span>{doc.code}</span>
        </div>
        <h1 className="t-title text-2xl sm:text-3xl">{doc.title}</h1>
      </header>

      <section className="surface-panel flex flex-col gap-4 p-4 sm:p-6">
        <h2 className="t-title text-base sm:text-lg">এই পথে যেখানে আসে</h2>
        {uses.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {uses.map((use, i) => (
              <li key={`${use.dayCode}-${i}`} className="surface-raised flex flex-col gap-2 p-3 sm:p-4">
                <Link href={`/day/${use.dayCode}/`} className="chip chip--accent self-start">
                  দিন {use.dayLabel} · {use.dayTitle}
                </Link>
                <Markdown inline className="task-text text-sm">
                  {use.text}
                </Markdown>
              </li>
            ))}
          </ul>
        ) : (
          <div className="surface-well t-caption p-4 text-center">
            এই পথের কোনো দিনে এই ডক নেই — জেনেশুনে বাদ, দরকার হলে পরে। 🧠 Pareto principle
          </div>
        )}
      </section>

      <article className="surface-panel p-4 sm:p-6 md:p-8">
        <Markdown>{doc.body}</Markdown>
      </article>

      <Pager
        label="ডক"
        prev={prev && { href: `/doc/${prev.code}/`, label: `${prev.code} ${prev.title}` }}
        next={next && { href: `/doc/${next.code}/`, label: `${next.code} ${next.title}` }}
      />
    </>
  );
}
