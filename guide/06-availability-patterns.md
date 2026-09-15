# Availability Patterns

High availability মানে সিস্টেমের কোনো একটা অংশ ভেঙে গেলেও সেবা চালু থাকা। এটা অর্জনের দুটো প্রধান কৌশল — **Fail-Over** এবং **Replication**। এদের ভিত্তি একই: redundancy, অর্থাৎ কোনো single point of failure না রাখা।

## Fail-Over

একটা component মরে গেলে অন্য একটা তার জায়গা নেয়। দুটো প্রধান রূপ আছে।

### Active - Passive (Master - Standby)

একটা server (active) সব traffic সামলায়, আরেকটা (passive) অপেক্ষা করে এবং heartbeat দিয়ে active-এর অবস্থা নজরে রাখে। Heartbeat বন্ধ হলে passive server virtual IP নিয়ে নেয় এবং সেবা শুরু করে।

- **সুবিধা**: সহজ, ডেটা conflict-এর ঝুঁকি নেই।
- **অসুবিধা**: standby server-টা বসে থাকে (খরচ অপচয়), আর failover-এর সময় কিছুটা downtime হয় — passive যদি "hot standby" হয় (আগে থেকে চালু) তাহলে সেকেন্ড, আর "cold standby" হলে মিনিট।

### Active - Active

দুটো (বা তার বেশি) server একসাথে traffic সামলায়। Load balancer বা DNS দুটোর মধ্যে ট্রাফিক ভাগ করে দেয়।

- **সুবিধা**: কোনো resource অলস বসে থাকে না, একটা মরলে বাকিরা টেনে নেয় — failover প্রায় তাৎক্ষণিক।
- **অসুবিধা**: দুটো node-ই যেহেতু লেখে, ডেটা conflict সামলাতে হয়। আর ক্ষমতার পরিকল্পনা সাবধানে করতে হয় — দুটো node ৮০% লোডে চললে একটা মরলে বাকিটা ১৬০% লোড পাবে, অর্থাৎ সেটাও মরবে (cascading failure)।

### Fail-Over-এর সাধারণ ঝুঁকি

- **Data loss**: active মারা যাওয়ার আগে যে write গুলো replicate হয়নি সেগুলো হারায়।
- **Split-brain**: network partition-এর কারণে দুটো node-ই নিজেকে "active" ভাবে এবং দুজনেই লেখে। প্রতিরোধ: quorum-based leader election বা fencing (STONITH)।

## Replication

একই ডেটা একাধিক জায়গায় রাখা — availability, read scaling এবং disaster recovery — তিনটাই একসাথে দেয়।

### Master - Slave (Primary - Replica)

Master সব write নেয়, তারপর replication log পাঠিয়ে এক বা একাধিক slave-এ ডেটা কপি করে। Slave গুলো শুধু read সার্ভ করে।

- **সুবিধা**: read scale করা খুব সহজ (আরও replica যোগ করুন), backup ও analytics query replica-তে চালানো যায়।
- **অসুবিধা**: **replication lag** — replica সবসময় সামান্য পিছিয়ে থাকে, তাই stale read হতে পারে। Master মরলে একটা slave-কে promote করতে হয়, যা সাধারণত স্বয়ংক্রিয় নয় বা কিছুটা সময় নেয়। Write scale হয় না — master-ই সিলিং।

### Master - Master (Multi-Primary)

একাধিক node-ই read ও write দুটোই নেয় এবং একে অপরের সাথে sync করে।

- **সুবিধা**: write-ও scale করা যায় (কিছুটা), ভৌগোলিকভাবে দূরের user-দের কাছাকাছি write নেওয়া যায়, একটা master মরলেও write চলতে থাকে।
- **অসুবিধা**: **conflict resolution** সবচেয়ে বড় মাথাব্যথা — দুই master একই row একই সময়ে বদলালে কে জিতবে? কৌশল: last-write-wins (সহজ কিন্তু ডেটা হারায়), version vector, বা CRDT। এছাড়া auto-increment ID সংঘর্ষ এড়াতে আলাদা ID স্কিম (UUID বা offset) লাগে।

## Availability in Numbers

Availability সাধারণত শতাংশে প্রকাশ করা হয় এবং কথ্য ভাষায় "nines" বলা হয়। বছরে কতটা downtime সেটা দেখলে সংখ্যাগুলোর মানে পরিষ্কার হয়।

| Availability | নাম | প্রতি বছর downtime | প্রতি মাসে | প্রতি দিন |
|---|---|---|---|---|
| 99% | two 9s | ৩.৬৫ দিন | ৭.২ ঘণ্টা | ১৪.৪ মিনিট |
| **99.9%** | **three 9s** | **৮.৭৬ ঘণ্টা** | **৪৩.৮ মিনিট** | **১.৪৪ মিনিট** |
| **99.99%** | **four 9s** | **৫২.৬ মিনিট** | **৪.৩ মিনিট** | **৮.৬ সেকেন্ড** |
| 99.999% | five 9s | ৫.২৬ মিনিট | ২৬ সেকেন্ড | ০.৮৬ সেকেন্ড |

একটা "9" যোগ করা মানে খরচ ও জটিলতা প্রায় ১০ গুণ বাড়ানো। তাই ব্যবসায়িক প্রয়োজনের বেশি availability লক্ষ্য নির্ধারণ করা একটা সাধারণ ভুল।

### Availability in Parallel vs Sequence

একাধিক component মিলে সিস্টেম হলে মোট availability কীভাবে হিসাব হয় সেটা জানা জরুরি।

**Sequence (একটার পর একটা নির্ভরশীল)** — সব কটাকেই চলতে হবে, তাই availability **গুণ** হয় এবং সবসময় কমে:

```
Total = A × B
0.99 × 0.99 = 0.9801  (99.99% নয়, 98.01%!)
```

তাই আপনার request path-এ যত বেশি service, আপনার availability তত কম। এটাই microservice architecture-এর একটা লুকানো খরচ।

**Parallel (redundant, যেকোনো একটা চললেই হয়)** — availability **বাড়ে**:

```
Total = 1 - (1 - A) × (1 - B)
1 - (0.01 × 0.01) = 0.9999  (99.99%)
```

এই দুটো সূত্রই high availability ডিজাইনের মূল হাতিয়ার: **sequential dependency কমান, parallel redundancy বাড়ান**।

---

পূর্ববর্তী: [Consistency Patterns](05-consistency-patterns.md) · পরবর্তী: [Background Jobs](07-background-jobs.md)
