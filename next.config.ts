import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  experimental: {
    reactCompiler: true,
  },
  images: {
    remotePatterns: [
      // Google account avatars returned by Neon Auth (Better Auth) sign-in
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  rewrites: async () => {
    // Proxy /api/* to Flask, EXCEPT routes handled by Next.js itself:
    // /api/auth/* (Neon Auth handler — a dynamic catch-all, which afterFiles
    // rewrites would otherwise shadow), /api/history, and /api/mochi-settings.
    return [
      {
        source: "/api/:path((?!auth/|history|mochi-settings).*)",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:5328/api/:path"
            : "/api/",
      },
    ];
  },
};

export default nextConfig;
