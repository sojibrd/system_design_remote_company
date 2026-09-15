# Availability vs Consistency

Distributed system-এ সবচেয়ে মৌলিক trade-off টা এখানেই। একাধিক node-এ ডেটা রাখলে একদিকে আপনি fault tolerance পান, অন্যদিকে "সব node কি একই ডেটা দেখছে?" — এই প্রশ্নটা এসে যায়।

## CAP Theorem

Eric Brewer-এর CAP theorem বলে, একটা distributed data store একসাথে সর্বোচ্চ **তিনটার মধ্যে দুটো** নিশ্চিত করতে পারে:

- **C — Consistency**: প্রতিটা read সবচেয়ে সাম্প্রতিক write পাবে, নয়তো error পাবে। (এটা ACID-এর C নয়, এটা "linearizability"।)
- **A — Availability**: প্রতিটা request একটা (non-error) response পাবে — কিন্তু সেটা সবচেয়ে সাম্প্রতিক ডেটা নাও হতে পারে।
- **P — Partition Tolerance**: node-দের মধ্যে network message হারিয়ে গেলেও/দেরি হলেও সিস্টেম চলতে থাকবে।

গুরুত্বপূর্ণ ব্যাখ্যা: **network partition একটা বাস্তবতা, পছন্দ নয়।** যেকোনো সত্যিকারের distributed system-কে P বেছে নিতেই হবে। তাই বাস্তব সিদ্ধান্তটা হলো — **partition হলে আপনি C ছাড়বেন নাকি A ছাড়বেন?**

## AP — Availability + Partition Tolerance

Partition-এর সময় সব node **response দিতে থাকবে**, কিন্তু কিছু node হয়তো পুরনো ডেটা দেবে। Partition শেষ হলে node গুলো নিজেদের মধ্যে sync করে নেবে (eventual consistency)।

**কখন বেছে নেবেন**: যখন সিস্টেম বন্ধ থাকার চেয়ে সামান্য পুরনো ডেটা দেখানো ভালো। উদাহরণ — social media feed, product catalog, like/view counter, DNS, analytics ingestion, shopping cart (Amazon-এর ক্লাসিক উদাহরণ: cart-এ item যোগ করা কখনো fail করা উচিত নয়)।

উদাহরণ সিস্টেম: Cassandra, DynamoDB (default), CouchDB, Riak।

## CP — Consistency + Partition Tolerance

Partition-এর সময় যে node গুলো নিশ্চিত হতে পারে না তারা **error ফেরত দেবে বা timeout করবে**, ভুল ডেটা দেবে না।

**কখন বেছে নেবেন**: যখন ভুল/পুরনো ডেটা দেখানোর খরচ বন্ধ থাকার চেয়ে বেশি। উদাহরণ — ব্যাংক ব্যালান্স ও লেনদেন, inventory-র শেষ কয়েকটা item, seat/ticket booking, unique username রেজিস্ট্রেশন, distributed lock ও leader election।

উদাহরণ সিস্টেম: ZooKeeper, etcd, HBase, Spanner (বিশেষ hardware clock দিয়ে), MongoDB (default configuration-এ)।

## CAP-এর সীমাবদ্ধতা এবং PACELC

CAP শুধু **partition-এর সময়** কী হবে সেটা বলে — যা মোট সময়ের খুব ছোট অংশ। বাকি সময়ে কী হবে? সেটা বলে **PACELC**:

> **P**artition হলে **A** বনাম **C**; **E**lse (স্বাভাবিক সময়ে) **L**atency বনাম **C**onsistency.

অর্থাৎ partition না থাকলেও strong consistency-র জন্য আপনাকে node-দের মধ্যে coordination করতে হয়, যা latency বাড়ায়। এই কারণেই strongly consistent সিস্টেম সাধারণত ধীর হয়, শুধু failure-এর সময় নয় — সবসময়।

## বাস্তব পরামর্শ

পুরো সিস্টেমের জন্য একটাই উত্তর বেছে নিতে হবে এমন নয়। বাস্তব architecture-এ **প্রতি ডেটা-শ্রেণিতে আলাদা সিদ্ধান্ত** নেওয়া হয়: payment ledger CP, user profile ও feed AP, session data AP, inventory reservation CP। একই অ্যাপে দুই ধরনের store পাশাপাশি থাকা স্বাভাবিক ও কাম্য।

---

পূর্ববর্তী: [Latency vs Throughput](03-latency-vs-throughput.md) · পরবর্তী: [Consistency Patterns](05-consistency-patterns.md)
