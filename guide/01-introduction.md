# Introduction

System Design হলো এমন একটা প্রক্রিয়া যেখানে আপনি একটা সফটওয়্যার সিস্টেমের architecture, components, modules, interfaces এবং data flow আগে থেকে ঠিক করে নেন — কোড লেখার আগেই। ছোট অ্যাপে এটা অনেকটা স্বয়ংক্রিয়ভাবে হয়ে যায়, কিন্তু যখন সিস্টেমকে লক্ষ লক্ষ user, terabyte scale data আর ২৪/৭ availability সামলাতে হয়, তখন ডিজাইনের সিদ্ধান্তগুলোই ঠিক করে দেয় সিস্টেমটা টিকবে নাকি ভেঙে পড়বে।

গুরুত্বপূর্ণ কথা হলো — system design-এ কোনো "সঠিক উত্তর" নেই, আছে **trade-off**। আপনি consistency বাড়ালে availability কমবে, latency কমাতে গেলে খরচ বাড়বে, সবকিছু microservice করলে operational complexity বাড়বে। ভালো ডিজাইনার সেই ব্যক্তি নন যিনি সব প্যাটার্ন মুখস্থ জানেন, বরং যিনি জানেন কোন context-এ কোন trade-off গ্রহণযোগ্য।

## What is System Design?

System Design বলতে বোঝায় একটা সিস্টেমের requirement থেকে শুরু করে তার concrete architecture পর্যন্ত পৌঁছানোর কাজ। এর মধ্যে থাকে —

- **High-Level Design (HLD)**: বড় বড় component গুলো কী কী (web server, load balancer, database, cache, queue), তারা কীভাবে একে অপরের সাথে কথা বলে, ডেটা কোন পথে যায়।
- **Low-Level Design (LLD)**: প্রতিটা component-এর ভেতরের class, schema, API contract, algorithm.

দুটো স্তরের গুরুত্ব আলাদা। HLD ভুল হলে পুরো সিস্টেম নতুন করে লিখতে হয়; LLD ভুল হলে সাধারণত একটা module refactor করলেই চলে। তাই ডিজাইন সেশনের বেশিরভাগ সময় HLD-তে যাওয়া উচিত।

একটা সিস্টেমকে সাধারণত তিনটা মাত্রায় বিচার করা হয়: **Scalability** (লোড বাড়লে কী হয়), **Reliability** (কিছু ভেঙে গেলে কী হয়), এবং **Maintainability** (নতুন ডেভেলপার এসে বদলাতে পারবে কি না)। প্রতিটা ডিজাইন সিদ্ধান্তকে এই তিনটার বিরুদ্ধে যাচাই করা যায়।

## How to approach System Design?

একটা structured approach থাকলে খোলা প্রশ্নেও দিশা হারাতে হয় না। নিচের ধাপগুলো ইন্টারভিউ ও বাস্তব — দুই জায়গাতেই কাজ করে।

**১. Requirements স্পষ্ট করুন।** Functional requirement (সিস্টেম কী করবে) আর non-functional requirement (কত দ্রুত, কতজন user, কতটা available) আলাদা করে লিখুন। এই ধাপ বাদ দিলে আপনি ভুল সমস্যার সমাধান করবেন।

**২. Scale অনুমান করুন (Back-of-the-envelope estimation)।** দৈনিক active user কত, প্রতি সেকেন্ডে কত request (QPS), প্রতিটা record কত বাইট, ৫ বছরে মোট storage কত। এই সংখ্যাগুলোই ঠিক করে দেবে আপনার একটা database লাগবে নাকি sharded cluster লাগবে।

**৩. API আর data model ঠিক করুন।** কোন endpoint গুলো লাগবে, তাদের input/output কী। তারপর entity গুলো ও তাদের সম্পর্ক। এখানেই SQL vs NoSQL-এর সিদ্ধান্ত আসে।

**৪. High-level architecture আঁকুন।** Client → CDN → Load Balancer → Application Servers → Cache → Database — এই কঙ্কালটা দিয়ে শুরু করে আপনার সমস্যা অনুযায়ী component যোগ/বাদ দিন।

**৫. Bottleneck খুঁজে গভীরে যান।** কোন জায়গায় প্রথম চাপ পড়বে? সেই অংশটা scale করুন — read-heavy হলে cache ও read replica, write-heavy হলে sharding ও queue। প্রতিটা পরিবর্তনের সাথে যে trade-off আসছে সেটা জোরে বলুন।

**৬. Failure নিয়ে ভাবুন।** একটা server মরে গেলে? একটা region ডাউন হলে? Network partition হলে? Single point of failure কোথায়? এই প্রশ্নগুলোর উত্তরই একটা ডিজাইনকে "কাগজে সুন্দর" থেকে "প্রোডাকশনে টেকসই"-তে রূপান্তরিত করে।

---

পরবর্তী: [Performance vs Scalability](02-performance-vs-scalability.md)
