# Performance vs Scalability

এই দুটো শব্দ প্রায়ই একসাথে ব্যবহার হয়, কিন্তু এরা সম্পূর্ণ আলাদা জিনিস মাপে। সহজ সংজ্ঞা —

- একটা সিস্টেমের **performance** সমস্যা আছে যদি **একজন user-এর জন্যও** এটা ধীর হয়।
- একটা সিস্টেমের **scalability** সমস্যা আছে যদি একজন user-এর জন্য দ্রুত হয়, কিন্তু **লোড বাড়লে** ধীর হয়ে যায়।

অর্থাৎ performance হলো absolute speed, আর scalability হলো resource বাড়ানোর সাথে সাথে ক্ষমতা বাড়ানোর সামর্থ্য। একটা সিস্টেম scalable বলা যায় যখন resource দ্বিগুণ করলে throughput-ও (প্রায়) দ্বিগুণ হয়।

## কেন পার্থক্যটা গুরুত্বপূর্ণ

দুটো সমস্যার সমাধান সম্পূর্ণ ভিন্ন। Performance সমস্যার সমাধান সাধারণত কোডে বা query-তে — একটা missing index, একটা N+1 query, একটা অপ্রয়োজনীয় serialization। এখানে আরও server যোগ করলে কিছুই লাভ হয় না, শুধু খরচ বাড়ে।

Scalability সমস্যার সমাধান architecture-এ — stateless application server, horizontal scaling, cache layer, database sharding, queue দিয়ে load smoothing। এখানে কোড micro-optimize করে খুব বেশি দূর যাওয়া যায় না।

ভুল diagnosis-এর ফল ব্যয়বহুল: performance সমস্যাকে scalability সমস্যা ভেবে ১০টা server যোগ করলে আপনি একই ধীর query ১০ গুণ বেশি চালাবেন মাত্র।

## Scalability-র দুই রূপ

**Vertical scaling (scale up)** — একই মেশিনকে বড় করা: বেশি CPU, বেশি RAM, দ্রুত disk। সবচেয়ে সহজ, কোডে কোনো পরিবর্তন লাগে না। কিন্তু একটা hardware limit আছে, খরচ non-linear ভাবে বাড়ে, আর মেশিনটা একটা single point of failure থেকেই যায়।

**Horizontal scaling (scale out)** — অনেকগুলো ছোট মেশিন যোগ করা। প্রায় সীমাহীন, redundancy দেয়। কিন্তু এর জন্য application-কে **stateless** হতে হয় (session server-এ রাখা যাবে না), load balancer লাগে, এবং data consistency ও distributed system-এর জটিলতা এসে যায়।

বাস্তবে বেশিরভাগ টিম শুরু করে vertical scaling দিয়ে (দ্রুত, সস্তা সময়ের হিসাবে) এবং যখন সেটা ফুরিয়ে যায় তখন horizontal-এ যায়।

## Amdahl's Law মনে রাখুন

কোনো সিস্টেমের যে অংশটা parallelize করা যায় না, সেটাই আপনার scaling-এর সিলিং। যদি ১০% কাজ sequential হয়, তাহলে অসীম server দিয়েও আপনি ১০ গুণের বেশি speedup পাবেন না। তাই scaling-এর কাজ শুরু হয় "কোন অংশটা shared/sequential?" — এই প্রশ্ন দিয়ে। সাধারণত উত্তরটা হয়: database, অথবা একটা global lock।

---

পূর্ববর্তী: [Introduction](01-introduction.md) · পরবর্তী: [Latency vs Throughput](03-latency-vs-throughput.md)
