/** Vite: string URL. Next/webpack: `{ src: string }` or `{ default: ... }`. */
export function staticImageUrl(imported: unknown): string {
  if (typeof imported === "string") {
    return imported;
  }
  if (imported && typeof imported === "object") {
    const obj = imported as { src?: string; default?: unknown };
    if (typeof obj.src === "string") {
      return obj.src;
    }
    if (obj.default !== undefined) {
      return staticImageUrl(obj.default);
    }
  }
  return String(imported);
}
