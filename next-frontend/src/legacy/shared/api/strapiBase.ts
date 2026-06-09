/** Client-side Strapi base URL (browser). */
const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

export const STRAPI_URL = isLocalhost
  ? (process.env.NEXT_PUBLIC_STRAPI_PUBLIC_URL ?? "http://localhost:1337")
  : "/cms";
