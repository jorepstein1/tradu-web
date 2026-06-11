import { auth } from "@/lib/auth/server";

// Catch-all proxy for all Neon Auth API calls (sign-in, OAuth callbacks,
// session, sign-out). Takes precedence over the /api/* rewrite to Flask
// because Next.js app routes are matched before afterFiles rewrites.
export const { GET, POST } = auth.handler();
