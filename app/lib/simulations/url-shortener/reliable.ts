import type { LevelConfig } from "../../types";

export const reliableLevel: LevelConfig = {
  id: "reliable",
  name: "Reliable",
  badge: "🛡️ এটা ভাঙন ও সংঘর্ষে সঠিক থাকে",
  tagline: "Distributed ID generator, DB replication and an asynchronous analytics pipeline",
  componentCount: 13,
  conceptSummary:
    "বিলিয়ন বিলিয়ন ইউআরএল এবং প্রতি সেকেন্ডে লক্ষ লক্ষ ক্লিক হ্যান্ডেল করার জন্য বিশ্বমানের এন্টারপ্রাইজ আর্কিটেকচার। এখানে ডিস্ট্রিবিউটেড আইডি জেনারেটর (Twitter Snowflake), রিড-রাইট আলাদা করতে Primary ও Read Replicas ডাটাবেজ, এবং ইউজারের স্পিড না কমিয়ে ব্যাকগ্রাউন্ডে ক্লিক গোনার জন্য Kafka কিউ ব্যবহার করা হয়।",
  keyConcepts: [
    "Distributed Unique ID Generation (Twitter Snowflake)",
    "Database Replication (Master-Slave / Primary-Replica)",
    "Asynchronous Event-Driven Analytics (Apache Kafka)",
    "API Gateway Pattern (Routing, Auth, Telemetry)",
    "High Availability & Zero Downtime Failover",
  ],
  scaleEstimate: {
    writeQps: "~১,০০০ /sec (peak ~৫,০০০)",
    readQps: "~১,০০,০০০ /sec",
    readWriteRatio: "১০০ : ১",
    storage5y: "~৮০ TB (১৫,৮০০ কোটি লিংক × ৫০০ B)",
    extras: [{ label: "Short code", value: "৭ অক্ষর → ৬২⁷ ≈ ৩.৫ ট্রিলিয়ন" }],
  },
  tradeOffs: [
    {
      question: "Short code কে তৈরি করবে?",
      options: [
        {
          name: "DB counter",
          note: "একটিমাত্র counter মানে একটিমাত্র bottleneck। ১,০০০ write/sec-এ এটাই প্রথমে ভাঙবে, আর counter-টি বসে গেলে কোনো নতুন লিংকই তৈরি হবে না।",
        },
        {
          name: "Hash + collision retry",
          note: "১৫,৮০০ কোটি সারিতে জন্মদিনের সমস্যা (birthday paradox) নির্মম — collision ঘন ঘন হবে, আর প্রতিটি retry-তে একটা করে DB lookup লাগবে।",
        },
        {
          name: "Snowflake (timestamp + machine id + sequence)",
          note: "প্রতিটি pod কারো সাথে কথা না বলেই আইডি বানায়। কোনো সমন্বয় নেই, তাই কোনো bottleneck-ও নেই। আইডি সময়-অনুসারী ক্রমবর্ধমান, ফলে DB ইনডেক্সও সাজানো থাকে।",
        },
        {
          name: "KGS (আগে থেকে বানানো কী)",
          note: "সমান দ্রুত, তবে কী-গুলোর নিজস্ব স্টোরেজ ও HA লাগে; বিনিময়ে কোড অনুমান করা যায় না।",
        },
      ],
      chosen: "Snowflake (timestamp + machine id + sequence)",
      why: "beginner স্তরের counter এখানে কাজ করবে না — বহু pod একসাথে লিখছে। Snowflake সমন্বয়ের প্রয়োজনই মুছে দেয়: ৪১ বিট সময়, ১০ বিট মেশিন, ১২ বিট ক্রম — দুটি pod কখনোই একই আইডি বানাতে পারে না, কারণ তাদের মেশিন নম্বর আলাদা। বিনিময়ে কোড অনুমানযোগ্য হয়ে যায়; গোপনীয়তা দরকার হলে KGS বেছে নিতে হতো।",
    },
    {
      question: "301 না 302 — এবার হিসাব উল্টে যায়",
      options: [
        {
          name: "301 Moved Permanently",
          note: "ব্রাউজার ক্যাশ করে, তাই read QPS-এর বড় অংশ বেঁচে যায়। কিন্তু সেই ক্লিকগুলো সার্ভারে আসে না মানে Kafka-তেও যায় না — analytics চিরতরে অন্ধ।",
        },
        {
          name: "302 Found",
          note: "প্রতিটি ক্লিক সার্ভার পর্যন্ত আসে, তাই প্রতিটি ক্লিক গোনা যায় এবং পরে গন্তব্য বদলানোও সম্ভব। বিনিময়ে পুরো ১,০০,০০০ read/sec সামলাতে হয়।",
        },
      ],
      chosen: "302 Found",
      why: "এই স্তরে Kafka ও ClickHouse বসানোই হয়েছে প্রতিটি ক্লিক গোনার জন্য — 301 পাঠিয়ে সেটা করা অসম্ভব। এটাই এই পুরো সিমুলেটরের সবচেয়ে গুরুত্বপূর্ণ trade-off: beginner ও intermediate-এ 301 সঠিক ছিল কারণ সেখানে analytics ছিল না; analytics চাওয়ার মুহূর্তেই সিদ্ধান্তটি উল্টে যায়। আর 301-এর ক্ষতি স্থায়ী — যে ব্রাউজার একবার 301 পেয়েছে, সে আর কখনো ফিরে আসবে না।",
    },
    {
      question: "১৫,৮০০ কোটি সারি কীভাবে ভাগ করব?",
      options: [
        {
          name: "Range-based sharding",
          note: "আইডি ০-১ কোটি প্রথম shard-এ, পরেরটা দ্বিতীয়তে। কিন্তু Snowflake আইডি সময়-অনুসারী বাড়ে, তাই সব নতুন write সবসময় শেষ shard-এই পড়বে — hotspot।",
        },
        {
          name: "Hash-based sharding (short_code)",
          note: "কোডের hash দিয়ে shard বাছা হয়, তাই write সমানভাবে ছড়ায়। কিন্তু shard সংখ্যা বদলালে প্রায় সব ডেটা সরাতে হয়।",
        },
        {
          name: "Consistent hashing",
          note: "নতুন shard যোগ করলে শুধু ১/N ডেটা সরে। বিনিময়ে রাউটিং লজিক জটিল ও ভার্চুয়াল নোড সামলাতে হয়।",
        },
      ],
      chosen: "Hash-based sharding (short_code)",
      why: "প্রতিটি lookup-ই ঠিক একটি short_code ধরে হয় — কখনো range query নয়। তাই hash করে shard বাছাই সবচেয়ে সহজ ও সমান বণ্টন দেয়। Range sharding এখানে সবচেয়ে খারাপ পছন্দ হতো, কারণ Snowflake আইডি ক্রমবর্ধমান — সব নতুন লেখা একটিমাত্র shard-এ গিয়ে পড়ত।",
    },
    {
      question: "Read replica বাসি ডেটা দিলে?",
      options: [
        {
          name: "সব read replica থেকে",
          note: "Primary-র উপর চাপ সবচেয়ে কম। কিন্তু replication lag-এর কারণে সদ্য তৈরি লিংক কয়েক মিলিসেকেন্ড 'not found' দেখাতে পারে।",
        },
        {
          name: "Read-your-writes: নতুন লিংক primary থেকে",
          note: "যে ইউজার লিংকটি বানিয়েছে, তার নিজের read কিছুক্ষণ primary থেকে সার্ভ হয়। সঠিকতা নিশ্চিত, primary-তে সামান্য বাড়তি চাপ।",
        },
      ],
      chosen: "Read-your-writes: নতুন লিংক primary থেকে",
      why: "সবচেয়ে বিব্রতকর bug-টা হলো: ইউজার লিংক বানানোর ১ সেকেন্ড পর নিজেই সেটা খুলে '404 Not Found' দেখল। Shorten flow-এ যে ক্যাশ ব্যাকফিল করা হয়, সেটা এই সমস্যার প্রথম প্রতিরক্ষা — লিংকটি ইতিমধ্যেই Redis-এ থাকে, তাই replica পর্যন্ত যেতেই হয় না।",
    },
    {
      question: "Primary DB বসে গেলে কী হবে?",
      options: [
        {
          name: "Manual failover",
          note: "কেউ একজন ম্যানুয়ালি replica-কে promote করে। মিনিটের পর মিনিট downtime, কিন্তু কোনো ভুল স্বয়ংক্রিয় সিদ্ধান্তের ঝুঁকি নেই।",
        },
        {
          name: "Automatic failover (Raft / Patroni)",
          note: "একটি consensus গোষ্ঠী নতুন primary বেছে নেয়, সাধারণত ৩০ সেকেন্ডের মধ্যে। ঝুঁকি: নেটওয়ার্ক ভাগ হলে দুটি primary তৈরি হতে পারে (split-brain)।",
        },
        {
          name: "Read-only degraded mode",
          note: "primary ফিরে না আসা পর্যন্ত write বন্ধ, কিন্তু redirect (read) চলতেই থাকে।",
        },
      ],
      chosen: "Automatic failover (Raft / Patroni)",
      why: "Read আর write-এর গুরুত্ব এখানে সমান নয়: নতুন লিংক তৈরি ৩০ সেকেন্ড বন্ধ থাকলে কেউ খুব একটা টের পায় না, কিন্তু ১,০০,০০০ redirect/sec এক মিনিট বন্ধ থাকা মানে ৬০ লক্ষ ভাঙা লিংক। তাই read পথটি কখনোই primary-র উপর নির্ভর করে না — 'Failover' flow-এ ঠিক এটাই দেখানো হয়েছে।",
    },
    {
      question: "Analytics কি রিডাইরেক্টের পথেই বসবে?",
      options: [
        {
          name: "Synchronous — ClickHouse-এ লিখে তবেই redirect",
          note: "গণনা নিখুঁত, কিন্তু analytics DB ধীর হলে বা বসে গেলে প্রতিটি redirect-ও আটকে যায়।",
        },
        {
          name: "Async — Kafka-তে ছুড়ে দিয়ে সাথে সাথে redirect",
          note: "Redirect-এর গতি analytics-এর উপর নির্ভর করে না। Kafka বসে গেলে কিছু ইভেন্ট হারায়, কিন্তু কোনো ইউজার ক্ষতিগ্রস্ত হয় না।",
        },
      ],
      chosen: "Async — Kafka-তে ছুড়ে দিয়ে সাথে সাথে redirect",
      why: "ইউজারের কাজ হলো গন্তব্যে পৌঁছানো; ক্লিক গোনা আমাদের নিজেদের প্রয়োজন। নিজেদের প্রয়োজনকে কখনোই ইউজারের পথে দাঁড় করানো উচিত নয়। এই কারণেই redirect flow-এ Kafka-র ধাপটি ইউজারের রেসপন্স চলে যাওয়ার পরে আসে, আগে নয়।",
    },
    {
      question: "পরের ধাপ — একাধিক রিজিয়ন কি দরকার?",
      options: [
        {
          name: "Single-region write + global CDN (এখন)",
          note: "লেখা একটিমাত্র রিজিয়নে, পড়া CDN ও ক্যাশ থেকে বিশ্বজুড়ে। কোনো conflict নেই, কিন্তু দূরের ইউজারের write-এ ২০০ms+ লাগে, আর পুরো রিজিয়ন বসে গেলে write সম্পূর্ণ বন্ধ।",
        },
        {
          name: "Active-passive (দ্বিতীয় রিজিয়ন standby)",
          note: "দ্বিতীয় রিজিয়ন শুধু ডেটা কপি নিয়ে বসে থাকে, দুর্যোগে দায়িত্ব নেয়। বিপর্যয় থেকে সুরক্ষা মেলে, কিন্তু অর্ধেক হার্ডওয়্যার সারাক্ষণ অলস।",
        },
        {
          name: "Active-active (দুই রিজিয়নেই write)",
          note: "সব জায়গায় write দ্রুত। কিন্তু দুই রিজিয়নে একই short code একসাথে তৈরি হলে কে জিতবে — সেই conflict resolution লিখতে হয়।",
        },
      ],
      chosen: "Single-region write + global CDN (এখন)",
      why: "URL shortener-এ read আর write-এর ভূগোল সম্পূর্ণ আলাদা: read বিশ্বজুড়ে ছড়ানো (তাই CDN ও Redis), কিন্তু write বিরল — মাত্র ১,০০০/sec। যে কাজ সেকেন্ডে হাজারবারই হয়, তাকে বিশ্বজুড়ে ছড়ানোর খরচ পোষায় না। আর Snowflake আইডি এখানে একটা লুকানো সুবিধা দেয়: মেশিন আইডি আলাদা বলে দুই রিজিয়নেও কখনো একই কোড তৈরি হবে না — অর্থাৎ active-active-এ যাওয়ার পথ ইতিমধ্যেই খোলা আছে, শুধু আজ সেই খরচের দরকার নেই।",
    },
    {
      question: "লিংক কি চিরকাল থাকবে? আর ক্ষতিকর লিংক?",
      options: [
        {
          name: "TTL + cleanup + reclaim",
          note: "মেয়াদোত্তীর্ণ সারি মুছে ফেলা হয় এবং কোডগুলো আবার ব্যবহারযোগ্য হয়। স্টোরেজ স্থিতিশীল থাকে, কিন্তু পুরোনো লিংক ভেঙে যায়।",
        },
        {
          name: "Safe Browsing API দিয়ে যাচাই",
          note: "তৈরির সময় প্রতিটি URL ফিশিং/ম্যালওয়্যার তালিকার বিপরীতে যাচাই করা হয়। প্রতি write-এ একটি বাইরের API কল যোগ হয়।",
        },
        {
          name: "Custom alias",
          note: "ইউজার নিজের পছন্দের কোড দিতে পারে। এর জন্য আলাদা uniqueness চেক লাগে এবং জনপ্রিয় নামের জন্য কাড়াকাড়ি শুরু হয়।",
        },
      ],
      chosen: "TTL + cleanup + reclaim",
      why: "৮০ TB-তে স্টোরেজই প্রধান খরচ, তাই TTL এখানে বাধ্যতামূলক — beginner স্তরে যেটা অপ্রয়োজনীয় ছিল। Safe Browsing যাচাইও প্রয়োজনীয়, তবে সেটা shorten পথে async করা উচিত, নইলে প্রতিটি লিংক তৈরিতে বাইরের একটা সার্ভিসের উপর নির্ভরতা তৈরি হবে। Custom alias একটি পণ্য-সিদ্ধান্ত, স্কেলের নয় — তাই এখানে বাদ।",
    },
  ],
  nodes: [
    {
      id: "node-client",
      type: "simulationNode",
      position: { x: 59, y: 589 },
      data: {
        label: "Global Clients",
        subLabel: "Mobile, Web, APIs",
        category: "client",
        emoji: "📱",
        analogy: "সারা পৃথিবীর কোটি কোটি মানুষ।",
        description: "বিশ্বের যেকোনো প্রান্ত থেকে আসা রিকোয়েস্ট।",
        techSpecs: "Anycast / HTTP/3",
      },
    },
    {
      id: "node-cdn",
      type: "simulationNode",
      position: { x: 736, y: 147 },
      data: {
        label: "Cloudflare CDN",
        subLabel: "Edge Network (200+ PoPs)",
        category: "network",
        emoji: "🌐",
        analogy: "প্রতিটি শহরে ছোট ছোট ডেলিভারি হাব — যাতে প্রধান অফিসে না গিয়ে পাশের হাব থেকেই উত্তর পাওয়া যায়।",
        description: "ব্যবহারকারীর নিকটতম লোকেশন থেকে স্ট্যাটিক পেজ ও ক্যাশড রিডাইরেক্ট করে।",
        techSpecs: "Edge Cache / GeoDNS",
      },
    },
    {
      id: "node-lb",
      type: "simulationNode",
      position: { x: 736, y: 589 },
      data: {
        label: "Global Load Balancer",
        subLabel: "AWS ALB / Cloud LB",
        category: "network",
        emoji: "⚖️",
        analogy: "আন্তর্জাতিক এয়ারপোর্টের আধুনিক ট্রাফিক কন্ট্রোল টাওয়ার।",
        description: "ট্রাফিক হেলথ ও রিজিয়ন অনুযায়ী নিখুঁতভাবে রাউট করে।",
        techSpecs: "Layer 7 / SSL Offloading",
      },
    },
    {
      id: "node-gw",
      type: "simulationNode",
      position: { x: 1413, y: 589 },
      data: {
        label: "API Gateway",
        subLabel: "Kong / Envoy Gateway",
        category: "security",
        emoji: "🚪",
        analogy: "বিশাল ভবনের সেন্ট্রাল রিসেপশন — যেখানে নিরাপত্তা তল্লাশি, আইডি কার্ড চেক এবং ভেতরে যাওয়ার পাস দেওয়া হয়।",
        description: "অথেন্টিকেশন, সিকিউরিটি ফিল্টারিং, রেট লিমিট ও মেট্রিক্স ম্যানেজ করে।",
        techSpecs: "JWT Auth / Circuit Breaker",
      },
    },
    {
      id: "node-idgen",
      type: "simulationNode",
      position: { x: 1413, y: 147 },
      data: {
        label: "Snowflake ID Gen",
        subLabel: "64-bit Distributed Unique ID",
        category: "compute",
        emoji: "🏷️",
        analogy: "অদ্বিতীয় টোকেন মেকার মেশিন — যা সেকেন্ডে লাখ লাখ টোকেন বানালেও কখনো দুটি টোকেনের নাম্বার এক হবে না!",
        description: "টাইমস্ট্যাম্প + মেশিন আইডি দিয়ে 64-বিট ইউনিক ইন্টিজার বানায়। ডাটাবেজ লক দরকার হয় না।",
        techSpecs: "Snowflake / 10k IDs/ms",
      },
    },
    {
      id: "node-server-1",
      type: "simulationNode",
      position: { x: 2090, y: 338 },
      data: {
        label: "App Cluster (S1)",
        subLabel: "Kubernetes Pod 1",
        category: "compute",
        emoji: "🖥️",
        analogy: "অফিসের এক্সপার্ট ইঞ্জিনিয়ার ১।",
        description: "অটো-স্কেলিং মাইক্রোসার্ভিস পড।",
        techSpecs: "Golang / gRPC",
      },
    },
    {
      id: "node-server-2",
      type: "simulationNode",
      position: { x: 2090, y: 744 },
      data: {
        label: "App Cluster (S2)",
        subLabel: "Kubernetes Pod 2",
        category: "compute",
        emoji: "🖥️",
        analogy: "অফিসের এক্সপার্ট ইঞ্জিনিয়ার ২।",
        description: "লোড বাড়লে আপনাআপনি নতুন পড চালু হয়।",
        techSpecs: "K8s Auto-scaled",
      },
    },
    {
      id: "node-cache",
      type: "simulationNode",
      position: { x: 2767, y: 88 },
      data: {
        label: "Redis Cluster",
        subLabel: "Multi-Node Sharded Cache",
        category: "storage",
        emoji: "⚡",
        analogy: "সুপারফাস্ট মেমোরি যা ডেটা হারিয়ে গেলে অন্য ব্যাকআপ নোড থেকে পলকে রিকভার করে।",
        description: "মাল্টি-রিজিওন রেপ্লিকেটেড ক্যাশ।",
        techSpecs: "Cluster Mode / < 1ms",
      },
    },
    {
      id: "node-primary-db",
      type: "simulationNode",
      position: { x: 2767, y: 471 },
      data: {
        label: "Primary DB (Write)",
        subLabel: "PostgreSQL Master (ACID)",
        category: "storage",
        emoji: "📦",
        analogy: "মূল হেড অফিসের প্রধান ডায়েরি — যেখানে শুধু নতুন লিংকগুলো লেখা (Write) হয়।",
        description: "সকল রাইট (Write) অপারেশন এখানে সম্পন্ন হয়।",
        techSpecs: "Master / WAL Replication",
      },
    },
    {
      id: "node-replica-db",
      type: "simulationNode",
      position: { x: 2767, y: 824 },
      data: {
        label: "Read Replicas",
        subLabel: "PostgreSQL Slaves (Read-Only)",
        category: "storage",
        emoji: "📚",
        analogy: "মূল ডায়েরির একাধিক অবিকল কপি — যেখান থেকে কোটি কোটি মানুষ একসাথে লিংক পড়তে পারে!",
        description: "রিড কুয়েরি হ্যান্ডেল করে যাতে প্রাইমারি ডাটাবেজের ওপর কোনো চাপ না পড়ে।",
        techSpecs: "Async Replicated / Read-Pool",
      },
    },
    {
      id: "node-queue",
      type: "simulationNode",
      position: { x: 2090, y: 1126 },
      data: {
        label: "Kafka Queue",
        subLabel: "Distributed Event Stream",
        category: "queue",
        emoji: "📨",
        analogy: "চিঠির পোস্টবক্স — ইউজারকে রিডাইরেক্ট করে দিয়ে এই বক্সে একটি নোট ফেলে রাখা হয়: 'এই লিংকে অমুক দেশ থেকে একটা ক্লিক হয়েছে!'",
        description: "অ্যানালিটিক্স ইভেন্ট বাফার করে রাখে। কোনো রিকোয়েস্ট নষ্ট হয় না।",
        techSpecs: "Partitions / 100k events/s",
      },
    },
    {
      id: "node-worker",
      type: "simulationNode",
      position: { x: 2767, y: 1126 },
      data: {
        label: "Analytics Engine",
        subLabel: "ClickHouse + Workers",
        category: "analytics",
        emoji: "📊",
        analogy: "ডাটা সায়েন্টিস্ট দল — যারা পোস্টবক্স থেকে চিঠি নিয়ে সুন্দর গ্রাফ ও ক্লিক কাউন্টার তৈরি করে।",
        description: "ব্যাকগ্রাউন্ডে ক্লিক কাউন্ট, দেশ, ব্রাউজার অ্যানালিটিক্স প্রসেস ও স্টোর করে।",
        techSpecs: "Columnar DB / Real-time OLAP",
      },
    },
    {
      id: "node-dashboard",
      type: "simulationNode",
      position: { x: 3444, y: 1126 },
      data: {
        label: "Owner Dashboard",
        subLabel: "Analytics UI",
        category: "client",
        emoji: "📈",
        analogy: "লিংকের মালিকের রিপোর্ট কার্ড — কত ক্লিক, কোন দেশ থেকে, কোন ব্রাউজারে।",
        description:
          "লিংকের মালিক এখান থেকে তার ক্লিক পরিসংখ্যান দেখেন। এটি সম্পূর্ণ আলাদা একটি read path — redirect-এর পথে এর কোনো ভূমিকা নেই।",
        techSpecs: "OLAP Query / Aggregations",
      },
    },
  ],
  edges: [
    {
      id: "edge-client-to-cdn",
      type: "animatedFlowEdge",
      source: "node-client",
      sourceHandle: "r-s",
      target: "node-cdn",
      targetHandle: "l-t",
      data: {
        label: "0. GeoDNS Routing",
        particleColor: "request",
      },
    },
    {
      id: "edge-cdn-to-lb",
      type: "animatedFlowEdge",
      source: "node-cdn",
      sourceHandle: "b-s",
      target: "node-lb",
      targetHandle: "t-t",
      data: {
        label: "1. Edge Pass to LB",
        particleColor: "request",
      },
    },
    {
      id: "edge-client-to-lb",
      type: "animatedFlowEdge",
      source: "node-client",
      sourceHandle: "r-s",
      target: "node-lb",
      targetHandle: "l-t",
      data: {
        label: "1. Direct Ingress",
        particleColor: "request",
      },
    },
    {
      id: "edge-lb-to-gw",
      type: "animatedFlowEdge",
      source: "node-lb",
      sourceHandle: "r-s",
      target: "node-gw",
      targetHandle: "l-t",
      data: {
        label: "2. Gateway Ingress",
        particleColor: "request",
      },
    },
    {
      id: "edge-gw-to-s1",
      type: "animatedFlowEdge",
      source: "node-gw",
      sourceHandle: "r-s",
      target: "node-server-1",
      targetHandle: "l-t",
      data: {
        label: "3a. Pod-1 Route",
        particleColor: "request",
      },
    },
    {
      id: "edge-gw-to-s2",
      type: "animatedFlowEdge",
      source: "node-gw",
      sourceHandle: "r-s",
      target: "node-server-2",
      targetHandle: "l-t",
      data: {
        label: "3b. Pod-2 Route",
        particleColor: "request",
      },
    },
    {
      id: "edge-s1-to-idgen",
      type: "animatedFlowEdge",
      source: "node-server-1",
      sourceHandle: "t-s",
      target: "node-idgen",
      targetHandle: "b-t",
      data: {
        label: "4a. Fetch Snowflake ID",
        particleColor: "cache",
      },
    },
    {
      id: "edge-s1-to-primary",
      type: "animatedFlowEdge",
      source: "node-server-1",
      sourceHandle: "r-s",
      target: "node-primary-db",
      targetHandle: "l-t",
      data: {
        label: "5a. Write to Master",
        particleColor: "read",
      },
    },
    {
      id: "edge-s1-to-cache",
      type: "animatedFlowEdge",
      source: "node-server-1",
      sourceHandle: "r-s",
      target: "node-cache",
      targetHandle: "l-t",
      data: {
        label: "5b. Populate Cache",
        particleColor: "write",
      },
    },
    {
      id: "edge-primary-to-replica",
      type: "animatedFlowEdge",
      source: "node-primary-db",
      sourceHandle: "b-s",
      target: "node-replica-db",
      targetHandle: "t-t",
      data: {
        label: "Replicate WAL stream",
        particleColor: "meta",
      },
    },
    {
      id: "edge-s1-to-replica",
      type: "animatedFlowEdge",
      source: "node-server-1",
      sourceHandle: "r-s",
      target: "node-replica-db",
      targetHandle: "l-t",
      data: {
        label: "Read Query (Fallback)",
        particleColor: "success",
      },
    },
    {
      id: "edge-s2-to-queue",
      type: "animatedFlowEdge",
      source: "node-server-2",
      sourceHandle: "b-s",
      target: "node-queue",
      targetHandle: "t-t",
      data: {
        label: "Async Publish: click_event",
        particleColor: "event",
      },
    },
    {
      id: "edge-s2-to-cache",
      type: "animatedFlowEdge",
      source: "node-server-2",
      sourceHandle: "r-s",
      target: "node-cache",
      targetHandle: "l-t",
      data: {
        label: "Redis Lookup",
        particleColor: "write",
      },
    },
    {
      id: "edge-queue-to-worker",
      type: "animatedFlowEdge",
      source: "node-queue",
      sourceHandle: "r-s",
      target: "node-worker",
      targetHandle: "l-t",
      data: {
        label: "Batch Consume & Aggregate",
        particleColor: "error",
      },
    },
    {
      id: "edge-worker-to-dashboard",
      type: "animatedFlowEdge",
      source: "node-worker",
      sourceHandle: "r-s",
      target: "node-dashboard",
      targetHandle: "l-t",
      data: {
        label: "OLAP Query",
        particleColor: "read",
      },
    },
  ],
  // Every step below activates exactly one edge and its two endpoint nodes —
  // one hop per step, so the canvas never lights up a whole subgraph at once.
  flows: [
    {
      id: "shorten",
      name: "Shorten",
      icon: "link",
      steps: [
        {
          id: "e-s1",
          flowType: "shorten",
          stepNumber: 1,
          title: "Client → CDN Edge (ক্লায়েন্ট থেকে এজ নেটওয়ার্কে)",
          whatHappens:
            "ইউজারের রিকোয়েস্ট GeoDNS-এর মাধ্যমে তার সবচেয়ে কাছের Cloudflare এজ লোকেশনে পৌঁছালো।",
          whyItMatters:
            "সবচেয়ে কাছের এজ নোডে গেলে নেটওয়ার্ক দূরত্ব কমে, ফলে TLS হ্যান্ডশেকেই অনেকটা সময় বাঁচে।",
          analogy: "📍 পুরো দেশ পাড়ি না দিয়ে নিজের এলাকার ব্রাঞ্চ অফিসে যাওয়া।",
          activeNodeIds: ["node-client", "node-cdn"],
          activeEdgeIds: ["edge-client-to-cdn"],
          edgeOverrides: {
            "edge-client-to-cdn": { label: "1. GeoDNS Routing" },
          },
          nodeStatusMessages: {
            "node-client": "POST /api/v2/shorten",
            "node-cdn": "Nearest PoP selected (Dhaka)",
          },
          payloadSnippet: `POST /api/v2/shorten HTTP/2\nAuthorization: Bearer eyJhbGciOi...\nX-Request-Id: req_9fa8120c`,
        },
        {
          id: "e-s2",
          flowType: "shorten",
          stepNumber: 2,
          title: "CDN → Global Load Balancer (এজ থেকে লোড ব্যালেন্সারে)",
          whatHappens:
            "এটি একটি রাইট রিকোয়েস্ট, তাই CDN নিজে উত্তর দিতে পারলো না — রিকোয়েস্টটি গ্লোবাল লোড ব্যালেন্সারে ফরওয়ার্ড করলো।",
          whyItMatters:
            "CDN শুধু ক্যাশযোগ্য রিড সার্ভ করে; রাইট সবসময় origin-এ যায়, নইলে ডেটা অসামঞ্জস্য হয়ে যাবে।",
          analogy: "🚪 রিসেপশন নিজে সিদ্ধান্ত না নিয়ে ফাইলটা ভেতরের অফিসে পাঠিয়ে দিলো।",
          activeNodeIds: ["node-cdn", "node-lb"],
          activeEdgeIds: ["edge-cdn-to-lb"],
          edgeOverrides: {
            "edge-cdn-to-lb": { label: "2. Forward to Origin" },
          },
          nodeStatusMessages: {
            "node-cdn": "Non-cacheable (POST) -> Origin",
            "node-lb": "Healthy upstreams: 2/2",
          },
          payloadSnippet: `Cache-Control: no-store\nX-Forwarded-For: 203.0.113.195`,
        },
        {
          id: "e-s3",
          flowType: "shorten",
          stepNumber: 3,
          title: "Load Balancer → API Gateway (গেটওয়েতে প্রবেশ)",
          whatHappens:
            "লোড ব্যালেন্সার রিকোয়েস্টটি API Gateway-তে পাঠালো। গেটওয়ে JWT টোকেন যাচাই করলো এবং রেট লিমিট পরীক্ষা করলো।",
          whyItMatters:
            "সেন্ট্রালাইজড অথেন্টিকেশন ও রেট লিমিটিং থাকলে প্রতিটি মাইক্রোসার্ভিসকে আলাদাভাবে নিরাপত্তা কোড লিখতে হয় না।",
          analogy: "🏢 সিকিউরিটি চেকপয়েন্ট পার হয়ে বিশেষ পাস নিয়ে মূল ভবনে প্রবেশ।",
          activeNodeIds: ["node-lb", "node-gw"],
          activeEdgeIds: ["edge-lb-to-gw"],
          edgeOverrides: {
            "edge-lb-to-gw": { label: "3. Gateway Ingress" },
          },
          nodeStatusMessages: {
            "node-lb": "Routing to gateway pool",
            "node-gw": "JWT Validated | Rate: OK",
          },
          payloadSnippet: `HTTP 200 (auth ok)\nX-RateLimit-Remaining: 4998\nX-User-Id: 9012`,
        },
        {
          id: "e-s4",
          flowType: "shorten",
          stepNumber: 4,
          title: "API Gateway → App Pod 1 (অ্যাপ সার্ভারে ডেলিভারি)",
          whatHappens:
            "গেটওয়ে দেখলো Pod-1 সবচেয়ে কম ব্যস্ত, তাই রিকোয়েস্টটি সেখানেই পাঠিয়ে দিলো।",
          whyItMatters:
            "একটি রিকোয়েস্ট একবারে একটিমাত্র pod-এ যায়। অ্যাপ সার্ভারগুলো stateless হওয়ায় যেকোনো pod এই কাজ করতে পারতো।",
          analogy: "👉 'কাউন্টার ১ ফাঁকা আছে, ওখানে যান!'",
          activeNodeIds: ["node-gw", "node-server-1"],
          activeEdgeIds: ["edge-gw-to-s1"],
          edgeOverrides: {
            "edge-gw-to-s1": { label: "4. Route to Pod-1" },
          },
          nodeStatusMessages: {
            "node-gw": "Least-conn -> Pod-1",
            "node-server-1": "Pod-1 handling request",
          },
          payloadSnippet: `// Kubernetes Service routing\nselected pod: url-api-7d9c4-x2ml (least connections)`,
        },
        {
          id: "e-s5",
          flowType: "shorten",
          stepNumber: 5,
          title: "App Pod 1 → Snowflake ID Generator (ইউনিক আইডি চাওয়া)",
          whatHappens:
            "সার্ভার ডাটাবেজে লক না লাগিয়ে আলাদা 'Snowflake ID Generator' সার্ভিসের কাছে একটি ইউনিক ৬৪-বিট নাম্বার চাইলো।",
          whyItMatters:
            "ডাটাবেজ অটো-ইনক্রিমেন্ট আইডি ব্যবহার করলে মাল্টি-ডাটাবেজ সিস্টেমে কলিশন বা বটলনেক তৈরি হয়।",
          analogy: "🏷️ সেন্ট্রাল কিউতে না দাঁড়িয়ে নিজের বারকোড মেশিন থেকে নাম্বার নেওয়া।",
          activeNodeIds: ["node-server-1", "node-idgen"],
          activeEdgeIds: ["edge-s1-to-idgen"],
          edgeOverrides: {
            "edge-s1-to-idgen": { label: "5. Request Snowflake ID" },
          },
          nodeStatusMessages: {
            "node-server-1": "Requesting unique ID...",
            "node-idgen": "Generating from machine #04",
          },
          payloadSnippet: `// Twitter Snowflake 64-bit structure:\n// 1 bit unused | 41 bit timestamp | 10 bit machine ID | 12 bit sequence\nconst id = snowflake.nextId();`,
        },
        {
          id: "e-s6",
          flowType: "shorten",
          stepNumber: 6,
          title: "ID Generator → App Pod 1 (আইডি ফেরত এলো)",
          whatHappens:
            "জেনারেটর একটি ইউনিক আইডি (154892019482390144) ফেরত দিলো এবং সার্ভার সেটাকে Base62 কোডে ('9wK2pL') রূপান্তর করলো।",
          whyItMatters:
            "Base62 এনকোডিং ৬৪-বিট বড় নাম্বারকে মাত্র ৬-৭ অক্ষরের মানুষ-বান্ধব কোডে পরিণত করে।",
          analogy: "🔢 লম্বা সিরিয়াল নাম্বারকে ছোট, সহজে লেখা যায় এমন কোডে বদলে নেওয়া।",
          activeNodeIds: ["node-idgen", "node-server-1"],
          activeEdgeIds: ["edge-s1-to-idgen"],
          edgeOverrides: {
            "edge-s1-to-idgen": {
              label: "6. ID Returned",
              isReverse: true,
              particleColor: "cache",
            },
          },
          nodeStatusMessages: {
            "node-idgen": "Snowflake ID: 154892019482390144",
            "node-server-1": "Base62 Encoded -> '9wK2pL'",
          },
          payloadSnippet: `const id = 154892019482390144n;\nconst shortCode = base62Encode(id); // "9wK2pL"`,
        },
        {
          id: "e-s7",
          flowType: "shorten",
          stepNumber: 7,
          title: "App Pod 1 → Primary DB (মাস্টার ডাটাবেজে লেখা)",
          whatHappens:
            "সার্ভার প্রাইমারি (মাস্টার) ডাটাবেজে লিংকটি স্থায়ীভাবে সেভ করলো।",
          whyItMatters:
            "সব write একটিমাত্র primary-তে যায়, ফলে কোনো write কনফ্লিক্ট হয় না এবং ডেটার একটি নির্ভরযোগ্য উৎস থাকে।",
          analogy: "✍️ শুধুমাত্র মূল খাতাতেই কলম চলে — কপিগুলোতে নয়।",
          activeNodeIds: ["node-server-1", "node-primary-db"],
          activeEdgeIds: ["edge-s1-to-primary"],
          edgeOverrides: {
            "edge-s1-to-primary": { label: "7. Write to Master" },
          },
          nodeStatusMessages: {
            "node-server-1": "Committing transaction...",
            "node-primary-db": "MASTER WRITE SUCCESS",
          },
          payloadSnippet: `BEGIN TRANSACTION;\nINSERT INTO urls_sharded_04 (id, short_code, original_url, user_id)\nVALUES (154892019482390144, '9wK2pL', 'https://...', 9012);\nCOMMIT;`,
        },
        {
          id: "e-s8",
          flowType: "shorten",
          stepNumber: 8,
          title: "Primary DB → Read Replicas (রেপ্লিকেশন)",
          whatHappens:
            "প্রাইমারি ডাটাবেজ তার WAL স্ট্রিমের মাধ্যমে নতুন রেকর্ডটি সব রিড-রেপ্লিকায় ছড়িয়ে দিলো।",
          whyItMatters:
            "Write শুধু primary-তে যায়, কিন্তু কোটি কোটি read কোয়েরি রেপ্লিকাগুলো ভাগ করে নেয় (CQRS প্যাটার্ন)।",
          analogy: "📄 মূল খাতায় লেখার পরপরই সব ফটোকপি মেশিনে নতুন পৃষ্ঠার কপি তৈরি হয়ে যাওয়া।",
          activeNodeIds: ["node-primary-db", "node-replica-db"],
          activeEdgeIds: ["edge-primary-to-replica"],
          edgeOverrides: {
            "edge-primary-to-replica": { label: "8. Replicate WAL stream" },
          },
          nodeStatusMessages: {
            "node-primary-db": "Streaming WAL to 3 replicas",
            "node-replica-db": "WAL Stream Syncing (Lag: 0.2ms)",
          },
          payloadSnippet: `-- Replica status\nSELECT client_addr, state, replay_lag FROM pg_stat_replication;\n-- streaming | 0.2ms`,
        },
        {
          id: "e-s9",
          flowType: "shorten",
          stepNumber: 9,
          title: "App Pod 1 → Redis Cluster (ক্যাশ গরম করা)",
          whatHappens:
            "সার্ভার নতুন লিংকটি Redis ক্লাস্টারেও রেখে দিলো, যাতে একটু পরেই কেউ ক্লিক করলে ডাটাবেজে যেতে না হয়।",
          whyItMatters:
            "নতুন লিংকে ক্লিক আসার সম্ভাবনা প্রথম কয়েক ঘণ্টাতেই সবচেয়ে বেশি — তাই আগেভাগে ক্যাশ করা লাভজনক।",
          analogy: "📌 ডায়েরিতে লেখার পর সামনের নোটিস বোর্ডেও পিন মেরে রাখা।",
          activeNodeIds: ["node-server-1", "node-cache"],
          activeEdgeIds: ["edge-s1-to-cache"],
          edgeOverrides: {
            "edge-s1-to-cache": { label: "9. Populate Cache" },
          },
          nodeStatusMessages: {
            "node-server-1": "Warming cache...",
            "node-cache": "Redis Key Cached with TTL",
          },
          payloadSnippet: `REDIS_CLUSTER.SETEX("{url}:9wK2pL", 86400, "https://...");`,
        },
        {
          id: "e-s10",
          flowType: "shorten",
          stepNumber: 10,
          title: "App Pod 1 → API Gateway (রেসপন্স ফেরত)",
          whatHappens:
            "সব কাজ শেষ। সার্ভার HTTP 201 Created রেসপন্স গেটওয়েতে ফেরত পাঠালো।",
          whyItMatters:
            "রিকোয়েস্ট যে পথে এসেছিল, রেসপন্স ঠিক সেই পথেই ফেরত যায় — এটাই request/response সাইকেল।",
          analogy: "📤 ক্যাশিয়ার টোকেন স্লিপ রেজিস্টারে ফেরত জমা দিলো।",
          activeNodeIds: ["node-server-1", "node-gw"],
          activeEdgeIds: ["edge-gw-to-s1"],
          edgeOverrides: {
            "edge-gw-to-s1": {
              label: "10. 201 Created Response",
              isReverse: true,
              particleColor: "success",
            },
          },
          nodeStatusMessages: {
            "node-server-1": "HTTP 201 Created",
            "node-gw": "Receiving response from Pod-1",
          },
          payloadSnippet: `HTTP/2 201 Created\n{\n  "shortUrl": "https://link.co/9wK2pL",\n  "id": "154892019482390144"\n}`,
        },
        {
          id: "e-s11",
          flowType: "shorten",
          stepNumber: 11,
          title: "API Gateway → Load Balancer (রেসপন্স ফরওয়ার্ড)",
          whatHappens:
            "গেটওয়ে রেসপন্সে টেলিমেট্রি হেডার যোগ করে লোড ব্যালেন্সারে পাঠিয়ে দিলো।",
          whyItMatters:
            "গেটওয়ে ফেরার পথে latency ও status কোড রেকর্ড করে, যা পরে মনিটরিং ড্যাশবোর্ডে কাজে লাগে।",
          analogy: "🧾 বেরোনোর সময় গার্ড রেজিস্টারে সময়টা টুকে রাখলো।",
          activeNodeIds: ["node-gw", "node-lb"],
          activeEdgeIds: ["edge-lb-to-gw"],
          edgeOverrides: {
            "edge-lb-to-gw": {
              label: "11. Forward Response",
              isReverse: true,
              particleColor: "success",
            },
          },
          nodeStatusMessages: {
            "node-gw": "Telemetry logged (7.8ms)",
            "node-lb": "Response received",
          },
          payloadSnippet: `X-Response-Time: 7.8ms\nX-Gateway-Node: gw-ap-south-2`,
        },
        {
          id: "e-s12",
          flowType: "shorten",
          stepNumber: 12,
          title: "Load Balancer → Client (ইউজার লিংক পেলো)",
          whatHappens:
            "ইউজার মাত্র ৮ মিলিসেকেন্ডে তার ব্র্যান্ডেড শর্ট লিঙ্ক (https://link.co/9wK2pL) পেয়ে গেলো।",
          whyItMatters:
            "ডিস্ট্রিবিউটেড ইনফ্রাস্ট্রাকচারের অপ্টিমাইজেশনের ফলে ৯৯.৯৯% রিকোয়েস্ট সাব-১০ মিলিসেকেন্ডে শেষ হয়।",
          analogy: "✨ পলকের মধ্যে কাজ শেষ হওয়া।",
          activeNodeIds: ["node-lb", "node-client"],
          activeEdgeIds: ["edge-client-to-lb"],
          edgeOverrides: {
            "edge-client-to-lb": {
              label: "12. Return Short URL",
              isReverse: true,
              particleColor: "success",
            },
          },
          nodeStatusMessages: {
            "node-lb": "Delivering to client",
            "node-client": "Created: https://link.co/9wK2pL",
          },
          payloadSnippet: `{\n  "success": true,\n  "shortUrl": "https://link.co/9wK2pL",\n  "id": "154892019482390144",\n  "latencyMs": 7.8\n}`,
        },
      ],
    },
    {
      id: "redirect",
      name: "Redirect",
      icon: "redirect",
      steps: [
        {
          id: "e-r1",
          flowType: "redirect",
          stepNumber: 1,
          title: "Client → CDN Edge (ক্লিক থেকে এজ নেটওয়ার্কে)",
          whatHappens:
            "একজন ইউজার শর্ট লিংকে ক্লিক করলেন। রিকোয়েস্টটি তার কাছের CDN এজ নোডে পৌঁছালো।",
          whyItMatters:
            "রিডাইরেক্ট লেটেন্সি ইউজার সরাসরি অনুভব করে, তাই প্রথম hop যত ছোট হয় ততই ভালো।",
          analogy: "📍 কাছের ব্রাঞ্চেই আগে খোঁজ নেওয়া।",
          activeNodeIds: ["node-client", "node-cdn"],
          activeEdgeIds: ["edge-client-to-cdn"],
          edgeOverrides: {
            "edge-client-to-cdn": { label: "1. GeoDNS Routing" },
          },
          nodeStatusMessages: {
            "node-client": "GET /9wK2pL",
            "node-cdn": "Edge Cache Miss -> Origin",
          },
          payloadSnippet: `GET /9wK2pL HTTP/2\nHost: link.co`,
        },
        {
          id: "e-r2",
          flowType: "redirect",
          stepNumber: 2,
          title: "CDN → Global Load Balancer (এজ থেকে অরিজিনে)",
          whatHappens:
            "এই কোডটি এজ ক্যাশে ছিল না, তাই CDN রিকোয়েস্টটি গ্লোবাল লোড ব্যালেন্সারে পাঠালো।",
          whyItMatters:
            "Cache miss হলেও CDN কানেকশন reuse করে, ফলে origin-এ যাওয়ার খরচ অনেকটাই কমে।",
          analogy: "🚪 রিসেপশনে না পেয়ে ভেতরের অফিসে খোঁজ নিতে যাওয়া।",
          activeNodeIds: ["node-cdn", "node-lb"],
          activeEdgeIds: ["edge-cdn-to-lb"],
          edgeOverrides: {
            "edge-cdn-to-lb": { label: "2. Origin Fetch" },
          },
          nodeStatusMessages: {
            "node-cdn": "MISS -> forwarding",
            "node-lb": "Healthy upstreams: 2/2",
          },
          payloadSnippet: `CF-Cache-Status: MISS\nConnection: keep-alive (reused)`,
        },
        {
          id: "e-r3",
          flowType: "redirect",
          stepNumber: 3,
          title: "Load Balancer → API Gateway (গেটওয়েতে প্রবেশ)",
          whatHappens:
            "লোড ব্যালেন্সার রিকোয়েস্টটি API Gateway-তে পাঠালো, যেখানে রেট লিমিট ও রাউটিং নিয়ম প্রয়োগ হলো।",
          whyItMatters:
            "পাবলিক রিডাইরেক্ট এন্ডপয়েন্টেও রেট লিমিট দরকার, নইলে বট ট্রাফিক ব্যাকএন্ড ডুবিয়ে দিতে পারে।",
          analogy: "🏢 ভেতরে ঢোকার আগে গার্ডের চেকপয়েন্ট।",
          activeNodeIds: ["node-lb", "node-gw"],
          activeEdgeIds: ["edge-lb-to-gw"],
          edgeOverrides: {
            "edge-lb-to-gw": { label: "3. Gateway Ingress" },
          },
          nodeStatusMessages: {
            "node-lb": "Routing to gateway pool",
            "node-gw": "Rate: OK | Route: /:code",
          },
          payloadSnippet: `X-RateLimit-Remaining: 9987\nmatched route: GET /:shortCode`,
        },
        {
          id: "e-r4",
          flowType: "redirect",
          stepNumber: 4,
          title: "API Gateway → App Pod 2 (অ্যাপ সার্ভারে ডেলিভারি)",
          whatHappens:
            "গেটওয়ে এবার Pod-2-কে বেছে নিলো এবং রিকোয়েস্টটি সেখানে পাঠিয়ে দিলো।",
          whyItMatters:
            "লোড দুই pod-এর মধ্যে ভাগ হয়ে যায়, তাই একটির উপর চাপ পড়লে অন্যটি সামলে নেয়।",
          analogy: "👉 'এবার কাউন্টার ২ ফাঁকা, ওখানে যান!'",
          activeNodeIds: ["node-gw", "node-server-2"],
          activeEdgeIds: ["edge-gw-to-s2"],
          edgeOverrides: {
            "edge-gw-to-s2": { label: "4. Route to Pod-2" },
          },
          nodeStatusMessages: {
            "node-gw": "Least-conn -> Pod-2",
            "node-server-2": "Pod-2 handling request",
          },
          payloadSnippet: `selected pod: url-api-7d9c4-k8vt (least connections)`,
        },
        {
          id: "e-r5",
          flowType: "redirect",
          stepNumber: 5,
          title: "App Pod 2 → Redis Cluster (ক্যাশে খোঁজা)",
          whatHappens:
            "সার্ভার ডাটাবেজে যাওয়ার আগে ডিস্ট্রিবিউটেড Redis ক্লাস্টারে '9wK2pL' কোডটি খুঁজলো।",
          whyItMatters:
            "Cache-aside প্যাটার্নে সবসময় আগে ক্যাশ দেখা হয় — এতে ৯০%+ রিড ডাটাবেজে পৌঁছায়ই না।",
          analogy: "⚡ আলমারি খোলার আগে টেবিলের উপরের খাতাটা দেখে নেওয়া।",
          activeNodeIds: ["node-server-2", "node-cache"],
          activeEdgeIds: ["edge-s2-to-cache"],
          edgeOverrides: {
            "edge-s2-to-cache": { label: "5. Redis Lookup" },
          },
          nodeStatusMessages: {
            "node-server-2": "Checking Redis first...",
            "node-cache": "SHARD_02: searching key",
          },
          payloadSnippet: `REDIS_CLUSTER.GET("{url}:9wK2pL")`,
        },
        {
          id: "e-r6",
          flowType: "redirect",
          stepNumber: 6,
          title: "Redis Cluster → App Pod 2 (ক্যাশ হিট!)",
          whatHappens:
            "মাত্র ০.৪ মিলিসেকেন্ডেই Redis আসল লিংকটি ফেরত দিলো। ডাটাবেজে যাওয়ার দরকারই পড়লো না!",
          whyItMatters:
            "মেমোরি থেকে পড়া ডিস্ক থেকে পড়ার চেয়ে প্রায় ১০০ গুণ দ্রুত — এখানেই রিডাইরেক্টের আসল গতি।",
          analogy: "🎯 খাতা খুলতেই প্রথম পাতায় উত্তর পাওয়া।",
          activeNodeIds: ["node-cache", "node-server-2"],
          activeEdgeIds: ["edge-s2-to-cache"],
          edgeOverrides: {
            "edge-s2-to-cache": {
              label: "6. CACHE HIT (0.4ms)",
              isReverse: true,
              particleColor: "write",
            },
          },
          nodeStatusMessages: {
            "node-cache": "CACHE HIT (0.4ms)",
            "node-server-2": "Found in RAM! Bypassing DB.",
          },
          payloadSnippet: `=> "https://systemdesign.com/expert-deep-dive"\nLatency: 0.4ms [CACHE HIT]`,
        },
        {
          id: "e-r7",
          flowType: "redirect",
          stepNumber: 7,
          title: "App Pod 2 → API Gateway (302 রেসপন্স ফেরত)",
          whatHappens:
            "সার্ভার HTTP 302 Found রেসপন্স তৈরি করে গেটওয়েতে ফেরত পাঠালো।",
          whyItMatters:
            "এখানে ইচ্ছাকৃতভাবে 302, 301 নয়। 301 পেলে ব্রাউজার ঠিকানাটি ক্যাশ করে রাখত এবং পরের ক্লিকগুলো আর সার্ভারেই আসত না — ফলে Kafka-তে কোনো ইভেন্টও যেত না, analytics চিরতরে অন্ধ হয়ে যেত।",
          analogy: "📤 'ঠিকানা বদলেছে' লেখা চিঠি ফেরত পাঠানো।",
          activeNodeIds: ["node-server-2", "node-gw"],
          activeEdgeIds: ["edge-gw-to-s2"],
          edgeOverrides: {
            "edge-gw-to-s2": {
              label: "7. 302 Response",
              isReverse: true,
              particleColor: "success",
            },
          },
          nodeStatusMessages: {
            "node-server-2": "302 Found (countable)",
            "node-gw": "Receiving response from Pod-2",
          },
          payloadSnippet: `HTTP/2 302 Found\nLocation: https://systemdesign.com/expert-deep-dive\nCache-Control: no-store   // প্রতিটি ক্লিক গোনার জন্য`,
        },
        {
          id: "e-r8",
          flowType: "redirect",
          stepNumber: 8,
          title: "API Gateway → Load Balancer (রেসপন্স ফরওয়ার্ড)",
          whatHappens:
            "গেটওয়ে রেসপন্সটি লোড ব্যালেন্সারে ফরওয়ার্ড করলো এবং latency মেট্রিক রেকর্ড করলো।",
          whyItMatters:
            "প্রতিটি hop-এর latency আলাদা করে মাপা থাকলে ধীর অংশটা সহজেই খুঁজে বের করা যায়।",
          analogy: "🧾 বেরোনোর সময় গার্ড সময়টা টুকে রাখলো।",
          activeNodeIds: ["node-gw", "node-lb"],
          activeEdgeIds: ["edge-lb-to-gw"],
          edgeOverrides: {
            "edge-lb-to-gw": {
              label: "8. Forward Response",
              isReverse: true,
              particleColor: "success",
            },
          },
          nodeStatusMessages: {
            "node-gw": "Telemetry logged (3.1ms)",
            "node-lb": "Response received",
          },
          payloadSnippet: `X-Response-Time: 3.1ms\nX-Cache-Layer: redis-hit`,
        },
        {
          id: "e-r9",
          flowType: "redirect",
          stepNumber: 9,
          title: "Load Balancer → Client (ব্রাউজার রিডাইরেক্ট হলো)",
          whatHappens:
            "ব্রাউজার 302 রেসপন্স পেয়ে সাথে সাথে আসল ওয়েবসাইটে চলে গেলো — ইউজার চোখের পলক ফেলার আগেই!",
          whyItMatters:
            "পুরো রিডাইরেক্ট সাইকেল ৩ মিলিসেকেন্ডে শেষ, কারণ কোথাও ডিস্ক পড়তে হয়নি।",
          analogy: "🚀 রকেটের মতো সঠিক গন্তব্যে পৌঁছে যাওয়া।",
          activeNodeIds: ["node-lb", "node-client"],
          activeEdgeIds: ["edge-client-to-lb"],
          edgeOverrides: {
            "edge-client-to-lb": {
              label: "9. Redirecting to Long URL",
              isReverse: true,
              particleColor: "success",
            },
          },
          nodeStatusMessages: {
            "node-lb": "Delivering 302 to client",
            "node-client": "Redirecting instantly (3.1ms)...",
          },
          payloadSnippet: `Location: https://systemdesign.com/expert-deep-dive\nTotal latency: 3.1ms`,
        },
        {
          id: "e-r10",
          flowType: "redirect",
          stepNumber: 10,
          title: "App Pod 2 → Kafka Queue (অ্যাসিনক্রোনাস ইভেন্ট)",
          whatHappens:
            "ইউজার চলে যাওয়ার পর ব্যাকগ্রাউন্ডে সার্ভার Kafka কিউতে একটি বার্তা ছুড়ে দিলো: 'এই লিংকে ১টি ক্লিক হয়েছে, ব্রাউজার Chrome, দেশ বাংলাদেশ'।",
          whyItMatters:
            "Fire-and-forget হওয়ায় ইউজারকে এক মুহূর্তও অপেক্ষা করতে হয় না (Non-blocking I/O)।",
          analogy: "📨 চিঠি পোস্টবক্সে ফেলে দিয়ে নিজের কাজে চলে যাওয়া — পোস্টম্যান পরে ডেলিভারি করবে।",
          activeNodeIds: ["node-server-2", "node-queue"],
          activeEdgeIds: ["edge-s2-to-queue"],
          edgeOverrides: {
            "edge-s2-to-queue": { label: "10. Async Publish: click_event" },
          },
          nodeStatusMessages: {
            "node-server-2": "Event fired (non-blocking)",
            "node-queue": "Kafka Topic: 'url-clicks' received event",
          },
          payloadSnippet: `kafkaProducer.send({\n  topic: 'url-clicks',\n  messages: [{ key: '9wK2pL', value: JSON.stringify({ ts: Date.now(), country: 'BD' }) }]\n});`,
        },
        {
          id: "e-r11",
          flowType: "redirect",
          stepNumber: 11,
          title: "Kafka Queue → Analytics Engine (অ্যানালিটিক্স সংরক্ষণ)",
          whatHappens:
            "অ্যানালিটিক্স ওয়ার্কার Kafka থেকে মেসেজটি তুলে নিয়ে ClickHouse টাইম-সিরিজ ডাটাবেজে স্টোর করলো।",
          whyItMatters:
            "কলামনার ডাটাবেজ (ClickHouse) প্রতি সেকেন্ডে লক্ষ লক্ষ ক্লিক ইভেন্ট এগ্রিগেট করতে পারে।",
          analogy: "📊 অফিসের পেছনের রুমে বসে হিসাবরক্ষকের খাতায় পাই-চার্ট আঁকা।",
          activeNodeIds: ["node-queue", "node-worker"],
          activeEdgeIds: ["edge-queue-to-worker"],
          edgeOverrides: {
            "edge-queue-to-worker": { label: "11. Batch Consume & Aggregate" },
          },
          nodeStatusMessages: {
            "node-queue": "Delivered to consumer group",
            "node-worker": "ClickHouse INSERT +1 click (Total: 4,192,051)",
          },
          payloadSnippet: `INSERT INTO click_analytics (short_code, clicked_at, country, browser)\nVALUES ('9wK2pL', NOW(), 'BD', 'Chrome 128');`,
        },
      ],
    },
    {
      id: "redirect-miss",
      name: "Redirect · Miss",
      icon: "miss",
      steps: [
        {
          id: "e-m1",
          flowType: "redirect-miss",
          stepNumber: 1,
          title: "Client → CDN Edge (পুরোনো একটা লিংকে ক্লিক)",
          whatHappens:
            "এবার এমন একটা কোডে ক্লিক পড়লো যেটা অনেক দিন কেউ খোলেনি। রিকোয়েস্ট নিকটতম এজ নোডে পৌঁছালো।",
          whyItMatters:
            "রিকোয়েস্টটা hit-এর ক্ষেত্রে যা হতো ঠিক তা-ই। ক্যাশে আছে কি নেই সেটা পাঁচ ধাপ পরে জানা যাবে — তার আগে পর্যন্ত দুটো পথ অভিন্ন।",
          analogy: "📍 কাছের ব্রাঞ্চেই আগে খোঁজ নেওয়া।",
          activeNodeIds: ["node-client", "node-cdn"],
          activeEdgeIds: ["edge-client-to-cdn"],
          edgeOverrides: {
            "edge-client-to-cdn": { label: "1. GeoDNS Routing" },
          },
          nodeStatusMessages: {
            "node-client": "GET /oLd7Zq",
            "node-cdn": "Edge Cache Miss -> Origin",
          },
          payloadSnippet: `GET /oLd7Zq HTTP/2\nHost: link.co`,
        },
        {
          id: "e-m2",
          flowType: "redirect-miss",
          stepNumber: 2,
          title: "CDN → Global Load Balancer (এজ থেকে অরিজিনে)",
          whatHappens:
            "এজ ক্যাশেও কোডটা নেই, তাই CDN রিকোয়েস্টটি গ্লোবাল লোড ব্যালেন্সারে পাঠালো।",
          whyItMatters:
            "লক্ষ করুন এখানে দুটো আলাদা ক্যাশ স্তর আছে — CDN edge, তারপর Redis। দুটোই miss হলে তবেই ডাটাবেজের পালা।",
          analogy: "🚪 রিসেপশনে না পেয়ে ভেতরের অফিসে খোঁজ নিতে যাওয়া।",
          activeNodeIds: ["node-cdn", "node-lb"],
          activeEdgeIds: ["edge-cdn-to-lb"],
          edgeOverrides: {
            "edge-cdn-to-lb": { label: "2. Origin Fetch" },
          },
          nodeStatusMessages: {
            "node-cdn": "MISS -> forwarding",
            "node-lb": "Healthy upstreams: 2/2",
          },
          payloadSnippet: `CF-Cache-Status: MISS\nConnection: keep-alive (reused)`,
        },
        {
          id: "e-m3",
          flowType: "redirect-miss",
          stepNumber: 3,
          title: "Load Balancer → API Gateway (গেটওয়েতে প্রবেশ)",
          whatHappens:
            "লোড ব্যালেন্সার রিকোয়েস্টটি API Gateway-তে পাঠালো, যেখানে রেট লিমিট ও রাউটিং নিয়ম প্রয়োগ হলো।",
          whyItMatters:
            "Miss পথটি ব্যয়বহুল, তাই এখানেই রেট লিমিট সবচেয়ে বেশি জরুরি — বট যদি এলোমেলো কোড ছুড়তে থাকে, প্রতিটিই miss হয়ে ডাটাবেজে গিয়ে আঘাত করবে।",
          analogy: "🏢 ভেতরে ঢোকার আগে গার্ডের চেকপয়েন্ট।",
          activeNodeIds: ["node-lb", "node-gw"],
          activeEdgeIds: ["edge-lb-to-gw"],
          edgeOverrides: {
            "edge-lb-to-gw": { label: "3. Gateway Ingress" },
          },
          nodeStatusMessages: {
            "node-lb": "Routing to gateway pool",
            "node-gw": "Rate: OK | Route: /:code",
          },
          payloadSnippet: `X-RateLimit-Remaining: 9987\nmatched route: GET /:shortCode`,
        },
        {
          id: "e-m4",
          flowType: "redirect-miss",
          stepNumber: 4,
          title: "API Gateway → App Pod 1 (অ্যাপ সার্ভারে ডেলিভারি)",
          whatHappens:
            "গেটওয়ে রিকোয়েস্টটি Pod-1-এ পাঠালো।",
          whyItMatters:
            "Pod-1 আর Pod-2-এর মধ্যে কোনো পার্থক্য নেই — দুটোই stateless, দুটোরই একই Redis ক্লাস্টার ও একই ডাটাবেজে হাত আছে।",
          analogy: "👉 'কাউন্টার ১-এ যান।'",
          activeNodeIds: ["node-gw", "node-server-1"],
          activeEdgeIds: ["edge-gw-to-s1"],
          edgeOverrides: {
            "edge-gw-to-s1": { label: "4. Route to Pod-1" },
          },
          nodeStatusMessages: {
            "node-gw": "Least-conn -> Pod-1",
            "node-server-1": "Pod-1 handling request",
          },
          payloadSnippet: `selected pod: url-api-7d9c4-x2ml (least connections)`,
        },
        {
          id: "e-m5",
          flowType: "redirect-miss",
          stepNumber: 5,
          title: "App Pod 1 → Redis Cluster (ক্যাশে খোঁজা)",
          whatHappens:
            "সার্ভার Redis ক্লাস্টারে 'oLd7Zq' কোডটি খুঁজলো — কোন shard-এ থাকার কথা, সেটা কোডের hash থেকেই বেরিয়ে এলো।",
          whyItMatters:
            "ক্লাস্টার মোডে কী-গুলো shard-এ ভাগ করা থাকে, তাই কোনো একটি নোড পুরো ডেটাসেট ধরে রাখে না। খোঁজার আগে জানতেই হয় কোন নোডে যেতে হবে।",
          analogy: "🔍 কোন আলমারিতে খুঁজতে হবে সেটা আগে বের করা।",
          activeNodeIds: ["node-server-1", "node-cache"],
          activeEdgeIds: ["edge-s1-to-cache"],
          edgeOverrides: {
            "edge-s1-to-cache": { label: "5. Redis Lookup", particleColor: "cache" },
          },
          nodeStatusMessages: {
            "node-server-1": "Checking Redis first...",
            "node-cache": "SHARD_07: searching key",
          },
          payloadSnippet: `REDIS_CLUSTER.GET("{url}:oLd7Zq")\n// slot 9284 -> shard 07`,
        },
        {
          id: "e-m6",
          flowType: "redirect-miss",
          stepNumber: 6,
          title: "Redis Cluster → App Pod 1 (CACHE MISS!)",
          whatHappens:
            "Redis উত্তর দিলো 'nil' — কী-টি নেই। অনেক দিন কেউ চায়নি বলে LRU নীতিতে এটি মেমোরি থেকে সরে গেছে।",
          whyItMatters:
            "৮০ TB ডেটার বিপরীতে Redis ক্লাস্টারে হয়তো কয়েকশ GB মেমোরি — অর্থাৎ ১%-এরও কম ডেটা ক্যাশে থাকতে পারে। তাই miss অনিবার্য, ব্যতিক্রম নয়। প্রশ্নটা 'miss হবে কি না' নয়, 'miss হলে কত দ্রুত সামলাতে পারি'।",
          analogy: "❌ আলমারি খুলে দেখা গেলো তাকটাই খালি।",
          activeNodeIds: ["node-cache", "node-server-1"],
          activeEdgeIds: ["edge-s1-to-cache"],
          edgeOverrides: {
            "edge-s1-to-cache": {
              label: "6. MISS (nil)",
              isReverse: true,
              particleColor: "error",
            },
          },
          nodeStatusMessages: {
            "node-cache": "CACHE MISS — evicted (LRU)",
            "node-server-1": "Falling back to read replica",
          },
          payloadSnippet: `REDIS_CLUSTER.GET("{url}:oLd7Zq")\n=> (nil)   [CACHE MISS]`,
        },
        {
          id: "e-m7",
          flowType: "redirect-miss",
          stepNumber: 7,
          title: "App Pod 1 → Read Replica (রেপ্লিকায় সন্ধান, primary-তে নয়)",
          whatHappens:
            "সার্ভার এবার রিড-রেপ্লিকায় গেলো — লক্ষ করুন, primary ডাটাবেজে নয়।",
          whyItMatters:
            "এটাই CQRS-এর মূল কথা এবং এই আর্কিটেকচারের সবচেয়ে গুরুত্বপূর্ণ নিয়ম: read কখনোই primary-তে যায় না। ১,০০,০০০ read/sec primary-তে পাঠালে সেটি সাথে সাথে ভেঙে পড়ত এবং সব write-ও বন্ধ হয়ে যেত।",
          analogy: "📚 মূল খাতা না ছুঁয়ে ফটোকপি থেকে পড়ে নেওয়া।",
          activeNodeIds: ["node-server-1", "node-replica-db"],
          activeEdgeIds: ["edge-s1-to-replica"],
          edgeOverrides: {
            "edge-s1-to-replica": { label: "7. Read Query (Replica)", particleColor: "read" },
          },
          nodeStatusMessages: {
            "node-server-1": "Querying read replica...",
            "node-replica-db": "Index scan on short_code",
          },
          payloadSnippet: `-- read pool, never the primary\nSELECT original_url FROM urls_sharded_07 WHERE short_code = 'oLd7Zq';`,
        },
        {
          id: "e-m8",
          flowType: "redirect-miss",
          stepNumber: 8,
          title: "Read Replica → App Pod 1 (আসল লিংক পাওয়া গেলো)",
          whatHappens:
            "রেপ্লিকা ১৮ মিলিসেকেন্ড পর আসল ঠিকানা ফেরত দিলো — ক্যাশের ০.৪ মিলিসেকেন্ডের তুলনায় প্রায় ৪৫ গুণ ধীর।",
          whyItMatters:
            "০.৪ms বনাম ১৮ms। যদি ৯৯% ক্লিক ক্যাশ থেকে মেটে, গড় দাঁড়ায় ~০.৬ms। কিন্তু hit-রেট ৯০%-এ নামলে গড় হয় ~২.২ms — প্রায় চারগুণ। এই কারণেই cache hit ratio এখানে সবচেয়ে নিবিড়ভাবে পর্যবেক্ষণ করা মেট্রিক।",
          analogy: "📂 কপি থেকেই তথ্য মিললো, তবে সময় লেগে গেলো।",
          activeNodeIds: ["node-replica-db", "node-server-1"],
          activeEdgeIds: ["edge-s1-to-replica"],
          edgeOverrides: {
            "edge-s1-to-replica": {
              label: "8. Row Found (18ms)",
              isReverse: true,
              particleColor: "success",
            },
          },
          nodeStatusMessages: {
            "node-replica-db": "1 row returned (18ms)",
            "node-server-1": "Got it — 45x slower than cache",
          },
          payloadSnippet: `{\n  "original_url": "https://systemdesign.com/an-old-but-popular-post"\n}\nLatency: 18ms [REPLICA READ]`,
        },
        {
          id: "e-m9",
          flowType: "redirect-miss",
          stepNumber: 9,
          title: "App Pod 1 → Redis Cluster (ক্যাশ ব্যাকফিল)",
          whatHappens:
            "উত্তর পাঠানোর আগে সার্ভার লিংকটি Redis-এ বসিয়ে দিলো, নতুন TTL সহ।",
          whyItMatters:
            "এই ধাপটাই cache-aside চক্র সম্পূর্ণ করে। কোনো লিংক আবার জনপ্রিয় হয়ে উঠলে (ধরুন কেউ পুরোনো পোস্ট শেয়ার করলো) প্রথম ক্লিকটাই তাকে ক্যাশে তুলে আনে — বাকি লক্ষ ক্লিক আর ডাটাবেজ পর্যন্ত পৌঁছায় না।",
          analogy: "📌 কপি ফেরত রাখার আগে টেবিলের খাতায় টুকে রাখা।",
          activeNodeIds: ["node-server-1", "node-cache"],
          activeEdgeIds: ["edge-s1-to-cache"],
          edgeOverrides: {
            "edge-s1-to-cache": { label: "9. Backfill Cache", particleColor: "cache" },
          },
          nodeStatusMessages: {
            "node-server-1": "Repopulating cache...",
            "node-cache": "SETEX with TTL 24h",
          },
          payloadSnippet: `REDIS_CLUSTER.SETEX("{url}:oLd7Zq", 86400, "https://...");\n// পরের ক্লিক থেকে এটি CACHE HIT`,
        },
        {
          id: "e-m10",
          flowType: "redirect-miss",
          stepNumber: 10,
          title: "App Pod 1 → API Gateway (302 রেসপন্স ফেরত)",
          whatHappens:
            "সার্ভার HTTP 302 রেসপন্স তৈরি করে গেটওয়েতে পাঠালো।",
          whyItMatters:
            "Hit হোক বা miss, উত্তরটা অভিন্ন — শুধু পৌঁছাতে সময় লাগলো বেশি। ধীর পথ কখনোই ভিন্ন উত্তর দেয় না।",
          analogy: "📤 একই চিঠি, শুধু লিখতে সময় বেশি লাগলো।",
          activeNodeIds: ["node-server-1", "node-gw"],
          activeEdgeIds: ["edge-gw-to-s1"],
          edgeOverrides: {
            "edge-gw-to-s1": {
              label: "10. 302 Response",
              isReverse: true,
              particleColor: "success",
            },
          },
          nodeStatusMessages: {
            "node-server-1": "302 Found (countable)",
            "node-gw": "Receiving response from Pod-1",
          },
          payloadSnippet: `HTTP/2 302 Found\nLocation: https://systemdesign.com/an-old-but-popular-post`,
        },
        {
          id: "e-m11",
          flowType: "redirect-miss",
          stepNumber: 11,
          title: "API Gateway → Load Balancer (রেসপন্স ফরওয়ার্ড)",
          whatHappens:
            "গেটওয়ে রেসপন্সটি ফরওয়ার্ড করলো এবং latency মেট্রিকে এটিকে 'cache miss' হিসেবে চিহ্নিত করলো।",
          whyItMatters:
            "Hit ও miss আলাদা করে ট্যাগ না করলে ড্যাশবোর্ডে শুধু একটা গড় সংখ্যা দেখা যাবে — আর গড় সংখ্যা এখানে মিথ্যা বলে, কারণ দুটো পথের গতি ৪৫ গুণ আলাদা।",
          analogy: "🧾 বেরোনোর সময় গার্ড লিখে রাখলো: 'এই কাজে দেরি হয়েছে'।",
          activeNodeIds: ["node-gw", "node-lb"],
          activeEdgeIds: ["edge-lb-to-gw"],
          edgeOverrides: {
            "edge-lb-to-gw": {
              label: "11. Forward Response",
              isReverse: true,
              particleColor: "success",
            },
          },
          nodeStatusMessages: {
            "node-gw": "Telemetry: cache=miss, 21.3ms",
            "node-lb": "Response received",
          },
          payloadSnippet: `X-Response-Time: 21.3ms\nX-Cache-Layer: redis-miss -> replica`,
        },
        {
          id: "e-m12",
          flowType: "redirect-miss",
          stepNumber: 12,
          title: "Load Balancer → Client (রিডাইরেক্ট, তবে ধীরে)",
          whatHappens:
            "ইউজার আসল সাইটে পৌঁছে গেলেন — ২১ মিলিসেকেন্ডে, hit-এর ৩ মিলিসেকেন্ডের বদলে।",
          whyItMatters:
            "ইউজার এই পার্থক্যটা টেরই পান না — দুটোই চোখের পলকের চেয়ে দ্রুত। কিন্তু সার্ভারের জন্য পার্থক্যটা বিশাল: miss মানে একটা ডাটাবেজ কানেকশন দখল হওয়া। hit-রেট ৯৯% থেকে ৯০%-এ নামলে ডাটাবেজের উপর চাপ দশগুণ বেড়ে যায়।",
          analogy: "🐢 গন্তব্য একই, শুধু রাস্তাটা লম্বা ছিল।",
          activeNodeIds: ["node-lb", "node-client"],
          activeEdgeIds: ["edge-client-to-lb"],
          edgeOverrides: {
            "edge-client-to-lb": {
              label: "12. Redirecting (21ms)",
              isReverse: true,
              particleColor: "success",
            },
          },
          nodeStatusMessages: {
            "node-lb": "Delivering 302 to client",
            "node-client": "Redirected in 21ms (cache miss)",
          },
          payloadSnippet: `Location: https://systemdesign.com/an-old-but-popular-post\nTotal latency: 21ms  (vs 3.1ms on a cache hit)`,
        },
      ],
    },
    {
      id: "failover",
      name: "Failover",
      icon: "failover",
      steps: [
        {
          id: "e-f1",
          flowType: "failover",
          stepNumber: 1,
          title: "App Pod 1 → Primary DB (write চেষ্টা, কিন্তু primary মৃত)",
          whatHappens:
            "একজন ইউজার নতুন লিংক বানাতে চাইলেন। সার্ভার primary ডাটাবেজে লিখতে গেলো — কিন্তু কানেকশনই তৈরি হলো না। primary মেশিনটি বসে গেছে।",
          whyItMatters:
            "'High Availability' মানে কিছু কখনো ভাঙবে না, এমন নয় — মানে হলো ভাঙলে সিস্টেম কী করে, সেটা আগে থেকেই ঠিক করা আছে। এই flow-টা সেই পরিকল্পনাটাই দেখায়।",
          analogy: "💥 হেড অফিসের মূল খাতাটা হঠাৎ আগুনে পুড়ে গেলো।",
          activeNodeIds: ["node-server-1", "node-primary-db"],
          activeEdgeIds: ["edge-s1-to-primary"],
          edgeOverrides: {
            "edge-s1-to-primary": { label: "1. Write FAILED", particleColor: "error" },
          },
          nodeStatusMessages: {
            "node-server-1": "ECONNREFUSED — retrying...",
            "node-primary-db": "❌ NODE DOWN (no heartbeat 10s)",
          },
          payloadSnippet: `Error: connect ECONNREFUSED 10.0.4.11:5432\n// circuit breaker: OPEN after 5 consecutive failures`,
        },
        {
          id: "e-f2",
          flowType: "failover",
          stepNumber: 2,
          title: "Primary DB → Read Replica (Raft ভোটে নতুন primary নির্বাচন)",
          whatHappens:
            "Patroni ক্লাস্টার লক্ষ করলো primary-র heartbeat বন্ধ। বাকি নোডগুলো ভোট দিয়ে সবচেয়ে কম lag থাকা রেপ্লিকাটিকে নতুন primary হিসেবে promote করলো।",
          whyItMatters:
            "সবচেয়ে কম lag-এর রেপ্লিকা বাছা হয় কারণ তার কাছেই সবচেয়ে বেশি সাম্প্রতিক ডেটা আছে — অর্থাৎ সবচেয়ে কম লেখা হারাবে। আর ভোটাভুটির জন্য সংখ্যাগরিষ্ঠতা (quorum) লাগে; এতেই split-brain ঠেকে: নেটওয়ার্ক দু'ভাগ হলে যে অংশে সংখ্যাগরিষ্ঠতা নেই, সে নিজেকে primary ঘোষণা করতে পারে না।",
          analogy: "🗳️ সহকর্মীরা মিলে ভোট দিয়ে ঠিক করলো কে এখন থেকে মূল খাতা রাখবে।",
          activeNodeIds: ["node-primary-db", "node-replica-db"],
          activeEdgeIds: ["edge-primary-to-replica"],
          edgeOverrides: {
            "edge-primary-to-replica": {
              label: "2. Raft election → promote",
              particleColor: "meta",
            },
          },
          nodeStatusMessages: {
            "node-primary-db": "❌ DEMOTED (fenced)",
            "node-replica-db": "⬆️ PROMOTED to PRIMARY (lag was 0.2ms)",
          },
          payloadSnippet: `patroni: leader lease expired\npatroni: replica-02 has lowest lag (0.2ms) -> promoting\npatroni: new leader = replica-02   (elapsed: 24s)`,
        },
        {
          id: "e-f3",
          flowType: "failover",
          stepNumber: 3,
          title: "App Pod 2 → Redis Cluster (এদিকে redirect চলছেই)",
          whatHappens:
            "ঠিক এই ২৪ সেকেন্ড জুড়ে redirect ট্রাফিক এক মুহূর্তের জন্যও থামেনি — প্রতিটি ক্লিক Redis থেকেই মিটে যাচ্ছে।",
          whyItMatters:
            "এটাই ব্যর্থতা সামলানোর আসল কৌশল: read পথ আর write পথ আলাদা রাখা। write ৩০ সেকেন্ড বন্ধ থাকলে কয়েকজন ইউজার নতুন লিংক বানাতে পারেন না। কিন্তু read বন্ধ হলে ১,০০,০০০ ক্লিক/sec হারে ভাঙা লিংক তৈরি হতো। তাই ব্যর্থতার সময় আমরা write কোরবানি দিই, read নয়।",
          analogy: "📖 মূল খাতা পুড়লেও পড়ার কপিগুলো অক্ষত — তাই পাঠকরা টেরই পেলো না।",
          activeNodeIds: ["node-server-2", "node-cache"],
          activeEdgeIds: ["edge-s2-to-cache"],
          edgeOverrides: {
            "edge-s2-to-cache": { label: "3. Reads unaffected", particleColor: "cache" },
          },
          nodeStatusMessages: {
            "node-server-2": "Redirects: 100% healthy",
            "node-cache": "CACHE HIT (0.4ms) — serving as normal",
          },
          payloadSnippet: `# during the 24s failover window\nredirect_success_rate: 100%\nshorten_success_rate:    0%   ← degraded, by design`,
        },
        {
          id: "e-f4",
          flowType: "failover",
          stepNumber: 4,
          title: "App Pod 1 → নতুন Primary (write আবার চালু)",
          whatHappens:
            "নতুন primary তৈরি হয়ে গেছে। Circuit breaker আবার খুলে গেলো এবং যে write গুলো queue-তে অপেক্ষা করছিল, সেগুলো একে একে সফল হলো।",
          whyItMatters:
            "কিন্তু একটা মূল্য দিতে হয়েছে: replication async ছিল, তাই primary মরার ঠিক আগের ~০.২ms-এ যে লেখাগুলো হয়েছিল, সেগুলো কোনো রেপ্লিকায় পৌঁছায়নি — চিরতরে হারিয়ে গেছে। Sync replication এই ক্ষতি ঠেকাতে পারত, কিন্তু তাতে প্রতিটি write ধীর হয়ে যেত। এই বিনিময়টাই সচেতনভাবে বেছে নেওয়া।",
          analogy: "✍️ নতুন খাতা খোলা হলো — শুধু শেষ মুহূর্তের দু-এক লাইন আর ফিরে পাওয়া গেলো না।",
          activeNodeIds: ["node-server-1", "node-replica-db"],
          activeEdgeIds: ["edge-s1-to-replica"],
          edgeOverrides: {
            "edge-s1-to-replica": {
              label: "4. Writes resume (new primary)",
              particleColor: "write",
            },
          },
          nodeStatusMessages: {
            "node-server-1": "Circuit CLOSED — writes flowing",
            "node-replica-db": "PRIMARY — accepting writes",
          },
          payloadSnippet: `# post-mortem\ntotal write downtime:  24s\nwrites lost (async replication gap):  ~3 rows\nredirect impact:  none`,
        },
      ],
    },
    {
      id: "analytics",
      name: "Analytics",
      icon: "analytics",
      steps: [
        {
          id: "e-a1",
          flowType: "analytics",
          stepNumber: 1,
          title: "Dashboard → Analytics Engine (মালিক তার রিপোর্ট চাইলেন)",
          whatHappens:
            "লিংকের মালিক ড্যাশবোর্ড খুলে জানতে চাইলেন — গত ৩০ দিনে এই লিংকে কোন দেশ থেকে কত ক্লিক পড়েছে? প্রশ্নটি ClickHouse-এ গেলো।",
          whyItMatters:
            "লক্ষ করুন এই পথে PostgreSQL, Redis বা অ্যাপ pod — কিছুই নেই। Analytics একটি সম্পূর্ণ আলাদা read path। এই বিচ্ছিন্নতাই মূল কথা: একজন মালিক ভুল করে ভারী কোনো কোয়েরি চালালেও একটিও redirect ধীর হবে না।",
          analogy: "📋 দোকানদার হিসাবরক্ষকের কাছে গিয়ে জিজ্ঞেস করলেন 'এ মাসে কত বিক্রি হলো?' — সামনের কাউন্টারের লাইন এতে থামে না।",
          activeNodeIds: ["node-dashboard", "node-worker"],
          activeEdgeIds: ["edge-worker-to-dashboard"],
          edgeOverrides: {
            "edge-worker-to-dashboard": {
              label: "1. OLAP Aggregation Query",
              isReverse: true,
              particleColor: "read",
            },
          },
          nodeStatusMessages: {
            "node-dashboard": "GET /stats/9wK2pL?days=30",
            "node-worker": "Scanning 12.4M rows (columnar)",
          },
          payloadSnippet: `SELECT country, count() AS clicks\nFROM click_analytics\nWHERE short_code = '9wK2pL'\n  AND clicked_at > now() - INTERVAL 30 DAY\nGROUP BY country ORDER BY clicks DESC;`,
        },
        {
          id: "e-a2",
          flowType: "analytics",
          stepNumber: 2,
          title: "Analytics Engine → Dashboard (১.২ কোটি সারি, ৯০ মিলিসেকেন্ডে)",
          whatHappens:
            "ClickHouse ১.২ কোটি সারি ঘেঁটে দেশভিত্তিক হিসাব বানিয়ে ৯০ মিলিসেকেন্ডে ফেরত দিলো। ড্যাশবোর্ডে গ্রাফ ভেসে উঠলো।",
          whyItMatters:
            "একই কাজ PostgreSQL-এ করতে গেলে কয়েক সেকেন্ড লাগত। পার্থক্যটা কলামনার স্টোরেজে: ClickHouse শুধু `country` কলামটাই ডিস্ক থেকে পড়ে, পুরো সারি নয়। এই কারণেই analytics-এর জন্য আলাদা ডাটাবেজ — একই ডেটা, কিন্তু প্রশ্নের ধরন সম্পূর্ণ ভিন্ন বলে স্টোরেজের আকারও ভিন্ন হতে হয়।",
          analogy: "📊 হিসাবরক্ষক পুরো খাতা না পড়ে শুধু 'দেশ' কলামটা চোখ বুলিয়ে যোগফল বলে দিলেন।",
          activeNodeIds: ["node-worker", "node-dashboard"],
          activeEdgeIds: ["edge-worker-to-dashboard"],
          edgeOverrides: {
            "edge-worker-to-dashboard": {
              label: "2. Aggregated Result (90ms)",
              particleColor: "success",
            },
          },
          nodeStatusMessages: {
            "node-worker": "12.4M rows scanned in 90ms",
            "node-dashboard": "Chart rendered — BD 61%, IN 18%, US 9%",
          },
          payloadSnippet: `[\n  { "country": "BD", "clicks": 2841903 },\n  { "country": "IN", "clicks":  842117 },\n  { "country": "US", "clicks":  418266 }\n]\nElapsed: 90ms  |  rows scanned: 12,400,000`,
        },
      ],
    },
  ],
};
