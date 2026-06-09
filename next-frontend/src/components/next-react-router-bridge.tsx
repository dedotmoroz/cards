"use client";

import { Suspense, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Router, type To } from "react-router-dom";
import { ClientPageLoader } from "@app/components/client-page-loader";

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

function RouterBridgeInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const search = searchParams.toString();
  const searchWithPrefix = search ? `?${search}` : "";

  const [state, setState] = useState(() => ({
    action: "POP" as const,
    location: {
      pathname,
      search: searchWithPrefix,
      hash: "",
      state: null,
      key: "default",
    },
  }));

  useEffect(() => {
    setState({
      action: "POP",
      location: {
        pathname,
        search: searchWithPrefix,
        hash: typeof window !== "undefined" ? window.location.hash : "",
        state: null,
        key: `${pathname}${searchWithPrefix}`,
      },
    });
  }, [pathname, searchWithPrefix]);

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

  return (
    <Router
      location={state.location}
      navigationType={state.action}
      navigator={navigator}
    >
      {children}
    </Router>
  );
}

/**
 * Bridges react-router-dom hooks (useNavigate, Link) to Next.js App Router.
 */
export function NextReactRouterBridge({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<ClientPageLoader />}>
      <RouterBridgeInner>{children}</RouterBridgeInner>
    </Suspense>
  );
}
