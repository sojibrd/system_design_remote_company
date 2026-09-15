# ব্লক ৪ — লিখে বোঝানো

*দিন ০৪৩–০৫৬ · srdtube-এর ইংরেজি design doc · frontend design note · ওদের ফিচার*

রিমোট নিয়োগ মানে দূর থেকে বিশ্বাস কেনা — ওরা আপনাকে দেখে না, পড়ে। এই দুই সপ্তাহে তিনটা লেখা, তিনটাই ইংরেজিতে, তিনটাই প্রকাশের মতো: **`srdtube`-এর ছয় সেকশনের design doc**, নিজের static সাইটের **frontend design note**, আর আবেদনের তালিকার একটা কোম্পানির **ফিচারের design note।** লোকালে যা প্রস্তুতি, এখানে তা জমা দেওয়ার মতো নমুনা। 🧠 (Skill stacking · Have an endpoint)

শেষ দিনে থামা — তিনটার পরে নতুন লেখা নয়, এখন থেকে ঝালাই আর আবেদনের চিঠিতে লিংক। 🧠 (10,000 hours rule)

> **ব্লক শেষে:** তিনটা ইংরেজি লেখা প্রকাশিত, আর একটা কোম্পানির ফিচারের ১০ মিনিটের রেকর্ডিং?

### দিন ০৪৩ · What I built, Scale

- [ ] ২০′ `srdtube`-এর design doc **ইংরেজিতে**, `system_design/designs/srdtube-small-static.md` — সেকশন ১–২: functional ৩ বুলেট, non-functional ২ বুলেট; scale: দিনে ১০,০০০ quota unit ÷ search-প্রতি ১০০ = দিনে ~১০০টা খোঁজা 🧠 (Active learning · Procrastination)

> **দিন শেষে:** দুই সেকশন লেখা, সংখ্যাসহ?

### দিন ০৪৪ · Decisions

- [ ] ২০′ সেকশন ৩ — টেবিলে *Decision · Why · Cost:* ৫০-id-এর batch, auto-pagination বন্ধ, কোডে fallback key; প্রতিটার cost সৎভাবে (ডক ১৫) 🔁 🧠 (Feynman · Einstellung)

> **দিন শেষে:** তিনটা cost লেখা?

### দিন ০৪৫ · Left out, Architecture

- [ ] ২০′ সেকশন ৪–৫ — backend, database, auth, cache বাদ, প্রতিটায় *"would add when…"*; architecture: browser → GitHub Pages (CDN) → YouTube API, ASCII-তে (ডক ১৩ · ডক ০৯) 🧠 (Pareto · The power of senses)

> **দিন শেষে:** চারটা "would add when" লেখা?

### দিন ০৪৬ · Where it breaks

- [ ] ২০′ সেকশন ৬ — quota শেষ, key ফাঁস, ১০× ব্যবহারকারী; শেষে তিন রিমোট প্রশ্নের উত্তর: *"Why this and not the alternative?" · "What did you deliberately leave out?" · "Availability or consistency here — which, and why?"* (ডক ০৪ · ডক ১৮) 🔁 🧠 (Einstellung · Everything is a game)

> **দিন শেষে:** তিন প্রশ্নের উত্তর doc-এ?

### দিন ০৪৭ · প্রকাশ

- [ ] ২০′ ⚑ doc একবার জোরে পড়ে লম্বা বাক্য কাটুন, তারপর commit আর প্রকাশ; `srdtube`-এর README আর GitHub প্রোফাইল থেকে লিংক। নিখুঁত নয়, প্রকাশিত 🧠 (Have an endpoint · Failures don't count)

> **দিন শেষে:** doc-এর লিংক README-তে?

### দিন ০৪৮ · doc, না দেখে

- [ ] ১৫′ doc বন্ধ — ছয় সেকশনের প্রতিটায় এক বাক্য, ইংরেজিতে জোরে 🧠 (Test yourself)

> **দিন শেষে:** ছয় বাক্য না দেখে?

### দিন ০৪৯ · সপ্তাহের হিসাব

- [ ] ১০′ doc লিখতে কোন সেকশনে সবচেয়ে বেশি সময় গেল — কেন; পরের দুটো লেখায় ঐ সেকশন আগে ধরবেন 🧠 (Feedback · Deliberate practice)

> **দিন শেষে:** কারণ লেখা?

### দিন ০৫০ · frontend design note — ১

- [ ] ২০′ নিজের একটা static সাইটের client-side design, ইংরেজিতে এক পাতা — *Problem:* static export-এ `localStorage` পড়লে hydration mismatch · *Decisions:* সব progress এক hook দিয়ে, mount-এর আগে UI নয়, server-only content · প্রথম দুই অংশ 🧠 (Active learning · Trunk based knowledge)

> **দিন শেষে:** Problem আর Decisions লেখা?

### দিন ০৫১ · frontend design note — ২

- [ ] ২০′ ⚑ বাকি অংশ — *Left out:* backend sync, account · *Result:* কী ভাঙে না এখন, কী ভাঙবে ডিভাইস বদলালে; তারপর repo-তে প্রকাশ (ডক ০৪) 🔁 🧠 (Pareto · Have an endpoint)

> **দিন শেষে:** এক পাতার note প্রকাশিত?

### দিন ০৫২ · take-home-এর design note

- [ ] ২০′ take-home-এর সাথে জমা দেওয়ার **পাঁচ লাইনের ছাঁচ**, ইংরেজিতে — Approach · Key decision · Trade-off · With more time I would… · How to run; একটা পুরনো কাজে ভরে দেখুন 🔁 🧠 (Everything is a game · Parkinson's law)

> **দিন শেষে:** ছাঁচ আর একটা ভরা উদাহরণ?

### দিন ০৫৩ · ওদের ফিচার, লিখে

- [ ] ২০′ আবেদনের তালিকার একটা কোম্পানির প্রোডাক্টের একটা ফিচার — **২০′ টাইমারে** এক পাতার design note, ইংরেজিতে: চাহিদা → component → state → ডেটা আর cache → একটা trade-off → কী বাদ 🔁 🧠 (Parkinson's law · Active learning)

> **দিন শেষে:** ২০ মিনিটে এক পাতা?

### দিন ০৫৪ · ওদের ফিচার, মুখে

- [ ] ২০′ ⚑ *"We need to build this feature — how would you approach it?"* — কালকের ফিচার, **১০ মিনিট টানা, ইংরেজিতে**, note বন্ধ; রেকর্ড শুনে দুটো জিনিস: সহজ উত্তর আগে ছিল কি, প্রশ্ন করেছেন কি 🧠 (Test yourself · Feedback)

> **দিন শেষে:** ১০ মিনিটের রেকর্ডিং আছে, প্রশ্ন দিয়ে শুরু?

### দিন ০৫৫ · তিন লেখা, তিন বাক্য

- [ ] ১৫′ তিনটা লেখা — প্রতিটায় *"the one decision I'd defend"* এক বাক্যে, ইংরেজিতে জোরে, না দেখে 🧠 (Test yourself · Spaced repetition)

> **দিন শেষে:** তিনটা বাক্য?

### দিন ০৫৬ · থামা

- [ ] ১০′ ⚑ থামার সিদ্ধান্ত লিখুন — তিনটার পরে নতুন লেখা নয়; এখন থেকে ঝালাই, আর আবেদনের চিঠিতে doc-এর লিংক। নিজেকে ছোট একটা পুরস্কার 🧠 (Have an endpoint · 10,000 hours rule · Stakes & Rewards)

> **দিন শেষে:** থামার সিদ্ধান্ত লেখা?
