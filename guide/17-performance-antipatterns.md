# Performance Antipatterns

Antipattern হলো এমন কোড বা ডিজাইন যা দেখতে যুক্তিসঙ্গত এবং ছোট স্কেলে নিখুঁতভাবে কাজ করে, কিন্তু লোড বাড়ার সাথে সাথে সিস্টেমকে ধসিয়ে দেয়। নিচের দশটা সবচেয়ে ঘন ঘন দেখা যায় (Microsoft-এর performance antipattern তালিকা অনুসরণে)।

এদের চেনার মূল্য বিশাল — কারণ প্রায় প্রতিটা "আমাদের সিস্টেম হঠাৎ ধীর হয়ে গেছে" সমস্যার মূলে এদের কেউ না কেউ থাকে।

## Busy Database

Database server-কে এমন কাজ করানো যা application layer-এ করলেই চলত — ভারী stored procedure, জটিল ব্যবসায়িক যুক্তি, trigger-এর জাল, বা ডেটা রূপান্তর।

**কেন খারাপ**: database সাধারণত সিস্টেমের সবচেয়ে ব্যয়বহুল ও সবচেয়ে কঠিনভাবে scale করা যায় এমন উপাদান। Application server সস্তা ও অসীমভাবে বাড়ানো যায়; database তা নয়। Database-এর CPU সেই কাজে ব্যয় করা উচিত যা কেবল সে-ই করতে পারে।

**সমাধান**: গণনা ও ব্যবসায়িক যুক্তি application layer-এ সরান। তবে ভারসাম্য রাখুন — ডেটা ফিল্টার ও aggregation database-এই করা উচিত, নাহলে আপনি Extraneous Fetching-এ পড়বেন।

## Busy Frontend

ব্যয়বহুল কাজ user-এর request-response cycle-এর ভেতরেই (বা UI thread-এ) চালানো — যেমন request-এর মধ্যেই ভিডিও encode করা বা রিপোর্ট বানানো।

**কেন খারাপ**: user দীর্ঘক্ষণ অপেক্ষা করে ও timeout হয়; thread/connection আটকে থাকায় server-এর সমান্তরাল ক্ষমতা ধসে যায়; ট্রাফিক সামান্য বাড়লেই সব thread ফুরিয়ে যায়।

**সমাধান**: ভারী কাজ [background job](07-background-jobs.md)-এ পাঠান, সাথে সাথে `202 Accepted` ও একটা job ID দিন। কাজটা যদি সত্যিই সাথে সাথে দরকার হয়, তাহলে সেটাকে দ্রুত করার উপায় খুঁজুন — precompute করে রাখুন।

## Chatty I/O

একটা যৌক্তিক কাজ সম্পন্ন করতে বহু ছোট ছোট request পাঠানো — ১০০টা আলাদা database query, ৫০টা আলাদা API call, বা একটা ফাইল বাইট-বাই-বাইট পড়া।

**কেন খারাপ**: প্রতিটা I/O-তে network latency, connection ব্যবস্থাপনা ও protocol overhead যোগ হয়। ৫০টা call × ২০ms = ১ সেকেন্ড, যদিও প্রকৃত কাজ হয়তো ৫ms।

**সবচেয়ে প্রচলিত রূপ — N+1 query**: একটা query দিয়ে ১০০টা order আনা, তারপর প্রতিটার customer আনতে আরও ১০০টা query।

**সমাধান**: batch করুন ও একসাথে আনুন — `JOIN`, `WHERE id IN (...)`, ORM-এর eager loading, GraphQL-এ DataLoader, বা একটা coarse-grained API endpoint যা একবারেই সব দেয়।

## Retry Storm

কোনো service ধীর বা ব্যর্থ হলে সব client একসাথে retry শুরু করে, ফলে ইতিমধ্যেই কষ্টে থাকা service-এর উপর চাপ বহুগুণ বেড়ে যায়। বহুস্তরের সিস্টেমে retry গুণিতক হয় — তিন স্তরে ৩টা করে retry মানে মূল service-এ ২৭ গুণ ট্রাফিক।

**কেন খারাপ**: এটা একটা positive feedback loop — service সেরে উঠতে চাইলেই retry-র ঢেউ তাকে আবার ফেলে দেয়। ফলে সাময়িক সমস্যা স্থায়ী outage-এ পরিণত হয়।

**সমাধান**: **exponential backoff + jitter** (jitter অপরিহার্য, নাহলে সবাই একই মুহূর্তে আবার আসবে); retry সংখ্যা সীমিত করুন; **circuit breaker** ব্যবহার করুন যাতে ব্যর্থ service-কে সেরে ওঠার সুযোগ দেওয়া হয়; শুধু একটা স্তরে retry করুন, প্রতি স্তরে নয়।

## No Caching

একই ডেটা বারবার নতুন করে গণনা বা fetch করা, যদিও সেটা কদাচিৎ বদলায়।

**কেন খারাপ**: অপ্রয়োজনীয় latency, database-এ অপ্রয়োজনীয় লোড, এবং বেশি খরচ। জনপ্রিয় ডেটা যদি cache না হয়, তাহলে জনপ্রিয়তাই আপনার সিস্টেমের শত্রু হয়ে দাঁড়ায়।

**সমাধান**: পরিচয় করান একটা cache স্তর ([Caching](13-caching.md)) — বিশেষত read-heavy ও কদাচিৎ-বদলানো ডেটার জন্য। তবে বিপরীত antipattern-ও আছে: সব কিছু cache করলে invalidation-এর জটিলতা ও বাসি ডেটার সমস্যা আসে। যা ঘন ঘন পড়া হয় এবং কদাচিৎ বদলায় — শুধু সেটাই cache করুন।

## Improper Instantiation

প্রতিবার নতুন করে এমন object তৈরি করা যা একবার তৈরি করে বারবার ব্যবহার করার কথা — যেমন প্রতি request-এ নতুন `HttpClient`, নতুন database connection, নতুন ORM context বা নতুন serializer।

**কেন খারাপ**: এই object গুলো তৈরি করা ব্যয়বহুল (TLS handshake, DNS lookup, buffer বরাদ্দ)। সবচেয়ে কুখ্যাত উদাহরণ — .NET-এ প্রতি request-এ নতুন `HttpClient` তৈরি করলে socket exhaustion হয়, কারণ বন্ধ socket গুলো `TIME_WAIT`-এ আটকে থাকে।

**সমাধান**: এমন object গুলোকে singleton হিসেবে বা pool থেকে ব্যবহার করুন — connection pool, HTTP client factory, thread pool। উল্টো দিকে সতর্ক থাকুন: shared object গুলো thread-safe হতে হবে।

## Monolithic Persistence

সব রকম ডেটা একটামাত্র data store-এ ঠেসে দেওয়া — লেনদেনের ডেটা, session, log, analytics event, বড় blob — সব একই database-এ।

**কেন খারাপ**: বিভিন্ন ধরনের ডেটার চাহিদা সম্পূর্ণ ভিন্ন। বিশাল পরিমাণ log লেখা আপনার order table-এর সাথে একই disk ও lock-এর জন্য প্রতিযোগিতা করে, ফলে গুরুত্বপূর্ণ লেনদেন ধীর হয়ে যায়।

**সমাধান**: **Polyglot persistence** — প্রতিটা কাজের জন্য উপযুক্ত store: লেনদেনে relational, session ও cache-এ Redis, log ও search-এ Elasticsearch, ফাইল ও ছবি object storage-এ, analytics-এ data warehouse। অন্তত ভিন্ন workload গুলোকে ভিন্ন database instance-এ আলাদা করুন ([Federation](12-databases.md))।

## Noisy Neighbor

একজন tenant, একজন user বা একটা কাজ shared resource-এর অসম অংশ দখল করে ফেলে, ফলে বাকি সবাই ভোগে। যেমন একজন client-এর ভারী API ব্যবহার সবার জন্য সিস্টেম ধীর করে দেয়, বা একটা report query পুরো database-এর CPU খেয়ে ফেলে।

**কেন খারাপ**: একজনের আচরণ সবার অভিজ্ঞতা নষ্ট করে, এবং সমস্যাটা নির্ণয় করা কঠিন — কারণ ভুক্তভোগীদের নিজেদের কোনো দোষ নেই।

**সমাধান**: প্রতি-tenant **rate limiting ও quota**; resource সীমা (CPU/memory cap, query timeout); গুরুত্বপূর্ণ ও ভারী workload-এর জন্য আলাদা pool বা queue (**Bulkhead** প্যাটার্ন); বড় গ্রাহকদের জন্য প্রয়োজনে সম্পূর্ণ আলাদা infrastructure।

## Synchronous I/O

I/O চলাকালীন thread টাকে অবরুদ্ধ করে বসিয়ে রাখা, যদিও সে ওই সময়ে অন্য কাজ করতে পারত।

**কেন খারাপ**: thread ব্যয়বহুল (প্রতিটাতে memory ও context-switch খরচ)। I/O-র জন্য অপেক্ষারত thread-এ pool ভরে গেলে server নতুন request নিতে পারে না — যদিও CPU প্রায় পুরোপুরি অলস। এভাবেই একটা ধীর downstream পুরো service-কে অচল করে দেয়।

**সমাধান**: async/await ও non-blocking I/O ব্যবহার করুন — I/O-র সময় thread টা মুক্ত হয়ে অন্য request সামলাতে পারে। **সব স্তরে async রাখুন** — মাঝপথে একটা blocking call (বা `.Result`/`.wait()`) পুরো সুবিধা নষ্ট করে দেয়, এমনকি deadlock ঘটাতে পারে।

## Extraneous Fetching

প্রয়োজনের চেয়ে বেশি ডেটা আনা — `SELECT *` করে ৫০টা column আনা যেখানে ২টা লাগত, পুরো table এনে application-এ filter করা, বা ১০,০০০ সারি এনে শুধু গুনে দেখা।

**কেন খারাপ**: বাড়তি network bandwidth, বেশি memory, ধীর serialization, এবং index থাকা সত্ত্বেও অকার্যকর query plan। বিশেষভাবে ক্ষতিকর যখন filter করার কাজটা database-এর বদলে application-এ হয়।

**সমাধান**: কেবল প্রয়োজনীয় column নির্বাচন করুন; filter, sort ও aggregation database-কে দিয়ে করান (`WHERE`, `COUNT`, `SUM`); সবসময় **pagination** ব্যবহার করুন এবং কোনো unbounded query চলতে দেবেন না; projection/DTO ব্যবহার করুন।

লক্ষ্য করুন এটা **Chatty I/O**-র ঠিক বিপরীত মেরু — একদিকে অতি-বেশি ছোট call, অন্যদিকে অতি-বড় call। সঠিক উত্তরটা মাঝখানে, আর সেটা খুঁজে পাওয়া যায় মেপে।

---

পূর্ববর্তী: [Idempotent Operations](16-idempotent-operations.md) · পরবর্তী: [Monitoring](18-monitoring.md)
