import Link from "next/link";
import { ArrowLeft, ArrowRight } from "./icons";

export type PagerLink = { href: string; label: string };

/** আগের/পরের দিন বা ব্লক — কোনো state নেই, তাই server ও client দুই জায়গাতেই চলে */
export default function Pager({ prev, next, label }: { prev?: PagerLink; next?: PagerLink; label: string }) {
  return (
    <nav className="grid grid-cols-2 gap-2" aria-label={label}>
      {prev ? (
        <Link href={prev.href} className="control justify-start px-3 py-2 text-xs">
          <ArrowLeft />
          <span className="truncate">{prev.label}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link href={next.href} className="control justify-end px-3 py-2 text-xs">
          <span className="truncate">{next.label}</span>
          <ArrowRight />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
