# Content Delivery Networks (CDN)

CDN হলো ভৌগোলিকভাবে ছড়িয়ে থাকা proxy server-এর একটা নেটওয়ার্ক, যারা user-এর কাছাকাছি থেকে content সার্ভ করে। মূল যুক্তিটা পদার্থবিজ্ঞানের — আলোর গতি ধ্রুবক। ঢাকার একজন user যদি ভার্জিনিয়ার server থেকে ফাইল নেয়, শুধু round trip-এই ~250ms চলে যাবে, আপনার server যত দ্রুতই হোক। কিন্তু সিঙ্গাপুরের edge node থেকে দিলে সেটা ~40ms।

CDN তিনটা জিনিস একসাথে দেয়:
- **কম latency** — content user-এর কাছাকাছি থাকে।
- **কম origin load** — বেশিরভাগ request আপনার server পর্যন্ত পৌঁছায়ই না, তাই bandwidth ও compute খরচ নাটকীয়ভাবে কমে।
- **বেশি availability** — origin ডাউন থাকলেও CDN cached content দিতে পারে; DDoS ট্রাফিকও edge-এ শোষিত হয়।

ঐতিহাসিকভাবে CDN শুধু static file (ছবি, CSS, JS, ভিডিও) এর জন্য ছিল, কিন্তু আধুনিক CDN dynamic content-ও accelerate করে (TLS termination ও optimized backbone routing দিয়ে) এবং edge-এ কোড চালাতে পারে।

## Push CDN

আপনি **নিজে** content CDN-এ আপলোড করেন এবং কখন কী থাকবে তা নিয়ন্ত্রণ করেন। Content বদলালে আপনাকেই আবার push করতে হয় বা invalidate করতে হয়।

- **সুবিধা**: প্রথম user-ও cache hit পায় (কোনো "cold start" নেই), origin-এ ট্রাফিক প্রায় শূন্য, ঠিক কী কী distribute হচ্ছে তার পূর্ণ নিয়ন্ত্রণ।
- **অসুবিধা**: আপলোড ও invalidation-এর logic আপনাকে লিখতে হয়; সব content সব edge-এ রাখা হয় বলে storage খরচ বেশি।
- **কখন উপযুক্ত**: ছোট বা মাঝারি আকারের content set যা কদাচিৎ বদলায় — সাইটের static asset, app-এর release build, বড় software download।

## Pull CDN

CDN **নিজে থেকে** origin থেকে content টেনে আনে। প্রথম user যখন কোনো ফাইল চায়, edge-এ সেটা না থাকলে (cache miss) CDN আপনার origin থেকে এনে user-কে দেয় এবং কপি রেখে দেয়। পরের user-রা cache hit পায়। TTL শেষ হলে কপিটা বাতিল হয় বা revalidate হয়।

- **সুবিধা**: setup প্রায় শূন্য — শুধু origin দেখিয়ে দিন। যেটা চাওয়া হয় শুধু সেটাই cache হয়, তাই storage কম লাগে। নতুন content স্বয়ংক্রিয়ভাবে চলে আসে।
- **অসুবিধা**: প্রথম request ধীর (cache miss), আর ভুল TTL দিলে user পুরনো content দেখতে পারে। Origin অবশ্যই available থাকতে হবে।
- **কখন উপযুক্ত**: বেশিরভাগ ওয়েবসাইট, বিশাল content library (যার অল্প অংশই জনপ্রিয়), ঘন ঘন বদলানো site। **বাস্তবে ৯০%+ ক্ষেত্রে এটাই সঠিক পছন্দ।**

## Cache Invalidation ও Versioning

CDN ব্যবহারে সবচেয়ে বড় বাস্তব সমস্যা হলো — content আপডেট করলাম, কিন্তু user পুরনোটাই দেখছে। দুটো সমাধান আছে:

**১. Purge/Invalidate API** — CDN-কে বলা "এই URL-টা ভুলে যাও"। কাজ করে, কিন্তু সব edge-এ ছড়াতে সময় লাগে এবং অনেক provider-এ rate limit থাকে।

**২. Cache busting / versioned URL** — ফাইলের নামে content hash বসিয়ে দিন: `app.a3f9c2.js`। Content বদলালে নামই বদলে যায়, তাই invalidation-এর দরকারই পড়ে না, আর TTL এক বছর রাখা যায়। এটাই আধুনিক পদ্ধতি এবং সবচেয়ে নির্ভরযোগ্য।

## গুরুত্বপূর্ণ HTTP Cache Header

CDN-এর আচরণ মূলত origin-এর পাঠানো header দিয়ে নিয়ন্ত্রিত হয়:

- `Cache-Control: public, max-age=31536000, immutable` — versioned static asset-এর জন্য।
- `Cache-Control: no-store` — ব্যক্তিগত/সংবেদনশীল response, কখনো cache হবে না।
- `s-maxage` — শুধু CDN-এর জন্য আলাদা TTL (browser-এর থেকে ভিন্ন রাখা যায়)।
- `stale-while-revalidate` — TTL শেষ হলেও পুরনোটা দিয়ে দাও, পেছনে নতুনটা আনো। Latency-র জন্য চমৎকার।
- `Vary` — কোন header-এর ভিত্তিতে আলাদা cache entry হবে (যেমন `Accept-Encoding`)। সাবধান: `Vary: Cookie` দিলে cache প্রায় অকেজো হয়ে যায়।

---

পূর্ববর্তী: [Domain Name System](08-domain-name-system.md) · পরবর্তী: [Application Layer](10-application-layer.md)
