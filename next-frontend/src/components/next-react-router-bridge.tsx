"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Router, type To, type NavigationType } from "react-router-dom";

function toHref(to: To): string {
  if (typeof to === "string") return to;
  const pathname = to.pathname ?? "";
  const search =
    typeof to.search === "string"
      ? to.search
      : to.search
        ? `?${new URLSearchParams(to.search as Record<string, string>).toString()}`
        : "";
  const hash = to.hash ?? "";
  return `${pathname}${search}${hash}`;
}

type NavigatorOptions = {
  replace?: boolean;
  state?: unknown;
};

/**
 * Bridges react-router-dom hooks (useNavigate, Link) to Next.js App Router.
 * Avoids useSearchParams so content can SSR without Suspense bailout to a loader.
 */
export function NextReactRouterBridge({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [searchWithPrefix, setSearchWithPrefix] = useState(() =>
    typeof window !== "undefined" ? window.location.search : ""
  );

  const [state, setState] = useState(() => ({
    action: "POP" as NavigationType,
    location: {
      pathname,
      search: typeof window !== "undefined" ? window.location.search : "",
      hash: "",
      state: null as unknown,
      key: "default",
    },
  }));

  useEffect(() => {
    const search = window.location.search;
    setSearchWithPrefix(search);
    setState({
      action: "POP" as NavigationType,
      location: {
        pathname,
        search,
        hash: window.location.hash,
        state: null,
        key: `${pathname}${search}`,
      },
    });
  }, [pathname]);

  const navigator = useMemo(
    () => ({
      createHref: (to: To) => toHref(to),
      push: (to: To, stateOrOptions?: unknown, maybeOptions?: NavigatorOptions) => {
        const href = toHref(to);
        const options =
          maybeOptions ??
          (stateOrOptions &&
          typeof stateOrOptions === "object" &&
          ("replace" in stateOrOptions || "state" in stateOrOptions)
            ? (stateOrOptions as NavigatorOptions)
            : undefined);
        if (options?.replace) router.replace(href);
        else router.push(href);
      },
      replace: (to: To) => {
        router.replace(toHref(to));
      },
      go: (delta: number) => {
        if (delta === -1) router.back();
        else if (delta === 1) router.forward();
        else window.history.go(delta);
      },
    }),
    [router]
  );

  const location = useMemo(
    () => ({
      ...state.location,
      pathname,
      search: searchWithPrefix || state.location.search,
    }),
    [pathname, searchWithPrefix, state.location]
  );

  return (
    <Router location={location} navigationType={state.action} navigator={navigator}>
      {children}
    </Router>
  );
}
