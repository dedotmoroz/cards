import type { NextConfig } from "next";
import path from "path";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:3000";
const strapiUrl = process.env.STRAPI_URL ?? "http://localhost:1337";

const legacySrc = path.join(__dirname, "src/legacy");
const nextSrc = path.join(__dirname, "src");

const nextConfig: NextConfig = {
  output: "standalone",
  env: {
    NEXT_PUBLIC_API_BASE_URL:
      process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api",
    // Reuse Vite env names from monorepo / CI if Next-specific vars are unset
    NEXT_PUBLIC_GOOGLE_CLIENT_ID:
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ??
      process.env.VITE_GOOGLE_CLIENT_ID ??
      "",
    NEXT_PUBLIC_GOOGLE_API_KEY:
      process.env.NEXT_PUBLIC_GOOGLE_API_KEY ??
      process.env.VITE_GOOGLE_API_KEY ??
      "",
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    resolveAlias: {
      "@/*": `${legacySrc}/*`,
      "@app/*": `${nextSrc}/*`,
    },
  },
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${backendUrl}/:path*` },
      { source: "/cms/:path*", destination: `${strapiUrl}/:path*` },
    ];
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": legacySrc,
      "@app": nextSrc,
    };
    return config;
  },
};

export default nextConfig;
