# Communication

Distributed system-এর component গুলো একে অপরের সাথে কীভাবে কথা বলবে — এটা একটা মৌলিক ডিজাইন সিদ্ধান্ত। নিচের স্তরে আছে transport protocol (TCP/UDP), তার উপরে application protocol (HTTP), আর তার উপরে API-র শৈলী (REST, GraphQL, RPC)।

---

# Transport ও Application Protocol

## TCP

Transmission Control Protocol — **connection-oriented ও নির্ভরযোগ্য**। ডেটা পাঠানোর আগে three-way handshake দিয়ে সংযোগ স্থাপন করে, প্রতিটা packet-এর প্রাপ্তিস্বীকার (ACK) নেয়, হারানো packet পুনরায় পাঠায়, এবং packet গুলোকে সঠিক ক্রমে সাজিয়ে দেয়। সেই সাথে flow control ও congestion control দিয়ে নেটওয়ার্ককে ডুবিয়ে দেওয়া থেকে বিরত থাকে।

- **সুবিধা**: যা পাঠানো হয়েছে তা পৌঁছাবে, এবং সঠিক ক্রমে পৌঁছাবে।
- **খরচ**: handshake-এর কারণে শুরুতে বাড়তি round trip, retransmission-এর কারণে অনিয়মিত latency, এবং **head-of-line blocking** — একটা packet হারালে তার পরের সবগুলো আটকে থাকে।
- **ব্যবহার**: HTTP, ডেটাবেস সংযোগ, ফাইল স্থানান্তর — অর্থাৎ যেখানে নির্ভুলতা অপরিহার্য (প্রায় সব)।

## UDP

User Datagram Protocol — **connectionless ও অনির্ভরযোগ্য**। কোনো handshake নেই, ACK নেই, retransmission নেই, ক্রমের নিশ্চয়তা নেই। শুধু packet ছুড়ে দেওয়া হয়।

- **সুবিধা**: ন্যূনতম overhead ও সর্বনিম্ন latency; broadcast ও multicast সমর্থন করে।
- **খরচ**: নির্ভরযোগ্যতা যদি লাগে, সেটা application-কেই তৈরি করতে হবে।
- **ব্যবহার**: DNS, ভিডিও কল ও VoIP, live streaming, online gaming, metric/log পাঠানো — যেখানে দেরিতে আসা ডেটার চেয়ে হারানো ডেটাই ভালো।

## HTTP

Web-এর application-layer protocol — একটা request/response ভিত্তিক, **stateless** protocol। প্রতিটা request স্বয়ংসম্পূর্ণ; server আগের request-এর কথা মনে রাখে না (state রাখতে cookie/token লাগে)। এই statelessness-ই horizontal scaling সহজ করে দিয়েছে।

সংস্করণগুলোর বিবর্তনটা জানা দরকার:
- **HTTP/1.1** — প্রতি connection-এ একসাথে একটা request; browser তাই ৬টা সমান্তরাল connection খোলে।
- **HTTP/2** — একটা connection-এ multiplexing (একসাথে অনেক request), header compression, server push। TCP-স্তরে head-of-line blocking রয়ে যায়।
- **HTTP/3** — TCP-র বদলে QUIC (UDP-র উপর) ব্যবহার করে, ফলে head-of-line blocking দূর হয় এবং সংযোগ স্থাপন দ্রুততর হয়।

---

# API শৈলী

## REST

Representational State Transfer — resource-কেন্দ্রিক একটা architectural style। প্রতিটা resource-এর একটা URL থাকে, আর HTTP method দিয়ে কাজ প্রকাশ করা হয় (`GET` পড়া, `POST` তৈরি, `PUT/PATCH` বদলানো, `DELETE` মোছা)। Status code দিয়ে ফলাফল বোঝানো হয়।

- **সুবিধা**: সর্বত্র বোঝা যায়, কোনো বিশেষ tooling লাগে না, HTTP-র caching ও proxy অবকাঠামো সরাসরি কাজে লাগে, stateless হওয়ায় scale করা সহজ।
- **অসুবিধা**: **over-fetching** (দরকারের চেয়ে বেশি field আসে) ও **under-fetching** (একটা স্ক্রিনের জন্য ৫টা call করতে হয়)। জটিল বা nested ডেটার জন্য অদক্ষ।
- **কখন**: পাবলিক API, CRUD-প্রধান সেবা, সাধারণ web ও mobile backend। **সন্দেহ হলে এটাই ডিফল্ট।**

## GraphQL

একটা query ভাষা, যেখানে client নিজেই বলে দেয় ঠিক কোন কোন field তার দরকার, এবং একটামাত্র request-এ সম্পর্কিত ডেটাও একসাথে আনতে পারে। সাধারণত একটাই endpoint (`/graphql`) থাকে, আর একটা strongly-typed schema পুরো API-র চুক্তি নির্ধারণ করে।

- **সুবিধা**: over/under-fetching সমস্যা দূর হয়, front-end টিম backend-এর পরিবর্তন ছাড়াই নতুন প্রয়োজন মেটাতে পারে, schema থেকে স্বয়ংক্রিয় ডকুমেন্টেশন ও type পাওয়া যায়।
- **অসুবিধা**: HTTP caching কঠিন (সব কিছু POST), একটা দুষ্ট query দিয়ে server-কে ডোবানো সম্ভব (query depth/complexity সীমিত করতে হয়), backend-এ **N+1 query** সমস্যা খুব সহজেই তৈরি হয় (DataLoader-এর মতো batching লাগে)।
- **কখন**: বিভিন্ন ধরনের client (web + mobile + TV) যাদের ডেটার চাহিদা ভিন্ন, বা জটিল সম্পর্কযুক্ত ডেটা।

## RPC

Remote Procedure Call — মূল ধারণাটা হলো দূরের একটা function কল করাকে স্থানীয় function কলের মতো দেখানো। REST যেখানে resource-কেন্দ্রিক, RPC সেখানে **action-কেন্দ্রিক** (`createUser`, `sendEmail`, `calculateTax`)।

- **সুবিধা**: এমন কাজের জন্য স্বাভাবিক যেগুলো CRUD-এ ভালোভাবে মেলে না, এবং সাধারণত দ্রুত ও সংক্ষিপ্ত।
- **অসুবিধা**: HTTP-র semantics (method, status code, caching) হারিয়ে যায়; client ও server শক্তভাবে যুক্ত (tightly coupled) হয়ে পড়ে, তাই পাবলিক API-র জন্য কম উপযুক্ত।

## gRPC

Google-এর তৈরি আধুনিক RPC framework — HTTP/2-র উপর চলে এবং **Protocol Buffers** দিয়ে ডেটা binary আকারে serialize করে। `.proto` ফাইলে service ও message সংজ্ঞায়িত করলে সেখান থেকেই client ও server-এর কোড তৈরি হয়ে যায়।

- **সুবিধা**: JSON-এর তুলনায় অনেক ছোট payload ও দ্রুত (de)serialization, strongly typed contract, ভাষা-নিরপেক্ষ কোড জেনারেশন, এবং চার ধরনের streaming (unary, server, client, bidirectional)।
- **অসুবিধা**: binary বলে মানুষের পড়ার অযোগ্য (debugging কঠিন), browser থেকে সরাসরি ব্যবহার করা যায় না (gRPC-Web proxy লাগে), HTTP caching সুবিধা নেই।
- **কখন**: **service-to-service অভ্যন্তরীণ যোগাযোগে এটাই সেরা পছন্দ** — যেখানে performance গুরুত্বপূর্ণ এবং দুই প্রান্তই আপনার নিয়ন্ত্রণে।

---

## দ্রুত সিদ্ধান্তের ছক

| পরিস্থিতি | পছন্দ |
|---|---|
| পাবলিক API, বাইরের ডেভেলপার | REST |
| ভেতরের microservice-এর মধ্যে | gRPC |
| বিভিন্ন চাহিদার একাধিক front-end | GraphQL |
| Server থেকে client-এ realtime push | WebSocket / SSE |
| একমুখী realtime update (notification, feed) | SSE (সহজতর) |
| দ্বিমুখী realtime (chat, gaming, collaboration) | WebSocket |
| দীর্ঘ কাজ, ফলাফল পরে | Async + polling/webhook |

---

পূর্ববর্তী: [Asynchronism](14-asynchronism.md) · পরবর্তী: [Idempotent Operations](16-idempotent-operations.md)
