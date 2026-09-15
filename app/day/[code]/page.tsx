import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DayBody from "../../components/DayBody";
import Markdown from "../../components/Markdown";
import Pager from "../../components/Pager";
import { getBlock, getDays } from "../../lib/plan";

type Params = { code: string };

export function generateStaticParams(): Params[] {
  return getDays().map((day) => ({ code: day.code }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { code } = await params;
  const day = getDays().find((item) => item.code === code);
  return { title: day ? `দিন ${day.label} · ${day.title}` : "দিন" };
}

export default async function DayPage({ params }: { params: Promise<Params> }) {
  const { code } = await params;
  const days = getDays();
  const index = days.findIndex((day) => day.code === code);
  if (index === -1) notFound();

  const day = days[index];
  const block = getBlock(day.blockSlug);
  /* ব্লকের ভূমিকা শুধু ব্লকের প্রথম দিনে */
  const blockIntro = block && block.days[0]?.code === day.code ? block : null;
  const prev = days[index - 1];
  const next = days[index + 1];

  return (
    <>
      {blockIntro && (
        <div className="callout p-4">
          <div className="t-label mb-2">
            {blockIntro.title} · {blockIntro.range}
          </div>
          <Markdown className="t-body">{blockIntro.intro}</Markdown>
        </div>
      )}
      <DayBody day={day} blockName={day.blockName} blockSlug={day.blockSlug} totalDays={days.length} />
      <Pager
        label="দিন"
        prev={prev && { href: `/day/${prev.code}/`, label: `দিন ${prev.label} · ${prev.title}` }}
        next={next && { href: `/day/${next.code}/`, label: `দিন ${next.label} · ${next.title}` }}
      />
    </>
  );
}
