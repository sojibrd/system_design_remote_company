# ব্লক ১ — সিদ্ধান্ত, ইংরেজিতে

*দিন ০০১–০১৪ · ডক ১৫ · ১২ · ১৩ · ০৪ · ১১ · functional লেভেল*

রিমোট টিম সিদ্ধান্ত লিখে রাখে — কী ঠিক হলো, কেন, খরচ কী। এই দুই সপ্তাহে পাঁচটা ডক, আর প্রতিটা থেকে **নিজের কাজের একটা সিদ্ধান্ত, ইংরেজিতে তিন লাইনে:** *Context · Decision · Consequence*। সাথে দুটো simulation-এর সবচেয়ে সহজ রূপ, আর প্রথমবার *"how would you build this feature of ours?"* 🧠 (Active learning · Feynman)

প্রথম সপ্তাহটা ধীর লাগবে — ইংরেজিতে সিদ্ধান্তের কারণ লিখতে শব্দ খুঁজতে হয়। নতুন দক্ষতার প্রথম কয়েক ঘণ্টা এরকমই। 🧠 (The first 20 hours · Learning vs Winning)

> **ব্লক শেষে:** পাঁচটা ডকের প্রতিটায় ইংরেজিতে তিন লাইনের একটা সিদ্ধান্ত, আর একটা কোম্পানির ফিচারের ৫ লাইন?

### দিন ০০১ · ছয় সেকশনের ছাঁচ

- [ ] ১০′ [নিয়মের পাতার](/rules/) "design doc — ছয় সেকশন" খুলে ছয় সেকশনের নাম **ইংরেজিতে** একটা কার্ডে — What I built → Scale → Decisions → Left out → Architecture → Where it breaks 🔁 🧠 (Chunk the subject · Trunk based knowledge)

> **দিন শেষে:** ছয় সেকশনের কার্ড আছে?

### দিন ০০২ · API-র সিদ্ধান্ত

- [ ] ২০′ `srdtube`-এর একটা API সিদ্ধান্ত, ইংরেজিতে তিন লাইন — *Context:* quota per search · *Decision:* no auto-pagination · *Consequence:* one click per page; REST আর status code-এর অংশ পড়ে বন্ধ করে (ডক ১৫) 🔁 🧠 (Feynman · Concepts vs Facts)

> **দিন শেষে:** Context · Decision · Consequence — তিন লাইন ইংরেজিতে?

### দিন ০০৩ · data model

- [ ] ২০′ অফিসের কাজের একটা data model — কোন টেবিল বা collection, কোন field-এ index, SQL না NoSQL কেন; ইংরেজিতে ৫ বুলেট, ডক পড়ে বন্ধ করে (ডক ১২) 🔁 🧠 (Active learning)

> **দিন শেষে:** index-এর কারণ নিজের উদাহরণে লেখা?

### দিন ০০৪ · cache-এর সিদ্ধান্ত

- [ ] ২০′ `srdtube`-এ quota বাঁচাতে cache — কোথায় (browser, CDN, ছোট backend), কী বাসি হলে চলে, কী চলে না; ইংরেজিতে তিন লাইনের সিদ্ধান্ত, খরচসহ (ডক ১৩) 🔁 🧠 (Concepts vs Facts · Chunking)

> **দিন শেষে:** cache-এর সিদ্ধান্তে খরচটা লেখা?

### দিন ০০৫ · সহজ ডিজাইন

- [ ] ২০′ URL shortener-এর functional লেভেল চালিয়ে দেখুন — তারপর বন্ধ করে ইংরেজিতে ৫ লাইন: কোন তিনটা অংশ, কেন এর বেশি নয় (sim url-shortener · functional) 🧠 (The power of senses · Test yourself)

> **দিন শেষে:** "কেন এর বেশি নয়" লেখা?

### দিন ০০৬ · সপ্তাহের চারটা, না দেখে

- [ ] ১৫′ চারটা সিদ্ধান্ত এলোমেলো ক্রমে — প্রতিটায় এক বাক্য, ইংরেজিতে জোরে, নোট বন্ধ; তারপর মেলান 🧠 (Test yourself · Interleaving)

> **দিন শেষে:** চারটার কয়টা না দেখে বলা গেছে?

### দিন ০০৭ · সপ্তাহের হিসাব

- [ ] ১০′ আটকানো ডিজাইনে না ইংরেজিতে? পরের সপ্তাহের একটা দুর্বলতা এক লাইনে; "আমি পারি না" নয়, "এখনো ___-এ" 🧠 (Feedback · It's all in the frame)

> **দিন শেষে:** পরের সপ্তাহের দুর্বলতা লেখা?

### দিন ০০৮ · availability না consistency

- [ ] ২০′ তিনটা ফিচার, প্রতিটায় *"availability or consistency — which, and why?"* ইংরেজিতে দুই লাইন: like-এর সংখ্যা · পেমেন্ট · chat-এর unread badge; রিমোট আলোচনায় এই ট্রেড-অফটা সত্যিই আসে (ডক ০৪) 🔁 🧠 (Concepts vs Facts · Feynman)

> **দিন শেষে:** তিন ফিচারের তিনটা বাছাই আর কারণ?

### দিন ০০৯ · load balancer কখন

- [ ] ২০′ অফিসের বা পরিচিত একটা প্রোডাক্টে load balancer কোথায় আছে, আর ছোট টিমে কখন **লাগে না** — ইংরেজিতে ৫ বুলেট; সহজ উত্তর আগে (ডক ১১) 🔁 🧠 (Everything is a game)

> **দিন শেষে:** "কখন লাগে না" অংশটা লেখা?

### দিন ০১০ · rate limiter-এর সহজ রূপ

- [ ] ২০′ rate limiter-এর functional লেভেল — তারপর ইংরেজিতে ৩ লাইন: একটা public API-র জন্য কোথায় বসাতেন, আর `srdtube`-এর quota-র সাথে মিল কোথায় (sim rate-limiter · functional) 🧠 (Einstellung · The power of senses)

> **দিন শেষে:** তিন লাইন লেখা?

### দিন ০১১ · "Why this and not the alternative?"

- [ ] ২০′ অফিসের একটা আসল সিদ্ধান্ত (library, state, architecture) — ইংরেজিতে ADR: Context · Options (দুটো) · Decision · Consequence; বিকল্পটার ভালো দিকটাও সৎভাবে 🔁 🧠 (Einstellung · Feynman)

> **দিন শেষে:** বিকল্পের ভালো দিক লেখা আছে?

### দিন ০১২ · ওদের একটা ফিচার

- [ ] ২০′ আবেদনের তালিকার একটা কোম্পানি — প্রোডাক্ট খুলে একটা ফিচার বাছুন; *"How would you build this?"* ইংরেজিতে ৫ বুলেট: চাহিদা → অংশগুলো → ডেটা কোথায় → একটা trade-off → কী বাদ রাখতেন 🧠 (Everything is a game · Active learning)

> **দিন শেষে:** একটা আসল ফিচারের ৫ বুলেট?

### দিন ০১৩ · পাঁচ ডক, এলোমেলো

- [ ] ১৫′ পাঁচটা ডকের নাম কাগজে উল্টে; তিনটা তুলে প্রতিটায় নিজের কাজের এক বাক্য, ইংরেজিতে জোরে 🧠 (Interleaving · Test yourself)

> **দিন শেষে:** তিনটাতেই নিজের উদাহরণ এসেছে?

### দিন ০১৪ · ব্লক ১-এর হিসাব

- [ ] ১০′ কোন সিদ্ধান্তের "Consequence" লাইন সবচেয়ে দুর্বল — ওটা আবার এক লাইনে; পরের ব্লকে async আর reliable 🧠 (Feedback · It's all in the frame)

> **দিন শেষে:** দুর্বল লাইনটা আবার লেখা?
