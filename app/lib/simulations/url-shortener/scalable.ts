import type { LevelConfig } from "../../types";

export const scalableLevel: LevelConfig = {
  id: "scalable",
  name: "Scalable",
  badge: "⚡ এটা চাপ সামলায়",
  tagline: "Load balancer, rate limiter, caching and multiple servers",
  componentCount: 7,
  conceptSummary:
    "যখন লাখ লাখ মানুষ একসাথে সাইটে আসে, তখন একটি সার্ভার লোড নিতে পারে না। তাই আমরা সামনে একটি লোড ব্যালেন্সার বসিয়ে একাধিক সার্ভারে ট্র্যাফিক ভাগ করে দিই, রোবট আটকাতে রেট লিমিটার এবং ডাটাবেজের চাপ কমাতে মেমোরি ক্যাশ (Redis) ব্যবহার করি।",
  keyConcepts: [
    "Load Balancing (Round Robin / Least Conn)",
    "Rate Limiting (Token Bucket / Sliding Window)",
    "In-Memory Caching (Redis Cache-Aside)",
    "Horizontal Scaling (Stateless App Servers)",
    "Cache Hit vs Cache Miss",
  ],
  scaleEstimate: {
    writeQps: "~১০ /sec",
    readQps: "~১,০০০ /sec",
    readWriteRatio: "১০০ : ১",
    storage5y: "~৮০০ GB (১৫৮ কোটি লিংক × ৫০০ B)",
    extras: [{ label: "Short code", value: "৭ অক্ষর → ৬২⁷ ≈ ৩.৫ ট্রিলিয়ন" }],
  },
  tradeOffs: [
    {
      question: "কোন caching কৌশল?",
      options: [
        {
          name: "Cache-aside (Lazy loading)",
          note: "অ্যাপ আগে ক্যাশ দেখে; না পেলে DB থেকে এনে ক্যাশে বসিয়ে দেয়। শুধু যেটা সত্যিই চাওয়া হয় সেটাই ক্যাশে ওঠে, কিন্তু প্রতিটি নতুন কোডের প্রথম ক্লিক ধীর।",
        },
        {
          name: "Write-through",
          note: "লেখার সময়েই ক্যাশে বসে যায়, তাই প্রথম ক্লিকও দ্রুত। কিন্তু যে লিংকে কেউ কখনো ক্লিক করবে না, সেটাও মেমোরি দখল করে থাকে।",
        },
        {
          name: "Write-behind",
          note: "আগে ক্যাশে, পরে ধীরে ধীরে DB-তে। সবচেয়ে দ্রুত write, কিন্তু ক্যাশ নোড মরে গেলে ডেটা হারানোর ঝুঁকি।",
        },
      ],
      chosen: "Cache-aside (Lazy loading)",
      why: "URL shortener-এর ট্রাফিক তীব্রভাবে অসম — মুষ্টিমেয় কিছু লিংকেই বেশিরভাগ ক্লিক পড়ে। Cache-aside স্বয়ংক্রিয়ভাবে শুধু সেই জনপ্রিয় লিংকগুলোকেই মেমোরিতে রাখে। এখানে shorten flow-এ যে write-through-ও করা হচ্ছে, সেটা এই কারণে যে নতুন লিংকে ক্লিক আসে প্রথম কয়েক ঘণ্টাতেই।",
    },
    {
      question: "Cache miss হলে ঠিক কী ঘটে?",
      options: [
        {
          name: "DB থেকে এনে ক্যাশ ভরে দেওয়া",
          note: "একটি অতিরিক্ত round trip (~২০ms), তারপর সেই কোডের পরের প্রতিটি ক্লিক ক্যাশ থেকেই মিটবে।",
        },
        {
          name: "সরাসরি DB, ক্যাশে না রাখা",
          note: "ক্যাশ কখনো গরম হয় না — একই কোডে বারবার ক্লিক পড়লেও প্রতিবার DB-তে যেতে হয়।",
        },
      ],
      chosen: "DB থেকে এনে ক্যাশ ভরে দেওয়া",
      why: "এই ব্যাকফিল ধাপটাই cache-aside-কে কাজ করায়। এটা বাদ দিলে ক্যাশে শুধু সদ্য তৈরি লিংক থাকবে, আর পুরোনো কিন্তু জনপ্রিয় লিংকগুলো চিরকাল DB-তে আঘাত করতেই থাকবে। 'Redirect · Miss' flow-এ ধাপে ধাপে এটাই দেখানো হয়েছে।",
    },
    {
      question: "Rate limiter কোন অ্যালগরিদমে চলবে?",
      options: [
        {
          name: "Fixed window",
          note: "গোনা সবচেয়ে সহজ, কিন্তু উইন্ডোর সীমানায় দ্বিগুণ ট্রাফিক ঢুকে পড়তে পারে।",
        },
        {
          name: "Sliding window",
          note: "সীমানার ফাঁকটা বন্ধ হয়, কিন্তু প্রতি ইউজারের টাইমস্ট্যাম্প রাখতে হয় — মেমোরি বেশি লাগে।",
        },
        {
          name: "Token bucket",
          note: "স্বাভাবিক গড় হার ধরে রেখেও হঠাৎ আসা burst সহ্য করে। বাস্তব ইউজারের আচরণের সবচেয়ে কাছাকাছি।",
        },
      ],
      chosen: "Token bucket",
      why: "আসল ইউজাররা থেমে থেমে গুচ্ছ গুচ্ছ রিকোয়েস্ট পাঠায় — একটা পেজে দশটা লিংক একসাথে তৈরি করা স্বাভাবিক, আক্রমণ নয়। Fixed window এমন ইউজারকে অকারণে আটকে দিত।",
    },
    {
      question: "Rate limiter-এর হিসাব কোথায় থাকবে?",
      options: [
        {
          name: "প্রতিটি সার্ভারের নিজের মেমোরিতে",
          note: "দ্রুততম, কিন্তু ২টি সার্ভার থাকলে ইউজার কার্যত দ্বিগুণ কোটা পেয়ে যায় — লোড ব্যালেন্সার তাকে ঘুরিয়ে ফিরিয়ে দু'জায়গাতেই পাঠায়।",
        },
        {
          name: "শেয়ার্ড Redis-এ",
          note: "সব সার্ভার একই হিসাব দেখে, তাই কোটা সত্যিই কার্যকর হয়। বিনিময়ে প্রতিটি রিকোয়েস্টে একটা নেটওয়ার্ক hop যোগ হয়।",
        },
      ],
      chosen: "শেয়ার্ড Redis-এ",
      why: "সার্ভার একাধিক হওয়ার মুহূর্তেই in-memory কাউন্টার ভুল উত্তর দিতে শুরু করে। এখানে rate limiter-কে আলাদা কম্পোনেন্ট হিসেবে আঁকা হয়েছে ঠিক এই কারণেই — এটা অ্যাপ সার্ভারের ভেতরের কোনো ফাংশন নয়, একটি শেয়ার্ড state।",
    },
    {
      question: "301 না 302?",
      options: [
        {
          name: "301 Moved Permanently",
          note: "ব্রাউজার ক্যাশ করে, তাই পরের ক্লিকগুলো সার্ভারে আসে না। ১,০০০ read/sec-এর অনেকটাই এতে বেঁচে যায়।",
        },
        {
          name: "302 Found",
          note: "প্রতিটি ক্লিক সার্ভারে আসে — গোনা যায়, কিন্তু read QPS-এর পুরো চাপ নিতে হয়।",
        },
      ],
      chosen: "301 Moved Permanently",
      why: "এই স্তরেও কোনো analytics পাইপলাইন নেই, তাই ক্লিক গোনার প্রয়োজন নেই — ব্রাউজার ক্যাশকে কাজে লাগানোই বুদ্ধিমানের। expert স্তরে Kafka আসার সাথে সাথেই এই সিদ্ধান্ত উল্টে যাবে, কারণ 301 পাঠিয়ে ক্লিক গোনা যায় না।",
    },
  ],
  nodes: [
    {
      id: "node-client",
      type: "simulationNode",
      position: { x: 59, y: 427 },
      data: {
        label: "Client",
        subLabel: "Web & Mobile Users",
        category: "client",
        emoji: "📱",
        analogy: "হাজার হাজার গ্রাহক — যারা একসাথে লাইন ধরেছে।",
        description: "ব্যবহারকারীর ডিভাইস যেখান থেকে অনুরোধ আসে।",
        techSpecs: "HTTPS / REST",
      },
    },
    {
      id: "node-lb",
      type: "simulationNode",
      position: { x: 706, y: 427 },
      data: {
        label: "Load Balancer",
        subLabel: "NGINX / HAProxy",
        category: "network",
        emoji: "⚖️",
        analogy: "স্মার্ট ট্রাফিক পুলিশ — যে লাইন দেখে ঠিক করে কোন কাউন্টার ফাঁকা আছে এবং গ্রাহককে সেখানে পাঠায়।",
        description: "ইনকামিং ট্রাফিককে একাধিক অ্যাপ সার্ভারের মধ্যে সমানভাবে বণ্টন করে।",
        techSpecs: "Round-Robin / Health Check",
      },
    },
    {
      id: "node-limiter",
      type: "simulationNode",
      position: { x: 1413, y: 74 },
      data: {
        label: "Rate Limiter",
        subLabel: "Token Bucket (Redis based)",
        category: "security",
        emoji: "🛡️",
        analogy: "নিরাপত্তার দারোয়ান — যদি কেউ এক সেকেন্ডে ১০০ বার বেল বাজায়, দারোয়ান তাকে বলে 'একটু পরে আসো!'",
        description: "অতিরিক্ত বা স্প্যাম রিকোয়েস্ট আটকে দেয় যাতে সার্ভার ক্র্যাশ না করে।",
        techSpecs: "Max 10 req/sec per IP",
      },
    },
    {
      id: "node-server-1",
      type: "simulationNode",
      position: { x: 1413, y: 294 },
      data: {
        label: "App Server 1",
        subLabel: "Stateless Node.js",
        category: "compute",
        emoji: "🖥️",
        analogy: "কাউন্টার ১-এর ক্যাশিয়ার।",
        description: "লিংক শর্ট ও রিডাইরেক্ট লজিক প্রসেস করে।",
        techSpecs: "Worker Process 1",
      },
    },
    {
      id: "node-server-2",
      type: "simulationNode",
      position: { x: 1413, y: 662 },
      data: {
        label: "App Server 2",
        subLabel: "Stateless Node.js",
        category: "compute",
        emoji: "🖥️",
        analogy: "কাউন্টার ২-এর ক্যাশিয়ার — প্রথম ক্যাশিয়ারের লোড কমাতে বসেছে।",
        description: "একই লজিক চালায়, কাজ ভাগ করে নেয়।",
        techSpecs: "Worker Process 2",
      },
    },
    {
      id: "node-cache",
      type: "simulationNode",
      position: { x: 2119, y: 191 },
      data: {
        label: "Cache (Redis)",
        subLabel: "In-Memory Key-Value",
        category: "storage",
        emoji: "⚡",
        analogy: "দেওয়ালে টাঙানো দ্রুত চিরকুট বোর্ড — সবচেয়ে বেশি ব্যবহৃত লিঙ্কগুলো এখানে থাকে, চোখের পলকে মিলবে!",
        description: "র‍্যামে ডাটা রাখে। ডাটাবেজে না গিয়েই < 2ms সময়ে লিঙ্ক রিটার্ন করে।",
        techSpecs: "RAM Cache / LRU Eviction",
      },
    },
    {
      id: "node-db",
      type: "simulationNode",
      position: { x: 2119, y: 618 },
      data: {
        label: "Database",
        subLabel: "PostgreSQL Primary",
        category: "storage",
        emoji: "📦",
        analogy: "স্থায়ী বড় ফাইল কেবিনেট — যেখানে কোটি কোটি লিংকের মূল রেকর্ড সুরক্ষিত।",
        description: "স্থায়ী ডিস্ক স্টোরেজ। ক্যাশে না পাওয়া গেলে এখান থেকে আনা হয়।",
        techSpecs: "SSD / Indexed Tables",
      },
    },
  ],
  edges: [
    {
      id: "edge-client-to-lb",
      type: "animatedFlowEdge",
      source: "node-client",
      sourceHandle: "r-s",
      target: "node-lb",
      targetHandle: "l-t",
      data: {
        label: "1. Incoming Request",
        particleColor: "request",
      },
    },
    {
      id: "edge-lb-to-limiter",
      type: "animatedFlowEdge",
      source: "node-lb",
      sourceHandle: "r-s",
      target: "node-limiter",
      targetHandle: "l-t",
      data: {
        label: "2. Check IP Quota",
        particleColor: "cache",
      },
    },
    {
      id: "edge-lb-to-s1",
      type: "animatedFlowEdge",
      source: "node-lb",
      sourceHandle: "r-s",
      target: "node-server-1",
      targetHandle: "l-t",
      data: {
        label: "3a. Forward to Server 1",
        particleColor: "request",
      },
    },
    {
      id: "edge-lb-to-s2",
      type: "animatedFlowEdge",
      source: "node-lb",
      sourceHandle: "r-s",
      target: "node-server-2",
      targetHandle: "l-t",
      data: {
        label: "3b. Forward to Server 2",
        particleColor: "request",
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
        label: "4a. Cache Check / Set",
        particleColor: "write",
      },
    },
    {
      id: "edge-s1-to-db",
      type: "animatedFlowEdge",
      source: "node-server-1",
      sourceHandle: "r-s",
      target: "node-db",
      targetHandle: "l-t",
      data: {
        label: "4b. DB Query",
        particleColor: "read",
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
        label: "4c. Cache Check",
        particleColor: "write",
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
          id: "i-s1",
          flowType: "shorten",
          stepNumber: 1,
          title: "Client → Load Balancer (লোড ব্যালেন্সারে রিকোয়েস্ট)",
          whatHappens:
            "ক্লায়েন্ট নতুন লিংক তৈরি করতে রিকোয়েস্ট পাঠালো। রিকোয়েস্টটি সরাসরি সার্ভারে না গিয়ে প্রথমে লোড ব্যালেন্সারে আসলো।",
          whyItMatters:
            "লোড ব্যালেন্সার সিঙ্গেল পয়েন্ট অফ এন্ট্রি হিসেবে কাজ করে এবং ব্যাকএন্ড সার্ভারগুলোর আসল আইপি আড়ালে রাখে।",
          analogy: "🏢 বড় ব্যাংকের সদর দরজায় গার্ডের কাছে যাওয়া।",
          activeNodeIds: ["node-client", "node-lb"],
          activeEdgeIds: ["edge-client-to-lb"],
          edgeOverrides: {
            "edge-client-to-lb": { label: "1. Incoming Request" },
          },
          nodeStatusMessages: {
            "node-client": "POST /api/v1/shorten",
            "node-lb": "SSL Termination & Routing...",
          },
          payloadSnippet: `POST /api/v1/shorten HTTP/1.1\nHost: api.shortener.io\nX-Forwarded-For: 203.0.113.195`,
        },
        {
          id: "i-s2",
          flowType: "shorten",
          stepNumber: 2,
          title: "Load Balancer → Rate Limiter (কোটা যাচাই করতে পাঠানো)",
          whatHappens:
            "সার্ভারে পাঠানোর আগে লোড ব্যালেন্সার রেট লিমিটারকে জিজ্ঞেস করলো — এই আইপি কি সীমা অতিক্রম করেছে?",
          whyItMatters:
            "ব্যয়বহুল কাজ শুরু করার আগেই খারাপ ট্রাফিক আটকে দেওয়া সবচেয়ে সস্তা প্রতিরক্ষা।",
          analogy: "🚦 গাড়ি ছাড়ার আগে সিগন্যালের দিকে তাকানো।",
          activeNodeIds: ["node-lb", "node-limiter"],
          activeEdgeIds: ["edge-lb-to-limiter"],
          edgeOverrides: {
            "edge-lb-to-limiter": { label: "2. Check IP Quota" },
          },
          nodeStatusMessages: {
            "node-lb": "Asking rate limiter...",
            "node-limiter": "Looking up IP 203.0.113.195",
          },
          payloadSnippet: `INCR ratelimit:203.0.113.195 (window: 60s)`,
        },
        {
          id: "i-s3",
          flowType: "shorten",
          stepNumber: 3,
          title: "Rate Limiter → Load Balancer (অনুমতি পাওয়া গেলো)",
          whatHappens:
            "রেট লিমিটার উত্তর পাঠালো: 'সব ঠিক আছে, ১০টির মধ্যে মাত্র ৩টি ব্যবহার হয়েছে — অনুমতি দেওয়া হলো!'",
          whyItMatters:
            "DDoS আক্রমণ এবং স্ক্র্যাপারদের অতিরিক্ত রিকোয়েস্ট ঠেকিয়ে সার্ভারকে নিরাপদ রাখে।",
          analogy: "✅ সিগন্যালে গ্রিন লাইট জ্বলে ওঠা।",
          activeNodeIds: ["node-limiter", "node-lb"],
          activeEdgeIds: ["edge-lb-to-limiter"],
          edgeOverrides: {
            "edge-lb-to-limiter": {
              label: "3. Quota OK (ALLOWED)",
              isReverse: true,
              particleColor: "success",
            },
          },
          nodeStatusMessages: {
            "node-limiter": "IP 203.0.113.195: 3/10 tokens used (ALLOWED)",
            "node-lb": "Rate limit PASSED",
          },
          payloadSnippet: `HTTP 200 OK\nX-RateLimit-Limit: 10\nX-RateLimit-Remaining: 7\nX-RateLimit-Reset: 1718000000`,
        },
        {
          id: "i-s4",
          flowType: "shorten",
          stepNumber: 4,
          title: "Load Balancer → App Server 1 (সার্ভার ১-এ ডেলিভারি)",
          whatHappens:
            "লোড ব্যালেন্সার দেখলো সার্ভার ১ ফ্রি আছে, তাই রিকোয়েস্টটি সেখানে পাঠিয়ে দিলো। সার্ভার ১ একটি নতুন শর্ট কোড 'mR8vX1' তৈরি করলো।",
          whyItMatters:
            "একটি রিকোয়েস্ট একবারে একটিমাত্র সার্ভারে যায়। Stateless আর্কিটেকচারের কারণে সার্ভার ২-ও একই কাজ করতে পারতো।",
          analogy: "👉 'কাউন্টার ১ ফাঁকা আছে, ওখানে যান!'",
          activeNodeIds: ["node-lb", "node-server-1"],
          activeEdgeIds: ["edge-lb-to-s1"],
          edgeOverrides: {
            "edge-lb-to-s1": { label: "4. Forward to Server 1" },
          },
          nodeStatusMessages: {
            "node-lb": "Round-Robin -> Server 1",
            "node-server-1": "Processing request... 'mR8vX1'",
          },
          payloadSnippet: `Generated Base62 ID: "mR8vX1" (Length: 6 chars)`,
        },
        {
          id: "i-s5",
          flowType: "shorten",
          stepNumber: 5,
          title: "App Server 1 → Database (স্থায়ীভাবে সংরক্ষণ)",
          whatHappens:
            "সার্ভার ১ ডাটাবেজে লিংকটি স্থায়ীভাবে সেভ করলো।",
          whyItMatters:
            "ডাটাবেজই একমাত্র স্থায়ী উৎস — ক্যাশ মুছে গেলেও এখান থেকে ডেটা ফিরে পাওয়া যায়।",
          analogy: "📓 ডায়েরিতে কলম দিয়ে পাকাপাকিভাবে লিখে ফেলা।",
          activeNodeIds: ["node-server-1", "node-db"],
          activeEdgeIds: ["edge-s1-to-db"],
          edgeOverrides: {
            "edge-s1-to-db": { label: "5. Persist to DB" },
          },
          nodeStatusMessages: {
            "node-server-1": "Writing to database...",
            "node-db": "Persisted to table: urls (ID: 59302)",
          },
          payloadSnippet: `INSERT INTO urls (code, url) VALUES ('mR8vX1', 'https://...');`,
        },
        {
          id: "i-s6",
          flowType: "shorten",
          stepNumber: 6,
          title: "App Server 1 → Redis Cache (ক্যাশ গরম করা)",
          whatHappens:
            "ডাটাবেজে সেভ হওয়ার পর সার্ভার ১ লিংকটি Redis ক্যাশেও রেখে দিলো, যাতে একটু পরেই কেউ সার্চ করলে সাথে সাথে পাওয়া যায়!",
          whyItMatters:
            "Write-Through স্ট্র্যাটেজি নিশ্চিত করে যে ক্যাশ ও ডাটাবেজ সবসময় সিঙ্কে থাকে।",
          analogy: "📌 ডায়েরিতে লেখার পর সামনের নোটিস বোর্ডেও পিন মেরে রাখা।",
          activeNodeIds: ["node-server-1", "node-cache"],
          activeEdgeIds: ["edge-s1-to-cache"],
          edgeOverrides: {
            "edge-s1-to-cache": { label: "6. Warm the Cache" },
          },
          nodeStatusMessages: {
            "node-server-1": "Warming cache...",
            "node-cache": "SET 'url:mR8vX1' -> TTL 24h",
          },
          payloadSnippet: `REDIS.SETEX("url:mR8vX1", 86400, "https://...");`,
        },
        {
          id: "i-s7",
          flowType: "shorten",
          stepNumber: 7,
          title: "App Server 1 → Load Balancer (রেসপন্স ফেরত)",
          whatHappens:
            "অ্যাপ সার্ভার ১ শর্ট ইউআরএল তৈরি সম্পন্ন করে লোড ব্যালেন্সারে রেসপন্স ফেরত পাঠালো।",
          whyItMatters:
            "সার্ভার প্রসেসিং শেষ করে লোড ব্যালেন্সারের মাধ্যমেই রেসপন্স রুটিং করে — ক্লায়েন্ট সরাসরি সার্ভারকে চেনে না।",
          analogy: "📤 ক্যাশিয়ার টোকেন স্লিপ রেজিস্টারে ফেরত জমা দিলো।",
          activeNodeIds: ["node-server-1", "node-lb"],
          activeEdgeIds: ["edge-lb-to-s1"],
          edgeOverrides: {
            "edge-lb-to-s1": {
              label: "7. 201 Created Response",
              isReverse: true,
              particleColor: "success",
            },
          },
          nodeStatusMessages: {
            "node-server-1": "201 Created -> Returning to LB",
            "node-lb": "Receiving response from Server 1...",
          },
          payloadSnippet: `HTTP/1.1 201 Created\nContent-Type: application/json\n\n{\n  "code": "mR8vX1",\n  "shortUrl": "https://sho.rt/mR8vX1"\n}`,
        },
        {
          id: "i-s8",
          flowType: "shorten",
          stepNumber: 8,
          title: "Load Balancer → Client (ইউজারকে ছোট লিংক প্রদান)",
          whatHappens:
            "ইউজারের স্ক্রিনে সাথে সাথে 'https://sho.rt/mR8vX1' ভেসে উঠলো। পুরো প্রক্রিয়াটি মাত্র ১৫ মিলিসেকেন্ডে শেষ হলো!",
          whyItMatters:
            "হাই পারফরম্যান্স সিস্টেমের p95 latency < 50ms রাখা নিশ্চিত করা হয়েছে।",
          analogy: "🎉 সেকেন্ডের মধ্যে কাজ শেষ করে মুখে হাসি নিয়ে বিদায় জানানো।",
          activeNodeIds: ["node-lb", "node-client"],
          activeEdgeIds: ["edge-client-to-lb"],
          edgeOverrides: {
            "edge-client-to-lb": {
              label: "8. Return Short URL",
              isReverse: true,
              particleColor: "success",
            },
          },
          nodeStatusMessages: {
            "node-lb": "Delivering response to Client",
            "node-client": "Created! https://sho.rt/mR8vX1",
          },
          payloadSnippet: `{\n  "status": "success",\n  "shortUrl": "https://sho.rt/mR8vX1",\n  "latencyMs": 14.2\n}`,
        },
      ],
    },
    {
      id: "redirect",
      name: "Redirect",
      icon: "redirect",
      steps: [
        {
          id: "i-r1",
          flowType: "redirect",
          stepNumber: 1,
          title: "Client → Load Balancer (লিংক ক্লিক)",
          whatHappens:
            "একজন ইউজার 'https://sho.rt/mR8vX1' লিংকে ক্লিক করলেন। রিকোয়েস্টটি লোড ব্যালেন্সারে পৌঁছালো।",
          whyItMatters:
            "HTTP GET রিকোয়েস্ট খুব দ্রুত প্রসেস করতে হবে, কারণ রিডাইরেক্ট লেটেন্সি ব্যবহারকারী সরাসরি অনুভব করে।",
          analogy: "🚪 সদর দরজা দিয়ে দ্রুত ভেতরে ঢোকা।",
          activeNodeIds: ["node-client", "node-lb"],
          activeEdgeIds: ["edge-client-to-lb"],
          edgeOverrides: {
            "edge-client-to-lb": { label: "1. Incoming Request" },
          },
          nodeStatusMessages: {
            "node-client": "GET /mR8vX1",
            "node-lb": "SSL Termination & Routing...",
          },
          payloadSnippet: `GET /mR8vX1 HTTP/1.1\nHost: sho.rt`,
        },
        {
          id: "i-r2",
          flowType: "redirect",
          stepNumber: 2,
          title: "Load Balancer → App Server 2 (সার্ভার ২-এ ডেলিভারি)",
          whatHappens:
            "লোড ব্যালেন্সার এবার সার্ভার ২-কে বেছে নিলো এবং রিকোয়েস্টটি সেখানে পাঠিয়ে দিলো।",
          whyItMatters:
            "লোড দুই সার্ভারের মধ্যে ভাগ হয়ে যায়, তাই একটির উপর চাপ পড়লে অন্যটি সামলে নেয়।",
          analogy: "👉 'এবার কাউন্টার ২ ফাঁকা, ওখানে যান!'",
          activeNodeIds: ["node-lb", "node-server-2"],
          activeEdgeIds: ["edge-lb-to-s2"],
          edgeOverrides: {
            "edge-lb-to-s2": { label: "2. Forward to Server 2" },
          },
          nodeStatusMessages: {
            "node-lb": "Round-Robin -> Server 2",
            "node-server-2": "Checking Redis Cache first...",
          },
          payloadSnippet: `upstream: app-server-2:8080 (active conns: 12)`,
        },
        {
          id: "i-r3",
          flowType: "redirect",
          stepNumber: 3,
          title: "App Server 2 → Redis Cache (ক্যাশে খোঁজা)",
          whatHappens:
            "সার্ভার ডাটাবেজের কাছে যাওয়ার আগেই দ্রুত Redis ক্যাশে 'mR8vX1' কোডটি খুঁজলো।",
          whyItMatters:
            "Cache-Aside প্যাটার্নে সবসময় আগে ক্যাশ দেখা হয়, যাতে ডাটাবেজ অপ্রয়োজনীয় চাপ থেকে বাঁচে।",
          analogy: "🔍 আলমারি খোলার আগে টেবিলের উপরের খাতাটা দেখে নেওয়া।",
          activeNodeIds: ["node-server-2", "node-cache"],
          activeEdgeIds: ["edge-s2-to-cache"],
          edgeOverrides: {
            "edge-s2-to-cache": { label: "3. Cache Lookup" },
          },
          nodeStatusMessages: {
            "node-server-2": "Checking Redis first...",
            "node-cache": "Searching key 'url:mR8vX1'",
          },
          payloadSnippet: `REDIS.GET("url:mR8vX1")`,
        },
        {
          id: "i-r4",
          flowType: "redirect",
          stepNumber: 4,
          title: "Redis Cache → App Server 2 (ক্যাশ হিট!)",
          whatHappens:
            "ওয়াও! ক্যাশেই লিংকটি পাওয়া গেলো, মাত্র ০.৮ মিলিসেকেন্ডে! ডাটাবেজে যাওয়ারই দরকার পড়লো না।",
          whyItMatters:
            "৮০-৯০% রিড রিকোয়েস্ট ক্যাশ থেকে মেটানো হয়, যার ফলে ডাটাবেজ ওভারলোড থেকে বাঁচে এবং লেটেন্সি ১-২ms এ নেমে আসে।",
          analogy: "⚡ টেবিলের উপরের খাতা থেকেই উত্তর পেয়ে যাওয়া — আলমারি খোলার প্রয়োজনই হলো না!",
          activeNodeIds: ["node-cache", "node-server-2"],
          activeEdgeIds: ["edge-s2-to-cache"],
          edgeOverrides: {
            "edge-s2-to-cache": {
              label: "4. CACHE HIT (0.8ms)",
              isReverse: true,
              particleColor: "write",
            },
          },
          nodeStatusMessages: {
            "node-cache": "CACHE HIT! key='url:mR8vX1' (0.8ms)",
            "node-server-2": "Found in RAM! Bypassing Database.",
          },
          payloadSnippet: `=> "https://example.com/system-design-intermediate"\nLatency: 0.8ms [CACHE HIT]`,
        },
        {
          id: "i-r5",
          flowType: "redirect",
          stepNumber: 5,
          title: "App Server 2 → Load Balancer (301 রেসপন্স ফেরত)",
          whatHappens:
            "সার্ভার ২ একটি HTTP 301 Moved Permanently রেসপন্স তৈরি করে লোড ব্যালেন্সারে ফেরত পাঠালো।",
          whyItMatters:
            "301 ব্যবহার করলে ব্রাউজার ঠিকানাটি মনে রাখে — পরের বার আর সার্ভারে আসতেই হয় না।",
          analogy: "📤 'ঠিকানা বদলেছে' লেখা চিঠি ফেরত পাঠানো।",
          activeNodeIds: ["node-server-2", "node-lb"],
          activeEdgeIds: ["edge-lb-to-s2"],
          edgeOverrides: {
            "edge-lb-to-s2": {
              label: "5. 301 Redirect Response",
              isReverse: true,
              particleColor: "success",
            },
          },
          nodeStatusMessages: {
            "node-server-2": "301 Moved Permanently",
            "node-lb": "Receiving response from Server 2...",
          },
          payloadSnippet: `HTTP/1.1 301 Moved Permanently\nLocation: https://example.com/system-design-intermediate`,
        },
        {
          id: "i-r6",
          flowType: "redirect",
          stepNumber: 6,
          title: "Load Balancer → Client (তাৎক্ষণিক রিডাইরেক্ট)",
          whatHappens:
            "ব্রাউজার রেসপন্স পেয়ে পলকের মধ্যে আসল ওয়েবসাইটে চলে গেলো!",
          whyItMatters:
            "ক্যাশ থাকার কারণে সমগ্র রিডাইরেক্ট সাইকেল মাত্র ৫ মিলিসেকেন্ডে শেষ হলো।",
          analogy: "🚀 সুপারফাস্ট রকেটের মতো সঠিক গন্তব্যে পৌঁছে যাওয়া।",
          activeNodeIds: ["node-lb", "node-client"],
          activeEdgeIds: ["edge-client-to-lb"],
          edgeOverrides: {
            "edge-client-to-lb": {
              label: "6. Redirecting to Long URL",
              isReverse: true,
              particleColor: "success",
            },
          },
          nodeStatusMessages: {
            "node-lb": "Delivering 301 to Client",
            "node-client": "Redirected in 4.9ms!",
          },
          payloadSnippet: `Location: https://example.com/system-design-intermediate\nTotal latency: 4.9ms`,
        },
      ],
    },
    {
      id: "redirect-miss",
      name: "Redirect · Miss",
      icon: "miss",
      steps: [
        {
          id: "i-m1",
          flowType: "redirect-miss",
          stepNumber: 1,
          title: "Client → Load Balancer (পুরোনো একটা লিংকে ক্লিক)",
          whatHappens:
            "এবার ইউজার এমন একটা লিংকে ক্লিক করলেন যেটা অনেক দিন কেউ খোলেনি। রিকোয়েস্ট লোড ব্যালেন্সারে পৌঁছালো।",
          whyItMatters:
            "রিকোয়েস্টটা দেখতে আগের মতোই — ক্যাশে আছে কি নেই, সেটা এখনো কেউ জানে না। পার্থক্য শুরু হবে তিন ধাপ পরে।",
          analogy: "🚪 একই সদর দরজা, কিন্তু এবার খোঁজা জিনিসটা সহজে পাওয়া যাবে না।",
          activeNodeIds: ["node-client", "node-lb"],
          activeEdgeIds: ["edge-client-to-lb"],
          edgeOverrides: {
            "edge-client-to-lb": { label: "1. Incoming Request" },
          },
          nodeStatusMessages: {
            "node-client": "GET /oLd7Zq",
            "node-lb": "SSL Termination & Routing...",
          },
          payloadSnippet: `GET /oLd7Zq HTTP/1.1\nHost: sho.rt`,
        },
        {
          id: "i-m2",
          flowType: "redirect-miss",
          stepNumber: 2,
          title: "Load Balancer → App Server 1 (সার্ভার ১-এ ডেলিভারি)",
          whatHappens:
            "লোড ব্যালেন্সার এবার সার্ভার ১-কে বেছে নিলো।",
          whyItMatters:
            "কোন সার্ভার পেলো তাতে কিছু আসে যায় না — দুটোই stateless, দুটোরই একই ক্যাশ ও একই ডাটাবেজে হাত আছে।",
          analogy: "👉 'কাউন্টার ১-এ যান।'",
          activeNodeIds: ["node-lb", "node-server-1"],
          activeEdgeIds: ["edge-lb-to-s1"],
          edgeOverrides: {
            "edge-lb-to-s1": { label: "2. Forward to Server 1" },
          },
          nodeStatusMessages: {
            "node-lb": "Round-Robin -> Server 1",
            "node-server-1": "Checking Redis Cache first...",
          },
          payloadSnippet: `upstream: app-server-1:8080 (active conns: 9)`,
        },
        {
          id: "i-m3",
          flowType: "redirect-miss",
          stepNumber: 3,
          title: "App Server 1 → Redis Cache (ক্যাশে খোঁজা)",
          whatHappens:
            "সার্ভার আগের মতোই প্রথমে Redis-এ 'oLd7Zq' কোডটি খুঁজলো।",
          whyItMatters:
            "Cache-aside-এর নিয়ম একটাই এবং তা কখনো বদলায় না: DB-তে যাওয়ার আগে সবসময় ক্যাশ দেখো। hit না miss, সেটা আগে থেকে জানার উপায় নেই।",
          analogy: "🔍 আলমারি খোলার আগে টেবিলের খাতাটা দেখে নেওয়া।",
          activeNodeIds: ["node-server-1", "node-cache"],
          activeEdgeIds: ["edge-s1-to-cache"],
          edgeOverrides: {
            "edge-s1-to-cache": { label: "3. Cache Lookup", particleColor: "cache" },
          },
          nodeStatusMessages: {
            "node-server-1": "Checking Redis first...",
            "node-cache": "Searching key 'url:oLd7Zq'",
          },
          payloadSnippet: `REDIS.GET("url:oLd7Zq")`,
        },
        {
          id: "i-m4",
          flowType: "redirect-miss",
          stepNumber: 4,
          title: "Redis Cache → App Server 1 (CACHE MISS!)",
          whatHappens:
            "Redis উত্তর দিলো: 'nil' — এই কোডটা আমার কাছে নেই! কারণ অনেক দিন কেউ চায়নি বলে TTL শেষ হয়ে এটা মেমোরি থেকে মুছে গেছে।",
          whyItMatters:
            "ক্যাশ কোনো ডাটাবেজ নয়, এটা সীমিত মেমোরির একটা তাক। LRU নীতিতে কম ব্যবহৃত জিনিস আপনাআপনি ফেলে দেওয়া হয় — এটা ত্রুটি নয়, নকশারই অংশ। তাই miss পথটা সবসময় লেখা থাকতে হবে।",
          analogy: "❌ খাতা খুলে দেখা গেলো পাতাটাই ছেঁড়া — এবার আলমারি খুলতেই হবে।",
          activeNodeIds: ["node-cache", "node-server-1"],
          activeEdgeIds: ["edge-s1-to-cache"],
          edgeOverrides: {
            "edge-s1-to-cache": {
              label: "4. MISS (nil)",
              isReverse: true,
              particleColor: "error",
            },
          },
          nodeStatusMessages: {
            "node-cache": "CACHE MISS — key evicted (LRU)",
            "node-server-1": "Not in RAM. Falling back to DB.",
          },
          payloadSnippet: `REDIS.GET("url:oLd7Zq")\n=> (nil)   [CACHE MISS]`,
        },
        {
          id: "i-m5",
          flowType: "redirect-miss",
          stepNumber: 5,
          title: "App Server 1 → Database (ডাটাবেজে সন্ধান)",
          whatHappens:
            "সার্ভার এবার ডাটাবেজে গেলো এবং short_code কলামের ইনডেক্স ধরে সারিটি খুঁজলো।",
          whyItMatters:
            "এই hop-টাই ক্যাশ থাকার আসল কারণ — এটি ক্যাশের চেয়ে প্রায় ২৫ গুণ ধীর। short_code-এ ইনডেক্স না থাকলে এটি হতো আরও হাজার গুণ ধীর।",
          analogy: "🗄️ অবশেষে আলমারি খুলে ফাইল বের করা।",
          activeNodeIds: ["node-server-1", "node-db"],
          activeEdgeIds: ["edge-s1-to-db"],
          edgeOverrides: {
            "edge-s1-to-db": { label: "5. DB Query", particleColor: "read" },
          },
          nodeStatusMessages: {
            "node-server-1": "Querying database...",
            "node-db": "Index scan on short_code",
          },
          payloadSnippet: `SELECT url FROM urls WHERE code = 'oLd7Zq';\n-- using idx_urls_code (B-tree)`,
        },
        {
          id: "i-m6",
          flowType: "redirect-miss",
          stepNumber: 6,
          title: "Database → App Server 1 (আসল লিংক পাওয়া গেলো)",
          whatHappens:
            "ডাটাবেজ ২১ মিলিসেকেন্ড পর আসল ঠিকানাটি ফেরত দিলো — ক্যাশের ০.৮ মিলিসেকেন্ডের তুলনায় অনেক ধীর, কিন্তু পাওয়া গেছে।",
          whyItMatters:
            "সংখ্যা দুটো পাশাপাশি রাখুন: ০.৮ms বনাম ২১ms। এই পার্থক্যটাই ক্যাশ নামের বাড়তি কম্পোনেন্টটির পুরো যুক্তি।",
          analogy: "📂 ফাইল পাওয়া গেলো, কিন্তু আলমারি হাতড়াতে সময় লেগে গেলো।",
          activeNodeIds: ["node-db", "node-server-1"],
          activeEdgeIds: ["edge-s1-to-db"],
          edgeOverrides: {
            "edge-s1-to-db": {
              label: "6. Row Found (21ms)",
              isReverse: true,
              particleColor: "success",
            },
          },
          nodeStatusMessages: {
            "node-db": "1 row returned (21ms)",
            "node-server-1": "Got it — 26x slower than cache",
          },
          payloadSnippet: `{\n  "url": "https://example.com/an-old-but-popular-post"\n}\nLatency: 21ms [DB READ]`,
        },
        {
          id: "i-m7",
          flowType: "redirect-miss",
          stepNumber: 7,
          title: "App Server 1 → Redis Cache (ক্যাশ ব্যাকফিল)",
          whatHappens:
            "ইউজারকে উত্তর পাঠানোর আগে সার্ভার লিংকটি আবার Redis-এ বসিয়ে দিলো, নতুন ২৪ ঘণ্টার TTL সহ।",
          whyItMatters:
            "এটাই cache-aside চক্রের শেষ কড়া। এই ধাপটা না থাকলে ক্যাশ কখনোই গরম হতো না — একই লিংকে দশ হাজার ক্লিক পড়লে দশ হাজার বারই DB-তে যেতে হতো। এখন পরের ক্লিক থেকেই এটি hit।",
          analogy: "📌 ফাইলটা আলমারিতে ফেরত রাখার আগে টেবিলের খাতায় টুকে রাখা।",
          activeNodeIds: ["node-server-1", "node-cache"],
          activeEdgeIds: ["edge-s1-to-cache"],
          edgeOverrides: {
            "edge-s1-to-cache": { label: "7. Backfill Cache", particleColor: "cache" },
          },
          nodeStatusMessages: {
            "node-server-1": "Repopulating cache...",
            "node-cache": "SET 'url:oLd7Zq' -> TTL 24h",
          },
          payloadSnippet: `REDIS.SETEX("url:oLd7Zq", 86400, "https://...");\n// পরের ক্লিক থেকে এটি CACHE HIT`,
        },
        {
          id: "i-m8",
          flowType: "redirect-miss",
          stepNumber: 8,
          title: "App Server 1 → Load Balancer (301 রেসপন্স ফেরত)",
          whatHappens:
            "সার্ভার HTTP 301 রেসপন্স তৈরি করে লোড ব্যালেন্সারে পাঠিয়ে দিলো।",
          whyItMatters:
            "ইউজারের দিক থেকে উত্তরটা hit-এর ক্ষেত্রে যা হতো ঠিক তা-ই — শুধু পৌঁছাতে সময় লাগলো বেশি। ধীর পথ মানে ভিন্ন উত্তর নয়।",
          analogy: "📤 একই চিঠি, শুধু লিখতে সময় বেশি লাগলো।",
          activeNodeIds: ["node-server-1", "node-lb"],
          activeEdgeIds: ["edge-lb-to-s1"],
          edgeOverrides: {
            "edge-lb-to-s1": {
              label: "8. 301 Redirect Response",
              isReverse: true,
              particleColor: "success",
            },
          },
          nodeStatusMessages: {
            "node-server-1": "301 Moved Permanently",
            "node-lb": "Receiving response from Server 1...",
          },
          payloadSnippet: `HTTP/1.1 301 Moved Permanently\nLocation: https://example.com/an-old-but-popular-post`,
        },
        {
          id: "i-m9",
          flowType: "redirect-miss",
          stepNumber: 9,
          title: "Load Balancer → Client (রিডাইরেক্ট, তবে ধীরে)",
          whatHappens:
            "ইউজার আসল সাইটে পৌঁছে গেলেন — কিন্তু ২৬ মিলিসেকেন্ডে, hit-এর ৫ মিলিসেকেন্ডের বদলে।",
          whyItMatters:
            "৯০% ক্লিক hit হলে গড় লেটেন্সি ৭ms-এর কাছাকাছি থাকে। কিন্তু hit-রেট নেমে ৫০% হলে গড় দাঁড়ায় ১৩ms — তাই cache hit ratio কেবল একটা মেট্রিক নয়, এটাই সিস্টেমের স্বাস্থ্যের প্রধান সূচক।",
          analogy: "🐢 গন্তব্য একই, শুধু রাস্তাটা লম্বা ছিল।",
          activeNodeIds: ["node-lb", "node-client"],
          activeEdgeIds: ["edge-client-to-lb"],
          edgeOverrides: {
            "edge-client-to-lb": {
              label: "9. Redirecting (26ms)",
              isReverse: true,
              particleColor: "success",
            },
          },
          nodeStatusMessages: {
            "node-lb": "Delivering 301 to Client",
            "node-client": "Redirected in 26ms (cache miss)",
          },
          payloadSnippet: `Location: https://example.com/an-old-but-popular-post\nTotal latency: 26ms  (vs 4.9ms on a cache hit)`,
        },
      ],
    },
  ],
};
