import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlockDays from "../../components/BlockDays";
import CheckQuestion from "../../components/CheckQuestion";
import Markdown from "../../components/Markdown";
import Pager from "../../components/Pager";
import { getBlock, getBlocks, getPlanIndex } from "../../lib/plan";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getBlocks().map((block) => ({ slug: block.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: getBlock(slug)?.title ?? "ব্লক" };
}

export default async function BlockPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const blocks = getBlocks();
  const index = blocks.findIndex((block) => block.slug === slug);
  const indexBlock = getPlanIndex().find((block) => block.slug === slug);
  if (index === -1 || !indexBlock) notFound();

  const block = blocks[index];
  const prev = blocks[index - 1];
  const next = blocks[index + 1];

  return (
    <>
      <header className="flex flex-col gap-2">
        <h1 className="t-title text-2xl sm:text-3xl">{block.title}</h1>
        <p className="t-caption">
          {block.range}
          {block.dip ? " · dip-এর সময়" : ""}
        </p>
      </header>

      <section className="surface-panel p-4 sm:p-6 md:p-8">
        <Markdown className="measure">{block.intro}</Markdown>
      </section>

      <BlockDays block={indexBlock} />

      {block.check && (
        <CheckQuestion
          storageKey={`b${block.num}`}
          label="ব্লক শেষে — নিজেকে যাচাই"
          question={block.check}
          recall="উত্তরের আগে দিনের তালিকা না দেখে মনে করুন এই ব্লকে কী কী হয়েছে।"
        />
      )}

      <Pager
        label="ব্লক"
        prev={prev && { href: `/block/${prev.slug}/`, label: prev.title }}
        next={next && { href: `/block/${next.slug}/`, label: next.title }}
      />
    </>
  );
}
