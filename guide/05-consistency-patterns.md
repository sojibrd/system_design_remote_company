# Consistency Patterns

একই ডেটার একাধিক কপি থাকলে প্রশ্ন আসে — write করার পর read করলে কী পাওয়া যাবে? এর উত্তরের উপর ভিত্তি করে তিনটা মূল consistency model আছে। এদের মধ্যে বাছাই মানে **guarantee বনাম latency/availability**-র বিনিময়।

## Weak Consistency

Write করার পর read-এ সেই ডেটা পাওয়ার **কোনো নিশ্চয়তা নেই**। কিছু read পেতে পারে, কিছু নাও পেতে পারে; কোনো নির্দিষ্ট সময়সীমাও নেই। সিস্টেম "best effort" চেষ্টা করে।

শুনতে দুর্বল লাগলেও কিছু ক্ষেত্রে এটাই সঠিক পছন্দ — যেখানে পুরনো/হারানো ডেটার মূল্য প্রায় শূন্য এবং গতিই সব। উদাহরণ: VoIP ও video call (কয়েকটা packet হারালে সমস্যা নেই, কিন্তু বিলম্ব অসহনীয়), realtime multiplayer game-এর position update, live streaming। এখানে হারানো ডেটার জন্য অপেক্ষা করার চেয়ে পরবর্তী ডেটা নিয়ে এগিয়ে যাওয়াই ভালো।

## Eventual Consistency

Write করার পর read-এ ডেটা পাওয়া যাবে — সাধারণত **milliseconds থেকে seconds-এর মধ্যে**। নতুন write অবশেষে (eventually) সব replica-তে পৌঁছাবে, এবং নতুন write বন্ধ হলে সব replica একই অবস্থায় মিলে যাবে।

এটাই বড় স্কেলের সবচেয়ে ব্যবহৃত model, কারণ এটা high availability দেয়। DNS, email, CDN, social feed, S3-এর মতো object store — সব eventual consistency-তে চলে।

সমস্যা হলো user-এর কাছে এটা মাঝে মাঝে ভাঙা মনে হয়: আপনি একটা comment লিখলেন, page refresh করলেন, comment নেই। এই কারণে বাস্তব সিস্টেমে কিছু বাড়তি guarantee যোগ করা হয় —

- **Read-your-writes consistency**: একজন user নিজের করা write সবসময় দেখবে (সাধারণত তার request গুলো primary-তে বা একই replica-তে পাঠিয়ে)।
- **Monotonic reads**: user কখনো সময়ে পিছিয়ে যাবে না — একবার নতুন ডেটা দেখলে পরে পুরনো দেখবে না।
- **Consistent prefix reads**: ঘটনাগুলো যে ক্রমে ঘটেছে সেই ক্রমেই দেখা যাবে (প্রশ্নের আগে উত্তর দেখা যাবে না)।

## Strong Consistency

Write করার পর প্রতিটা read **অবশ্যই** সেই ডেটা পাবে। ডেটা synchronously replicate হয় বা read-এ quorum লাগে। বাইরে থেকে সিস্টেমটাকে একটা single-copy database-এর মতো দেখায়।

**খরচ**: প্রতিটা write-এ একাধিক node-এর সাথে coordination দরকার, তাই latency বেশি; আর যথেষ্ট node না পৌঁছালে write fail করে, তাই availability কম।

**কখন লাগে**: আর্থিক লেনদেন, inventory decrement, seat booking, unique constraint (username/email), distributed lock ও configuration store।

## কীভাবে অর্জিত হয়: Quorum

Replicated store-এ consistency নিয়ন্ত্রণ করার সাধারণ কৌশল হলো quorum। N = মোট replica, W = লিখতে যত node-এ সফল হতে হবে, R = পড়তে যত node থেকে পড়তে হবে।

```
W + R > N  →  strong consistency (read আর write-এর মধ্যে অন্তত একটা common node)
W + R ≤ N  →  eventual consistency, কিন্তু দ্রুত
```

উদাহরণ: N=3, W=2, R=2 → strongly consistent এবং একটা node মরলেও চলে। W=1, R=1 → খুব দ্রুত ও available, কিন্তু stale read সম্ভব। Cassandra ও DynamoDB-তে এই মানগুলো **প্রতি query-তে** ঠিক করা যায় — অর্থাৎ একই database-এ গুরুত্বপূর্ণ লেখায় strong আর সাধারণ লেখায় eventual ব্যবহার করা সম্ভব।

---

পূর্ববর্তী: [Availability vs Consistency](04-availability-vs-consistency.md) · পরবর্তী: [Availability Patterns](06-availability-patterns.md)
