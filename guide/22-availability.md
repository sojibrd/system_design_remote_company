# Reliability Patterns — Availability

Availability মানে সিস্টেম যখন দরকার তখন কার্যক্ষম ও অ্যাক্সেসযোগ্য থাকা। এটা শুধু "server চালু আছে" নয় — user-এর কাজটা সম্পন্ন হচ্ছে কি না সেটাই আসল মাপকাঠি। এখানকার প্যাটার্নগুলো ব্যর্থতার প্রভাব সীমিত রাখা ও সেবা চালু রাখার কৌশল।

মৌলিক গণিতটা আগে দেখে নিন: [Availability Patterns](06-availability-patterns.md) — বিশেষত sequential dependency কীভাবে availability কমায় আর parallel redundancy কীভাবে বাড়ায়।

## Deployment Stamps

পুরো application stack-এর একাধিক স্বাধীন কপি (stamp বা scale unit) deploy করা, যার প্রতিটা নির্দিষ্টসংখ্যক গ্রাহক বা tenant-কে সেবা দেয়। প্রতিটা stamp-এর নিজস্ব compute, database ও অন্যান্য resource থাকে।

**সুবিধা**:
- **ব্যর্থতার বিচ্ছিন্নতা** — একটা stamp ভেঙে পড়লে কেবল সেই stamp-এর গ্রাহকরা প্রভাবিত হয়, সবাই নয়। "Blast radius" ছোট থাকে।
- **পূর্বানুমেয় scaling** — একটা stamp কতজনকে সামলাতে পারে সেটা জানা থাকলে বৃদ্ধির পরিকল্পনা সহজ: আরও stamp যোগ করুন।
- **নিরাপদ deployment** — নতুন version একটা stamp-এ ছেড়ে দেখা যায়, সমস্যা হলে সেখানেই থামে।
- বড় গ্রাহকদের জন্য উৎসর্গীকৃত stamp দেওয়া যায় (Noisy Neighbor সমাধান), এবং ডেটার ভৌগোলিক অবস্থান সংক্রান্ত আইনি প্রয়োজন মেটানো যায়।

**খরচ**: অনেকগুলো একই রকম পরিবেশ পরিচালনা করতে হয় — তাই deployment ও configuration সম্পূর্ণ স্বয়ংক্রিয় (infrastructure as code) না হলে এটা অসম্ভব। কোন গ্রাহক কোন stamp-এ, সেটা জানার জন্য একটা routing স্তরও লাগে (যা নিজে অত্যন্ত নির্ভরযোগ্য হতে হবে)।

## Geodes (Geographical Nodes)

একাধিক ভৌগোলিক অঞ্চলে সম্পূর্ণ কার্যক্ষম, সমপর্যায়ের deployment রাখা, যেখানে **প্রতিটা node যেকোনো অঞ্চলের যেকোনো request সামলাতে পারে**। Traffic যায় সবচেয়ে কাছের বা সুস্থতম node-এ (geo-routing/anycast দিয়ে)।

Deployment Stamps-এর সাথে পার্থক্যটা গুরুত্বপূর্ণ: stamp-এ প্রতিটা unit একটা নির্দিষ্ট গ্রাহকগোষ্ঠীর মালিক; geode-এ সব node সবার সেবা দিতে পারে। তাই geode আরও শক্তিশালী, কিন্তু ডেটার দিক থেকে অনেক বেশি দাবিদার।

**সুবিধা**: সারা পৃথিবীর user-দের জন্য কম latency; একটা পুরো region ডাউন হলেও সেবা চালু (সবচেয়ে উঁচু স্তরের availability); ট্রাফিক অনুযায়ী অঞ্চলভিত্তিক scaling।

**খরচ ও কঠিন অংশ**: **ডেটা**। সব অঞ্চলে ডেটা কীভাবে থাকবে? Global replication করলে eventual consistency ও conflict resolution মেনে নিতে হবে; অঞ্চলভিত্তিক ডেটা রাখলে cross-region request সামলাতে হবে। এই কারণে geode সাধারণত read-heavy ও eventual consistency সহনীয় সিস্টেমেই ব্যবহারযোগ্য। খরচও উল্লেখযোগ্য।

## Health Endpoint Monitoring

Application-এ এমন endpoint তৈরি করা যা বাইরের tool নিয়মিত ডেকে সিস্টেমের স্বাস্থ্য যাচাই করতে পারে। এটাই সেই ভিত্তি যার উপর load balancer, orchestrator ও alerting দাঁড়িয়ে থাকে — কারণ একটা অসুস্থ instance শনাক্ত করতে না পারলে ট্রাফিক তার দিকেই যেতে থাকবে।

কার্যকর health endpoint-এর বৈশিষ্ট্য:
- **liveness ও readiness আলাদা রাখুন** — একটা বলে "আমাকে restart করো", অন্যটা বলে "এখন ট্রাফিক পাঠিও না"।
- জরুরি নির্ভরতাগুলো যাচাই করুন (database, cache), কিন্তু **ঐচ্ছিক নির্ভরতার ব্যর্থতায় নিজেকে অসুস্থ ঘোষণা করবেন না** — নাহলে একটা তুচ্ছ downstream সমস্যা আপনার পুরো fleet-কে rotation থেকে বের করে দেবে।
- Endpoint টা হালকা ও দ্রুত রাখুন, এবং প্রতি কয়েক সেকেন্ডে ডাকা হবে ধরে নিয়েই ডিজাইন করুন।
- Endpoint টা সুরক্ষিত রাখুন — অভ্যন্তরীণ বিস্তারিত তথ্য প্রকাশ করা একটা নিরাপত্তা ঝুঁকি।
- একাধিক অঞ্চল থেকে check করুন, যাতে "সিস্টেম ঠিক আছে কিন্তু একটা অঞ্চল থেকে পৌঁছানো যাচ্ছে না" ধরা পড়ে।

বিস্তারিত: [Monitoring — Health Monitoring](18-monitoring.md)।

## Queue-Based Load Leveling

Service-এর সামনে queue বসিয়ে ট্রাফিকের চূড়াকে সমতল করা — যাতে হঠাৎ ঢেউয়ে service ভেঙে না পড়ে, বরং কাজগুলো অপেক্ষা করে ও ধীরে ধীরে সম্পন্ন হয়। Availability-র দৃষ্টিকোণ থেকে এর মূল অবদান হলো: **চাপের মুখে সিস্টেম ব্যর্থ হয় না, কেবল ধীর হয়** — এবং ধীর হওয়া প্রায় সবসময়ই বন্ধ হয়ে যাওয়ার চেয়ে ভালো। বিস্তারিত: [Messaging Patterns](21-messaging-patterns.md)।

---

পূর্ববর্তী: [Messaging Patterns](21-messaging-patterns.md) · পরবর্তী: [High Availability](23-high-availability.md)
