import type { LevelConfig } from "../../types";

export const reliableLevel: LevelConfig = {
  id: "reliable",
  name: "Reliable",
  badge: "🛡️ এটা ভেঙে পড়েও টিকে থাকে",
  tagline: "Token bucket leases + Redis replica + fail-open policy",
  componentCount: 8,
  conceptSummary:
    "আগের স্তরে প্রতিটি রিকোয়েস্ট Redis-এর ওপর নির্ভরশীল ছিল — অর্থাৎ রক্ষাকবচটাই সবচেয়ে বড় ঝুঁকি। এখানে প্রতিটি সার্ভার Redis থেকে একগুচ্ছ টোকেন **ইজারা** নিয়ে রাখে, তাই বেশিরভাগ সিদ্ধান্ত লোকালি হয়। Redis মরলে সার্ভার হাতের টোকেন দিয়ে চলতে থাকে, তারপর ঘোষিতভাবে fail-open-এ নামে।",
  keyConcepts: [
    "Token bucket + lease (দুই স্তরের limiter)",
    "Fail-open vs fail-closed — ঘোষিত নীতি",
    "Redis replica + Sentinel failover",
    "Hot key sharding",
    "Degraded mode observability",
  ],
  scaleEstimate: {
    writeQps: "~৫,০০০ /sec Redis-এ (২০০k API কল, ~৪০:১ lease অনুপাত)",
    readQps: "~২,০০,০০০ /sec API-তে",
    readWriteRatio: "৪০ : ১ (lease-এর কল্যাণে)",
    storage5y: "~২ GB RAM (শার্ড জুড়ে)",
    extras: [
      { label: "Lease size", value: "৪০ টোকেন / সার্ভার / ২ sec" },
      { label: "Redis timeout", value: "৫ ms → degraded mode" },
      { label: "Failover", value: "Sentinel, ~৮ sec" },
      { label: "সীমা", value: "১০,০০০ req / মিনিট / API key" },
    ],
  },
  tradeOffs: [
    {
      question: "Redis অদৃশ্য হলে রিকোয়েস্টগুলোর কী হবে?",
      options: [
        {
          name: "Fail-open — সব ঢুকতে দাও",
          note: "ইউজার টেরই পায় না। কিন্তু ঠিক সেই মুহূর্তে ভেতরের সার্ভিসের কোনো রক্ষাকবচ থাকে না — Redis-এর বিভ্রাট গোটা সিস্টেমের বিভ্রাটে রূপ নিতে পারে।",
        },
        {
          name: "Fail-closed — সব আটকাও",
          note: "ভেতরের সার্ভিস সম্পূর্ণ নিরাপদ। কিন্তু রেট লিমিটারের একটা বিভ্রাট পুরো API বন্ধ করে দেয় — সৎ ইউজাররাও ৪২৯ পায়।",
        },
        {
          name: "Local lease দিয়ে চালিয়ে যাও, তারপর fail-open",
          note: "হাতে থাকা টোকেন শেষ না হওয়া পর্যন্ত সীমা মোটামুটি বহাল থাকে; তারপর ঘোষিতভাবে খুলে দেওয়া হয় এবং অ্যালার্ম বাজে।",
        },
      ],
      chosen: "Local lease দিয়ে চালিয়ে যাও, তারপর fail-open",
      why: "প্রশ্নটা আসলে — কোন ব্যর্থতা বেশি ব্যয়বহুল। এটি একটি পাবলিক API; সেখানে 'সবাই ব্লকড' মানে ১০০% বিভ্রাট, আর 'সীমা কিছুক্ষণ শিথিল' মানে কিছুটা বাড়তি লোড। তাই fail-open। কিন্তু বিলিং বা OTP পাঠানোর মতো endpoint-এ উত্তর উল্টো হতো — সেখানে সীমা হারানোর মানে টাকা বা spam হারানো, তাই fail-closed। **এটা প্রযুক্তির নয়, ব্যবসার সিদ্ধান্ত** — আর সেটি স্পষ্টভাবে লেখা থাকতে হবে, দুর্ঘটনাক্রমে ঘটে যাওয়া নয়।",
    },
    {
      question: "প্রতিটি রিকোয়েস্টে Redis কল না করে চলা যায়?",
      options: [
        {
          name: "প্রতি রিকোয়েস্টে একটা কল",
          note: "সবচেয়ে সঠিক। কিন্তু ২,০০,০০০ req/sec মানে Redis-এ ২,০০,০০০ কল — একটা নোডের সীমার কাছাকাছি, আর প্রতিটি API কলে ০.৩ ms যোগ।",
        },
        {
          name: "Lease — একবারে ৪০টা টোকেন নাও",
          note: "Redis-এর চাপ ৪০ ভাগের এক ভাগ, আর বেশিরভাগ সিদ্ধান্ত মেমোরিতে (~০ latency)। দাম: সার্ভার হঠাৎ মরে গেলে হাতের অব্যবহৃত টোকেনগুলো নষ্ট হয়, অর্থাৎ ইউজার সামান্য কম পায়।",
        },
      ],
      chosen: "Lease",
      why: "এটা ঠিক ব্যাংক থেকে একবারে কিছু টাকা তুলে রাখার মতো — প্রতিবার ATM-এ যাওয়ার দরকার হয় না। ৪০টি টোকেনের ইজারা Redis-এর লোড ৯৭.৫% কমায়, আর সবচেয়ে খারাপ ক্ষেত্রে ভুলের পরিমাণ সার্ভার-প্রতি ৪০টি রিকোয়েস্ট — ১০,০০০ সীমার তুলনায় শব্দমাত্র। এই একটা সিদ্ধান্তই লিমিটারকে hot path থেকে সরিয়ে দেয়।",
    },
    {
      question: "একটাই জনপ্রিয় key পুরো Redis নোড গরম করে ফেললে?",
      options: [
        {
          name: "key অনুযায়ী শার্ডিং",
          note: "ভিন্ন ইউজার ভিন্ন নোডে পড়ে, তাই মোট ক্ষমতা বাড়ে। কিন্তু একটিমাত্র বিশাল ইউজার এখনো এক নোডেই পড়ে থাকে।",
        },
        {
          name: "বড় key-কে N ভাগে ভাঙা (key:0…key:9)",
          note: "একজন ইউজারের গণনাও অনেক নোডে ছড়িয়ে যায়, প্রতিটি ভাগে সীমার N ভাগের এক ভাগ। সঠিকতা সামান্য কমে, কারণ ভাগগুলো সমান হয় না।",
        },
      ],
      chosen: "দুটোই — শার্ডিং, আর শীর্ষ key-গুলোর জন্য বিভাজন",
      why: "স্বাভাবিক ট্রাফিকের জন্য শার্ডিংই যথেষ্ট। কিন্তু বাস্তবে দু-একজন বিশাল গ্রাহক থাকেই, যাদের একার ট্রাফিক বাকি সবার সমান — তাদের জন্য key ভাগ না করলে সেই একটি নোডই দেয়াল হয়ে দাঁড়ায়। বিভাজনটা শুধু ওই কয়েকটি key-তে প্রয়োগ করা হয়, সবার জন্য নয় — কারণ সঠিকতা হারানোর দাম শুধু সেখানেই ন্যায্য।",
    },
    {
      question: "Sentinel failover-এর ৮ সেকেন্ডে গণনার কী হবে?",
      options: [
        {
          name: "Replica থেকে গণনা নিয়ে চালু হবে",
          note: "গণনা মোটামুটি বজায় থাকে। কিন্তু replication asynchronous — শেষ কয়েক শত INCR হারিয়ে যেতে পারে, তাই কিছু ইউজার সামান্য বেশি কোটা পায়।",
        },
        {
          name: "শূন্য থেকে শুরু",
          note: "সরল ও অনুমানযোগ্য। কিন্তু failover-এর মুহূর্তে সবার কোটা রিসেট — অর্থাৎ ঠিক সেই সময়েই একটা burst, যখন সিস্টেম সবচেয়ে দুর্বল।",
        },
      ],
      chosen: "Replica থেকে",
      why: "রেট লিমিটারের গণনা হারানোর ক্ষতি ছোট ও ক্ষণস্থায়ী — কয়েকশো বাড়তি রিকোয়েস্ট। কিন্তু failover-এর সময় সবার কোটা একসাথে রিসেট হওয়া মানে সবচেয়ে নাজুক মুহূর্তে সর্বোচ্চ চাপ। তাই কাছাকাছি-সঠিক অবস্থা নিয়ে চালু হওয়াই নিরাপদ। এখানে AP বেছে নেওয়া হচ্ছে — সামান্য ভুল গণনা মেনে নিয়ে উপলব্ধ থাকা।",
    },
  ],
  nodes: [
    {
      id: "node-client",
      type: "simulationNode",
      position: { x: 60, y: 420 },
      data: {
        label: "Clients",
        subLabel: "২,০০,০০০ req/sec",
        category: "client",
        emoji: "📱",
        analogy: "গোটা শহর — কেউ শান্ত, কেউ প্রতি সেকেন্ডে ডাকছে।",
        description: "ট্রাফিক আগের স্তরের দশ গুণ। এখন লিমিটার নিজেই hot path-এ।",
        techSpecs: "১০,০০০ req/min per key",
      },
    },
    {
      id: "node-gateway",
      type: "simulationNode",
      position: { x: 600, y: 420 },
      data: {
        label: "API Gateway",
        subLabel: "TLS + routing",
        category: "network",
        emoji: "⚖️",
        analogy: "শহরের প্রধান ফটক — সবাই এখান দিয়েই ঢোকে।",
        description: "রিকোয়েস্ট সার্ভারদের মধ্যে ছড়ায়; sticky session নেই।",
        techSpecs: "L7 / health-checked",
      },
    },
    {
      id: "node-api-1",
      type: "simulationNode",
      position: { x: 1160, y: 200 },
      data: {
        label: "API Server 1",
        subLabel: "local token bucket",
        category: "compute",
        emoji: "🪣",
        analogy: "দারোয়ানের পকেটে ৪০টা টোকেন — প্রতিবার অফিসে দৌড়াতে হয় না।",
        description:
          "Redis থেকে ইজারা নেওয়া টোকেন হাতে রাখে। বেশিরভাগ সিদ্ধান্ত এই মেমোরিতেই হয়, নেটওয়ার্ক ছোঁয়া ছাড়াই।",
        techSpecs: "lease 40 / 2s",
      },
    },
    {
      id: "node-api-2",
      type: "simulationNode",
      position: { x: 1160, y: 640 },
      data: {
        label: "API Server 2",
        subLabel: "local token bucket",
        category: "compute",
        emoji: "🪣",
        analogy: "দ্বিতীয় দারোয়ান — তারও নিজের পকেট আছে, একই কেন্দ্রীয় কোষাগার থেকে ভরা।",
        description:
          "টোকেন ফুরালে নতুন ইজারা চায়। Redis নীরব থাকলে degraded mode-এ নামে।",
        techSpecs: "lease 40 / 2s",
      },
    },
    {
      id: "node-redis-primary",
      type: "simulationNode",
      position: { x: 1740, y: 200 },
      data: {
        label: "Redis Primary",
        subLabel: "sharded by key hash",
        category: "storage",
        emoji: "🧮",
        analogy: "কেন্দ্রীয় কোষাগার — এখান থেকেই টোকেনের ইজারা দেওয়া হয়।",
        description:
          "প্রকৃত কোটার মালিক। এখন প্রতি রিকোয়েস্টে নয়, প্রতি ইজারায় একবার ডাকা হয় — চাপ ৪০ ভাগের এক ভাগ।",
        techSpecs: "৪ শার্ড / Lua lease script",
      },
    },
    {
      id: "node-redis-replica",
      type: "simulationNode",
      position: { x: 1740, y: 640 },
      data: {
        label: "Redis Replica",
        subLabel: "async replication",
        category: "storage",
        emoji: "🗃️",
        analogy: "কোষাগারের দ্বিতীয় খাতা — প্রধানটি পুড়ে গেলে এটাই কাজে লাগে।",
        description:
          "প্রাইমারির গণনা অনুসরণ করে। Sentinel প্রাইমারিকে মৃত ঘোষণা করলে ~৮ সেকেন্ডে এটিই প্রাইমারি হয়।",
        techSpecs: "lag ~50 ms",
      },
    },
    {
      id: "node-monitor",
      type: "simulationNode",
      position: { x: 1160, y: 1080 },
      data: {
        label: "Monitoring",
        subLabel: "metrics + alerting",
        category: "analytics",
        emoji: "📊",
        analogy: "নিয়ন্ত্রণ কক্ষের বাতি — লিমিটার আন্দাজে চলতে শুরু করলে জ্বলে ওঠে।",
        description:
          "degraded mode, ৪২৯-এর হার, lease-এর ব্যর্থতা মাপে। fail-open নীরবে ঘটলে সেটা বিপজ্জনক — তাই এটি ঐচ্ছিক নয়।",
        techSpecs: "Prometheus / PagerDuty",
      },
    },
    {
      id: "node-upstream",
      type: "simulationNode",
      position: { x: 2320, y: 420 },
      data: {
        label: "Upstream Service",
        subLabel: "যাকে বাঁচাতে চাইছি",
        category: "compute",
        emoji: "⚙️",
        analogy: "রান্নাঘর — ভিড় যতই হোক, ক্ষমতা যা তা-ই।",
        description: "সীমা মেনে আসা ট্রাফিকই কেবল এখানে পৌঁছায়।",
        techSpecs: "~২,৫০,০০০ req/sec ceiling",
      },
    },
  ],
  edges: [
    {
      id: "edge-client-to-gateway",
      type: "animatedFlowEdge",
      source: "node-client",
      sourceHandle: "r-s",
      target: "node-gateway",
      targetHandle: "l-t",
      data: { label: "1. GET /api/rides", particleColor: "request" },
    },
    {
      id: "edge-gateway-to-api-1",
      type: "animatedFlowEdge",
      source: "node-gateway",
      sourceHandle: "r-s",
      target: "node-api-1",
      targetHandle: "l-t",
      data: { label: "2. route", particleColor: "request" },
    },
    {
      id: "edge-gateway-to-api-2",
      type: "animatedFlowEdge",
      source: "node-gateway",
      sourceHandle: "r-s",
      target: "node-api-2",
      targetHandle: "l-t",
      data: { label: "2. route", particleColor: "request" },
    },
    {
      id: "edge-api-1-to-redis",
      type: "animatedFlowEdge",
      source: "node-api-1",
      sourceHandle: "r-s",
      target: "node-redis-primary",
      targetHandle: "l-t",
      data: { label: "lease 40 tokens", particleColor: "write" },
    },
    {
      id: "edge-api-2-to-redis",
      type: "animatedFlowEdge",
      source: "node-api-2",
      sourceHandle: "r-s",
      target: "node-redis-primary",
      targetHandle: "b-t",
      data: { label: "lease 40 tokens", particleColor: "write" },
    },
    {
      id: "edge-redis-replication",
      type: "animatedFlowEdge",
      source: "node-redis-primary",
      sourceHandle: "b-s",
      target: "node-redis-replica",
      targetHandle: "t-t",
      data: { label: "async replication", particleColor: "meta" },
    },
    {
      id: "edge-api-2-to-replica",
      type: "animatedFlowEdge",
      source: "node-api-2",
      sourceHandle: "r-s",
      target: "node-redis-replica",
      targetHandle: "l-t",
      data: { label: "after failover", particleColor: "write" },
    },
    {
      id: "edge-api-1-to-upstream",
      type: "animatedFlowEdge",
      source: "node-api-1",
      sourceHandle: "r-s",
      target: "node-upstream",
      targetHandle: "t-t",
      data: { label: "forward (allowed)", particleColor: "read" },
    },
    {
      id: "edge-api-2-to-monitor",
      type: "animatedFlowEdge",
      source: "node-api-2",
      sourceHandle: "b-s",
      target: "node-monitor",
      targetHandle: "r-t",
      data: { label: "degraded_mode = 1", particleColor: "event" },
    },
  ],
  flows: [
    {
      id: "allowed",
      name: "Allowed",
      icon: "allow",
      steps: [
        {
          id: "rl-r-a1",
          flowType: "allowed",
          stepNumber: 1,
          title: "Server leases 40 tokens up front (সার্ভার আগেভাগে ৪০টা টোকেন তুলে নিলো)",
          whatHappens:
            "সার্ভার ১ Redis-কে বললো: 'এই key-এর কোটা থেকে আমাকে ৪০টা টোকেন দাও, ২ সেকেন্ডের জন্য'। Redis কেন্দ্রীয় গণনা থেকে ৪০ কেটে নিয়ে ইজারা দিলো।",
          whyItMatters:
            "এটাই এই স্তরের মূল চাল: Redis-এর সাথে কথা হয় **ইজারা প্রতি**, রিকোয়েস্ট প্রতি নয়। ২,০০,০০০ req/sec-এ Redis দেখে মাত্র ৫,০০০ কল।",
          analogy: "🏧 প্রতিবার ATM-এ না গিয়ে একবারে কিছু টাকা তুলে পকেটে রাখা।",
          activeNodeIds: ["node-api-1", "node-redis-primary"],
          activeEdgeIds: ["edge-api-1-to-redis"],
          nodeStatusMessages: {
            "node-api-1": "Requesting lease: 40 tokens",
            "node-redis-primary": "quota 6,240 → 6,200 (leased 40)",
          },
          payloadSnippet: `-- lease.lua\nlocal left = tonumber(redis.call('GET', KEYS[1]) or ARGV[1])\nlocal take = math.min(left, tonumber(ARGV[2]))  -- 40\nredis.call('DECRBY', KEYS[1], take)\nreturn take`,
        },
        {
          id: "rl-r-a2",
          flowType: "allowed",
          stepNumber: 2,
          title: "Requests are decided locally (সিদ্ধান্ত হচ্ছে মেমোরিতেই)",
          whatHappens:
            "এরপরের ৪০টা রিকোয়েস্ট এলো, আর প্রতিটির সিদ্ধান্ত হলো সার্ভারের নিজের বালতি থেকেই। Redis-এ একটাও কল গেল না।",
          whyItMatters:
            "লিমিটার এখন hot path থেকে সরে গেছে — সিদ্ধান্তে নেটওয়ার্ক নেই, তাই p99 latency-তে লিমিটারের অবদান কার্যত শূন্য। রক্ষাকবচ আর নিজেই বাধা নয়।",
          analogy: "🪣 পকেট থেকেই টোকেন বেরোচ্ছে — অফিসে দৌড়াতে হচ্ছে না।",
          activeNodeIds: ["node-client", "node-gateway", "node-api-1"],
          activeEdgeIds: ["edge-client-to-gateway", "edge-gateway-to-api-1"],
          nodeStatusMessages: {
            "node-gateway": "→ API Server 1",
            "node-api-1": "bucket 40 → 39 · local, 0 network hops",
          },
          payloadSnippet: `if (bucket.tokens > 0) {\n  bucket.tokens--;      // ~80 ns, কোনো I/O নেই\n  return ALLOW;\n}\n// টোকেন ফুরালে তবেই Redis`,
        },
        {
          id: "rl-r-a3",
          flowType: "allowed",
          stepNumber: 3,
          title: "Forwarded to the upstream (ভেতরে গেলো)",
          whatHappens:
            "অনুমতি পাওয়া রিকোয়েস্ট আসল সার্ভিসে পৌঁছালো এবং উত্তর নিয়ে ফিরলো।",
          whyItMatters:
            "মোট চিত্রটা দেখুন: ২,০০,০০০ req/sec ঢুকছে, Redis দেখছে ৫,০০০, আর ভেতরের সার্ভিস পাচ্ছে ঠিক সীমার ভেতরের অংশ। তিনটে আলাদা স্তরে তিন রকম চাপ — এটাই ভালো নকশার চেহারা।",
          analogy: "🍳 রান্নাঘরে অর্ডার গেলো — লাইনের দৈর্ঘ্য যাই হোক, ভেতরের ছন্দ একই।",
          activeNodeIds: ["node-api-1", "node-upstream"],
          activeEdgeIds: ["edge-api-1-to-upstream"],
          nodeStatusMessages: {
            "node-api-1": "Forwarding (bucket 39 left)",
            "node-upstream": "Handling /api/rides…",
          },
          payloadSnippet: `HTTP/1.1 200 OK\nX-RateLimit-Limit: 10000\nX-RateLimit-Remaining: 6199`,
        },
        {
          id: "rl-r-a4",
          flowType: "allowed",
          stepNumber: 4,
          title: "Lease renewed before it runs dry (ফুরানোর আগেই নতুন ইজারা)",
          whatHappens:
            "বালতিতে ৮টা টোকেন বাকি থাকতেই সার্ভার পরের ইজারা চেয়ে নিলো — ব্যাকগ্রাউন্ডে, চলমান রিকোয়েস্ট আটকে না রেখে।",
          whyItMatters:
            "শূন্য হওয়ার পর ইজারা চাইলে ওই কয়েক মিলিসেকেন্ডে রিকোয়েস্টগুলো হয় অপেক্ষা করত, নয় ভুলভাবে ৪২৯ খেত। আগেভাগে ভরে নেওয়ায় সেই ফাঁকটা কখনো তৈরিই হয় না।",
          analogy: "⛽ ট্যাংক খালি হওয়ার অপেক্ষা না করে রিজার্ভ বাতি জ্বলতেই তেল ভরা।",
          activeNodeIds: ["node-api-1", "node-redis-primary", "node-redis-replica"],
          activeEdgeIds: ["edge-api-1-to-redis", "edge-redis-replication"],
          nodeStatusMessages: {
            "node-api-1": "8 left → prefetching next lease",
            "node-redis-primary": "quota 6,200 → 6,160",
            "node-redis-replica": "replicating…",
          },
          payloadSnippet: `if (bucket.tokens < LOW_WATER) {   // 8\n  void renewLeaseInBackground();   // রিকোয়েস্ট আটকায় না\n}`,
        },
      ],
    },
    {
      id: "throttled",
      name: "Throttled",
      icon: "block",
      steps: [
        {
          id: "rl-r-t1",
          flowType: "throttled",
          stepNumber: 1,
          title: "Central quota is exhausted (কেন্দ্রীয় কোটা ফুরালো)",
          whatHappens:
            "একটা key-এর ১০,০০০ কোটা এই মিনিটে শেষ। সার্ভার ২ নতুন ইজারা চাইলো, Redis দিলো শূন্য।",
          whyItMatters:
            "সীমাটা এখনো **কেন্দ্রীয়ভাবেই** রক্ষিত — ইজারা কেবল সিদ্ধান্তকে ছড়িয়ে দেয়, কোটাকে বাড়ায় না। কেউ যত সার্ভারেই পড়ুক, কোষাগার একটাই।",
          analogy: "🏧 কোষাগার খালি — পকেট ভরার আর উপায় নেই।",
          activeNodeIds: ["node-api-2", "node-redis-primary"],
          activeEdgeIds: ["edge-api-2-to-redis"],
          edgeOverrides: {
            "edge-api-2-to-redis": {
              label: "lease → 0 tokens",
              isReverse: true,
              particleColor: "error",
            },
          },
          nodeStatusMessages: {
            "node-api-2": "Lease request → 0 granted",
            "node-redis-primary": "quota 0 / 10,000 — resets in 31s",
          },
          payloadSnippet: `lease.lua → 0\n// বালতি ভরার কিছু নেই, তাই পরের রিকোয়েস্ট থেকেই 429`,
        },
        {
          id: "rl-r-t2",
          flowType: "throttled",
          stepNumber: 2,
          title: "429 with an honest Retry-After (সৎ উত্তর — কখন ফিরে আসবে)",
          whatHappens:
            "সার্ভার ক্লায়েন্টকে ৪২৯ দিলো, সাথে `Retry-After: 31` — কেন্দ্রীয় উইন্ডো ঠিক ৩১ সেকেন্ড পরে রিসেট হবে।",
          whyItMatters:
            "সংখ্যাটা আন্দাজ নয়, Redis-এর TTL থেকে আসা। সঠিক `Retry-After` দিলে ক্লায়েন্ট লাইব্রেরিগুলো ঠিক সময়েই ফেরে — ফলে বারবার চেষ্টা করে সিস্টেমকে আরও ভোগানোর প্রবণতাটাই মরে যায়।",
          analogy: "🕐 'সাড়ে বারোটায় আবার আসুন' — অনুমান নয়, ঘড়ি দেখে বলা।",
          activeNodeIds: ["node-api-2", "node-client"],
          activeEdgeIds: ["edge-gateway-to-api-2", "edge-client-to-gateway"],
          edgeOverrides: {
            "edge-gateway-to-api-2": {
              label: "429",
              isReverse: true,
              particleColor: "error",
            },
            "edge-client-to-gateway": {
              label: "429 Too Many Requests",
              isReverse: true,
              particleColor: "error",
            },
          },
          nodeStatusMessages: {
            "node-api-2": "HTTP 429 · Retry-After: 31",
            "node-client": "Backing off 31s",
          },
          payloadSnippet: `HTTP/1.1 429 Too Many Requests\nRetry-After: 31\nX-RateLimit-Limit: 10000\nX-RateLimit-Remaining: 0\nX-RateLimit-Reset: 1730458111`,
        },
        {
          id: "rl-r-t3",
          flowType: "throttled",
          stepNumber: 3,
          title: "One noisy key does not touch the rest (একজনের শাস্তি সবার নয়)",
          whatHappens:
            "ওই key ব্লকড, কিন্তু বাকি সব গ্রাহকের ট্রাফিক স্বাভাবিকভাবেই চলছে — কারণ তাদের গণনা ভিন্ন শার্ডে, ভিন্ন বালতিতে।",
          whyItMatters:
            "এটাই bulkhead নীতি: এক গ্রাহকের বাড়াবাড়ি যেন অন্য গ্রাহকের সেবা নষ্ট না করে। শার্ডিং শুধু ক্ষমতা বাড়ায় না, **বিচ্ছিন্নতা**ও দেয়।",
          analogy: "🚪 এক ঘরে আগুন লাগলেও পাশের ঘরের দরজা বন্ধ — আগুন ছড়ায় না।",
          activeNodeIds: ["node-api-1", "node-upstream", "node-redis-primary"],
          activeEdgeIds: ["edge-api-1-to-upstream"],
          nodeStatusMessages: {
            "node-api-1": "অন্য key-গুলো স্বাভাবিক",
            "node-redis-primary": "shard 2 hot · shard 0,1,3 normal",
            "node-upstream": "ভেতরের চাপ অপরিবর্তিত",
          },
          payloadSnippet: `shard = hash("ak_live_9f2c") % 4   →  2\n// শুধু shard 2 গরম; বাকিরা এই ঝড়ের কথা জানেই না`,
        },
      ],
    },
    {
      id: "limiter-down",
      name: "Redis down",
      icon: "failover",
      steps: [
        {
          id: "rl-r-d1",
          flowType: "limiter-down",
          stepNumber: 1,
          title: "Redis stops answering (Redis নীরব হয়ে গেল)",
          whatHappens:
            "প্রাইমারি Redis নোড আর উত্তর দিচ্ছে না। সার্ভার ২-এর ইজারা কল ৫ ms-এ টাইমআউট করলো।",
          whyItMatters:
            "কড়া টাইমআউটটাই এখানে আসল নায়ক। এটা না থাকলে প্রতিটি রিকোয়েস্ট TCP টাইমআউট (~৩০ sec) পর্যন্ত ঝুলে থাকত, thread pool ভরে যেত — আর Redis-এর বিভ্রাট মুহূর্তেই API-র সম্পূর্ণ বিভ্রাটে পরিণত হতো।",
          analogy: "📵 কোষাগারের ফোন বাজছে, কেউ ধরছে না — দারোয়ান পাঁচ সেকেন্ড পর ফোন রেখে দিলো।",
          activeNodeIds: ["node-api-2", "node-redis-primary"],
          activeEdgeIds: ["edge-api-2-to-redis"],
          edgeOverrides: {
            "edge-api-2-to-redis": {
              label: "timeout after 5 ms",
              particleColor: "error",
            },
          },
          nodeStatusMessages: {
            "node-api-2": "⚠️ lease timeout (5 ms)",
            "node-redis-primary": "❌ unreachable",
          },
          payloadSnippet: `redis.call(timeout = 5ms)  →  ETIMEDOUT\n// থ্রেড ছেড়ে দাও, রিকোয়েস্টকে ঝুলিয়ে রেখো না`,
        },
        {
          id: "rl-r-d2",
          flowType: "limiter-down",
          stepNumber: 2,
          title: "Local buckets keep the limit alive (হাতের টোকেনেই সীমা টিকে রইলো)",
          whatHappens:
            "সার্ভারের বালতিতে তখনো ২৩টা টোকেন ছিল। পরের ২৩টা রিকোয়েস্ট আগের মতোই সঠিকভাবে সীমার ভেতরে সার্ভ হলো — কেউ টেরই পেল না।",
          whyItMatters:
            "ইজারার নকশাটা এখানে দ্বিতীয়বার মূল্য দিচ্ছে: এটা শুধু latency কমায় না, একটা **ছোট বিভ্রাটের বাফার**ও তৈরি করে রাখে। বেশিরভাগ Redis হেঁচকি এই বাফারের ভেতরেই মিটে যায়, কেউ জানতেও পারে না।",
          analogy: "💵 ব্যাংক বন্ধ, কিন্তু পকেটে টাকা আছে — আজকের বাজার চলে যাবে।",
          activeNodeIds: ["node-api-2", "node-upstream"],
          activeEdgeIds: ["edge-gateway-to-api-2"],
          nodeStatusMessages: {
            "node-api-2": "bucket 23 → serving normally",
            "node-upstream": "চাপ স্বাভাবিক",
          },
          payloadSnippet: `// degraded, কিন্তু এখনো সঠিক\nbucket.tokens = 23  →  22  →  21 …\n// টোকেন ফুরালে তবেই নীতি প্রশ্ন হয়ে দাঁড়াবে`,
        },
        {
          id: "rl-r-d3",
          flowType: "limiter-down",
          stepNumber: 3,
          title: "Tokens run out — the policy decides (টোকেন শেষ, এখন নীতিই সিদ্ধান্ত নেবে)",
          whatHappens:
            "বালতি খালি, Redis এখনো নীরব। ঘোষিত নীতি অনুযায়ী সার্ভার **fail-open**-এ গেল — রিকোয়েস্ট ঢুকতে দিচ্ছে, কিন্তু degraded পতাকা তুলে দিয়ে।",
          whyItMatters:
            "এটা কোনো দুর্ঘটনা নয়, আগেই লেখা একটা সিদ্ধান্ত। পাবলিক read API-তে 'সবাই ব্লকড' মানে ১০০% বিভ্রাট; 'সীমা কিছুক্ষণ শিথিল' মানে কিছুটা বাড়তি লোড, যা ভেতরের সার্ভিসের ২,৫০,০০০ ceiling সামলে নেবে। বিলিং বা OTP endpoint-এ ঠিক এই জায়গাতেই উত্তর হতো fail-closed।",
          analogy: "🚦 বাতি নষ্ট — মোড় বন্ধ না করে ট্রাফিক পুলিশ হাতে সামলাচ্ছে, আর কন্ট্রোল রুমে খবর গেছে।",
          activeNodeIds: ["node-api-2", "node-monitor", "node-upstream"],
          activeEdgeIds: ["edge-api-2-to-monitor"],
          nodeStatusMessages: {
            "node-api-2": "🔓 FAIL-OPEN · limits not enforced",
            "node-monitor": "🚨 degraded_mode = 1 → paging on-call",
            "node-upstream": "লোড বাড়ছে, তবু ceiling-এর নিচে",
          },
          payloadSnippet: `// নীতিটা কোডে লেখা, তর্কে নয়\nconst ON_LIMITER_FAILURE = "fail-open";  // পাবলিক read API\n// billing / OTP endpoint → "fail-closed"\n\nmetrics.gauge("limiter.degraded", 1);`,
        },
        {
          id: "rl-r-d4",
          flowType: "limiter-down",
          stepNumber: 4,
          title: "Sentinel promotes the replica (Sentinel replica-কে প্রাইমারি বানালো)",
          whatHappens:
            "~৮ সেকেন্ড পর Sentinel প্রাইমারিকে মৃত ঘোষণা করে replica-কে উন্নীত করলো। সার্ভাররা নতুন ঠিকানায় ইজারা চাইলো, আর গণনা replica-র (সামান্য পুরনো) অবস্থা থেকেই চলতে লাগলো।",
          whyItMatters:
            "replication asynchronous, তাই শেষ কয়েকশো গণনা হারিয়েছে — কিছু ইউজার একটু বেশি কোটা পেয়ে গেছে। এটা মেনে নেওয়া হয়েছে সজ্ঞানে: failover-এ সবার কোটা শূন্য থেকে শুরু হলে সিস্টেমের সবচেয়ে দুর্বল মুহূর্তেই সর্বোচ্চ burst আসত।",
          analogy: "🗃️ দ্বিতীয় খাতা খোলা হলো — শেষ কয়েক লাইন নেই, কিন্তু হিসাব প্রায় ঠিকই আছে।",
          activeNodeIds: ["node-redis-replica", "node-api-2", "node-monitor"],
          activeEdgeIds: ["edge-api-2-to-replica"],
          nodeStatusMessages: {
            "node-redis-replica": "PROMOTED → primary (lag was 50 ms)",
            "node-api-2": "🔒 limits enforced again",
            "node-monitor": "degraded_mode = 0 · duration 8.2s",
          },
          payloadSnippet: `+switch-master mymaster 10.0.1.7 6379 10.0.2.4 6379\n\n// ফিরে আসার হিসাব\nবিভ্রাটকাল      : 8.2s\nহারানো গণনা    : ~400\nবাড়তি ট্রাফিক  : ~2%  (ceiling-এর অনেক নিচে)`,
        },
      ],
    },
  ],
};
