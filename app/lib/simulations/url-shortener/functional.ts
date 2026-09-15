import type { LevelConfig } from "../../types";

export const functionalLevel: LevelConfig = {
  id: "functional",
  name: "Functional",
  badge: "🌱 এটা কাজ করে",
  tagline: "Simple 3-component architecture — one server and one database",
  componentCount: 3,
  conceptSummary:
    "এটি একটি URL Shortener-এর সবচেয়ে সরল রূপ। এখানে ক্লায়েন্ট সরাসরি অ্যাপ সার্ভারের সাথে কথা বলে এবং অ্যাপ সার্ভার সরাসরি ডাটাবেজে শর্ট আইডি ও লং ইউআরএল জমা রাখে।",
  keyConcepts: [
    "Client-Server Model",
    "Base62 Encoding (Counter-based ID)",
    "Relational Database (SQL Lookup)",
    "HTTP 301 vs 302 Redirect",
  ],
  scaleEstimate: {
    writeQps: "~১ /sec",
    readQps: "~১০০ /sec",
    readWriteRatio: "১০০ : ১",
    storage5y: "~৮০ GB (১৫.৮ কোটি লিংক × ৫০০ B)",
    extras: [{ label: "Short code", value: "৬ অক্ষর → ৬২⁶ ≈ ৫,৭০০ কোটি" }],
  },
  tradeOffs: [
    {
      question: "Short code কীভাবে তৈরি হবে?",
      options: [
        {
          name: "Counter + Base62",
          note: "ডাটাবেজের auto-increment আইডিকে Base62-তে রূপান্তর। কখনো collision হয় না, কোড ছোট থাকে। কিন্তু আইডি অনুমানযোগ্য, আর counter-টাই একমাত্র bottleneck।",
        },
        {
          name: "Hash (MD5/SHA → প্রথম ৬ অক্ষর)",
          note: "একই URL দিলে একই কোড পাওয়া যায়। কিন্তু ভিন্ন URL-এও একই কোড পড়তে পারে (collision), তাই প্রতিবার DB-তে দেখে নিয়ে দরকারে নতুন করে চেষ্টা করতে হয়।",
        },
        {
          name: "KGS (Key Generation Service)",
          note: "আগে থেকেই লক্ষ লক্ষ ইউনিক কোড বানিয়ে রাখা হয়, সার্ভার শুধু একটা তুলে নেয়। সবচেয়ে দ্রুত, কিন্তু একটা বাড়তি সার্ভিস ও তার নিজের HA সামলাতে হয়।",
        },
      ],
      chosen: "Counter + Base62",
      why: "এই স্তরে সার্ভার একটাই, তাই counter-এর bottleneck বা contention কোনো সমস্যাই নয় — আর collision সামলানোর কোড না লিখেই কাজ চলে যায়। একাধিক সার্ভার এলে এই সিদ্ধান্তটাই ভেঙে পড়ে; expert স্তরে তাই Snowflake আসে।",
    },
    {
      question: "301 না 302 — কোন redirect পাঠাব?",
      options: [
        {
          name: "301 Moved Permanently",
          note: "ব্রাউজার ঠিকানাটি ক্যাশ করে রাখে, তাই পরের ক্লিকগুলো সার্ভারেই আসে না। সার্ভারের চাপ সবচেয়ে কম, ইউজারের জন্য সবচেয়ে দ্রুত।",
        },
        {
          name: "302 Found",
          note: "প্রতিটি ক্লিক সার্ভার পর্যন্ত আসে। চাপ বেশি, কিন্তু প্রতিটি ক্লিক গোনা যায় এবং পরে গন্তব্য বদলানোও সম্ভব।",
        },
      ],
      chosen: "301 Moved Permanently",
      why: "এই স্তরে কোনো analytics নেই — ক্লিক গোনার দরকারই পড়ছে না। তাই ব্রাউজারকে ক্যাশ করতে দেওয়াই সবচেয়ে সস্তা। কিন্তু মনে রাখুন: 301 একবার পাঠালে ব্রাউজার সেটা ধরে রাখে, তাই পরে ক্লিক গুনতে চাইলে পুরোনো ইউজারদের ডেটা আর কখনোই পাওয়া যাবে না। expert স্তরে ঠিক এই কারণেই 302-তে যেতে হয়।",
    },
    {
      question: "একটা মাত্র ডাটাবেজ — কোথায় ভাঙবে?",
      options: [
        {
          name: "Single DB (এখন)",
          note: "সব read ও write একই মেশিনে। সহজ, সস্তা, কিন্তু মেশিনটি বসে গেলে পুরো সিস্টেম বন্ধ (single point of failure)।",
        },
        {
          name: "Read replica যোগ করা",
          note: "১০০:১ read/write অনুপাতে read-ই আগে বটলনেক হয়। Replica সেই চাপ ভাগ করে নেয়।",
        },
        {
          name: "Cache যোগ করা",
          note: "জনপ্রিয় কয়েকটি লিংকেই বেশিরভাগ ট্রাফিক আসে, তাই মেমোরি ক্যাশ সবচেয়ে বেশি লাভ দেয়।",
        },
      ],
      chosen: "Single DB (এখন)",
      why: "১০০ read/sec একটিমাত্র ইনডেক্সড PostgreSQL অনায়াসে সামলায় — এই সংখ্যায় cache বা replica যোগ করা নিছক overengineering। কিন্তু read ১,০০০/sec ছাড়ালে ডিস্ক I/O-ই দেয়াল হয়ে দাঁড়াবে; সেখান থেকেই intermediate স্তরের গল্প শুরু।",
    },
    {
      question: "লিংক কি চিরকাল থাকবে?",
      options: [
        {
          name: "কোনো expiry নেই",
          note: "স্টোরেজ শুধু বাড়তেই থাকে, কখনো কমে না।",
        },
        {
          name: "TTL + cleanup job",
          note: "প্রতিটি লিংকে মেয়াদ বসানো হয়, আর একটা ব্যাকগ্রাউন্ড job মেয়াদোত্তীর্ণ সারি মুছে দেয় — সেই কোডগুলো আবার ব্যবহারযোগ্যও হয়ে ওঠে।",
        },
      ],
      chosen: "কোনো expiry নেই",
      why: "৫ বছরে মাত্র ~৮০ GB — একটা সাধারণ SSD-তেই ধরে যায়, তাই cleanup job লেখার খরচ এখনো ন্যায্য নয়। কিন্তু expert স্তরে ~৮০ TB হলে হিসাবটা উল্টে যায়: তখন TTL শুধু জায়গা বাঁচায় না, ৬-অক্ষরের keyspace ফুরিয়ে যাওয়া থেকেও বাঁচায়।",
    },
  ],
  nodes: [
    {
      id: "node-client",
      type: "simulationNode",
      position: { x: 88, y: 235 },
      data: {
        label: "Client",
        subLabel: "Web Browser / Mobile App",
        category: "client",
        emoji: "📱",
        analogy: "গ্রাহক বা ক্রেতা — যে লম্বা লিঙ্ক ছোট করতে চায় অথবা শর্ট লিঙ্কে ক্লিক করে।",
        description: "ব্যবহারকারীর ডিভাইস যেখান থেকে রিকোয়েস্ট শুরু হয়।",
        techSpecs: "HTTPS / JSON",
      },
    },
    {
      id: "node-server",
      type: "simulationNode",
      position: { x: 765, y: 235 },
      data: {
        label: "App Server",
        subLabel: "Node.js / Express API",
        category: "compute",
        emoji: "🖥️",
        analogy: "দোকানের কাউন্টারে বসা ক্যাশিয়ার — যে লম্বা নাম দেখে একটা ছোট টোকেন নাম্বার বানিয়ে দেয়।",
        description: "মূল লজিক চালায়, শর্ট হ্যাশ কোড (যেমন abc12) তৈরি করে এবং ডাটাবেজে খোঁজাখুঁজি করে।",
        techSpecs: "Port 3000 / REST API",
      },
    },
    {
      id: "node-db",
      type: "simulationNode",
      position: { x: 1442, y: 235 },
      data: {
        label: "Database",
        subLabel: "PostgreSQL (Relational DB)",
        category: "storage",
        emoji: "📦",
        analogy: "একটি বড় খাতা বা ডায়েরি — যেখানে প্রতিটি ছোট কোডের পাশে তার আসল বড় লিঙ্ক লিখে রাখা হয়।",
        description: "সব লিংক স্থায়ীভাবে টেবিলে জমা রাখে যাতে সার্ভার বন্ধ হলেও ডাটা হারিয়ে না যায়।",
        techSpecs: "Port 5432 / B-Tree Index",
      },
    },
  ],
  edges: [
    {
      id: "edge-client-to-server",
      type: "animatedFlowEdge",
      source: "node-client",
      sourceHandle: "r-s",
      target: "node-server",
      targetHandle: "l-t",
      data: {
        label: "1. POST /api/shorten",
        particleColor: "request",
      },
    },
    {
      id: "edge-server-to-db",
      type: "animatedFlowEdge",
      source: "node-server",
      sourceHandle: "r-s",
      target: "node-db",
      targetHandle: "l-t",
      data: {
        label: "2. INSERT INTO urls",
        particleColor: "read",
      },
    },
  ],
  flows: [
    {
      id: "shorten",
      name: "Shorten",
      icon: "link",
      steps: [
        {
          id: "b-s1",
          flowType: "shorten",
          stepNumber: 1,
          title: "Client sends Long URL (ইউজার লম্বা লিঙ্ক পাঠালো)",
          whatHappens:
            "ইউজার একটি বড় লিঙ্ক ইনপুট বক্সে দিয়ে 'Shorten' বাটনে ক্লিক করলো। ব্রাউজার থেকে সার্ভারে একটি POST রিকোয়েস্ট চলে গেলো।",
          whyItMatters:
            "ক্লায়েন্ট HTTP POST মেথড ব্যবহার করে JSON ফরম্যাটে আসল লিঙ্কটি সার্ভারের API এন্ডপয়েন্টে সাবমিট করে।",
          analogy: "📦 যেমন দোকানে পার্সেল জমা দিয়ে রিসিট চাওয়া।",
          activeNodeIds: ["node-client", "node-server"],
          activeEdgeIds: ["edge-client-to-server"],
          nodeStatusMessages: {
            "node-client": "Sending: https://google.com/search?q=system+design...",
            "node-server": "Receiving request...",
          },
          payloadSnippet: `POST /api/v1/shorten HTTP/1.1\nContent-Type: application/json\n\n{\n  "originalUrl": "https://example.com/very/long/article/system-design-roadmap"\n}`,
        },
        {
          id: "b-s2",
          flowType: "shorten",
          stepNumber: 2,
          title: "Server generates Short Code & writes to DB (কোড জেনারেশন ও সেভ)",
          whatHappens:
            "সার্ভার লিঙ্কটির জন্য একটি ৭ অক্ষরের ইউনিক শর্ট কোড (যেমন: 'xK9pL2') বানালো এবং তা ডাটাবেজের ডায়েরিতে লিখে রাখতে পাঠালো।",
          whyItMatters:
            "Base62 অ্যালগরিদম (a-z, A-Z, 0-9) ব্যবহার করে 62^7 = 3.5 ট্রিলিয়ন ইউনিক শর্ট লিঙ্ক তৈরি করা সম্ভব।",
          analogy: "🏷️ যেমন লকারে ব্যাগ রেখে লকার নম্বর 'K-92' ট্যাগ বানানো।",
          activeNodeIds: ["node-server", "node-db"],
          activeEdgeIds: ["edge-server-to-db"],
          nodeStatusMessages: {
            "node-server": "Generated ID: 'xK9pL2' -> Writing to DB",
            "node-db": "INSERT INTO urls (short_code, original_url)...",
          },
          payloadSnippet: `INSERT INTO urls (short_code, original_url, created_at)\nVALUES ('xK9pL2', 'https://example.com/very/long...', NOW());`,
        },
        {
          id: "b-s3",
          flowType: "shorten",
          stepNumber: 3,
          title: "Database confirms persistence (ডাটাবেজ সেভ নিশ্চিত করলো)",
          whatHappens:
            "ডাটাবেজ ডিস্কে ডাটা নিরাপদে লিখে সার্ভারকে জানালো 'হ্যাঁ, আমি সেভ করে নিয়েছি!'",
          whyItMatters:
            "ACID ট্রানজাকশনের মাধ্যমে নিশ্চিত হওয়া যায় যে ডাটাবেজ ক্র্যাশ করলেও ডাটা হারাবে না।",
          analogy: "✍️ ডায়েরিতে লিখে কলমের মুখ বন্ধ করে দেওয়া — যাতে লেখা মোছা না যায়।",
          activeNodeIds: ["node-db", "node-server"],
          activeEdgeIds: ["edge-server-to-db"],
          edgeOverrides: {
            "edge-server-to-db": {
              label: "3. SQL Result (OK)",
              isReverse: true,
              particleColor: "success",
            },
          },
          nodeStatusMessages: {
            "node-db": "Saved successfully! Row ID: 10482",
            "node-server": "DB confirmation received.",
          },
          payloadSnippet: `Query OK, 1 row affected (1.8 ms)`,
        },
        {
          id: "b-s4",
          flowType: "shorten",
          stepNumber: 4,
          title: "Server returns Short URL to Client (ছোট লিঙ্ক ফেরত প্রদান)",
          whatHappens:
            "সার্ভার ক্লায়েন্টকে মিষ্টি হাসি দিয়ে ছোট লিঙ্কটি (https://sho.rt/xK9pL2) ফেরত দিলো। ইউজার এখন এটি কপি করে শেয়ার করতে পারবে!",
          whyItMatters:
            "HTTP 201 Created স্ট্যাটাস কোড সহ শর্ট URL এবং মেটাডাটা রেসপন্স হিসেবে পাঠানো হয়।",
          analogy: "🎟️ ক্যাশিয়ারের হাত থেকে টোকেন স্লিপ হাতে পাওয়া।",
          activeNodeIds: ["node-server", "node-client"],
          activeEdgeIds: ["edge-client-to-server"],
          edgeOverrides: {
            "edge-client-to-server": {
              label: "4. Return Short URL",
              isReverse: true,
              particleColor: "success",
            },
          },
          nodeStatusMessages: {
            "node-server": "HTTP 201 Created -> Sending response",
            "node-client": "Ready! Copy: https://sho.rt/xK9pL2",
          },
          payloadSnippet: `HTTP/1.1 201 Created\nContent-Type: application/json\n\n{\n  "shortUrl": "https://sho.rt/xK9pL2",\n  "originalUrl": "https://example.com/very/long...",\n  "code": "xK9pL2"\n}`,
        },
      ],
    },
    {
      id: "redirect",
      name: "Redirect",
      icon: "redirect",
      steps: [
        {
          id: "b-r1",
          flowType: "redirect",
          stepNumber: 1,
          title: "User clicks Short URL (শর্ট লিঙ্কে ক্লিক)",
          whatHappens:
            "কেউ ব্রাউজারে 'https://sho.rt/xK9pL2' ওপেন করলো। ব্রাউজার সার্ভারের কাছে জিজ্ঞেস করলো, 'এই শর্ট কোডের আসল লিঙ্ক কী?'",
          whyItMatters:
            "HTTP GET রিকোয়েস্ট পাথের শর্ট কোডটি নিয়ে সার্ভারে পৌঁছায়।",
          analogy: "🔍 টোকেন নাম্বার দেখিয়ে কাউন্টারে আসল পার্সেল জানতে চাওয়া।",
          activeNodeIds: ["node-client", "node-server"],
          activeEdgeIds: ["edge-client-to-server"],
          nodeStatusMessages: {
            "node-client": "GET /xK9pL2",
            "node-server": "Looking up code: 'xK9pL2'...",
          },
          payloadSnippet: `GET /xK9pL2 HTTP/1.1\nHost: sho.rt`,
        },
        {
          id: "b-r2",
          flowType: "redirect",
          stepNumber: 2,
          title: "Server queries Database (ডাটাবেজে সন্ধান)",
          whatHappens:
            "সার্ভার ডাটাবেজ ডায়েরি খুলে 'xK9pL2' পৃষ্ঠা খুঁজলো।",
          whyItMatters:
            "শর্ট কোডের ওপর B-Tree Index থাকায় ডাটাবেজ খুব দ্রুত (O(log N)) সময়ে রো-টি খুঁজে পায়।",
          analogy: "📖 ইনডেক্স দেখে এক সেকেন্ডেই ডায়েরির সঠিক পৃষ্ঠা বের করা।",
          activeNodeIds: ["node-server", "node-db"],
          activeEdgeIds: ["edge-server-to-db"],
          nodeStatusMessages: {
            "node-server": "SELECT * FROM urls WHERE short_code = 'xK9pL2'",
            "node-db": "Searching B-Tree index...",
          },
          payloadSnippet: `SELECT original_url FROM urls\nWHERE short_code = 'xK9pL2'\nLIMIT 1;`,
        },
        {
          id: "b-r3",
          flowType: "redirect",
          stepNumber: 3,
          title: "Database returns Original URL (আসল লিঙ্ক পাওয়া গেলো)",
          whatHappens:
            "ডাটাবেজ আসল লিঙ্কটি খুঁজে পেয়ে সার্ভারকে ফেরত দিলো।",
          whyItMatters:
            "ডাটাবেজ থেকে আসল ইউআরএল মেমরিতে লোড হয় এবং সার্ভার রিডাইরেক্ট রেসপন্স তৈরি করে।",
          analogy: "🎯 খাতায় লেখা আসল ঠিকানা চোখে পড়া।",
          activeNodeIds: ["node-db", "node-server"],
          activeEdgeIds: ["edge-server-to-db"],
          edgeOverrides: {
            "edge-server-to-db": {
              label: "3. SQL Result (OK)",
              isReverse: true,
              particleColor: "success",
            },
          },
          nodeStatusMessages: {
            "node-db": "Found: https://example.com/very/long...",
            "node-server": "Preparing HTTP 301 Redirect...",
          },
          payloadSnippet: `{\n  "original_url": "https://example.com/very/long/article/system-design-roadmap"\n}`,
        },
        {
          id: "b-r4",
          flowType: "redirect",
          stepNumber: 4,
          title: "Server sends HTTP 301 Redirect (ব্রাউজার রিডাইরেক্ট হলো)",
          whatHappens:
            "সার্ভার ব্রাউজারকে বললো: 'আসল ঠিকানা হলো এইটা, তুমি সরাসরি সেখানে চলে যাও!' ব্রাউজার সাথে সাথে আসল সাইটটি ওপেন করে নিলো।",
          whyItMatters:
            "HTTP 301 (Moved Permanently) রেসপন্সের Location হেডারে আসল URL দিয়ে দেওয়া হয়, ফলে ব্রাউজার নিজে থেকেই আসল ওয়েবসাইটে চলে যায়।",
          analogy: "➡️ সাইনবোর্ড দেখে গাড়ি সঠিক হাইওয়েতে ঢুকে পড়া।",
          activeNodeIds: ["node-server", "node-client"],
          activeEdgeIds: ["edge-client-to-server"],
          edgeOverrides: {
            "edge-client-to-server": {
              label: "4. Return Short URL",
              isReverse: true,
              particleColor: "success",
            },
          },
          nodeStatusMessages: {
            "node-server": "HTTP/1.1 301 Moved Permanently",
            "node-client": "Redirecting to original URL...",
          },
          payloadSnippet: `HTTP/1.1 301 Moved Permanently\nLocation: https://example.com/very/long/article/system-design-roadmap\nCache-Control: public, max-age=86400`,
        },
      ],
    },
  ],
};
