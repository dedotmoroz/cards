/**
 * API config for Next.js (same-origin `/api` via rewrites → backend).
 * Do not use `typeof window` here: webpack inlines it at build time.
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
export const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY ?? "";

export const GOOGLE_PICKER_ACCESS_TOKEN_HEADER = "x-google-picker-access-token";

export const SITE_BASE_URL =
  process.env.NEXT_PUBLIC_SITE_BASE_URL ?? "https://kotcat.com";

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
};
