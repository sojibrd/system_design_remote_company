import type { LevelConfig } from "../../types";

export const functionalLevel: LevelConfig = {
  id: "functional",
  name: "Functional",
  badge: "🌱 এটা কাজ করে",
  tagline: "One server, one in-memory counter — fixed window rate limiting",
  componentCount: 3,
  conceptSummary:
    "রেট লিমিটারের সবচেয়ে সরল রূপ। একটাই API সার্ভার, আর সেই সার্ভারের নিজের মেমোরিতেই একটা গণনা রাখা — কোন ইউজার এই মিনিটে কতবার ডেকেছে। সীমা পেরোলে ৪২৯ ফেরত যায়, ভেতরের সার্ভিস পর্যন্ত রিকোয়েস্ট পৌঁছায়ই না।",
  keyConcepts: [
    "Fixed Window Counter",
    "HTTP 429 + Retry-After",
    "In-memory state (per-process)",
    "Protecting the upstream, not the limiter",
  ],
  scaleEstimate: {
    writeQps: "~২০০ /sec (প্রতিটি রিকোয়েস্টেই counter বাড়ে)",
    readQps: "~২০০ /sec",
    readWriteRatio: "১ : ১",
    storage5y: "~০ (মেমোরিতেই, ডিস্কে কিছুই নয়)",
    extras: [
      { label: "সীমা", value: "১০০ req / মিনিট / API key" },
      { label: "State", value: "~৫০ B × ১০,০০০ key ≈ ৫০০ KB RAM" },
    ],
  },
  tradeOffs: [
    {
      question: "উইন্ডো কীভাবে গুনব?",
      options: [
        {
          name: "Fixed window",
          note: "প্রতি মিনিটের শুরুতে গণনা শূন্য হয়। এক পূর্ণসংখ্যা আর এক টাইমস্ট্যাম্প — এর চেয়ে সস্তা কিছু নেই। সমস্যা: সীমানার দুই পাশে (যেমন ১০:৫৯:৫৯ ও ১১:০০:০০) ইউজার দ্বিগুণ পাঠিয়ে ফেলতে পারে।",
        },
        {
          name: "Sliding window log",
          note: "প্রতিটি রিকোয়েস্টের টাইমস্ট্যাম্প জমা থাকে, তাই গণনা একদম নিখুঁত। কিন্তু প্রতি ইউজারে ১০০টা টাইমস্ট্যাম্প — মেমোরি সীমার সমানুপাতে বাড়ে।",
        },
        {
          name: "Token bucket",
          note: "একটা বালতিতে নির্দিষ্ট হারে টোকেন জমে; রিকোয়েস্ট এলে একটা টোকেন খরচ হয়। হঠাৎ আসা burst সহ্য করে, তবু গড় হার ধরে রাখে।",
        },
      ],
      chosen: "Fixed window",
      why: "এই স্তরে সার্ভার একটাই এবং ট্রাফিক অল্প — সীমানার ওই দ্বিগুণ ঝুঁকিটা বাস্তবে ২০০ req/sec-এ কাউকে ব্যথা দেয় না। দুটো মাত্র ভেরিয়েবলে যা পাওয়া যাচ্ছে, তার জন্য টাইমস্ট্যাম্পের তালিকা রাখা এখন নিছক খরচ। burst নিয়ন্ত্রণ সত্যিই দরকার হলে token bucket আসবে — reliable স্তরে ঠিক সেটাই ঘটে।",
    },
    {
      question: "লিমিটার কোথায় বসবে?",
      options: [
        {
          name: "App সার্ভারের middleware-এ",
          note: "কোডের সবচেয়ে কাছে, তাই ইউজার-নির্দিষ্ট নিয়ম (plan, endpoint) লেখা সহজ। কিন্তু রিকোয়েস্ট সার্ভার পর্যন্ত আসে — TLS, parsing, thread সব খরচ হয়েই যায়।",
        },
        {
          name: "API Gateway / Nginx-এ",
          note: "অ্যাপ ছোঁয়ার আগেই থামায়, তাই সবচেয়ে সস্তা। কিন্তু gateway ইউজারের plan জানে না, তাই সূক্ষ্ম নিয়ম লেখা কঠিন।",
        },
        {
          name: "CDN / edge-এ",
          note: "ব্যবহারকারীর সবচেয়ে কাছে থামায়, তাই DDoS-এর বিরুদ্ধে সবচেয়ে কার্যকর। কিন্তু edge-গুলোর মধ্যে গণনা ভাগ করা কঠিন — প্রতিটি PoP আলাদা হিসাব রাখে।",
        },
      ],
      chosen: "App সার্ভারের middleware-এ",
      why: "সীমা এখানে API key ও plan অনুযায়ী আলাদা — সেই তথ্য অ্যাপেরই, gateway-র নয়। আর ২০০ req/sec-এ parsing-এর খরচ নগণ্য। ট্রাফিক যখন এমন জায়গায় যাবে যে অ্যাপ পর্যন্ত পৌঁছানোটাই খরচ, তখন লিমিটারকে সামনে ঠেলতে হবে — কিন্তু তার আগে নয়।",
    },
    {
      question: "সীমা পেরোলে কী ফেরত যাবে?",
      options: [
        {
          name: "429 + Retry-After",
          note: "ক্লায়েন্ট জানে কখন আবার চেষ্টা করতে হবে, তাই ভালো ক্লায়েন্ট নিজেই থেমে যায়। খারাপ ক্লায়েন্টও অন্তত সঠিক সংকেত পায়।",
        },
        {
          name: "নীরবে drop / connection বন্ধ",
          note: "আক্রমণকারীকে কোনো তথ্য দেয় না। কিন্তু বৈধ ক্লায়েন্টও বুঝতে পারে না কী হলো — টাইমআউট হয়ে বসে থাকে, আর প্রায়ই আরও জোরে retry করে।",
        },
        {
          name: "সারিতে রেখে দেরিতে সার্ভ (queue)",
          note: "কোনো রিকোয়েস্ট হারায় না। কিন্তু সারিটাই মেমোরি খায় এবং latency বাড়ায় — ঠিক যে চাপ থেকে বাঁচতে চাইছিলেন, সেটাই ভেতরে ঢুকিয়ে নেওয়া হয়।",
        },
      ],
      chosen: "429 + Retry-After",
      why: "রেট লিমিটারের কাজ ট্রাফিক গোপন করা নয়, **সৎভাবে না বলা**। `Retry-After` হেডারটাই বেশিরভাগ retry-storm থামিয়ে দেয়, কারণ ক্লায়েন্ট লাইব্রেরিগুলো ওটা মেনে চলে। সাথে `X-RateLimit-Remaining` পাঠালে ভালো ক্লায়েন্ট সীমায় পৌঁছানোর আগেই নিজেকে সামলায়।",
    },
    {
      question: "গণনা মেমোরিতে রাখলে কী হারাবেন?",
      options: [
        {
          name: "In-memory (এখন)",
          note: "নেটওয়ার্ক হপ নেই, latency ~০। কিন্তু সার্ভার রিস্টার্ট করলেই সব গণনা মুছে যায়, আর দ্বিতীয় সার্ভার যোগ করলে প্রত্যেকের হিসাব আলাদা হয়ে যায়।",
        },
        {
          name: "Redis-এ শেয়ার্ড কাউন্টার",
          note: "সব সার্ভার একই সংখ্যা দেখে। কিন্তু প্রতিটি রিকোয়েস্টে একটা নেটওয়ার্ক কল, এবং Redis নিজেই একটা নতুন নির্ভরতা।",
        },
      ],
      chosen: "In-memory (এখন)",
      why: "সার্ভার যখন একটাই, তখন \"শেয়ার্ড\" বলে কিছু নেই — মেমোরিই সত্যের একমাত্র উৎস। রিস্টার্টে গণনা মুছে যাওয়াও এখানে ক্ষমাযোগ্য: সবচেয়ে খারাপ ক্ষেত্রে একজন ইউজার এক মিনিটে দ্বিগুণ কল পায়। কিন্তু লোড ব্যালান্সারের পেছনে তিনটে সার্ভার এলেই এই সিদ্ধান্ত ভেঙে পড়ে — সীমা নিঃশব্দে তিনগুণ হয়ে যায়। scalable স্তরের গল্প ওখান থেকেই শুরু।",
    },
  ],
  nodes: [
    {
      id: "node-client",
      type: "simulationNode",
      position: { x: 88, y: 235 },
      data: {
        label: "Client",
        subLabel: "API consumer (script / app)",
        category: "client",
        emoji: "📱",
        analogy: "রাইড শেয়ারিং অ্যাপ — যে প্রতি সেকেন্ডে বারবার সার্ভারকে জিজ্ঞেস করে 'গাড়ি এলো?'",
        description: "API key নিয়ে রিকোয়েস্ট পাঠায়। সীমা পেরোলে 429 পায়।",
        techSpecs: "HTTPS / Bearer key",
      },
    },
    {
      id: "node-limiter",
      type: "simulationNode",
      position: { x: 765, y: 235 },
      data: {
        label: "API Server",
        subLabel: "Rate limiter middleware",
        category: "compute",
        emoji: "🚦",
        analogy: "দরজায় দাঁড়ানো দারোয়ান — হাতে একটা খাতা, প্রতিটা নাম কতবার ঢুকল তা দাগ কেটে রাখে।",
        description:
          "প্রতিটি রিকোয়েস্টে API key দেখে নিজের মেমোরির counter এক বাড়ায়। সীমার ভেতরে হলে ভেতরে পাঠায়, নাহলে 429 ফেরত দেয়।",
        techSpecs: "Node.js / in-memory Map",
      },
    },
    {
      id: "node-upstream",
      type: "simulationNode",
      position: { x: 1442, y: 235 },
      data: {
        label: "Upstream Service",
        subLabel: "যাকে বাঁচাতে চাইছি",
        category: "compute",
        emoji: "⚙️",
        analogy: "রান্নাঘর — একসাথে কতগুলো অর্ডার সামলাতে পারে তার সীমা আছে।",
        description:
          "আসল কাজটা এখানে হয় — DB query, হিসাব, external call। রেট লিমিটার আছেই এই সার্ভিসটিকে অতিরিক্ত চাপ থেকে বাঁচানোর জন্য।",
        techSpecs: "~৩০০ req/sec ceiling",
      },
    },
  ],
  edges: [
    {
      id: "edge-client-to-limiter",
      type: "animatedFlowEdge",
      source: "node-client",
      sourceHandle: "r-s",
      target: "node-limiter",
      targetHandle: "l-t",
      data: {
        label: "1. GET /api/rides",
        particleColor: "request",
      },
    },
    {
      id: "edge-limiter-to-upstream",
      type: "animatedFlowEdge",
      source: "node-limiter",
      sourceHandle: "r-s",
      target: "node-upstream",
      targetHandle: "l-t",
      data: {
        label: "2. Forward (within limit)",
        particleColor: "read",
      },
    },
  ],
  flows: [
    {
      id: "allowed",
      name: "Allowed",
      icon: "allow",
      steps: [
        {
          id: "rl-f-a1",
          flowType: "allowed",
          stepNumber: 1,
          title: "Client sends a request (ক্লায়েন্ট রিকোয়েস্ট পাঠালো)",
          whatHappens:
            "ক্লায়েন্ট তার API key নিয়ে একটা সাধারণ রিকোয়েস্ট পাঠালো। এই মিনিটে এটা তার ৪২ নম্বর কল।",
          whyItMatters:
            "লিমিটারকে জানতে হবে রিকোয়েস্টটা কার — সেই পরিচয়ই আসে API key (বা লগইন টোকেন) থেকে। IP দিয়ে গোনা হলে একই অফিসের সবাই একসাথে শাস্তি পেত।",
          analogy: "🎫 গেটে ঢোকার সময় নিজের কার্ডটা দেখানো।",
          activeNodeIds: ["node-client", "node-limiter"],
          activeEdgeIds: ["edge-client-to-limiter"],
          nodeStatusMessages: {
            "node-client": "GET /api/rides (key: ak_live_9f2…)",
            "node-limiter": "Identifying caller…",
          },
          payloadSnippet: `GET /api/rides HTTP/1.1\nHost: api.example.com\nAuthorization: Bearer ak_live_9f2c…`,
        },
        {
          id: "rl-f-a2",
          flowType: "allowed",
          stepNumber: 2,
          title: "Limiter checks its counter (দারোয়ান খাতা দেখলো)",
          whatHappens:
            "সার্ভার নিজের মেমোরিতে দেখলো: এই key-এর জন্য এই মিনিটে গণনা ৪১। সীমা ১০০, তাই জায়গা আছে। গণনা বেড়ে ৪২ হলো।",
          whyItMatters:
            "পুরো সিদ্ধান্তটা একটা in-memory Map লুকআপ — কয়েকশো ন্যানোসেকেন্ড। কোনো নেটওয়ার্ক কল নেই বলেই এই স্তরে লিমিটার নিজে কখনো বটলনেক হয় না।",
          analogy: "📓 নামের পাশে দাগ গুনে দেখা — এখনো ঘর খালি আছে।",
          activeNodeIds: ["node-limiter"],
          activeEdgeIds: [],
          nodeStatusMessages: {
            "node-limiter": "counter[ak_live_9f2…] 41 → 42 / 100 ✓",
          },
          payloadSnippet: `window = 10:47:00–10:47:59\ncounter["ak_live_9f2c"] = 42\nlimit = 100  →  ALLOW`,
        },
        {
          id: "rl-f-a3",
          flowType: "allowed",
          stepNumber: 3,
          title: "Request reaches the upstream (রিকোয়েস্ট ভেতরে গেলো)",
          whatHappens:
            "সীমার ভেতরে থাকায় রিকোয়েস্টটা আসল সার্ভিসে পৌঁছালো, আর সেখানে সত্যিকারের কাজটা হলো।",
          whyItMatters:
            "মনে রাখার মতো কথা: লিমিটারের কাজ রিকোয়েস্ট **বন্ধ করা** নয় — ভেতরের সার্ভিসকে তার ক্ষমতার ভেতরে রাখা। এই হপটাই সেই সীমিত সম্পদ, যা রক্ষা করার জন্য পুরো ব্যবস্থাটা দাঁড়িয়ে আছে।",
          analogy: "🍳 অর্ডার স্লিপ রান্নাঘরে পৌঁছালো — রান্নাঘর এখনো ব্যস্ত নয়।",
          activeNodeIds: ["node-limiter", "node-upstream"],
          activeEdgeIds: ["edge-limiter-to-upstream"],
          nodeStatusMessages: {
            "node-limiter": "Within limit → forwarding",
            "node-upstream": "Handling /api/rides…",
          },
          payloadSnippet: `SELECT * FROM rides WHERE user_id = 8812\n  AND status = 'active';`,
        },
        {
          id: "rl-f-a4",
          flowType: "allowed",
          stepNumber: 4,
          title: "200 OK with quota headers (উত্তরের সাথে হিসাবও গেলো)",
          whatHappens:
            "উত্তর ক্লায়েন্টের কাছে ফিরলো, আর সাথে গেল হেডার: 'তোমার এই মিনিটে আর ৫৮টা বাকি'।",
          whyItMatters:
            "`X-RateLimit-Remaining` পাঠানো মানে ক্লায়েন্টকে দেয়ালে ধাক্কা খাওয়ার **আগেই** সতর্ক করা। ভালো ক্লায়েন্ট লাইব্রেরি এটা দেখে নিজের গতি কমায় — অর্থাৎ ৪২৯-এর সংখ্যাই কমে যায়।",
          analogy: "🧾 বিলের নিচে লেখা 'আপনার প্যাকেজে আর ৫৮টা ট্রিপ বাকি'।",
          activeNodeIds: ["node-upstream", "node-limiter", "node-client"],
          activeEdgeIds: ["edge-limiter-to-upstream", "edge-client-to-limiter"],
          edgeOverrides: {
            "edge-limiter-to-upstream": {
              label: "3. Result",
              isReverse: true,
              particleColor: "success",
            },
            "edge-client-to-limiter": {
              label: "4. 200 OK",
              isReverse: true,
              particleColor: "success",
            },
          },
          nodeStatusMessages: {
            "node-upstream": "Done in 24 ms",
            "node-limiter": "HTTP 200 + quota headers",
            "node-client": "58 requests left this minute",
          },
          payloadSnippet: `HTTP/1.1 200 OK\nX-RateLimit-Limit: 100\nX-RateLimit-Remaining: 58\nX-RateLimit-Reset: 1730458080`,
        },
      ],
    },
    {
      id: "throttled",
      name: "Throttled",
      icon: "block",
      steps: [
        {
          id: "rl-f-t1",
          flowType: "throttled",
          stepNumber: 1,
          title: "The 101st request arrives (একশো এক নম্বর কল)",
          whatHappens:
            "ক্লায়েন্টের স্ক্রিপ্টে একটা লুপ আটকে গেছে — এই মিনিটেই সে ১০০টা কল শেষ করে ফেলেছে, এখন ১০১তমটা পাঠাচ্ছে।",
          whyItMatters:
            "বাস্তবে বেশিরভাগ রেট লিমিট ঘটনা আক্রমণ নয়, **বাগ** — একটা ভুল retry লুপ বা একটা অসাবধান cron। সিস্টেমের দুজনকেই সামলাতে হয় একইভাবে।",
          analogy: "🔁 একই লোক বারবার গেটে এসে দাঁড়াচ্ছে, থামছেই না।",
          activeNodeIds: ["node-client", "node-limiter"],
          activeEdgeIds: ["edge-client-to-limiter"],
          nodeStatusMessages: {
            "node-client": "Retry loop: request #101",
            "node-limiter": "Identifying caller…",
          },
          payloadSnippet: `GET /api/rides HTTP/1.1\nAuthorization: Bearer ak_live_9f2c…`,
        },
        {
          id: "rl-f-t2",
          flowType: "throttled",
          stepNumber: 2,
          title: "Counter has hit the limit (খাতা বলছে কোটা শেষ)",
          whatHappens:
            "গণনা ইতিমধ্যেই ১০০। সীমা পেরিয়ে গেছে, তাই লিমিটার সিদ্ধান্ত নিলো — এটা ভেতরে যাবে না।",
          whyItMatters:
            "লক্ষ করুন গণনা এখানে **বাড়ছে না**। প্রত্যাখ্যাত রিকোয়েস্ট গুনলে একজন আগ্রাসী ক্লায়েন্ট নিজেকে চিরকালের জন্য আটকে ফেলত, কারণ তার প্রতিটি retry-ই কোটা খেত।",
          analogy: "🚫 দারোয়ান হাত তুলে বললো — 'আজকের মতো আপনার ঢোকা শেষ'।",
          activeNodeIds: ["node-limiter"],
          activeEdgeIds: [],
          nodeStatusMessages: {
            "node-limiter": "counter = 100 / 100 → DENY (not incremented)",
          },
          payloadSnippet: `window  = 10:47:00–10:47:59\ncounter = 100\nlimit   = 100  →  DENY\nresets in 18s`,
        },
        {
          id: "rl-f-t3",
          flowType: "throttled",
          stepNumber: 3,
          title: "429 goes back — upstream never hears about it (৪২৯ ফেরত, ভেতরে কিছুই গেল না)",
          whatHappens:
            "ক্লায়েন্ট পেলো `429 Too Many Requests`, সাথে `Retry-After: 18` — অর্থাৎ '১৮ সেকেন্ড পরে এসো'। আসল সার্ভিসটা এই রিকোয়েস্টের কথা জানতেই পারলো না।",
          whyItMatters:
            "এখানেই পুরো কাঠামোটার মূল্য: ওই ডান দিকের হপটা ঘটেইনি। ১০০ জন ক্লায়েন্ট একসাথে পাগলামি করলেও ভেতরের সার্ভিস তার ক্ষমতার ভেতরেই থাকে — একজনের বাগ সবার সেবা নষ্ট করে না।",
          analogy: "🍳 রান্নাঘর টেরই পেল না — স্লিপটা দরজাতেই আটকে গেছে।",
          activeNodeIds: ["node-limiter", "node-client"],
          activeEdgeIds: ["edge-client-to-limiter"],
          edgeOverrides: {
            "edge-client-to-limiter": {
              label: "2. 429 Too Many Requests",
              isReverse: true,
              particleColor: "error",
            },
          },
          nodeStatusMessages: {
            "node-limiter": "HTTP 429 · Retry-After: 18",
            "node-client": "Throttled — backing off 18s",
          },
          payloadSnippet: `HTTP/1.1 429 Too Many Requests\nRetry-After: 18\nX-RateLimit-Limit: 100\nX-RateLimit-Remaining: 0`,
        },
        {
          id: "rl-f-t4",
          flowType: "throttled",
          stepNumber: 4,
          title: "The window resets (নতুন মিনিট, নতুন খাতা)",
          whatHappens:
            "ঘড়ি ১০:৪৮:০০ ছুঁলো। গণনা এক ঝটকায় শূন্য হয়ে গেল, ক্লায়েন্ট আবার ১০০টা কল পাবে।",
          whyItMatters:
            "এটাই fixed window-এর দুর্বলতা: ১০:৪৭:৫৯-এ ১০০ আর ১০:৪৮:০০-এ আরও ১০০ — দুই সেকেন্ডে ২০০। ঘোষিত সীমার দ্বিগুণ। ভেতরের সার্ভিসের ceiling এর কাছাকাছি হলে ওই বিস্ফোরণটাই তাকে ফেলে দিতে পারে।",
          analogy: "🕛 ঘড়িতে কাঁটা ঘুরলো, দারোয়ান নতুন পাতা খুলে বসলো।",
          activeNodeIds: ["node-limiter"],
          activeEdgeIds: [],
          nodeStatusMessages: {
            "node-limiter": "window 10:48 → counter reset to 0",
          },
          payloadSnippet: `// fixed window boundary problem\n10:47:59  →  100 requests  ✓\n10:48:00  →  100 requests  ✓\n──────────────────────────────\n2 সেকেন্ডে 200 — সীমা বলেছিল 100/min`,
        },
      ],
    },
  ],
};
