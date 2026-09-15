# ব্লক ৩ — frontend system design

*দিন ০২৯–০৪২ · ছয় ধাপ · autocomplete · news feed · file upload*

রিমোট frontend পদে **সবচেয়ে সম্ভাব্য design প্রশ্ন** এটাই — component, state কোথায়, ডেটা আনা ও cache, optimistic update, accessibility। আর এই সাইটের ২৫টা ডকের একটাও এটা নিয়ে নয়। ভালো খবর: আপনি এটা রোজ করেন — theme contract, server-only `plan.ts`, এক hook-এ আটকানো `localStorage`, সবই frontend design-এর সিদ্ধান্ত। বাকি শুধু **এভাবে গুছিয়ে বলা।** 🧠 (The obstacle · Skill stacking)

তিনটা UI, প্রতিটা ছয় ধাপে লেখা, তারপর মুখে। শেষ দিনে এলোমেলো তুলে। 🧠 (Chunk the subject · Interleaving)

> **ব্লক শেষে:** তিনটা UI ছয় ধাপে লেখা, আর এলোমেলো একটা ২০′-এ ইংরেজিতে বলা?

### দিন ০২৯ · ছয় ধাপ

- [ ] ২০′ frontend system design-এর **ছয় ধাপ** একটা কার্ডে, ইংরেজিতে — Requirements → Components → State → Data fetching & cache → Optimistic update? → Performance & accessibility; প্রতিটার পাশে নিজের কাজের একটা উদাহরণ 🔁 🧠 (Chunk the subject · Method of loci)

> **দিন শেষে:** ছয় ধাপ, ছয় উদাহরণ?

### দিন ০৩০ · state কোথায়

- [ ] ২০′ **কোন state কোথায়** — component, store/service, নাকি URL; তিনটার প্রতিটায় নিজের কাজের একটা উদাহরণ (যেমন `srdtube`-এর sort), আর ভুল জায়গায় রাখলে কী ভাঙে; ইংরেজিতে 🔁 🧠 (Feynman · Concepts vs Facts)

> **দিন শেষে:** তিন জায়গা, তিন উদাহরণ, তিনটা "কী ভাঙে"?

### দিন ০৩১ · autocomplete — ১

- [ ] ২০′ *"Design an autocomplete"* — ধাপ ১–৩ ইংরেজিতে বুলেটে: কী দেখায় আর কত দ্রুত, component-এর গাছ (input, list, item), state — query, results, highlighted index কোথায় 🧠 (Active learning)

> **দিন শেষে:** তিন ধাপ লেখা?

### দিন ০৩২ · autocomplete — ২

- [ ] ২০′ ধাপ ৪–৬ — debounce কত ms আর কেন, পুরনো request বাতিল, query ধরে cache, optimistic লাগে না কেন, keyboard (↑ ↓ Enter Esc) আর `combobox` role (ডক ১৩ · ডক ১৫) 🔁 🧠 (Concepts vs Facts · Einstellung)

> **দিন শেষে:** "optimistic লাগে না কেন" এক লাইনে?

### দিন ০৩৩ · autocomplete, মুখে

- [ ] ২০′ autocomplete — **২০′ টাইমারে, ইংরেজিতে জোরে,** লেখা বন্ধ, কাগজে আঁকতে আঁকতে; রেকর্ড করে শুনুন কোন ধাপ বাদ পড়ল 🔁 🧠 (Test yourself · The power of senses)

> **দিন শেষে:** ছয় ধাপের কোনোটা বাদ পড়েনি?

### দিন ০৩৪ · সপ্তাহের UI, না দেখে

- [ ] ১৫′ ছয় ধাপ আর state-এর তিন জায়গা — না দেখে, ইংরেজিতে জোরে, এক বাক্য করে 🧠 (Test yourself)

> **দিন শেষে:** না দেখে পুরো?

### দিন ০৩৫ · সপ্তাহের হিসাব

- [ ] ১০′ রেকর্ডিং থেকে — কোন ধাপে সবচেয়ে কম বলার ছিল; পরের সপ্তাহে ঐ ধাপ আগে ধরবেন 🧠 (Feedback · Deliberate practice)

> **দিন শেষে:** দুর্বল ধাপটা লেখা?

### দিন ০৩৬ · news feed — ১

- [ ] ২০′ *"Design a news feed"* — চাহিদা, component, state; পাতা ধরে আনা: offset না cursor, কেন; নতুন পোস্ট এলে উপরে কীভাবে (ডক ১৫) 🧠 (Active learning · Chunk the subject)

> **দিন শেষে:** cursor-এর কারণ লেখা?

### দিন ০৩৭ · optimistic like

- [ ] ২০′ like চাপলে **সঙ্গে সঙ্গে দেখানো** — state কোথায় বদলায়, request ব্যর্থ হলে কীভাবে ফেরানো, ব্যবহারকারী কী দেখে; আর কোন ফিচারে optimistic **নয়** (পেমেন্ট) — কেন; ইংরেজিতে (ডক ০৪) 🔁 🧠 (Einstellung · Feynman)

> **দিন শেষে:** ফেরানোর ধাপ আর "কখন নয়" দুটোই লেখা?

### দিন ০৩৮ · লম্বা তালিকা

- [ ] ২০′ news feed-এর performance — হাজার সারি কেন সব DOM-এ নয়, virtualization কী করে আর কখন লাগে না, ছবি lazy আর CDN থেকে; accessibility: নতুন পোস্টের ঘোষণা (ডক ০৯) 🔁 🧠 (Concepts vs Facts)

> **দিন শেষে:** "virtualization কখন লাগে না" লেখা?

### দিন ০৩৯ · file upload

- [ ] ২০′ *"Design a file upload"* — ছয় ধাপে বুলেট: অগ্রগতি দেখানো, মাঝপথে বাতিল, ব্যর্থ হলে আবার চেষ্টা, বড় ফাইল টুকরো করে, একই টুকরো দুবার গেলে কী (ডক ১৪ · ডক ১৬) 🔁 🧠 (Chunk the subject · Active learning)

> **দিন শেষে:** ছয় ধাপের সবগুলোয় বুলেট?

### দিন ০৪০ · এলোমেলো UI

- [ ] ২০′ তিনটা UI কাগজে লিখে উল্টে — একটা তুলুন, **২০′ টাইমারে** ছয় ধাপ, ইংরেজিতে জোরে, রেকর্ড 🔁 🧠 (Interleaving · Test yourself)

> **দিন শেষে:** ২০ মিনিটে ছয় ধাপ?

### দিন ০৪১ · তিন UI, এক লাইন

- [ ] ১৫′ তিনটা UI — প্রতিটায় সবচেয়ে কঠিন সিদ্ধান্ত এক বাক্যে, ইংরেজিতে জোরে, না দেখে 🧠 (Test yourself · Spaced repetition)

> **দিন শেষে:** তিনটা বাক্য?

### দিন ০৪২ · ব্লক ৩-এর হিসাব

- [ ] ১০′ দুটো রেকর্ডিং পাশাপাশি — autocomplete (দিন ০৩৩) আর এলোমেলো (দিন ০৪০): কী ভালো হলো, কী একই; পরের ব্লকে লেখা design doc 🧠 (Compound learning · Feedback)

> **দিন শেষে:** একটা উন্নতি আর একটা বাকি জিনিস লেখা?
