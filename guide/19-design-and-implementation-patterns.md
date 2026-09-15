# Cloud Design Patterns — Design & Implementation

> এই অংশের প্যাটার্নগুলোর গুরুত্ব সমান নয়। সবগুলো আয়ত্ত করার দরকার নেই — কোনটা কী সমস্যার সমাধান করে সেটা চেনা থাকলেই যথেষ্ট, যাতে প্রয়োজনের সময় সঠিকটা মনে পড়ে।

ভালো design ও implementation প্যাটার্ন component গুলোর মধ্যে সীমারেখা পরিষ্কার রাখে, পুনঃব্যবহার সহজ করে, এবং একটা অংশ বদলাতে গিয়ে অন্য অংশ ভাঙার ঝুঁকি কমায়।

## Ambassador

Client-এর হয়ে network call পরিচালনা করার জন্য একটা আলাদা helper service বা process তৈরি করা। মূল application সরল থাকে (শুধু localhost-এ call করে), আর ambassador সামলায় retry, timeout, circuit breaking, TLS, monitoring ও routing।

**কখন**: বিভিন্ন ভাষায় লেখা legacy বা পুরনো service, যাদের কোডে হাত না দিয়েই আধুনিক resilience ও observability যোগ করতে হবে। Service mesh (Istio, Linkerd)-এর মূল ভিত্তি এই প্যাটার্ন।

## Anti-Corruption Layer

আপনার পরিচ্ছন্ন domain model আর কোনো legacy বা বাইরের সিস্টেমের মধ্যে একটা অনুবাদক স্তর বসানো, যাতে বাইরের সিস্টেমের অদ্ভুত ধারণা ও গঠন আপনার model-কে "দূষিত" না করে।

**কখন**: legacy সিস্টেম থেকে ধাপে ধাপে সরে আসার সময়, বা তৃতীয় পক্ষের API-র সাথে যুক্ত হওয়ার সময়। বাড়তি একটা স্তর ও কিছু latency-র খরচে আপনি নিজের কোডবেসকে পরিষ্কার রাখেন — সাধারণত এই বিনিময়টা লাভজনক।

## Backends for Frontends (BFF)

প্রতিটা ধরনের client-এর (web, mobile, smart TV) জন্য আলাদা backend service তৈরি করা, যা ঠিক সেই client-এর প্রয়োজন অনুযায়ী ডেটা জোগাড় ও আকার দেয়।

**কেন**: একটামাত্র general-purpose API সব client-কে খুশি করতে গিয়ে কাউকেই ভালোভাবে সেবা দিতে পারে না — mobile-এর দরকার ছোট payload, web-এর দরকার বিস্তারিত। BFF থাকলে প্রতিটা front-end টিম নিজের backend নিয়ন্ত্রণ করে ও দ্রুত এগোতে পারে।

**খরচ**: কোডের পুনরাবৃত্তি ও আরও কিছু service রক্ষণাবেক্ষণ। GraphQL অনেক ক্ষেত্রে এর একটা বিকল্প সমাধান দেয়।

## Compute Resource Consolidation

একাধিক ছোট কাজ বা service-কে একই compute unit-এ একত্র করা, যাতে অলস resource-এর অপচয় কমে।

**কখন**: অনেকগুলো ছোট service যাদের প্রত্যেকের ব্যবহার কম, কিন্তু প্রত্যেকের জন্য আলাদা VM/container চালাতে হচ্ছে — খরচ ও ব্যবস্থাপনার বোঝা দুটোই অযৌক্তিক। এটা microservice-এর ঠিক বিপরীত দিকের চাপ, এবং মাঝে মাঝে সেটাই সঠিক উত্তর।

**সতর্কতা**: একত্র করলে isolation কমে — একটা কাজের সমস্যা অন্যটাকে প্রভাবিত করতে পারে (Noisy Neighbor)।

## External Configuration Store

Configuration কে application-এর deployment package থেকে বের করে একটা কেন্দ্রীয় store-এ রাখা (Consul, etcd, AWS Parameter Store, Azure App Configuration)।

**কেন**: নতুন deploy না করেই setting বদলানো যায়; একাধিক service একই configuration ভাগ করে নিতে পারে; পরিবেশভেদে (dev/staging/prod) ব্যবস্থাপনা পরিচ্ছন্ন হয়; পরিবর্তনের ইতিহাস রাখা যায়।

**গুরুত্বপূর্ণ**: secret (password, API key) কখনো সাধারণ configuration-এর সাথে রাখবেন না — সেগুলোর জন্য আলাদা secret manager ব্যবহার করুন, যেখানে encryption, access control ও rotation আছে।

## Gateway Aggregation

Client-এর একটা request-কে gateway একাধিক backend service-এ ভেঙে পাঠায়, উত্তরগুলো জোড়া লাগিয়ে একটা response ফেরত দেয়।

**কেন**: client-কে ৭টা call করতে হয় না, একটাই করতে হয়। মোবাইল বা দুর্বল নেটওয়ার্কে এটা বিশাল পার্থক্য গড়ে — [Chatty I/O](17-performance-antipatterns.md) দূর করে।

**সতর্কতা**: gateway যেন নিজেই bottleneck বা single point of failure না হয়; ভেতরের call গুলো সমান্তরালে করুন এবং একটা service ব্যর্থ হলে আংশিক ফলাফল দেওয়ার কৌশল রাখুন।

## Gateway Offloading

সব service-এ যে কাজগুলো একই রকম, সেগুলো gateway-তে সরিয়ে নেওয়া — TLS termination, authentication, rate limiting, compression, logging, IP allowlist।

**কেন**: প্রতিটা service-এ একই কোড লিখতে ও রক্ষণাবেক্ষণ করতে হয় না; নিরাপত্তার নিয়ম এক জায়গায় প্রয়োগ হয় বলে ভুলের সম্ভাবনা কমে; বিশেষায়িত hardware/software দিয়ে কাজগুলো দক্ষভাবে করা যায়।

## Gateway Routing

একটামাত্র endpoint দিয়ে একাধিক service-এ request পাঠানো, request-এর বৈশিষ্ট্য (path, header, version) দেখে।

**কেন**: client শুধু একটা address জানে, ভেতরের service গুলো ভাঙা-গড়া করা যায় নির্বিঘ্নে। এটা blue-green ও canary deployment-ও সহজ করে — শুধু routing নিয়ম বদলে দিন।

## Leader Election

একদল সমপর্যায়ের instance-এর মধ্যে একজনকে "নেতা" নির্বাচন করা, যে কোনো কাজের সমন্বয় করবে বা এমন কাজ করবে যা কেবল একবারই হওয়া উচিত।

**কখন**: scheduled job যাতে ৫টা server-এ ৫ বার না চলে; একটা shared resource-এর একচ্ছত্র মালিকানা; বা কাজ বণ্টনের সমন্বয়।

**কীভাবে**: নিজে বাস্তবায়ন করার চেষ্টা করবেন না — এটা ভয়াবহভাবে সূক্ষ্ম (split-brain, clock drift)। ZooKeeper, etcd, Consul বা Redis-এর distributed lock ব্যবহার করুন, এবং lock-এ সবসময় TTL/lease রাখুন যাতে নেতা মরে গেলে lock আটকে না থাকে।

## Pipes and Filters

জটিল একটা প্রক্রিয়াকে ছোট ছোট স্বাধীন ধাপে (filter) ভাগ করা, যারা একটার পর একটা যুক্ত (pipe) হয়ে ডেটা রূপান্তর করে।

**সুবিধা**: প্রতিটা ধাপ আলাদাভাবে পরীক্ষা, পুনঃব্যবহার ও scale করা যায় — যে ধাপটা ধীর কেবল সেটার instance বাড়ান। ধাপগুলো নতুন করে সাজিয়ে নতুন pipeline বানানো সহজ।

**ব্যবহার**: ডেটা প্রক্রিয়াকরণ pipeline, ছবি/ভিডিও রূপান্তর, ETL, log প্রক্রিয়াকরণ।

## Sidecar

Application-এর পাশে একই host বা pod-এ একটা সহযোগী component চালানো, যা সহায়ক কাজগুলো করে — log সংগ্রহ, configuration sync, proxy, monitoring agent।

**কেন**: মূল application-এর সাথে জীবনচক্র ও resource ভাগ করে, কিন্তু কোড আলাদা থাকে — তাই ভিন্ন ভাষায় লেখা যায় ও স্বাধীনভাবে আপডেট করা যায়। Kubernetes-এ এটা একটা মৌলিক নির্মাণ-উপাদান, এবং service mesh-এর ভিত্তি।

**Ambassador-এর সাথে সম্পর্ক**: ambassador হলো সিদ্ধান্তমূলকভাবে network-কেন্দ্রিক একটা বিশেষ ধরনের sidecar।

## Static Content Hosting

Static content (HTML, CSS, JS, ছবি, ভিডিও) application server থেকে না দিয়ে একটা বিশেষায়িত storage service থেকে সরাসরি দেওয়া — যেমন S3, Azure Blob Storage — সাধারণত সামনে CDN বসিয়ে।

**কেন**: application server-এর মূল্যবান resource ফাইল সরবরাহে ব্যয় হয় না; খরচ অনেক কম; scalability কার্যত সীমাহীন; আর CDN-এর সাথে মিলিয়ে latency-ও কমে।

## Strangler Fig

পুরনো একটা সিস্টেমকে একবারে প্রতিস্থাপন না করে ধীরে ধীরে টুকরো টুকরো করে নতুন সিস্টেম দিয়ে বদলানো। একটা facade বা gateway সামনে বসিয়ে কিছু request নতুন সিস্টেমে আর বাকিগুলো পুরনোটায় পাঠানো হয়; ধীরে ধীরে নতুনের ভাগ বাড়ে, শেষে পুরনোটা মৃত হয়ে যায়।

**কেন**: "big bang rewrite" প্রায় সবসময়ই ব্যর্থ হয় — খরচ, ঝুঁকি ও সময় সব অনুমানের বাইরে চলে যায়। Strangler Fig ঝুঁকিকে ছোট ছোট টুকরোয় ভাগ করে, প্রতিটা ধাপে পিছিয়ে যাওয়ার সুযোগ রাখে, এবং ব্যবসা চলতে থাকে।

**খরচ**: রূপান্তরের সময়টায় দুটো সিস্টেমই চালাতে হয় এবং ডেটার সামঞ্জস্য রাখতে হয়। নাম-করা ঝুঁকি: রূপান্তরটা অর্ধেক পথে থেমে গিয়ে চিরস্থায়ী হয়ে যাওয়া।

## CQRS (Command Query Responsibility Segregation)

Read ও write-এর জন্য আলাদা model ব্যবহার করা। Command (write) ব্যবসায়িক নিয়ম ও validation নিয়ে কাজ করে; Query (read) কেবল দ্রুত ডেটা দেওয়ার জন্য অপ্টিমাইজ করা হয়। বিস্তারিত: [Data Management](20-data-management-patterns.md)।

---

পূর্ববর্তী: [Monitoring](18-monitoring.md) · পরবর্তী: [Data Management Patterns](20-data-management-patterns.md)
