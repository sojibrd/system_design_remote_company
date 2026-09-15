import type { Metadata } from "next";
import {
  Archivo,
  Archivo_Black,
  Barlow_Semi_Condensed,
  JetBrains_Mono,
  Noto_Sans_Bengali,
} from "next/font/google";
import Shell from "./components/Shell";
import { getPlanIndex } from "./lib/plan";
import { SITE } from "./lib/site";
import "./globals.css";

/**
 * The font shelf — the same five families as every workspace site. Bengali is
 * on the shelf because the Latin faces carry no Bengali glyphs.
 *
 * Adding a family no theme uses yet is the ONLY reason to edit this block.
 */
const grotesk = Archivo({
  variable: "--font-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const display = Archivo_Black({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const condensed = Barlow_Semi_Condensed({
  variable: "--font-condensed",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono-family",
  subsets: ["latin"],
  display: "swap",
});

const bengali = Noto_Sans_Bengali({
  variable: "--font-bengali",
  subsets: ["bengali", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: SITE.title,
    template: `%s — ${SITE.short}`,
  },
  description: SITE.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="bn"
      className={`${grotesk.variable} ${display.variable} ${condensed.variable} ${mono.variable} ${bengali.variable} h-full antialiased`}
    >
      <body className="surface-app flex min-h-full flex-col">
        <a
          href="#main-content"
          className="control control--primary sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 px-3 py-1.5 text-xs"
        >
          মূল কনটেন্টে যান
        </a>
        {/* সূচি এখানে পড়া হয়, পাতায় নয় — rail chassis-এর অংশ, সব পাতায় একই */}
        <Shell blocks={getPlanIndex()}>{children}</Shell>
      </body>
    </html>
  );
}
