import { createNeonAuth } from "@neondatabase/auth/next/server";

// Server-side Neon Auth (Better Auth) instance. Provides .handler() for the
// auth API route, .getSession() for server components / actions / API routes,
// and the Better Auth server methods. See lib/auth/client.ts for the browser
// counterpart.
export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
  },
});
