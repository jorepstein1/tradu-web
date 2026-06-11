"use client";

import { createAuthClient } from "@neondatabase/auth/next";

// Browser-side Neon Auth (Better Auth) client. Exposes React hooks
// (useSession) and methods (signIn.social, signOut) and talks to the
// same-origin /api/auth handler. No provider wrapper is required —
// useSession is backed by an internal store.
export const authClient = createAuthClient();
