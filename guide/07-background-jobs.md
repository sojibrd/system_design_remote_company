# Background Jobs

সব কাজ user-এর request-response cycle-এর ভেতরে করা যায় না বা উচিত নয়। ভিডিও encode করা, রিপোর্ট তৈরি করা, ১০,০০০ জনকে ইমেইল পাঠানো — এগুলো সেকেন্ড থেকে ঘণ্টা লাগতে পারে। এই কাজগুলো **background job** হিসেবে মূল request থেকে আলাদা করে চালানো হয়।

মূল নীতি: **user-এর request শুধু ততটুকু করবে যতটুকু user-এর উত্তরের জন্য দরকার**, বাকিটা queue-তে ফেলে দ্রুত response দেবে। এতে latency কমে, web server-এর thread খালি থাকে, এবং ভারী কাজ আলাদাভাবে scale করা যায়।

Background job সাধারণত দুইভাবে ট্রিগার হয় — কোনো ঘটনার প্রতিক্রিয়ায়, অথবা সময় ধরে।

## Event-Driven

কোনো ঘটনা ঘটলে job শুরু হয় — user একটা ফাইল আপলোড করল, একটা order তৈরি হলো, একটা message queue-তে এলো। Producer কাজটা একটা queue-তে রাখে, আর worker গুলো queue থেকে তুলে নিয়ে কাজ করে।

**সুবিধা**: প্রায় সাথে সাথেই কাজ শুরু হয়, আর কাজের পরিমাণ অনুযায়ী worker সংখ্যা autoscale করা যায় (queue depth দেখে)।

**নকশার বিবেচনা**: worker গুলো stateless হওয়া উচিত, যেকোনো worker যেকোনো job নিতে পারবে। কাজ ব্যর্থ হলে retry হবে — তাই job গুলোকে **idempotent** হতে হবে (একই job দুবার চললেও ফল একই)। বারবার ব্যর্থ job গুলো **dead-letter queue**-তে পাঠাতে হবে, নাহলে সেগুলো queue জ্যাম করে রাখবে।

উদাহরণ: ছবি resize করা, ইমেইল/notification পাঠানো, search index আপডেট, webhook delivery, payment capture।

## Schedule Driven

কাজটা নির্দিষ্ট সময়ে বা নির্দিষ্ট বিরতিতে চলে — প্রতি রাত ২টায়, প্রতি ৫ মিনিটে, মাসের ১ তারিখে। ঐতিহ্যগতভাবে cron, আধুনিক পরিবেশে Kubernetes CronJob, cloud scheduler, বা Airflow-এর মতো workflow orchestrator।

উদাহরণ: রাতের ব্যাচ রিপোর্ট, পুরনো ডেটা আর্কাইভ/পরিষ্কার, subscription নবায়ন ও বিলিং, ডেটা backup, cache warm-up, তৃতীয় পক্ষের সাথে reconciliation।

**সাধারণ ফাঁদ**:
- **Overlapping run**: আগের run শেষ হওয়ার আগেই পরেরটা শুরু হয়ে গেলে ডেটা নষ্ট হতে পারে। সমাধান: distributed lock বা "singleton" ফ্ল্যাগ।
- **একাধিক server-এ ডুপ্লিকেট run**: তিনটা server-এ একই cron থাকলে কাজটা তিনবার হবে। সমাধান: leader election বা কেন্দ্রীয় scheduler।
- **Thundering herd**: সব job রাত ১২:০০-তে চালু হলে database একসাথে চাপে পড়ে। সমাধান: সময় ছড়িয়ে দিন (jitter)।
- **মিস হওয়া run**: server ডাউন থাকলে ওই run কি পরে চালাতে হবে? এই "catch-up" আচরণ আগে থেকে ঠিক করে নিন।

## Returning Results

Background job-এর সবচেয়ে অবহেলিত অংশ — ফলাফল user-কে কীভাবে জানাবেন? কারণ ততক্ষণে HTTP response চলে গেছে। প্রচলিত কৌশলগুলো:

**১. Polling** — API সাথে সাথে একটা `jobId` ও `202 Accepted` ফেরত দেয়; client পরে `GET /jobs/{id}` করে status (`pending`/`running`/`done`/`failed`) জানতে চায়। সবচেয়ে সহজ ও নির্ভরযোগ্য, কিন্তু অপ্রয়োজনীয় request তৈরি করে। Polling interval-এ backoff ব্যবহার করুন।

**২. Webhook / Callback** — কাজ শেষে সিস্টেম client-এর দেওয়া URL-এ POST করে। Server-to-server integration-এ আদর্শ, কিন্তু client-কে একটা public endpoint চালাতে হয় এবং delivery retry সামলাতে হয়।

**৩. Push connection (WebSocket / SSE)** — ফলাফল সাথে সাথে browser-এ পাঠানো যায়, live progress bar দেখানো যায়। খরচ: persistent connection ধরে রাখতে হয়, যা scale করা তুলনামূলক জটিল।

**৪. Shared store** — worker ফলাফল database বা object storage-এ লিখে রাখে, user পরে যেকোনো সময় গিয়ে দেখে (যেমন "আপনার রিপোর্ট প্রস্তুত" পেজ)। বড় ফলাফলের জন্য সবচেয়ে ভালো — queue বা response-এ বড় payload বহন করার দরকার হয় না।

কোনটাই বেছে নিন, একটা জিনিস সবসময় রাখুন: **job-এর একটা স্থায়ী status record**। শুধু queue-তে রাখলে কাজটা হারিয়ে গেলে user কখনো জানবে না কী হয়েছে।

---

পূর্ববর্তী: [Availability Patterns](06-availability-patterns.md) · পরবর্তী: [Domain Name System](08-domain-name-system.md)
