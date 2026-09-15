# system_design_remote_company

বিদেশি রিমোট কোম্পানির design রাউন্ডের প্রস্তুতি — যেটা আলাদা ৪৫ মিনিটের রাউন্ড নয়, আসে **লিখিত** (take-home-এর সাথে design note) আর **আলোচনামূলক** (*"how would you build this feature of ours?"*) রূপে। ৫৬ দিনে: দশটা ডকের সিদ্ধান্ত ইংরেজিতে, দুটো simulation-এর functional আর reliable লেভেল, তিনটা UI-র frontend system design, আর তিনটা ইংরেজি লেখা — `srdtube`-এর design doc আর frontend design note প্রকাশিত, একটা কোম্পানির ফিচারের note নিজের কাছে। দিনে একটা ছোট কাজ, ঝালাইসহ; তারপর থামা।

এটা **স্বাধীন পথ** — আগে অন্য কোনো system design সাইট লাগে না। [লোকাল](https://sojibrd.github.io/system_design_local_company/) আর [গ্লোবাল](https://sojibrd.github.io/system_design_global_company/) আলাদা সাইট; এখানে পথ বদলালে কাজের ধরনই বদলায়, পরিমাণ নয়। `switch_in_6_month_remote_company`-এর দিন ০৭৮–১৩৩-এ DSA শেষে যে সোম–শুক্রের ৩০′-এর ঘর খালি হয়, এই সাইট সেই ঘরের কাজ (ব্যবহারকারীর সিদ্ধান্ত ২০২৬-০৯-১৫)। শুরুর তারিখ ⏳, সাইট প্রথমবার খুললে জিজ্ঞেস করে।

**লাইভ:** https://sojibrd.github.io/system_design_remote_company/

## Functional Requirement

- **আজ (`/`):** প্রথমবার খুললে শুরুর তারিখ জিজ্ঞেস করে। তারপর দেখায় ক্যালেন্ডারের আজকের দিনটা, এই ক্রমে: জমে থাকা ⚑ → আজকের ঝালাই → আজকের দিন।
- **Rail:** ৫টা পাতার লিংক, gauge আর ৪টা ব্লক। শুধু খোলা ব্লকের দিনগুলো দেখায়।
- **দিন (`/day/<nnn>/`) · ব্লক (`/block/<slug>/`):** দিনের কাজ আর দিন বা ব্লক শেষের হ্যাঁ/না। plan-এর হালকা দিনে এখানে কাজ নেই — কেন ফাঁকা তা লেখা।
- **সূত্রের chip:** কাজে `(ডক ১৩)` থাকলে এই সাইটের ঐ ডকের পাতা; `(sim url-shortener · reliable)` থাকলে এই সাইটের simulator-এর ঐ সিস্টেম।
- **ডক (`/docs/`, `/doc/<nn>/`):** ২৫টা ডক এই সাইটেই (`guide/`)। প্রতিটা পাতায় আগে এই পথের কোন দিনের কোন কাজে আসে, তারপর পুরো ডক; plan-এর বাইরেরগুলো তালিকায় আলাদা নিচে।
- **simulator (`/simulation/<id>/`):** URL Shortener আর Rate Limiter, তিন লেভেল (functional → reliable → scalable) — React Flow-র ক্যানভাসে ধাপে ধাপে।
- **ঝালাই (`/review/`):** প্রতিটা 🔁 কাজ টিকের দিন থেকে ১/৩/৭/২১ দিন পরে ফেরে।
- **নিয়ম (`/rules/`):** `docs/00-rules.md` হুবহু।
- **🧠 chip:** `learning_to_learn`-এর পাঁচটা ডকের সব বিষয়। chip চাপলে এক লাইনে কারণ, সাথে ঐ সাইটের লিংক।

## Non-Functional Requirement

- **সত্যের উৎস `docs/`।** কোডে কোনো দিন বা কাজ হার্ডকোড নেই। কাজের `(ডক n)` যদি `guide/`-এ না থাকে বা `(sim … · …)` যদি `app/lib/sources.ts`-এ না মেলে, **build ভাঙে।** simulator-এর ভেতরের রেফারেন্স ধরে `npm run check:simulations` (CI-তে build-এর আগে)।
- **design doc-এর লেখা এই repo-তে নয়** — প্রজেক্টের নিজের repo-তে (`srdtube`-এর `DESIGN.md`)। সাইটে নোটের ঘর নেই, ইচ্ছাকৃত।
- **ফাইলে তারিখ নেই।** "আজ" মানে ক্যালেন্ডারের তারিখ, plan পেছায় না।
- **Static export → GitHub Pages।** Backend নেই। Progress শুধু `localStorage`-এ, একমাত্র `app/hooks/useProgress.ts` দিয়ে। `app/lib/plan.ts` server-only।
- **Theme contract অলঙ্ঘনীয়, সাইট dark-only।**
- **তিন পথের কোড একই।** পার্থক্য শুধু `app/lib/site.ts`, `next.config.ts`-এর basePath, `package.json`-এর নাম আর `docs/`-এ; `guide/` তিনটাতেই এক।
- **স্ট্যাক:** Next.js 16, React 19, TypeScript, Tailwind v4, react-markdown, React Flow (`@xyflow/react`), lucide-react।

## ডক ইনডেক্স

| ফাইল | Gist |
|---|---|
| [guide/](guide/) | ২৫টা system design ডক — অবসরপ্রাপ্ত `system_design` থেকে হুবহু, তিন পথে এক |
| [docs/00-rules.md](docs/00-rules.md) | লক্ষ্য, সত্যের উৎস, চিহ্ন, "আজ", সপ্তাহের ছন্দ, ২০′-এর বসা (ইংরেজিতে, ADR-এর তিন লাইন), frontend design-এর ছয় ধাপ, design doc-এর ছয় সেকশন আর তিন রিমোট প্রশ্ন, ঝালাই, `learning_to_learn`, যা উপেক্ষা করবেন, যা করবেন না, দিন ৫৬-এর পরে |
| [docs/01-decisions.md](docs/01-decisions.md) | দিন ০০১–০১৪: ডক ১৫ · ১২ · ১৩ · ০৪ · ১১, functional লেভেল, ADR, ওদের একটা ফিচার |
| [docs/02-async-reliable.md](docs/02-async-reliable.md) | দিন ০১৫–০২৮: ডক ১৪ · ০৭ · ১৬ · ০৯ · ১৮, reliable লেভেল, দশ ডকের এক পাতা |
| [docs/03-frontend-design.md](docs/03-frontend-design.md) | দিন ০২৯–০৪২: ছয় ধাপ, state কোথায়, autocomplete · news feed (optimistic like) · file upload, এলোমেলো UI |
| [docs/04-written-design.md](docs/04-written-design.md) | দিন ০৪৩–০৫৬: `srdtube`-এর ইংরেজি design doc, frontend design note, take-home-এর ছাঁচ, ওদের ফিচার লিখে আর মুখে; দিন ০৫৬-এ থামা |

## প্রজেক্ট-নির্দিষ্ট নিয়ম

### তথ্য বদলানোর ক্রম

`brainstorming/ASSUMPTIONS.md` → `brainstorming/` (`system-design.md`, `which-market.md`) → `switch_in_6_month_remote_company/docs/` → এই ফোল্ডার।

### ব্লক ফাইলের ছাঁচ

- `# ব্লক ১ — নাম` · `*দিন ০০১–০১৪ · …*` (শেষে `· dip` থাকলে হোমে সতর্কতা) · `> **ব্লক শেষে:** …` · `### দিন ০০৭ · শিরোনাম` · `- [ ] ২০′ …` · `> **দিন শেষে:** …`
- দিনের নম্বর সব ব্লক মিলিয়ে পরপর থাকতে হবে, না থাকলে build ভাঙে। কাজ ছাড়া দিন চলে।
- কাজে `(ডক ১৩)` বা `(ডক ১১ · ডক ১৩)` = `guide/`-এর ডক (ফাইল না থাকলে build ভাঙে); `(sim rate-limiter · reliable)` = simulator, তালিকা `app/lib/sources.ts`-এ — `app/lib/simulations/`-এ সিস্টেম বা লেভেল যোগ হলে ওখানেও।
- `⚑` = মাইলফলক, `🔁` = ঝালাই হবে, শেষে `🧠 (নাম · নাম)`। নতুন 🧠 নাম লিখলে তিন repo-র `app/lib/principles.ts`-এ যোগ করুন।

### Progress key

| key | মান |
|---|---|
| `rsd:v1:start` | শুরুর তারিখ `"YYYY-MM-DD"` |
| `rsd:v1:task` | কাজ শেষের তারিখ। id = দিন + কাজের **লেখা** থেকে hash |
| `rsd:v1:check` | দিন শেষ (`d007`) ও ব্লক শেষ (`b1`)-এর হ্যাঁ/না |
| `rsd:v1:review` | 🔁 ঝালাইয়ের অবস্থা `{ base, step }` |

## চালানো

```bash
npm install
npm run dev      # http://localhost:3000
npm run check:simulations   # simulator-এর node/edge রেফারেন্স (node ≥ 22.6)
npm run build    # static export → out/
```

push করলে `.github/workflows/deploy.yml` সাইটটা GitHub Pages-এ তোলে।
