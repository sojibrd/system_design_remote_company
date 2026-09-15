# Application Layer

Web server layer থেকে application layer আলাদা করলে দুটো স্তর স্বাধীনভাবে scale করা যায়। Web server (বা API gateway) সংযোগ, TLS, static content ও routing সামলায়; application server-রা ব্যবসায়িক যুক্তি চালায়। Read ট্রাফিক বাড়লে শুধু web layer বাড়ান, ভারী computation বাড়লে শুধু application layer বাড়ান।

এই আলাদা করার আরেকটা সুফল হলো **stateless** design-কে বাধ্যতামূলক করা। Application server-এ কোনো session বা local state না থাকলে যেকোনো request যেকোনো server-এ যেতে পারে — আর তখনই horizontal scaling সত্যিকারের কাজ করে। State যায় Redis-এর মতো shared store বা database-এ।

## Microservices

Microservices architecture-এ অ্যাপটাকে ছোট ছোট, স্বাধীনভাবে deploy করা যায় এমন service-এ ভাগ করা হয়, যাদের প্রত্যেকের নিজস্ব ব্যবসায়িক দায়িত্ব ও (আদর্শভাবে) নিজস্ব database থাকে। যেমন — User service, Order service, Payment service, Notification service।

**সুবিধা**:
- প্রতিটা service আলাদা করে deploy ও scale করা যায় — যে অংশে চাপ, শুধু সেটা বাড়ান।
- টিমগুলো স্বাধীনভাবে কাজ করতে পারে, প্রতি service-এ আলাদা ভাষা/প্রযুক্তি বাছাই সম্ভব।
- Fault isolation — একটা service মরলে (ভালো ডিজাইন থাকলে) পুরো সিস্টেম পড়ে না।

**খরচ (এগুলোকে হালকাভাবে নেবেন না)**:
- **Distributed system-এর জটিলতা** — network failure, partial failure, retry, timeout, tracing — সব এসে যায়।
- **Data consistency** — একাধিক service-এর মধ্যে transaction করতে হলে Saga-র মতো প্যাটার্ন লাগে; সহজ `JOIN` আর করা যায় না।
- **Availability গুণিতকভাবে কমে** — request path-এ ৫টা service, প্রতিটা 99.9% হলে মোট 99.5%।
- **Operational overhead** — CI/CD, monitoring, service mesh, on-call — সবই বহুগুণ।

**বাস্তব পরামর্শ**: প্রায় সব সফল বড় সিস্টেম শুরু হয়েছে **modular monolith** দিয়ে, তারপর যেখানে সত্যিকারের প্রয়োজন হয়েছে সেই অংশটা service হিসেবে বের করা হয়েছে। প্রথম দিনেই microservice দিয়ে শুরু করা বেশিরভাগ টিমের জন্য ভুল সিদ্ধান্ত — কারণ শুরুতে আপনি জানেনই না সঠিক সীমারেখা কোথায়।

## Service Discovery

Service গুলো যখন স্বয়ংক্রিয়ভাবে scale up/down হয়, container পুনরায় চালু হয়, IP বদলায় — তখন "Order service এখন কোথায় চলছে?" এই প্রশ্নের উত্তর hardcode করা অসম্ভব। Service discovery এই সমস্যার সমাধান।

একটা **service registry** (Consul, etcd, ZooKeeper, বা Kubernetes-এর নিজস্ব ব্যবস্থা) রাখে কোন service-এর কোন instance কোন address-এ চলছে। Instance গুলো চালু হলে নিজেদের register করে এবং নিয়মিত **heartbeat/health check** পাঠায়; সাড়া না দিলে registry থেকে বাদ পড়ে।

খোঁজার দুটো ধরন:

- **Client-side discovery**: client নিজে registry-তে জিজ্ঞেস করে instance-এর তালিকা নেয়, তারপর নিজেই একটা বাছে (load balancing client-এ)। কম network hop, কিন্তু প্রতিটা client-এ discovery logic লাগে।
- **Server-side discovery**: client শুধু একটা স্থির address-এ (load balancer বা Kubernetes Service) request পাঠায়, সেটাই সঠিক instance-এ পাঠিয়ে দেয়। Client সহজ থাকে — এটাই আজকের প্রচলিত পদ্ধতি।

**Health check** এখানে কেন্দ্রীয়। দুই ধরনের check আলাদা রাখা জরুরি — **liveness** (process কি বেঁচে আছে? না থাকলে restart করো) এবং **readiness** (এটা কি এখন ট্রাফিক নিতে প্রস্তুত? না হলে শুধু ট্রাফিক বন্ধ করো, মেরো না)। এই দুটো গুলিয়ে ফেললে সাময়িকভাবে ব্যস্ত service গুলো অকারণে restart হতে থাকে।

---

পূর্ববর্তী: [Content Delivery Networks](09-content-delivery-networks.md) · পরবর্তী: [Load Balancers](11-load-balancers.md)
