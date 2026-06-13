"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

export function useNextNavigate() {
  const router = useRouter();

  return useCallback(
    (to: string, options?: { replace?: boolean }) => {
      if (options?.replace) router.replace(to);
      else router.push(to);
    },
    [router]
  );
}
