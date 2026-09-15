# system_design_*_company — Agent Instructions

`brainstorming/system-design-how-many-paths.md`-এর তিন পথের একটা (`system_design_local_company` · `_remote_company` · `_global_company`) — দিনভিত্তিক plan, `learning_to_learn`-এর নীতি, chassis `dsa_prep_*` থেকে। এই ফাইল তিন repo-তে হুবহু এক।

- **তিনটা পথই স্বাধীন** (ব্যবহারকারীর সিদ্ধান্ত ২০২৬-০৯-১৫) — প্রতিটা শূন্য থেকে, আগের পথ শর্ত নয়। DSA-র মতো কেন্দ্রীভূত বৃত্ত নয়: পথ বদলালে **কাজের ধরন** বদলায় — লোকালে নিজের প্রজেক্ট ব্যাখ্যা, রিমোটে ইংরেজিতে লিখে বোঝানো, গ্লোবালে ঘড়ির নিচে মুখে।
- **লোকাল** ২৮ দিন (= লোকাল plan-এর দিন ০৫০–০৭৭), সাতটা ডক (০৯, ১১–১৫, ১৮) নিজের প্রজেক্ট দিয়ে, `srdtube`-এর ছয় সেকশনের design doc, চারটা লোকাল প্রশ্ন মুখে, simulation শুধু functional · **রিমোট** ৫৬ দিন (= দিন ০৭৮–১৩৩), দশটা ডক (+০৪, ০৭, ১৬), functional + reliable, frontend system design-এর তিনটা UI, তিনটা ইংরেজি লেখা (`srdtube`-এর design doc আর frontend design note প্রকাশিত, কোম্পানির ফিচারের note নিজের কাছে) · **গ্লোবাল** ১৬৮ দিন (= দিন ০০৮–১৭৫), আট সিস্টেম লেখা আর ৪৫′-এ মুখে, ছয়টা UI — কাজ গ্লোবাল plan থেকে হুবহু সরানো; plan-এ design-এর ঘর নেই এমন দিন সাইটে "বিরতি" (কাজ ছাড়া দিন)।
- লোকাল/রিমোটে সোম–শুক্র ~২০′-এর একটা কাজ, শনি ১৫′, রবি ১০′; গ্লোবালে দিনের মাপ plan-এর ঘরের মাপ।
- **তিন repo-র কোড হুবহু এক** — পার্থক্য শুধু `app/lib/site.ts` (নাম, `lsd`/`rsd`/`gsd` prefix, `suggestedStart` — লোকালে `2026-11-02`, বাকি দুটোয় `null`), `next.config.ts`-এর basePath, `package.json`-এর নাম আর `docs/`। কোড বদলালে তিনটাতেই একই বদল।
- ফাইলে **তারিখ নেই**, শুধু `### দিন ০০৭ · শিরোনাম` — ছাঁচ `dsa_prep_*`-এর মতোই; দিনের নম্বর পরপর না হলে build ভাঙে, কাজ ছাড়া দিন চলে। "আজ" = ক্যালেন্ডারের তারিখ, plan পেছায় না।
- কাজে `(ডক ১৩)` / `(ডক ১১ · ডক ১৩)` = `system_design`-এর ডক; `(sim url-shortener · functional)` = simulator-এর সিস্টেম আর লেভেল। তালিকা `app/lib/sources.ts`-এ হাতে লেখা — না মিললে **build ভাঙে**; `system_design`-এ ডকের ফাইলনাম বদলালে এখানেও বদলান (build ধরে না)। `/docs/` আর `/doc/<nn>/` দেখায় কোন ডক কোন দিনে।
- **design doc-এর লেখা এই repo-গুলোয় নয়** — `system_design/designs/`-এ। সাইটে নোটের ঘর নেই, ইচ্ছাকৃত — এক লেখা দুই জায়গায় রাখা নয়।
- 🧠 নাম → `app/lib/principles.ts`-এ `learning_to_learn`-এর পাঁচ ডকের **সব** বিষয়, system design-এর মাপে এক লাইন; নতুন নাম লিখলে তিন repo-তেই যোগ।
- Progress চার key (`start`, `task`, `check`, `review`) — একমাত্র `app/hooks/useProgress.ts` দিয়ে। `app/lib/plan.ts` server-only।
- **Theme contract অলঙ্ঘনীয়**, সাইট **dark-only**। plan-এর তথ্য বদলালে ক্রম: `brainstorming/ASSUMPTIONS.md` → `brainstorming/` → ৬ মাসের plan → এই ফোল্ডারগুলো; গ্লোবালে সাইটের দিন = plan-এর দিন − ৭।

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
