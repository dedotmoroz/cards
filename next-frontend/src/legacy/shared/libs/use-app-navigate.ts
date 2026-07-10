import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useNavigate } from "react-router-dom";

const NEXT_JS_PREFIXES = ["/signin", "/signup", "/collections", "/ecosystem", "/p"];

const LOCALIZED_CONTENT =
  /^\/[a-z]{2}\/(collections|ecosystem|p)(\/|$)/;

/** Paths owned by Next.js App Router (not CardsSpa react-router routes). */
export function isAppRouterPath(path: string): boolean {
  if (path === "/") return true;
  if (/^\/[a-z]{2}$/.test(path)) return true;
  if (LOCALIZED_CONTENT.test(path)) return true;
  return NEXT_JS_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );
}

/**
 * Navigates via Next.js App Router for site-wide routes, react-router for CardsSpa routes.
 */
export function useAppNavigate() {
  const nextRouter = useRouter();
  const rrNavigate = useNavigate();

  return useCallback(
    (to: string, options?: { replace?: boolean }) => {
      if (isAppRouterPath(to)) {
        if (options?.replace) nextRouter.replace(to);
        else nextRouter.push(to);
      } else {
        rrNavigate(to, options);
      }
    },
    [nextRouter, rrNavigate]
  );
}
