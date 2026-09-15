# Idempotent Operations

একটা operation **idempotent** যদি সেটা একবার চালানো আর একাধিকবার চালানোর ফলাফল একই হয়। গাণিতিকভাবে: `f(f(x)) = f(x)`।

গুরুত্বপূর্ণ সূক্ষ্মতা: idempotency মানে "দ্বিতীয়বার কিছুই হয় না" নয় — মানে হলো **সিস্টেমের চূড়ান্ত অবস্থা একই থাকে**। `SET balance = 100` idempotent; `balance = balance + 100` নয়।

## কেন এটা আলোচনাযোগ্য নয়, বরং অপরিহার্য

Distributed system-এ **network অনির্ভরযোগ্য**, এবং এর সবচেয়ে যন্ত্রণাদায়ক দিকটা হলো — request পাঠানোর পর যদি উত্তর না আসে, আপনি জানেন না কী ঘটেছে:

1. Request server পর্যন্ত পৌঁছায়ইনি, কিছুই হয়নি।
2. Request পৌঁছেছে, কাজ হয়েছে, কিন্তু response পথে হারিয়ে গেছে।

Client-এর কাছে দুটো ক্ষেত্রেই একই রকম দেখায় (timeout)। এই **অনিশ্চয়তা দূর করা অসম্ভব** — এটা distributed computing-এর একটা মৌলিক সীমা। তাই একমাত্র নিরাপদ পথ হলো retry করা, আর retry নিরাপদ করার একমাত্র উপায় হলো idempotency।

একই কারণে message queue গুলো সাধারণত *at-least-once* delivery দেয় — অর্থাৎ **duplicate আসবেই**। Consumer idempotent না হলে দুবার টাকা কাটা, দুবার ইমেইল পাঠানো, বা দুবার order তৈরি হওয়া শুধু সময়ের ব্যাপার।

## HTTP Method-এর স্বাভাবিক আচরণ

| Method | Idempotent? | Safe? (state বদলায় না) |
|---|---|---|
| `GET` | হ্যাঁ | হ্যাঁ |
| `HEAD` | হ্যাঁ | হ্যাঁ |
| `PUT` | হ্যাঁ (পুরো resource প্রতিস্থাপন) | না |
| `DELETE` | হ্যাঁ (দ্বিতীয়বারে ইতিমধ্যেই মোছা) | না |
| `POST` | **না** | না |
| `PATCH` | নির্ভর করে (`status=paid` হ্যাঁ, `count+=1` না) | না |

`POST`-ই মূল সমস্যা — এবং দুর্ভাগ্যবশত অর্থ লেনদেন, order তৈরি, ইমেইল পাঠানোর মতো গুরুত্বপূর্ণ কাজগুলো এখানেই ঘটে।

## Idempotency Key: প্রধান কৌশল

Client প্রতিটা লেনদেনের জন্য একটা অনন্য key তৈরি করে (সাধারণত UUID) এবং সেটা header-এ পাঠায়:

```
POST /payments
Idempotency-Key: 8f14e45f-ea6d-4b0e-9b6d-2c1a3f5e7d91
```

Server-এর কাজের ধারা:

1. Key টা store-এ (Redis বা database) খুঁজুন।
2. **নেই** → key টা "processing" অবস্থায় সংরক্ষণ করুন (atomic insert, unique constraint সহ), কাজটা করুন, response সংরক্ষণ করুন, তারপর response ফেরত দিন।
3. **আছে ও সম্পন্ন** → কাজটা আবার না করে **সংরক্ষিত আগের response টাই** ফেরত দিন।
4. **আছে কিন্তু চলমান** → `409 Conflict` দিন বা অপেক্ষা করান (একসাথে দুটো একই request এলে)।

বাস্তবায়নের কিছু নিয়ম:
- Key তৈরি করবে **client**, প্রতি যৌক্তিক অপারেশনে একবার — retry-তে **একই key** ব্যবহার করতে হবে, নাহলে পুরো ব্যবস্থাটাই অর্থহীন।
- Key-র record ও প্রকৃত কাজটা **একই transaction-এ** করুন, নাহলে মাঝপথে ব্যর্থ হলে ফাঁক থেকে যাবে।
- Key-র সাথে request-এর একটা hash রাখুন — একই key দিয়ে ভিন্ন payload এলে সেটা client-এর bug, error দিন।
- Key-গুলোর একটা TTL দিন (সাধারণত ২৪ ঘণ্টা), নাহলে store অসীম বাড়বে।

## অন্যান্য কৌশল

**Natural / deterministic key** — ব্যবসায়িক ডেটা থেকেই একটা অনন্য key বানান (যেমন `order_id + payment_attempt`) এবং database-এ unique constraint দিন। দ্বিতীয়বার লেখার চেষ্টায় duplicate error আসবে, যেটা ধরে সফল ধরে নেওয়া যাবে। বাড়তি কোনো অবকাঠামো লাগে না।

**Conditional update (optimistic concurrency)** — `UPDATE ... WHERE version = 5` বা HTTP-তে `If-Match: <etag>`। পুরনো version নিয়ে আসা duplicate কোনো কাজ করবে না।

**State machine** — অবস্থার পরিবর্তন কেবল বৈধ পথেই অনুমোদন করুন: `UPDATE orders SET status='shipped' WHERE id=? AND status='paid'`। ইতিমধ্যেই `shipped` হয়ে থাকলে query কোনো সারি স্পর্শ করবে না — নিরাপদে কিছুই হবে না।

**Deduplication window** — সাম্প্রতিক message ID গুলো cache-এ রেখে দিন এবং পুনরাবৃত্তি হলে বাদ দিন। সরল, তবে এটা সম্ভাব্য (probabilistic) সুরক্ষা — আর্থিক কাজে একে একমাত্র প্রতিরক্ষা বানাবেন না।

## Retry-র সঠিক নিয়ম

Idempotency retry-কে নিরাপদ করে, কিন্তু retry-র নিজেরও শৃঙ্খলা দরকার — নাহলে ব্যর্থ service-এর উপর retry storm নেমে আসে (দেখুন [Performance Antipatterns](17-performance-antipatterns.md))। সবসময় **exponential backoff + jitter** ব্যবহার করুন, সর্বোচ্চ চেষ্টার সংখ্যা বেঁধে দিন, এবং **circuit breaker** দিয়ে ঘেরাও করুন। আর মনে রাখুন — `400`-এর মতো client error retry করে লাভ নেই, শুধু `429`, `503` ও timeout-এর মতো ক্ষণস্থায়ী ব্যর্থতাই retry-যোগ্য।

---

পূর্ববর্তী: [Communication](15-communication.md) · পরবর্তী: [Performance Antipatterns](17-performance-antipatterns.md)
