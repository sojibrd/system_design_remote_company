/**
 * Node-এর ESM resolver-এর জন্য ছোট একটা হুক।
 *
 * প্রজেক্টের TypeScript ফাইলগুলো bundler-স্টাইলে extension ছাড়া import করে
 * (`../../types`), যা Next/Turbopack বোঝে কিন্তু খালি Node বোঝে না। এই হুক
 * শুধু অনুপস্থিত `.ts` বা `/index.ts` জুড়ে দেয় — আর কিছু করে না।
 */
export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    if (!specifier.startsWith(".")) throw error;
    for (const suffix of [".ts", "/index.ts"]) {
      try {
        return await nextResolve(specifier + suffix, context);
      } catch {
        // পরেরটা চেষ্টা করি
      }
    }
    throw error;
  }
}
