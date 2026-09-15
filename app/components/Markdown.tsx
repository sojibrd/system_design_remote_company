"use client";

import React from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { slugify } from "../lib/slug";

function headingId(children: React.ReactNode): string | undefined {
  const text = React.Children.toArray(children)
    .map((child) => (typeof child === "string" || typeof child === "number" ? String(child) : ""))
    .join("")
    .replace(/[*_`]/g, "")
    .trim();
  return text ? slugify(text) : undefined;
}

/**
 * plan-এর লিংক workspace-এর অন্য প্রজেক্টের md ফাইলে যায়
 * (`../../behavioural_interview/docs/04-question-bank/01-foo.md`)। এই repo-তে
 * ওই ফাইল নেই, তাই ঐ প্রজেক্টের লাইভ সাইটের route-এ রূপান্তর।
 */
function toSiteHref(href: string): string {
  if (/^([a-z]+:|#|\/)/i.test(href)) return href;
  const project = /^(?:\.\.\/)+([a-z0-9_-]+)\/docs\/(.+)\.md$/i.exec(href);
  if (project) return `https://sojibrd.github.io/${project[1]}/${project[2]}/`;
  return href;
}

type Props = {
  children: string;
  /** `<p>` ছাড়া inline রেন্ডার — কাজের লাইনের জন্য */
  inline?: boolean;
  className?: string;
};

export default function Markdown({ children, inline = false, className = "" }: Props) {
  return (
    <div className={`${inline ? "" : "doc-prose"} ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children: linkChildren }) => {
            const target = toSiteHref(href ?? "");
            /* সাইটের ভেতরের route — `Link` basePath বসায়, সাধারণ `<a>` বসায় না */
            if (target.startsWith("/")) return <Link href={target}>{linkChildren}</Link>;
            const external = /^https?:/i.test(target);
            return (
              <a href={target} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
                {linkChildren}
              </a>
            );
          },
          h2: ({ children: h2Children }) => <h2 id={headingId(h2Children)}>{h2Children}</h2>,
          h3: ({ children: h3Children }) => <h3 id={headingId(h3Children)}>{h3Children}</h3>,
          ...(inline ? { p: ({ children: pChildren }) => <>{pChildren}</> } : {}),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
