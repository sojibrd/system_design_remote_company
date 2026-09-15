# Latency vs Throughput

**Latency** হলো একটা একক কাজ শেষ হতে যত সময় লাগে — একটা request পাঠানো থেকে response পাওয়া পর্যন্ত। একক: millisecond।

**Throughput** হলো নির্দিষ্ট সময়ে কতগুলো কাজ শেষ হলো — requests per second (RPS/QPS), messages per second, bytes per second। একক: কাজ/সময়।

ক্লাসিক উপমা: একটা হাইওয়ে। Latency হলো একটা গাড়ির এক প্রান্ত থেকে অন্য প্রান্তে যেতে যত সময় লাগে; throughput হলো প্রতি ঘণ্টায় কতগুলো গাড়ি পার হলো। লেন বাড়ালে throughput বাড়ে, কিন্তু একটা গাড়ির যাত্রার সময় একটুও কমে না।

## সাধারণ লক্ষ্য

বেশিরভাগ সিস্টেমে লক্ষ্য হলো — **গ্রহণযোগ্য latency-র মধ্যে সর্বোচ্চ throughput**। শুধু throughput বাড়াতে গেলে queue লম্বা হয় আর latency আকাশ ছোঁয়; শুধু latency কমাতে গেলে resource under-utilized থাকে।

এই দুইয়ের সম্পর্ক **Little's Law** দিয়ে প্রকাশ করা যায়:

```
L = λ × W
（সিস্টেমে গড়ে যত request = আগমনের হার × প্রতিটার গড় সময়）
```

মানে, throughput আর latency স্বাধীন নয় — concurrency যদি স্থির থাকে, একটা বাড়লে অন্যটা কমে।

## Average নয়, Percentile দেখুন

Latency-র গড় (average/mean) প্রায় সবসময় বিভ্রান্তিকর। কয়েকটা অস্বাভাবিক ধীর request গড়ে হারিয়ে যায়, অথচ সেগুলোই আপনার সবচেয়ে গুরুত্বপূর্ণ user-দের অভিজ্ঞতা। তাই সবসময় **percentile** ব্যবহার করুন:

- **p50 (median)** — সাধারণ user কী অনুভব করছে
- **p95 / p99** — খারাপ অভিজ্ঞতাগুলো কতটা খারাপ
- **p99.9** — বড় স্কেলে এটাই আপনার সবচেয়ে সক্রিয় user-দের অভিজ্ঞতা, কারণ যে user বেশি request করে সে বেশি tail latency-র মুখোমুখি হয়

একটা service-এর SLO সাধারণে এভাবে লেখা হয়: "৯৯% request ২০০ms-এর নিচে শেষ হবে।"

## Tail latency amplification

Microservice architecture-এ একটা user request ভেতরে ১০টা service call করলে, প্রতিটার p99 ভালো হলেও পুরো request-এর p99 অনেক খারাপ হয়। কারণ ১০টার মধ্যে অন্তত একটা ধীর হওয়ার সম্ভাবনা অনেক বেশি। এই কারণেই fan-out বেশি এমন সিস্টেমে tail latency-কে আলাদা করে আক্রমণ করতে হয় — hedged request, timeout + fallback, বা fan-out কমানো।

## Latency-র বাস্তব সংখ্যা (আনুমানিক)

ডিজাইন করার সময় এই মাত্রাগুলো মাথায় রাখলে দ্রুত হিসাব করা যায়:

| অপারেশন | আনুমানিক সময় |
|---|---|
| L1 cache reference | ~1 ns |
| Main memory reference | ~100 ns |
| SSD random read | ~150 µs |
| একই datacenter-এ round trip | ~0.5 ms |
| Disk seek (HDD) | ~10 ms |
| মহাদেশ-পারাপার round trip | ~150 ms |

মূল শিক্ষা: **network আর disk হলো memory-র চেয়ে হাজার-লক্ষ গুণ ধীর**। তাই latency কমানোর সবচেয়ে বড় সুযোগ প্রায়ই "কম network call করা" বা "cache থেকে দেওয়া" — কোড দ্রুত করা নয়।

---

পূর্ববর্তী: [Performance vs Scalability](02-performance-vs-scalability.md) · পরবর্তী: [Availability vs Consistency](04-availability-vs-consistency.md)
