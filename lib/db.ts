import { neon, NeonQueryFunction } from "@neondatabase/serverless";

// Lazily construct the tagged-template SQL client for app tables
// (search_history, user_mochi_settings). neon() throws if DATABASE_URL is
// unset, so we defer construction until first use (within a request) rather
// than at module import — otherwise the build would fail collecting routes.
// Auth.js manages its own tables via the Pool-based adapter in auth.ts.
let cached: NeonQueryFunction<false, false> | null = null;

export const getSql = (): NeonQueryFunction<false, false> => {
  if (!cached) {
    cached = neon(process.env.DATABASE_URL!);
  }
  return cached;
};
