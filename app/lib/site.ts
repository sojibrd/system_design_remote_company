/**
 * সাইটের পরিচয় আর এই পথের সেটিং — plan-এর কনটেন্ট নয়, তাই `docs/`-এ নয়, এখানে।
 *
 * তিনটা পথের (লোকাল · রিমোট · গ্লোবাল) কোড একই; পার্থক্য শুধু এই ফাইল,
 * `next.config.ts`-এর basePath আর `docs/`-এর কনটেন্ট।
 */
export const SITE: {
  title: string;
  short: string;
  emoji: string;
  description: string;
  storagePrefix: string;
  suggestedStart: string | null;
} = {
  title: "রিমোট কোম্পানির system design",
  short: "রিমোট system design",
  emoji: "📝",
  description:
    "বিদেশি রিমোট কোম্পানির লিখিত আর আলোচনামূলক design রাউন্ডের জন্য — দশটা ডক, frontend system design আর ইংরেজিতে তিনটা design doc, ৫৬ দিনে, learning to learn-এর নীতিতে।",
  /** localStorage key-এর prefix — তিন পথের progress আলাদা থাকে */
  storagePrefix: "rsd",
  /** এই পথ কবে শুরু হবে জানা নেই — প্রস্তাব নেই, আজকের তারিখ দেখায় */
  suggestedStart: null,
};
