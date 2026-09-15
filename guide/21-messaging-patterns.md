# Cloud Design Patterns — Messaging

Distributed system-এ component গুলোকে যুক্ত করার সবচেয়ে স্থিতিস্থাপক উপায় হলো message। কিন্তু message-ভিত্তিক যোগাযোগ নিজস্ব সমস্যা আনে — ক্রম, পুনরাবৃত্তি, ব্যর্থতা, ভারসাম্যহীন লোড। নিচের প্যাটার্নগুলো সেই সমস্যাগুলোর পরীক্ষিত সমাধান।

মূল ভিত্তি প্রথমে পড়ে নিন: [Asynchronism](14-asynchronism.md)।

## Asynchronous Request-Reply

Client একটা কাজ শুরু করে সাথে সাথে একটা "গ্রহণ করা হয়েছে" উত্তর পায় (`202 Accepted` + status URL), আর প্রকৃত ফলাফল পরে সংগ্রহ করে — polling, webhook বা push connection দিয়ে।

**কেন**: দীর্ঘ কাজের জন্য HTTP connection ধরে রাখা অপচয় ও অনির্ভরযোগ্য (timeout, proxy-র সীমা)। এই প্যাটার্নে client অপেক্ষায় আটকে থাকে না, আর backend নিজের গতিতে কাজ করে। বিস্তারিত কৌশল: [Background Jobs — Returning Results](07-background-jobs.md)।

## Claim Check

বড় payload টা message-এ না পাঠিয়ে একটা external store-এ (S3, blob storage) রেখে দেওয়া, আর message-এ কেবল তার **রেফারেন্স** (claim check) পাঠানো। Consumer রেফারেন্স ব্যবহার করে ডেটা নিজে টেনে আনে।

**কেন**: প্রায় সব message broker-এর message আকারের কঠোর সীমা আছে (SQS-এ 256 KB, Kafka-তে সাধারণত 1 MB)। বড় payload বহন করলে broker ধীর হয়, খরচ বাড়ে, এবং সব consumer-কে অপ্রয়োজনীয় ডেটা টানতে হয়।

**ব্যবহার**: ছবি/ভিডিও প্রক্রিয়াকরণ, বড় ফাইল আপলোড pipeline, বিশাল ডেটা রপ্তানি।

## Choreography

কেন্দ্রীয় কোনো নিয়ন্ত্রক (orchestrator) ছাড়াই service গুলো ঘটনা প্রকাশ ও ঘটনায় প্রতিক্রিয়া জানানোর মাধ্যমে একটা প্রক্রিয়া সম্পন্ন করে। প্রতিটা service জানে "এই ঘটনা ঘটলে আমার কী করার আছে" — পুরো প্রবাহটা কেউ একা জানে না।

**সুবিধা**: service গুলো শিথিলভাবে যুক্ত, নতুন service যোগ করতে পুরনো কারও কোড বদলাতে হয় না, কোনো কেন্দ্রীয় bottleneck বা single point of failure নেই।

**অসুবিধা**: পুরো ব্যবসায়িক প্রক্রিয়াটা কোথাও স্পষ্টভাবে লেখা নেই — ফলে বোঝা ও debug করা কঠিন। প্রক্রিয়াটা এখন কোথায় দাঁড়িয়ে আছে সেটা জানার জন্য distributed tracing অপরিহার্য।

**তুলনা**: Orchestration-এ একজন কেন্দ্রীয় সমন্বয়কারী সবাইকে নির্দেশ দেয় — বোঝা ও নিয়ন্ত্রণ সহজ, কিন্তু coupling বেশি। জটিল ব্যবসায়িক প্রক্রিয়ায় orchestration সাধারণত বেশি ব্যবহারিক; সরল ঘটনাপ্রবাহে choreography ভালো।

## Competing Consumers

একই queue থেকে একাধিক consumer একসাথে message তুলে নেয়; প্রতিটা message ঠিক একজন consumer পায়।

**কেন**: এটাই queue-ভিত্তিক কাজ বণ্টনের মৌলিক রূপ — consumer সংখ্যা বাড়িয়ে সহজে throughput বাড়ানো যায় (queue depth দেখে autoscale)। একটা consumer মরে গেলে তার অসমাপ্ত message অন্যরা তুলে নেয়, তাই স্থিতিস্থাপকতাও পাওয়া যায়।

**দরকারি শর্ত**: consumer গুলো **idempotent** হতে হবে (message পুনরায় সরবরাহ হতে পারে), এবং message-এর ক্রম রক্ষিত হবে না — ক্রম দরকার হলে Sequential Convoy দেখুন।

## Pipes and Filters

একটা জটিল প্রক্রিয়াকে স্বাধীন ধাপে ভেঙে queue দিয়ে যুক্ত করা, যেখানে প্রতিটা ধাপ আলাদাভাবে scale ও পুনঃব্যবহারযোগ্য। বিস্তারিত: [Design & Implementation Patterns](19-design-and-implementation-patterns.md)।

## Priority Queue

Message গুলোকে গুরুত্ব অনুযায়ী আলাদা করে, বেশি গুরুত্বপূর্ণগুলো আগে প্রক্রিয়া করা।

**বাস্তবায়ন**: সবচেয়ে সরল ও নির্ভরযোগ্য উপায় হলো **আলাদা আলাদা queue** (high/normal/low) এবং high queue-তে বেশি consumer বরাদ্দ করা — একটামাত্র queue-তে priority field ব্যবহারের চেয়ে এটা অনেক সহজে scale করে।

**সতর্কতা**: **starvation** — উচ্চ অগ্রাধিকারের কাজ অবিরত আসতে থাকলে নিম্ন অগ্রাধিকারের কাজ কখনো চলবেই না। তাই নিম্ন queue-র জন্যও ন্যূনতম ক্ষমতা সংরক্ষিত রাখুন, বা অপেক্ষার সময় বাড়ার সাথে অগ্রাধিকার বাড়ান (aging)।

## Publisher/Subscriber

Publisher একটা ঘটনা প্রকাশ করে, আর যত subscriber আগ্রহী সবাই তার একটা করে কপি পায়। Publisher জানেই না কারা শুনছে।

**কেন**: একটা ঘটনায় একাধিক প্রতিক্রিয়া দরকার হলে (order তৈরি হলে → ইমেইল পাঠাও, inventory কমাও, analytics-এ লেখো, warehouse-কে জানাও) নতুন প্রতিক্রিয়া যোগ করতে publisher-এর কোডে হাত দিতে হয় না। এটাই event-driven architecture-এর মেরুদণ্ড।

**খরচ**: কে কী শুনছে তা কোথাও কেন্দ্রীয়ভাবে দেখা যায় না, তাই প্রভাব বোঝা কঠিন; event schema বদলানো ঝুঁকিপূর্ণ (versioning পরিকল্পনা আগেই করুন)।

## Queue-Based Load Leveling

Service-এর সামনে একটা queue বসিয়ে হঠাৎ আসা ট্রাফিকের ঢেউকে সমতল করা। Producer যত দ্রুতই পাঠাক, consumer নিজের স্থির ক্ষমতায় কাজ করে যায়।

**কেন**: এটা ছাড়া ট্রাফিকের চূড়ায় (peak) service ভেঙে পড়ে, আর সেই চূড়ার জন্য সবসময় ক্ষমতা কিনে রাখলে খরচ অপচয়। Queue থাকলে গড় ক্ষমতার জন্য পরিকল্পনা করাই যথেষ্ট।

**শর্ত**: কাজটা asynchronous হতে হবে, এবং চূড়ার সময় বাড়তি latency গ্রহণযোগ্য হতে হবে। Queue-র একটা সর্বোচ্চ সীমা ও পূর্ণ হলে কী হবে তার পরিকল্পনা রাখুন ([Back Pressure](14-asynchronism.md))।

## Scheduler Agent Supervisor

বিতরণকৃত কাজকে নির্ভরযোগ্যভাবে সম্পন্ন করার জন্য তিনটা ভূমিকায় ভাগ করা:

- **Scheduler** — কাজের ধাপগুলো সাজায় ও অগ্রগতির অবস্থা রেকর্ড করে।
- **Agent** — একেকটা দূরবর্তী কাজ প্রকৃতপক্ষে সম্পাদন করে (timeout ও retry সহ)।
- **Supervisor** — অবস্থার রেকর্ড নজরে রেখে আটকে যাওয়া বা ব্যর্থ ধাপ শনাক্ত করে, এবং পুনরায় চেষ্টা বা ক্ষতিপূরণমূলক পদক্ষেপ (Compensating Transaction) শুরু করে।

**কেন**: বহু ধাপের দীর্ঘ প্রক্রিয়ায় (order → payment → inventory → shipping) যেকোনো ধাপ যেকোনো সময় ব্যর্থ হতে পারে, এবং কেউ যদি সক্রিয়ভাবে নজর না রাখে তাহলে প্রক্রিয়াগুলো নীরবে অর্ধসমাপ্ত অবস্থায় আটকে থাকে। Supervisor-ই সেই সক্রিয় প্রহরী।

## Sequential Convoy

সম্পর্কিত message গুলোর ক্রম রক্ষা করা, একই সাথে অসম্পর্কিত message গুলো সমান্তরালে প্রক্রিয়া করতে দেওয়া।

**সমস্যাটা**: বিশুদ্ধ Competing Consumers-এ ক্রমের কোনো নিশ্চয়তা নেই — "account তৈরি" এর আগেই "account আপডেট" প্রক্রিয়া হয়ে যেতে পারে। কিন্তু সবকিছু একটা consumer দিয়ে ক্রমানুসারে করালে throughput ধসে যায়।

**সমাধান**: একটা **partition/group key** ব্যবহার করুন (যেমন `orderId` বা `userId`) — একই key-র সব message একই partition ও একই consumer-এ যাবে, তাই তাদের ভেতর ক্রম রক্ষিত হবে; ভিন্ন key-র message গুলো সমান্তরালে চলবে। Kafka-র partition key ও SQS FIFO-র message group ID ঠিক এই কাজটাই করে।

**সতর্কতা**: key-র বণ্টন অসম হলে একটা partition-এ hotspot তৈরি হবে — shard key নির্বাচনের মতোই সাবধানে বাছুন।

---

পূর্ববর্তী: [Data Management Patterns](20-data-management-patterns.md) · পরবর্তী: [Reliability — Availability](22-availability.md)
