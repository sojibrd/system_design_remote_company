/** `learning_to_learn`-এর slug-এর হুবহু কপি — ওই সাইটের topic anchor এই নিয়মেই তৈরি */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9ঀ-৿]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
