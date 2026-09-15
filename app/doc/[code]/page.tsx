import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "../../components/Markdown";
import Pager from "../../components/Pager";
import { ArrowUpRight } from "../../components/icons";
import { getDocUses } from "../../lib/plan";
import { DOCS, docHref } from "../../lib/sources";

type Params = { code: string };

/** ২৫টাই — plan-এ না থাকলেও পাতা থাকে, যাতে লিংক কখনো ভাঙে না */
export function generateStaticParams(): Params[] {
  return DOCS.map((doc) => ({ code: doc.code }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { code } = await params;
  const doc = DOCS.find((item) => item.code === code);
  return { title: doc ? `ডক ${doc.code} · ${doc.title}` : "ডক" };
}

/**
 * একটা ডক: এই পথে কোন দিনের কোন কাজে আসে, আর `system_design` সাইটে পুরোটা।
 * ডকের লেখা এখানে কপি নয় — এক জিনিস দুই জায়গায় থাকলে আলাদা হয়ে যায়।
 */
export default async function DocPage({ params }: { params: Promise<Params> }) {
  const { code } = await params;
  const index = DOCS.findIndex((doc) => doc.code === code);
  if (index === -1) notFound();

  const doc = DOCS[index];
  const uses = getDocUses()[doc.code] ?? [];
  const prev = DOCS[index - 1];
  const next = DOCS[index + 1];

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
        <a href={docHref(doc)} target="_blank" rel="noreferrer" className="t-accent inline-flex items-center gap-1 text-sm">
          system_design-এ পুরো ডক
          <ArrowUpRight />
        </a>
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

      <Pager
        label="ডক"
        prev={prev && { href: `/doc/${prev.code}/`, label: `${prev.code} ${prev.title}` }}
        next={next && { href: `/doc/${next.code}/`, label: `${next.code} ${next.title}` }}
      />
    </>
  );
}
