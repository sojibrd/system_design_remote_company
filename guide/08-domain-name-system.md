# Domain Name System (DNS)

DNS হলো ইন্টারনেটের ফোনবুক — এটা মানুষের পড়ার উপযোগী নাম (`www.example.com`) কে মেশিনের বোঝার উপযোগী IP address-এ (`93.184.216.34`) অনুবাদ করে। প্রতিটা web request-এর সবচেয়ে প্রথম ধাপ এটাই, তাই DNS ধীর বা অচল হলে আপনার পুরো সিস্টেম অচল — server গুলো নিখুঁতভাবে চললেও।

## Lookup কীভাবে কাজ করে

DNS একটা hierarchical, distributed database। একটা lookup সাধারণত এই পথে যায়:

```
Browser cache → OS cache → Router cache → ISP-র Recursive Resolver
    → Root nameserver (. )        →  ".com" কোথায় জিজ্ঞেস করো
    → TLD nameserver (.com)       →  "example.com"-এর মালিক কে
    → Authoritative nameserver    →  আসল IP address
```

প্রতিটা স্তরে **cache** আছে, তাই বাস্তবে বেশিরভাগ lookup প্রথম দু-এক ধাপেই শেষ হয়ে যায়। এই cache কতক্ষণ থাকবে তা নির্ধারণ করে record-এর **TTL (Time To Live)**।

TTL একটা গুরুত্বপূর্ণ trade-off: বেশি TTL (যেমন ২৪ ঘণ্টা) মানে দ্রুত resolution ও কম DNS ট্রাফিক, কিন্তু IP বদলাতে চাইলে সারা দুনিয়ার cache আপডেট হতে একদিন লাগবে। কম TTL (যেমন ৬০ সেকেন্ড) মানে দ্রুত failover সম্ভব, কিন্তু বেশি lookup ও সামান্য বেশি latency। সাধারণ কৌশল: পরিকল্পিত migration-এর কয়েক দিন আগে TTL কমিয়ে দিন, migration শেষে আবার বাড়িয়ে দিন।

## গুরুত্বপূর্ণ Record Types

| Record | কাজ |
|---|---|
| **A** | নামকে IPv4 address-এ map করে |
| **AAAA** | নামকে IPv6 address-এ map করে |
| **CNAME** | একটা নামকে আরেকটা নামে map করে (alias) — যেমন `www` → `example.com` |
| **MX** | ডোমেইনের ইমেইল কোন server-এ যাবে |
| **NS** | এই ডোমেইনের authoritative nameserver কারা |
| **TXT** | যেকোনো টেক্সট — SPF, DKIM, ডোমেইন verification |

লক্ষণীয়: root domain (`example.com`) এ CNAME ব্যবহার করা যায় না (RFC অনুযায়ী)। এই কারণেই cloud provider-রা `ALIAS`/`ANAME` নামে বিশেষ record দেয়, যা CNAME-এর মতো আচরণ করে কিন্তু A record হিসেবে resolve হয়।

## DNS দিয়ে Traffic Routing

DNS শুধু নাম-অনুবাদ নয়, এটা একটা **প্রথম স্তরের load balancer**-ও। একই নামের বিপরীতে একাধিক উত্তর দিয়ে বা বুদ্ধিমান উত্তর দিয়ে ট্রাফিক পরিচালনা করা যায়:

- **Round Robin**: একই নামের জন্য একাধিক A record ঘুরিয়ে ঘুরিয়ে দেওয়া। সহজ, কিন্তু server-এর স্বাস্থ্য বা লোড বোঝে না, আর cache-এর কারণে বণ্টন অসম হয়।
- **Weighted**: ৯০% ট্রাফিক পুরনো version-এ, ১০% নতুনে — canary deployment-এর জন্য কার্যকর।
- **Latency-based / Geo-based**: user-এর সবচেয়ে কাছের বা দ্রুততম region-এর IP ফেরত দেওয়া। Multi-region architecture-এর ভিত্তি।
- **Failover**: health check ব্যর্থ হলে primary-র বদলে secondary IP দেওয়া। TTL-এর কারণে এটা তাৎক্ষণিক নয় — এটাই DNS-based failover-এর মূল সীমাবদ্ধতা।

## নিরাপত্তা ও নির্ভরযোগ্যতা

DNS মূলত UDP-র উপর plaintext-এ চলে, তাই এটা আক্রমণের সহজ লক্ষ্য। **DNS spoofing/cache poisoning**-এ আক্রমণকারী ভুয়া উত্তর ঢুকিয়ে user-কে অন্য server-এ পাঠায়; **DNSSEC** cryptographic signature দিয়ে উত্তরের সত্যতা যাচাই করে এটা প্রতিরোধ করে। গোপনীয়তার জন্য **DoH (DNS over HTTPS)** ও **DoT (DNS over TLS)** query গুলো encrypt করে।

নির্ভরযোগ্যতার দিক থেকে সবচেয়ে বড় শিক্ষা ২০১৬ সালের Dyn DDoS আক্রমণ — একটামাত্র DNS provider-এর উপর নির্ভরশীল হওয়ায় Twitter, GitHub, Netflix সহ ইন্টারনেটের বড় একটা অংশ অচল হয়ে গিয়েছিল। তাই গুরুত্বপূর্ণ সিস্টেমে **একাধিক DNS provider** ব্যবহার করা উচিত।

---

পূর্ববর্তী: [Background Jobs](07-background-jobs.md) · পরবর্তী: [Content Delivery Networks](09-content-delivery-networks.md)
