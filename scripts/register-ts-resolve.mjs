import { register } from "node:module";

// `import.meta.url` — cwd নয়। ফলে রিপোর ভেতরের যেকোনো ডিরেক্টরি থেকে স্ক্রিপ্ট
// চালালেও হুকটা খুঁজে পাওয়া যায়।
register("./ts-resolve.mjs", import.meta.url);
