import { slugify } from "./slug";

/**
 * plan-এর 🧠 (…) বন্ধনীর নাম → `learning_to_learn`-এর বিষয়।
 *
 * পাঁচটা ডকের (Principle · Lies · Pillars · Science · Techniques) **সব** বিষয় আছে —
 * system design-এর প্রস্তুতিতে কোনটা কোথায় খাটে, এক লাইনে। ঐ সাইটের ডক থেকে হাতে
 * তোলা, build-এর সময় পড়া নয় — CI-তে শুধু এই repo থাকে। পুরো ব্যাখ্যার লিংক ঐ সাইটের
 * topic anchor-এ নামে।
 *
 * plan-এ নতুন নাম লিখলে এখানে না থাকলে সাইট ভাঙে না — chip দেখায়, ব্যাখ্যা দেখায় না।
 */
export type Principle = {
  /** `learning_to_learn/docs/0n-<doc>.md` → route `/<doc>/` */
  doc: "principle" | "lies" | "pillars" | "science" | "techniques";
  /** ঐ ডকে বুলেটের **নাম** হুবহু — anchor এটা থেকেই */
  topic: string;
  /** system design-এর প্রস্তুতিতে কেন — এক লাইনে */
  line: string;
};

const L2L_SITE = "https://sojibrd.github.io/learning_to_learn";

const ENTRIES: [names: string[], principle: Principle][] = [
  /* --- Principle --------------------------------------------------------- */
  [
    ["Learning vs Winning"],
    {
      doc: "principle",
      topic: "Learning vs Winning",
      line: "চেনা সিস্টেম বারবার বলা জেতার খেলা; যেখানে চুপ হয়ে যান সেই অংশ ধরা শেখার খেলা।",
    },
  ],
  [
    ["What is success?"],
    {
      doc: "principle",
      topic: "What is success?",
      line: "এই পথে সফলতা = নিজের লেখা হর পূরণ — ডক কয়টা পড়া হলো সেটা নয়, কয়টা ডিজাইন লেখা ও বলা হলো।",
    },
  ],
  [
    ["The obstacle"],
    {
      doc: "principle",
      topic: "The obstacle",
      line: "যে follow-up প্রশ্নে আটকান, শেখার জিনিসটা ঠিক ওখানেই — এড়ালে শেখাটাও এড়ানো হয়।",
    },
  ],
  [
    ["The dip"],
    {
      doc: "principle",
      topic: "The dip",
      line: "ডক পড়ার উৎসাহ শেষ, মুখে বলা এখনো আসেনি — বেশিরভাগ মানুষ এখানেই ছাড়ে। প্রশ্ন একটাই: dip, নাকি সত্যিই ভুল পথ?",
    },
  ],
  [
    ["Compound learning"],
    {
      doc: "principle",
      topic: "Compound learning",
      line: "দিনে একটা সিদ্ধান্ত লেখা চক্রবৃদ্ধির মতো জমে — প্রতিটা নতুন সিস্টেমে আগের সিদ্ধান্তগুলো ফিরে আসে।",
    },
  ],
  [
    ["Failures don't count"],
    {
      doc: "principle",
      topic: "Failures don't count",
      line: "৪৫ মিনিটে শেষ না হওয়া ডিজাইন ক্ষতি নয়, যদি রেকর্ডিং শুনে এক লাইনে লেখা হয় কোথায় থেমেছিলেন।",
    },
  ],
  [
    ["Choice vs Chore"],
    {
      doc: "principle",
      topic: "Choice vs Chore",
      line: "\"আজ system design পড়তে হবে\" নয়, \"আজ এই একটা সিদ্ধান্তের কারণ লিখছি\" — কাজ একই, শক্তি আলাদা।",
    },
  ],
  [
    ["It's all in the frame"],
    {
      doc: "principle",
      topic: "It's all in the frame",
      line: "\"আমি system design পারি না\" নয়, \"আমি এখনো ___ সেকশনে\" — দ্বিতীয় ফ্রেমে পরের ধাপটা দেখা যায়।",
    },
  ],
  [
    ["Pareto", "Pareto principle"],
    {
      doc: "principle",
      topic: "Pareto principle",
      line: "৮০% ফল আসে ২০% কাজ থেকে — এই পথের interview-এ যে ডক আর সিস্টেম লাগে শুধু সেগুলো।",
    },
  ],
  [
    ["Skill stacking"],
    {
      doc: "principle",
      topic: "Skill stacking",
      line: "design একা নয় — design + লিখে বোঝানো + ইংরেজিতে বলা একসাথে যে জায়গা বানায়, তা বিরল।",
    },
  ],
  [
    ["Happiness factors"],
    {
      doc: "principle",
      topic: "Happiness factors",
      line: "ঘুম, স্বাস্থ্য, পরিবার বাদ দিয়ে আরেকটা সিস্টেম — এটা জেতা নয়।",
    },
  ],
  [
    ["Productivity time", "Your productivity time"],
    {
      doc: "principle",
      topic: "Your productivity time",
      line: "দিনের যে সময়ে মাথা সবচেয়ে ভালো চলে, নতুন ডিজাইন তখন; ঝালাই আর রেকর্ডিং শোনা বাকি সময়ে।",
    },
  ],
  [
    ["Self learning paradigm"],
    {
      doc: "principle",
      topic: "Self learning paradigm",
      line: "কোর্স নয় — প্রশ্ন, অনুমান, সিদ্ধান্ত, আর নিজে খুঁজে বের করা কোথায় ভাঙবে; এই ক্ষমতাটাই পরের পথে যায়।",
    },
  ],

  /* --- Lies -------------------------------------------------------------- */
  [
    ["Follow your passion"],
    {
      doc: "lies",
      topic: "Follow your passion",
      line: "system design ভালো লাগার অপেক্ষা নয় — কয়েকটা সিস্টেম মুখে বলা গেলে ভালো লাগা আসে।",
    },
  ],
  [
    ["You can avoid risk"],
    {
      doc: "lies",
      topic: "You can avoid risk",
      line: "\"সব ডক পড়ে তারপর interview\" ঝুঁকি এড়ায় না — সময় হারানোর ঝুঁকিটা নেয়।",
    },
  ],
  [
    ["Trust this one person"],
    {
      doc: "lies",
      topic: "Trust this one person",
      line: "একটা বই বা একটা YouTube চ্যানেলের ডিজাইন মুখস্থ নয় — নিজের অনুমান থেকে নিজের সিদ্ধান্ত।",
    },
  ],
  [
    ["10,000 hours rule"],
    {
      doc: "lies",
      topic: "10,000 hours rule",
      line: "ডক বা সিস্টেমের সংখ্যা দক্ষতা বানায় না, deliberate practice বানায় — না বলে শুধু পড়া মানে শুধু চেনা লাগা।",
    },
  ],

  /* --- Pillars ----------------------------------------------------------- */
  [
    ["Everything is a game"],
    {
      doc: "pillars",
      topic: "Everything is a game",
      line: "design আলোচনারও নিয়ম আছে — প্রশ্ন আর scope আগে, সহজ ডিজাইন তারপর, শেষে নিজে থেকে \"কোথায় ভাঙবে\"।",
    },
  ],
  [
    ["Feynman", "Feynman technique"],
    {
      doc: "pillars",
      topic: "Feynman technique",
      line: "সিদ্ধান্তের কারণ বাচ্চাকে বোঝানোর মতো ৩ লাইনে লিখুন; যেখানে আটকান সেটাই ফাঁক।",
    },
  ],
  [
    ["Trunk based knowledge"],
    {
      doc: "pillars",
      topic: "Trunk based knowledge",
      line: "সিস্টেম পাতা, ছয় সেকশনের ছাঁচ কাণ্ড — ছাঁচ শক্ত থাকলে অচেনা সিস্টেমও কোথা থেকে শুরু করবেন জানা থাকে।",
    },
  ],
  [
    ["Efficiency trumps grit"],
    {
      doc: "pillars",
      topic: "Efficiency trumps grit",
      line: "এক সিদ্ধান্তে এক ঘণ্টা আটকে থাকা বীরত্ব নয় — টাইমার শেষে যা আছে লিখে পরের সেকশনে যান।",
    },
  ],

  /* --- Science ----------------------------------------------------------- */
  [
    ["Focus vs Diffuse", "Focus vs Diffuse mode"],
    {
      doc: "science",
      topic: "Focus vs Diffuse mode",
      line: "১০ মিনিট আটকালে উঠে হাঁটুন — \"কোথায় ভাঙবে\"-র উত্তর প্রায়ই diffuse মোডে আসে।",
    },
  ],
  [
    ["Sleep", "The science of sleep"],
    {
      doc: "science",
      topic: "The science of sleep",
      line: "আজকের সিদ্ধান্ত ঘুমের মধ্যে স্মৃতিতে বসে — রাত জেগে আরেকটা সেকশন নয়।",
    },
  ],
  [
    ["Brain training"],
    {
      doc: "science",
      topic: "Brain training",
      line: "diagram অ্যাপে সুন্দর ছবি নয় — interview-এর দক্ষতা বাড়ে কাগজে আঁকতে আঁকতে মুখে বলায়।",
    },
  ],
  [
    ["Feedback", "The science of feedback"],
    {
      doc: "science",
      topic: "The science of feedback",
      line: "রেকর্ড করে শোনা — কোথায় চুপ, কোথায় বইয়ের কথা; দ্রুত, নির্দিষ্ট feedback এটাই।",
    },
  ],
  [
    ["Procrastination"],
    {
      doc: "science",
      topic: "Procrastination",
      line: "অস্বস্তিটা শুরুর আগেই — শুধু ফাইলটা খুলে প্রথম সেকশনের শিরোনাম লিখুন, বাকিটা আসে।",
    },
  ],
  [
    ["Long and short memory"],
    {
      doc: "science",
      topic: "Long and short memory",
      line: "মাথা একবারে ~৪টা জিনিস ধরে — দিনে একটা সেকশন বা একটা প্রশ্ন, পাতায় শুধু আজ।",
    },
  ],
  [
    ["Active learning", "Active vs Passive learning"],
    {
      doc: "science",
      topic: "Active vs Passive learning",
      line: "ডক পড়া চেনা লাগায়; নিজের প্রজেক্ট দিয়ে লেখা আর না দেখে বলা শেখায়।",
    },
  ],
  [
    ["Motivation", "The science of motivation"],
    {
      doc: "science",
      topic: "The science of motivation",
      line: "ইচ্ছা আসে প্রথম ৫ মিনিটের পরে — আগে বসুন।",
    },
  ],
  [
    ["Goals"],
    {
      doc: "science",
      topic: "Goals",
      line: "\"system design-এ ভালো হব\" লক্ষ্য নয় — \"এই দিনের মধ্যে এই design doc, লেখা আর মুখে\" লক্ষ্য।",
    },
  ],
  [
    ["It pays to be not busy"],
    {
      doc: "science",
      topic: "It pays to be not busy",
      line: "সপ্তাহে ফাঁকা দিন রাখা — diffuse মোড কাজ করে ফাঁকা সময়েই।",
    },
  ],
  [
    ["Chunking"],
    {
      doc: "science",
      topic: "Chunking",
      line: "\"read-heavy + বাসি চলে → cache\" — ছড়ানো সিদ্ধান্ত এক গুচ্ছে বাঁধলে মনে থাকে।",
    },
  ],
  [
    ["Deliberate practice"],
    {
      doc: "science",
      topic: "Deliberate practice",
      line: "যা পারেন তার পুনরাবৃত্তি নয় — যে সেকশনে থামেন ঠিক তার ওপর, সীমার একটু বাইরে, সাথে feedback।",
    },
  ],
  [
    ["Spaced repetition"],
    {
      doc: "science",
      topic: "Spaced repetition",
      line: "একবারে দশবার নয় — ভুলে যাওয়ার ঠিক আগে আবার না দেখে বললে স্মৃতি সবচেয়ে শক্ত হয়।",
    },
  ],
  [
    ["Energy saving with habits"],
    {
      doc: "science",
      topic: "Energy saving with habits",
      line: "\"আজ কোন ডক\" plan আগেই ঠিক করে রেখেছে — ভাবার শক্তিটা সিদ্ধান্তে যায়।",
    },
  ],
  [
    ["Be adventurous"],
    {
      doc: "science",
      topic: "Be adventurous",
      line: "চেনা উত্তরের বাইরে একটা বিকল্প ভেবে দেখা — নতুনত্ব মাথা সজাগ রাখে।",
    },
  ],
  [
    ["Have an endpoint"],
    {
      doc: "science",
      topic: "Have an endpoint",
      line: "বসার আগে শেষ সময় ঠিক — ৪৫′ টাইমার থাকলে scope নিজে থেকেই ছোট হয়।",
    },
  ],
  [
    ["Be bored"],
    {
      doc: "science",
      topic: "Be bored",
      line: "রিকশায় ফোন না খুলে আজকের সিস্টেমটা মাথায় ঘোরান — \"কোথায় ভাঙবে\" প্রায়ই তখনই আসে।",
    },
  ],

  /* --- Techniques -------------------------------------------------------- */
  [
    ["Pomodoro", "Pomodoro technique"],
    {
      doc: "techniques",
      topic: "Pomodoro technique",
      line: "\"মাত্র ২৫ মিনিট, একটা সেকশন\" — শুরু সহজ হয়; বিরতিতে ফোন নয়।",
    },
  ],
  [
    ["Chunk the subject"],
    {
      doc: "techniques",
      topic: "Chunk the subject",
      line: "\"system design শিখব\" নয় — \"আজ শুধু cache কোথায় বসে, আর কখন বাসি হয়\"।",
    },
  ],
  [
    ["Spaced repetition revisited"],
    {
      doc: "techniques",
      topic: "Spaced repetition revisited",
      line: "১, ৩, ৭, ২১ দিন — হিসাবটা সাইট রাখে, আপনি শুধু না দেখে বলেন।",
    },
  ],
  [
    ["Deliberate practice revisited"],
    {
      doc: "techniques",
      topic: "Deliberate practice revisited",
      line: "বসার আগে এক লাইন: \"আজ কোন দুর্বলতায় কাজ\" — লক্ষ্যহীন অনুশীলন শুধু সময় খরচ।",
    },
  ],
  [
    ["Create a roadmap"],
    {
      doc: "techniques",
      topic: "Create a roadmap",
      line: "কোন দিনে কোন ডক, কোন সেকশন আগেই লেখা — প্রতিদিন \"আজ কী\" ভাবতে হয় না।",
    },
  ],
  [
    ["Interleaving"],
    {
      doc: "techniques",
      topic: "Interleaving",
      line: "সিস্টেম মিশিয়ে, এলোমেলো তুলে — interview-তে কোন সিস্টেম আসবে আপনি বাছেন না।",
    },
  ],
  [
    ["Einstellung"],
    {
      doc: "techniques",
      topic: "Einstellung",
      line: "সিদ্ধান্তের পরে এক মিনিট: আর কোন বিকল্প ছিল? প্রথম চেনা উত্তরটাই প্রায়ই ভালোটা আড়াল করে।",
    },
  ],
  [
    ["Community", "Importance of community"],
    {
      doc: "techniques",
      topic: "Importance of community",
      line: "একজন সঙ্গী যে মাঝপথে follow-up করে — প্রশ্ন আর জবাবদিহি দুটোই গতি বাড়ায়।",
    },
  ],
  [
    ["Habits revisited"],
    {
      doc: "techniques",
      topic: "Habits revisited",
      line: "সংকেত → কাজ → পুরস্কার: \"___ করার পরেই আজকের সেকশন\"।",
    },
  ],
  [
    ["System vs goal"],
    {
      doc: "techniques",
      topic: "System vs goal",
      line: "\"design doc সম্পূর্ণ\" লক্ষ্য, \"সোম–শুক্র দিনে একটা ছোট কাজ\" সিস্টেম — পৌঁছে দেয় সিস্টেম।",
    },
  ],
  [
    ["The power of senses"],
    {
      doc: "techniques",
      topic: "The power of senses",
      line: "কাগজে বাক্স আঁকা, জোরে বলা — প্রতিটা ইন্দ্রিয় স্মৃতির আলাদা পথ।",
    },
  ],
  [
    ["Method of loci"],
    {
      doc: "techniques",
      topic: "Method of loci",
      line: "ছয় সেকশন ঘরের ছয় কোণে বসান — মনে মনে হেঁটে এসে পুরো ছাঁচ ফিরিয়ে আনুন।",
    },
  ],
  [
    ["Pareto principle revisited"],
    {
      doc: "techniques",
      topic: "Pareto principle revisited",
      line: "পুরো ২৫টা ডক নয় — এই পথের ২০%, বাকিটা দরকার হলে তখন।",
    },
  ],
  [
    ["Parkinson's law"],
    {
      doc: "techniques",
      topic: "Parkinson's law",
      line: "ডিজাইন যত সময় পায় ততটাই নেয় — টাইমারটাই সীমা।",
    },
  ],
  [
    ["Deep work", "Exercise deep work"],
    {
      doc: "techniques",
      topic: "Exercise deep work",
      line: "notification বন্ধ, ফোন অন্য ঘরে — ৪৫ মিনিট টানা, ভাঙা ভাঙা নয়।",
    },
  ],
  [
    ["Stakes & Rewards"],
    {
      doc: "techniques",
      topic: "Stakes & Rewards",
      line: "কাউকে তারিখটা বলে রাখা, বা doc প্রকাশের দিনে ছোট একটা পুরস্কার — কিছু বাজি থাকলে কাজটা হয়।",
    },
  ],
  [
    ["Concepts vs Facts"],
    {
      doc: "techniques",
      topic: "Concepts vs Facts",
      line: "\"Redis\" fact, \"read-heavy হলে cache কেন সস্তা\" concept — মনে রাখুন concept।",
    },
  ],
  [
    ["Test yourself"],
    {
      doc: "techniques",
      topic: "Test yourself",
      line: "doc বন্ধ রেখে বলার চেষ্টাই শেখা — যেখানে আটকান, সেটাই দেখায় ফাঁক কোথায়।",
    },
  ],
  [
    ["The first 20 hours", "Exercise: the first 20 hours"],
    {
      doc: "techniques",
      topic: "Exercise: the first 20 hours",
      line: "প্রথম কয়েকটা ডিজাইনের বিচ্ছিরি অনুভূতিটা স্বাভাবিক — ছোট করে, শুরুতেই হাত লাগান।",
    },
  ],
];

const PRINCIPLES = new Map<string, Principle>(
  ENTRIES.flatMap(([names, principle]) => names.map((name) => [name.toLowerCase(), principle] as const)),
);

export function findPrinciple(name: string): Principle | undefined {
  return PRINCIPLES.get(name.trim().toLowerCase());
}

export function principleHref(principle: Principle): string {
  return `${L2L_SITE}/${principle.doc}/#${slugify(principle.topic)}`;
}
