# Load Balancers

Load balancer আসা ট্রাফিককে একাধিক server-এর মধ্যে বণ্টন করে। এটা horizontal scaling-এর প্রবেশদ্বার — একাধিক server থাকলেই কাউকে না কাউকে সিদ্ধান্ত নিতে হয় কোন request কোথায় যাবে।

বণ্টন ছাড়াও LB আরও কিছু কাজ করে: অসুস্থ server-কে rotation থেকে বাদ দেওয়া (health check), TLS termination, compression, rate limiting, এবং সরাসরি server গুলোকে ইন্টারনেট থেকে আড়াল করা।

লক্ষণীয়: load balancer নিজেই একটা single point of failure হয়ে যেতে পারে। তাই প্রোডাকশনে LB নিজেও redundant রাখতে হয় (active-passive জোড়া বা DNS-level multiple LB)।

## LB vs Reverse Proxy

দুটোই client ও server-এর মাঝখানে বসে, তাই প্রায়ই গুলিয়ে যায়। পার্থক্যটা **উদ্দেশ্যে**:

- **Load Balancer**: মূল উদ্দেশ্য একাধিক অভিন্ন server-এর মধ্যে লোড ভাগ করা। একটাই server থাকলে LB-র মানে নেই।
- **Reverse Proxy**: মূল উদ্দেশ্য backend-কে আড়াল করা ও তার হয়ে কাজ করা — TLS termination, caching, compression, path অনুযায়ী রাউটিং, নিরাপত্তা ফিল্টার। একটাই backend থাকলেও এটা কাজে লাগে।

বাস্তবে Nginx, HAProxy, Envoy-র মতো সফটওয়্যার একই সাথে দুটোই করে, তাই সীমারেখা ঝাপসা। মনে রাখার সহজ উপায়: **সব load balancer এক ধরনের reverse proxy, কিন্তু সব reverse proxy load balancer নয়।** (আর forward proxy সম্পূর্ণ ভিন্ন জিনিস — সেটা client-এর পক্ষে কাজ করে, server-এর নয়।)

## Layer 4 Load Balancing

Transport layer (TCP/UDP)-এ কাজ করে। LB শুধু source/destination IP ও port দেখে সিদ্ধান্ত নেয় — packet-এর ভেতরের content সে দেখে না বা বোঝে না।

- **সুবিধা**: অত্যন্ত দ্রুত ও কম resource লাগে, কারণ কোনো parsing নেই। Encrypted ট্রাফিক decrypt না করেই পাঠাতে পারে (end-to-end encryption বজায় থাকে)। যেকোনো protocol-এ কাজ করে।
- **অসুবিধা**: বুদ্ধিমান সিদ্ধান্ত নিতে পারে না — URL, header বা cookie-র ভিত্তিতে রাউট করা সম্ভব নয়। একটা TCP connection পুরোটাই একটা server-এ যায়।
- **ব্যবহার**: অত্যন্ত উচ্চ throughput, non-HTTP protocol (database, gaming, VoIP), বা যখন backend-এ TLS pass-through দরকার।

## Layer 7 Load Balancing

Application layer (HTTP/HTTPS)-এ কাজ করে। LB পুরো request পড়ে — URL path, header, cookie, method, এমনকি body।

- **সুবিধা**: content-ভিত্তিক রাউটিং সম্ভব — `/api/*` একদল server-এ, `/images/*` অন্যদলে, `/admin` সীমিত pool-এ। TLS termination, caching, request/response পরিবর্তন, cookie-ভিত্তিক sticky session, A/B testing ও canary release — সব করা যায়।
- **অসুবিধা**: বেশি CPU লাগে (parsing ও decryption), latency সামান্য বেশি, শুধু নির্দিষ্ট protocol-এ কাজ করে।
- **ব্যবহার**: প্রায় সব আধুনিক web application ও API gateway। **সাধারণ ওয়েব সিস্টেমে এটাই ডিফল্ট পছন্দ।**

## Load Balancing Algorithms

কোন server-এ পাঠানো হবে সেটা ঠিক করার নিয়ম:

- **Round Robin** — একটার পর একটা ঘুরিয়ে। সহজ; সব server সমান ক্ষমতার ও সব request সমান খরচের হলে ভালো কাজ করে।
- **Weighted Round Robin** — বড় server বেশি ভাগ পায়। ভিন্ন ক্ষমতার server থাকলে উপযোগী।
- **Least Connections** — যার হাতে সবচেয়ে কম সক্রিয় connection তাকে দাও। Request-এর সময়কাল অসম হলে (কিছু দ্রুত, কিছু দীর্ঘ) round robin-এর চেয়ে অনেক ভালো।
- **Least Response Time** — সবচেয়ে দ্রুত সাড়া দিচ্ছে এমন server বেছে নাও। ধীর হয়ে পড়া server স্বয়ংক্রিয়ভাবে কম ট্রাফিক পায়।
- **IP Hash / Consistent Hashing** — client-এর IP (বা key) hash করে server নির্ধারণ। একই client সবসময় একই server-এ যায় — cache locality ও session-এর জন্য দরকারি। **Consistent hashing** ব্যবহার করলে একটা server যোগ/বাদ হলে সব mapping ভেঙে যায় না, শুধু ছোট অংশ পুনর্বণ্টিত হয় — distributed cache ও sharding-এ এটা অপরিহার্য।
- **Random (Two Choices)** — এলোমেলোভাবে দুটো server বেছে, যার লোড কম তাকে দাও। আশ্চর্যজনকভাবে কার্যকর এবং কোনো global state লাগে না।

## Horizontal Scaling

Load balancer-ই horizontal scaling সম্ভব করে — নতুন server যোগ করুন, LB-র pool-এ ঢুকিয়ে দিন, ক্ষমতা বাড়ল। Autoscaling group এটাকে স্বয়ংক্রিয় করে: CPU বা request rate দেখে instance বাড়ে-কমে।

কিন্তু এর একটা পূর্বশর্ত আছে — **application-কে stateless হতে হবে**। যদি session server-এর memory-তে থাকে, তাহলে user পরের request-এ অন্য server-এ গিয়ে logged out হয়ে যাবে। সমাধান দুটো:

1. **Sticky session** — LB একই user-কে একই server-এ পাঠায়। সহজ, কিন্তু লোড অসম হয় এবং server মরলে ওই user-দের state হারায়। এটা একটা অস্থায়ী সমাধান হিসেবে দেখুন।
2. **External session store** — session Redis বা database-এ রাখুন, অথবা JWT-র মতো self-contained token ব্যবহার করুন। **এটাই সঠিক পদ্ধতি।**

Horizontal scaling-এর সীমাও মনে রাখুন: application server scale করা সহজ, কিন্তু চাপ শেষমেশ database-এ গিয়ে জমা হয় — এবং সেটা scale করাই আসল কঠিন কাজ ([Databases](12-databases.md) দেখুন)।

---

পূর্ববর্তী: [Application Layer](10-application-layer.md) · পরবর্তী: [Databases](12-databases.md)
