"use client";

import { useEffect } from "react";
import { LandingPage } from "@/pages/landing";
import { LocaleSync } from "@app/components/locale-sync";
import { NextReactRouterBridge } from "@app/components/next-react-router-bridge";
import { useAuthStore } from "@/shared/store/authStore";

type Props = {
  /** When set (e.g. /en), overrides localStorage language detector */
  locale?: string;
};

export function LandingClient({ locale }: Props) {
  const checkAuth = useAuthStore((s) => s.checkAuth);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  return (
    <>
      {locale ? <LocaleSync locale={locale} /> : null}
      <NextReactRouterBridge>
        <LandingPage />
      </NextReactRouterBridge>
    </>
  );
}
