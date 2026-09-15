import type { LevelConfig } from "../../types";

export const scalableLevel: LevelConfig = {
  id: "scalable",
  name: "Scalable",
  badge: "📈 এটা চাপ সামলায়",
  tagline: "Many servers, one shared counter — atomic INCR in Redis",
  componentCount: 7,
  conceptSummary:
    "লোড ব্যালান্সারের পেছনে তিনটে সার্ভার এলো, আর সাথে সাথেই in-memory গণনা মিথ্যা হয়ে গেল — প্রত্যেকে আলাদা হিসাব রাখছে, ফলে ঘোষিত সীমা নিঃশব্দে তিনগুণ। সমাধান: গণনাটা সার্ভারের বাইরে, সবার সাধারণ একটা জায়গায় — Redis-এ, atomic INCR দিয়ে।",
  keyConcepts: [
    "Shared state across replicas",
    "Atomic INCR + EXPIRE (race-free)",
    "Sliding window counter",
    "Lua script — একটাই round trip",
  ],
  scaleEstimate: {
    writeQps: "~২০,০০০ /sec (প্রতিটি রিকোয়েস্টে একটা INCR)",
    readQps: "~২০,০০০ /sec",
    readWriteRatio: "১ : ১",
    storage5y: "~২০০ MB RAM (১০ লক্ষ সক্রিয় key × ~২০০ B)",
    extras: [
      { label: "সার্ভার", value: "৩টি (auto-scaling group)" },
      { label: "Redis latency", value: "~০.৩ ms (একই AZ)" },
      { label: "সীমা", value: "১,০০০ req / মিনিট / API key" },
    ],
  },
  tradeOffs: [
    {
      question: "গণনা কোথায় থাকবে — এটাই এই স্তরের মূল প্রশ্ন",
      options: [
        {
          name: "প্রতিটি সার্ভারের মেমোরিতে",
          note: "দ্রুত, কিন্তু ভুল। ৩টি সার্ভার মানে প্রত্যেকে নিজের হিসাবে ১,০০০ পর্যন্ত দেয় — বাস্তব সীমা দাঁড়ায় ৩,০০০। সার্ভার সংখ্যা বদলালে সীমাও নিঃশব্দে বদলে যায়।",
        },
        {
          name: "সার্ভার-প্রতি সীমা ভাগ করে দেওয়া (limit / N)",
          note: "প্রতিটি সার্ভার ৩৩৩ পর্যন্ত দেয়। নেটওয়ার্ক কল লাগে না। কিন্তু লোড ব্যালান্সার নিখুঁতভাবে সমান ভাগ করে না — এক সার্ভারে বেশি পড়লে সেই ইউজার সীমার অনেক আগেই ৪২৯ খায়।",
        },
        {
          name: "Redis-এ শেয়ার্ড কাউন্টার",
          note: "সব সার্ভার একই সংখ্যা দেখে, সীমা সঠিক থাকে। দাম: প্রতি রিকোয়েস্টে একটা নেটওয়ার্ক হপ, আর Redis নিজেই একটা নতুন নির্ভরতা।",
        },
      ],
      chosen: "Redis-এ শেয়ার্ড কাউন্টার",
      why: "রেট লিমিটারের গোটা প্রতিশ্রুতিই একটা সংখ্যা — '১,০০০/মিনিট'। সেই সংখ্যাটাই যদি সার্ভার কতগুলো চলছে তার ওপর নির্ভর করে, তাহলে প্রতিশ্রুতিটাই অর্থহীন। ০.৩ ms নেটওয়ার্ক হপ এই সঠিকতার তুলনায় সস্তা। তবে খেয়াল রাখুন — এই সিদ্ধান্তেই Redis একটা single point of failure হয়ে দাঁড়ালো; reliable স্তরে সেটাই সামলাতে হবে।",
    },
    {
      question: "একই সময়ে দুই সার্ভার গুনলে race condition হবে না?",
      options: [
        {
          name: "GET তারপর SET",
          note: "সরল, কিন্তু ভাঙা। দুটি সার্ভার একই সাথে ৯৯৯ পড়ে, দুজনেই ১,০০০ লেখে — একটা রিকোয়েস্ট হিসাবের বাইরে চলে যায়। ট্রাফিক বাড়লে এই ফাঁক বাড়তেই থাকে।",
        },
        {
          name: "INCR (atomic)",
          note: "Redis একক থ্রেডে চলে, তাই INCR নিজেই অবিভাজ্য — পড়া ও লেখা একসাথে। কোনো লক লাগে না।",
        },
        {
          name: "Lua script (INCR + EXPIRE + সিদ্ধান্ত)",
          note: "পুরো যুক্তিটা Redis-এর ভেতরেই এক ধাপে চলে। একটাই round trip, আর মাঝপথে কেউ ঢুকতে পারে না।",
        },
      ],
      chosen: "Lua script",
      why: "শুধু INCR-ও race-free, কিন্তু তারপর EXPIRE বসাতে দ্বিতীয় একটা কল লাগে — আর ঠিক ওই দুই কলের মাঝখানে প্রসেস মরে গেলে key-টা **চিরকাল** থেকে যায়, ইউজার আজীবন ব্লকড। Lua-তে দুটো একসাথে হয় বলে সেই ফাঁকটাই থাকে না, উপরন্তু round trip অর্ধেক।",
    },
    {
      question: "Fixed window-এর সীমানা সমস্যা কীভাবে ঠিক করব?",
      options: [
        {
          name: "Sliding window log",
          note: "প্রতিটি টাইমস্ট্যাম্প sorted set-এ। একদম নিখুঁত, কিন্তু ১,০০০ সীমার জন্য প্রতি ইউজারে ১,০০০ entry — ১০ লক্ষ ইউজারে Redis-এর মেমোরি উড়ে যাবে।",
        },
        {
          name: "Sliding window counter",
          note: "চলতি ও আগের উইন্ডো — দুটো সংখ্যা রেখে ওজন করে হিসাব: `আগের × বাকি অংশ + চলতি`। প্রায় নিখুঁত, খরচ মাত্র দুটো সংখ্যা।",
        },
        {
          name: "Fixed window রেখে দেওয়া",
          note: "সবচেয়ে সস্তা, কিন্তু সীমানায় দ্বিগুণ burst থেকেই যায়।",
        },
      ],
      chosen: "Sliding window counter",
      why: "নিখুঁত হিসাবের জন্য ১,০০০ গুণ মেমোরি দেওয়ার কোনো মানে হয় না — যেখানে দুটো সংখ্যা দিয়েই ভুলের হার কয়েক শতাংশে নেমে আসে। রেট লিমিটিং ব্যাংকের হিসাব নয়; উদ্দেশ্য ভেতরের সার্ভিসকে ছাদের নিচে রাখা, প্রতিটি রিকোয়েস্ট আদালতে প্রমাণ করা নয়।",
    },
    {
      question: "Redis ধীর হয়ে গেলে রিকোয়েস্টগুলো কী করবে?",
      options: [
        {
          name: "অপেক্ষা করবে (blocking)",
          note: "হিসাব সবসময় সঠিক থাকে। কিন্তু Redis-এর latency সরাসরি প্রতিটি API কলের latency হয়ে যায় — লিমিটার নিজেই বটলনেক।",
        },
        {
          name: "টাইমআউট (~৫ ms) তারপর সিদ্ধান্ত",
          note: "লিমিটার কখনোই ভেতরের সার্ভিসের চেয়ে ধীর হয় না। কিন্তু টাইমআউট হলে অনুমান করে চলতে হয়।",
        },
      ],
      chosen: "টাইমআউট (~৫ ms)",
      why: "রক্ষাকবচ যদি নিজেই বিপদের উৎস হয়, তবে সেটা রক্ষাকবচ নয়। কড়া টাইমআউট নিশ্চিত করে যে Redis-এর খারাপ দিনেও API-র latency আটকে থাকে না। টাইমআউটের পরে **কী** করব — ঢুকতে দেব না আটকাব — সেটাই reliable স্তরের সবচেয়ে গুরুত্বপূর্ণ প্রশ্ন।",
    },
  ],
  nodes: [
    {
      id: "node-client",
      type: "simulationNode",
      position: { x: 60, y: 400 },
      data: {
        label: "Clients",
        subLabel: "হাজারো API consumer",
        category: "client",
        emoji: "📱",
        analogy: "শহরের সব যাত্রী — কে কতবার ডাকছে, কেউ আলাদা করে খেয়াল রাখছে না।",
        description: "একই API key থেকে আসা কল এখন যেকোনো সার্ভারে পড়তে পারে।",
        techSpecs: "~২০,০০০ req/sec",
      },
    },
    {
      id: "node-lb",
      type: "simulationNode",
      position: { x: 620, y: 400 },
      data: {
        label: "Load Balancer",
        subLabel: "Round-robin / least-conn",
        category: "network",
        emoji: "⚖️",
        analogy: "গেটে দাঁড়ানো ব্যবস্থাপক — ভিড়কে তিনটে লাইনে ভাগ করে দেয়।",
        description:
          "রিকোয়েস্ট তিনটি সার্ভারে ছড়িয়ে দেয়। এর ফলেই একই ইউজারের পরপর দুটো কল দুই সার্ভারে পড়তে পারে — আর তখনই in-memory গণনা মিথ্যা হয়ে যায়।",
        techSpecs: "L7 / sticky sessions off",
      },
    },
    {
      id: "node-api-1",
      type: "simulationNode",
      position: { x: 1180, y: 150 },
      data: {
        label: "API Server 1",
        subLabel: "limiter middleware",
        category: "compute",
        emoji: "🚦",
        analogy: "প্রথম দারোয়ান — নিজের খাতা নেই, সবাই একই কেন্দ্রীয় খাতা দেখে।",
        description: "সিদ্ধান্ত নেয় না; Redis-কে জিজ্ঞেস করে ও উত্তর মেনে চলে।",
        techSpecs: "stateless",
      },
    },
    {
      id: "node-api-2",
      type: "simulationNode",
      position: { x: 1180, y: 400 },
      data: {
        label: "API Server 2",
        subLabel: "limiter middleware",
        category: "compute",
        emoji: "🚦",
        analogy: "দ্বিতীয় দারোয়ান — একই খাতা, তাই একই হিসাব।",
        description:
          "একই API key-এর পরের কলটা এখানে পড়লেও গণনা ধারাবাহিক থাকে, কারণ গণনাটা এখানে নেই।",
        techSpecs: "stateless",
      },
    },
    {
      id: "node-api-3",
      type: "simulationNode",
      position: { x: 1180, y: 650 },
      data: {
        label: "API Server 3",
        subLabel: "limiter middleware",
        category: "compute",
        emoji: "🚦",
        analogy: "তৃতীয় দারোয়ান — সংখ্যা বাড়লেও সীমা বাড়ে না, এটাই আসল অর্জন।",
        description:
          "auto-scaling-এ সার্ভার যোগ বা বাদ হলেও ঘোষিত সীমা অপরিবর্তিত থাকে।",
        techSpecs: "stateless",
      },
    },
    {
      id: "node-redis",
      type: "simulationNode",
      position: { x: 1760, y: 400 },
      data: {
        label: "Redis",
        subLabel: "শেয়ার্ড counter + Lua",
        category: "storage",
        emoji: "🧮",
        analogy: "মাঝখানে ঝোলানো একটাই বড় বোর্ড — সব দারোয়ান এখানেই দাগ কাটে।",
        description:
          "প্রতিটি API key-এর জন্য উইন্ডো-ভিত্তিক গণনা রাখে। একক থ্রেড হওয়ায় INCR স্বাভাবিকভাবেই atomic; Lua script পুরো সিদ্ধান্তটা এক round trip-এ সারে।",
        techSpecs: "in-memory / TTL auto-cleanup",
      },
    },
    {
      id: "node-upstream",
      type: "simulationNode",
      position: { x: 2320, y: 400 },
      data: {
        label: "Upstream Service",
        subLabel: "যাকে বাঁচাতে চাইছি",
        category: "compute",
        emoji: "⚙️",
        analogy: "রান্নাঘর — লাইন যতই লম্বা হোক, একসাথে এতগুলোর বেশি রাঁধতে পারে না।",
        description: "সীমা মেনে আসা ট্রাফিকই কেবল এখানে পৌঁছায়।",
        techSpecs: "~২৫,০০০ req/sec ceiling",
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
      data: { label: "1. GET /api/rides", particleColor: "request" },
    },
    {
      id: "edge-lb-to-api-1",
      type: "animatedFlowEdge",
      source: "node-lb",
      sourceHandle: "r-s",
      target: "node-api-1",
      targetHandle: "l-t",
      data: { label: "2a. route", particleColor: "request" },
    },
    {
      id: "edge-lb-to-api-2",
      type: "animatedFlowEdge",
      source: "node-lb",
      sourceHandle: "r-s",
      target: "node-api-2",
      targetHandle: "l-t",
      data: { label: "2b. route", particleColor: "request" },
    },
    {
      id: "edge-lb-to-api-3",
      type: "animatedFlowEdge",
      source: "node-lb",
      sourceHandle: "r-s",
      target: "node-api-3",
      targetHandle: "l-t",
      data: { label: "2c. route", particleColor: "request" },
    },
    {
      id: "edge-api-1-to-redis",
      type: "animatedFlowEdge",
      source: "node-api-1",
      sourceHandle: "r-s",
      target: "node-redis",
      targetHandle: "l-t",
      data: { label: "3. EVAL limit.lua", particleColor: "write" },
    },
    {
      id: "edge-api-2-to-redis",
      type: "animatedFlowEdge",
      source: "node-api-2",
      sourceHandle: "r-s",
      target: "node-redis",
      targetHandle: "l-t",
      data: { label: "3. EVAL limit.lua", particleColor: "write" },
    },
    {
      id: "edge-api-3-to-redis",
      type: "animatedFlowEdge",
      source: "node-api-3",
      sourceHandle: "r-s",
      target: "node-redis",
      targetHandle: "l-t",
      data: { label: "3. EVAL limit.lua", particleColor: "write" },
    },
    {
      id: "edge-api-2-to-upstream",
      type: "animatedFlowEdge",
      source: "node-api-2",
      sourceHandle: "b-s",
      target: "node-upstream",
      targetHandle: "b-t",
      data: { label: "4. Forward (allowed)", particleColor: "read" },
    },
  ],
  flows: [
    {
      id: "allowed",
      name: "Allowed",
      icon: "allow",
      steps: [
        {
          id: "rl-s-a1",
          flowType: "allowed",
          stepNumber: 1,
          title: "Request hits the load balancer (রিকোয়েস্ট ব্যালান্সারে)",
          whatHappens:
            "একই API key-এর আগের কলটা গিয়েছিল সার্ভার ১-এ। এবারেরটা ব্যালান্সার পাঠাচ্ছে সার্ভার ২-এ।",
          whyItMatters:
            "এখানেই functional স্তরের নকশা ভেঙে পড়ে। sticky session ছাড়া একই ইউজারের পরপর দুটো কল দুই মেশিনে পড়ে — আর মেমোরির গণনা মেশিনের সাথে বাঁধা।",
          analogy: "🚶 একই লোক এবার অন্য লাইনে গিয়ে দাঁড়ালো।",
          activeNodeIds: ["node-client", "node-lb"],
          activeEdgeIds: ["edge-client-to-lb"],
          nodeStatusMessages: {
            "node-client": "GET /api/rides (key: ak_live_9f2…)",
            "node-lb": "least-conn → API Server 2",
          },
          payloadSnippet: `GET /api/rides HTTP/1.1\nAuthorization: Bearer ak_live_9f2c…\nX-Forwarded-For: 103.94.11.7`,
        },
        {
          id: "rl-s-a2",
          flowType: "allowed",
          stepNumber: 2,
          title: "Server asks Redis, not itself (সার্ভার নিজেকে নয়, Redis-কে জিজ্ঞেস করলো)",
          whatHappens:
            "সার্ভার ২ নিজের কোনো হিসাব রাখে না। সে Redis-এ একটা ছোট Lua script পাঠালো — 'এই key-এর গণনা বাড়াও, TTL বসাও, আর বলো ঢুকতে দেব কিনা'।",
          whyItMatters:
            "তিনটে কাজ (গণনা, মেয়াদ, সিদ্ধান্ত) একটাই round trip-এ হচ্ছে — আর Redis-এর ভেতরে অবিভাজ্যভাবে, তাই দুই সার্ভার একসাথে এলেও একটাও রিকোয়েস্ট হিসাবের বাইরে যায় না।",
          analogy: "📋 নিজের খাতা না দেখে সবাই মাঝখানের বড় বোর্ডটাই দেখছে।",
          activeNodeIds: ["node-lb", "node-api-2", "node-redis"],
          activeEdgeIds: ["edge-lb-to-api-2", "edge-api-2-to-redis"],
          nodeStatusMessages: {
            "node-api-2": "EVAL limit.lua (key, 1000, 60)",
            "node-redis": "Executing atomically…",
          },
          payloadSnippet: `-- limit.lua (একটাই round trip, অবিভাজ্য)\nlocal n = redis.call('INCR', KEYS[1])\nif n == 1 then\n  redis.call('EXPIRE', KEYS[1], ARGV[2])\nend\nreturn { n, n <= tonumber(ARGV[1]) and 1 or 0 }`,
        },
        {
          id: "rl-s-a3",
          flowType: "allowed",
          stepNumber: 3,
          title: "Sliding window says yes (ওজন করা হিসাব — অনুমতি)",
          whatHappens:
            "Redis চলতি উইন্ডোর ৩১২ আর আগের উইন্ডোর ৯৪০ মিলিয়ে ওজন করা হিসাব করলো ≈ ৮৯৫। সীমা ১,০০০, তাই অনুমতি — আর উত্তরটা ০.৩ ms-এ ফিরে গেল।",
          whyItMatters:
            "`আগের উইন্ডো × বাকি অংশ + চলতি উইন্ডো` — এই এক লাইনের হিসাবই fixed window-এর সীমানা-বিস্ফোরণ মুছে দেয়, অথচ ইউজার-প্রতি খরচ মাত্র দুটো সংখ্যা।",
          analogy: "⏳ শুধু এই মিনিট নয়, পেছনের ৬০ সেকেন্ড জুড়ে হিসাব।",
          activeNodeIds: ["node-redis", "node-api-2"],
          activeEdgeIds: ["edge-api-2-to-redis"],
          edgeOverrides: {
            "edge-api-2-to-redis": {
              label: "3. { count, allowed }",
              isReverse: true,
              particleColor: "success",
            },
          },
          nodeStatusMessages: {
            "node-redis": "≈ 895 / 1000 → ALLOW (0.3 ms)",
            "node-api-2": "Decision received: allow",
          },
          payloadSnippet: `previous = 940   (আগের মিনিট)\ncurrent  = 312   (চলতি মিনিট, ৩৮% অতিবাহিত)\n\nweighted = 940 × 0.62 + 312 ≈ 895\n→ ALLOW  (limit 1000)`,
        },
        {
          id: "rl-s-a4",
          flowType: "allowed",
          stepNumber: 4,
          title: "Forwarded to the upstream (ভেতরে গেলো)",
          whatHappens:
            "অনুমতি পেয়ে সার্ভার ২ রিকোয়েস্টটা আসল সার্ভিসে পাঠালো, উত্তর নিয়ে ক্লায়েন্টকে ফেরত দিলো।",
          whyItMatters:
            "সার্ভার এখন সম্পূর্ণ stateless — auto-scaling গ্রুপ ইচ্ছেমতো মেশিন যোগ বা বাদ করতে পারে, ঘোষিত ১,০০০/মিনিট সীমা এক চুলও নড়ে না। এটাই এই স্তরের আসল অর্জন।",
          analogy: "🍳 স্লিপ রান্নাঘরে গেলো — লাইন তিনটে হলেও রান্নাঘরের চাপ একই।",
          activeNodeIds: ["node-api-2", "node-upstream"],
          activeEdgeIds: ["edge-api-2-to-upstream"],
          nodeStatusMessages: {
            "node-api-2": "Within limit → forwarding",
            "node-upstream": "Handling /api/rides…",
          },
          payloadSnippet: `HTTP/1.1 200 OK\nX-RateLimit-Limit: 1000\nX-RateLimit-Remaining: 330`,
        },
      ],
    },
    {
      id: "throttled",
      name: "Throttled",
      icon: "block",
      steps: [
        {
          id: "rl-s-t1",
          flowType: "throttled",
          stepNumber: 1,
          title: "Burst spreads across all three servers (একই ইউজারের ঝড় তিন সার্ভারে)",
          whatHappens:
            "একটা ভুল স্ক্রিপ্ট একই key দিয়ে সেকেন্ডে শত শত কল ছুড়ছে। ব্যালান্সার সেগুলো তিন সার্ভারে ছড়িয়ে দিচ্ছে।",
          whyItMatters:
            "মেমোরির গণনা হলে এই মুহূর্তে প্রত্যেক সার্ভার দেখত ~৩৩৩ — কেউই সীমা পেরোতো না, অথচ ভেতরে ঢুকত ১,০০০। ভাগ হয়ে যাওয়া হিসাব শুধু অসম্পূর্ণ নয়, **বিপজ্জনক**।",
          analogy: "🌪️ একই লোক তিন লাইনেই একসাথে দাঁড়িয়ে পড়েছে।",
          activeNodeIds: ["node-client", "node-lb", "node-api-1", "node-api-2", "node-api-3"],
          activeEdgeIds: [
            "edge-client-to-lb",
            "edge-lb-to-api-1",
            "edge-lb-to-api-2",
            "edge-lb-to-api-3",
          ],
          nodeStatusMessages: {
            "node-client": "Runaway loop — 900 req/sec",
            "node-lb": "Spraying across 3 servers",
            "node-api-1": "same key…",
            "node-api-2": "same key…",
            "node-api-3": "same key…",
          },
          payloadSnippet: `// যদি গণনা মেমোরিতে থাকত:\nserver1.counter = 333  ✓ under 1000\nserver2.counter = 334  ✓ under 1000\nserver3.counter = 333  ✓ under 1000\n────────────────────────────────────\nআসলে ঢুকলো 1000 — সীমা বলেছিল 1000/min`,
        },
        {
          id: "rl-s-t2",
          flowType: "throttled",
          stepNumber: 2,
          title: "All three land on the same counter (তিনজনই একই বোর্ডে দাগ কাটছে)",
          whatHappens:
            "তিনটে সার্ভারই একই key-তে INCR পাঠাচ্ছে। Redis একক থ্রেডে একটার পর একটা চালাচ্ছে — কোনো গণনা হারাচ্ছে না।",
          whyItMatters:
            "Redis-এর একক-থ্রেড হওয়াটা এখানে সীমাবদ্ধতা নয়, **বৈশিষ্ট্য**: লক ছাড়াই ক্রম নিশ্চিত হয়। GET-তারপর-SET লিখলে এই মুহূর্তেই দুই সার্ভার একই সংখ্যা পড়ে একই সংখ্যা লিখত, আর গণনা পিছিয়ে যেত।",
          analogy: "🧮 এক কেরানি, এক খাতা — তিনজন একসাথে বললেও লেখা হয় একটার পর একটা।",
          activeNodeIds: ["node-api-1", "node-api-2", "node-api-3", "node-redis"],
          activeEdgeIds: [
            "edge-api-1-to-redis",
            "edge-api-2-to-redis",
            "edge-api-3-to-redis",
          ],
          nodeStatusMessages: {
            "node-redis": "INCR … 998 → 999 → 1000",
          },
          payloadSnippet: `t=0.001  server1 INCR → 998\nt=0.001  server3 INCR → 999\nt=0.002  server2 INCR → 1000\n// একটাও হারায়নি — INCR atomic`,
        },
        {
          id: "rl-s-t3",
          flowType: "throttled",
          stepNumber: 3,
          title: "Limit reached — every server hears the same no (সীমা শেষ, তিনজনই একই না শুনলো)",
          whatHappens:
            "গণনা ১,০০০ ছুঁলো। এরপর যে সার্ভারই জিজ্ঞেস করুক, Redis একই উত্তর দিচ্ছে — allowed = 0।",
          whyItMatters:
            "সিদ্ধান্তটা এখন সার্ভার নিচ্ছে না, শুধু বয়ে নিয়ে যাচ্ছে। ফলে সীমা এক জায়গায় লেখা, এক জায়গায় বদলানো যায়, আর সব সার্ভারে একই সাথে কার্যকর হয়।",
          analogy: "🚫 বোর্ডে লেখা 'কোটা শেষ' — তিন দারোয়ানই সেটাই পড়ছে।",
          activeNodeIds: ["node-redis", "node-api-1", "node-api-2", "node-api-3"],
          activeEdgeIds: [
            "edge-api-1-to-redis",
            "edge-api-2-to-redis",
            "edge-api-3-to-redis",
          ],
          edgeOverrides: {
            "edge-api-1-to-redis": {
              label: "{ 1000, denied }",
              isReverse: true,
              particleColor: "error",
            },
            "edge-api-2-to-redis": {
              label: "{ 1000, denied }",
              isReverse: true,
              particleColor: "error",
            },
            "edge-api-3-to-redis": {
              label: "{ 1000, denied }",
              isReverse: true,
              particleColor: "error",
            },
          },
          nodeStatusMessages: {
            "node-redis": "1000 / 1000 → DENY",
            "node-api-1": "429",
            "node-api-2": "429",
            "node-api-3": "429",
          },
          payloadSnippet: `HTTP/1.1 429 Too Many Requests\nRetry-After: 24\nX-RateLimit-Limit: 1000\nX-RateLimit-Remaining: 0`,
        },
        {
          id: "rl-s-t4",
          flowType: "throttled",
          stepNumber: 4,
          title: "The upstream never sees the storm (ঝড়টা ভেতরে পৌঁছালোই না)",
          whatHappens:
            "৯০০ req/sec-এর ঝড়ের মধ্যে ভেতরের সার্ভিস পেল কেবল সীমার ভেতরের অংশটুকু। বাকিটা দরজাতেই থেমে গেল।",
          whyItMatters:
            "কিন্তু একটা নতুন প্রশ্ন জন্ম নিলো: এখন **প্রতিটি** রিকোয়েস্ট Redis-এর ওপর নির্ভরশীল। Redis বসে গেলে কী হবে — সবাইকে ঢুকতে দেব, নাকি সবাইকে আটকাব? reliable স্তরের গোটা গল্পটাই এই প্রশ্ন থেকে।",
          analogy: "🍳 রান্নাঘর শান্ত — কিন্তু এখন গোটা ব্যবস্থাটা ওই একটা বোর্ডের ওপর দাঁড়িয়ে।",
          activeNodeIds: ["node-api-2", "node-upstream", "node-redis"],
          activeEdgeIds: ["edge-api-2-to-upstream"],
          nodeStatusMessages: {
            "node-upstream": "Steady ~1000 req/min per key",
            "node-redis": "⚠️ single point of failure",
          },
          payloadSnippet: `// এই স্তরে যা পেলাম\n✓ সীমা সঠিক, সার্ভার সংখ্যা নির্বিশেষে\n✓ race condition নেই\n\n// যা এখনো ঝুঁকি\n✗ Redis মরলে কী হবে?\n✗ একটাই hot key — সব শার্ডের চাপ এক নোডে`,
        },
      ],
    },
  ],
};
