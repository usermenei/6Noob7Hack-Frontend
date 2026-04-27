import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "drive.google.com",
      },
    ],
  },

  async headers() {
    return [
      {
        // ✅ apply to ALL routes (important!)
        source: "/(.*)",
        headers: [
          // =========================
          // 🔐 SECURITY HEADERS
          // =========================
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; img-src 'self' data: https://drive.google.com; script-src 'self'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none';",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },

          // =========================
          // 🌐 CORS (FIXED)
          // =========================
          {
            key: "Access-Control-Allow-Origin",
            value: "https://6-noob7-hack-frontend.vercel.app",
          },
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,POST,PUT,DELETE",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};

export default nextConfig;