"use client";

import { LandingPage } from "@/pages/landing";
import { LocaleSync } from "@app/components/locale-sync";
import { NextReactRouterBridge } from "@app/components/next-react-router-bridge";

type Props = {
  /** When set (e.g. /en), overrides localStorage language detector */
  locale?: string;
};

export function LandingClient({ locale }: Props) {
  return (
    <>
      {locale ? <LocaleSync locale={locale} /> : null}
      <NextReactRouterBridge>
        <LandingPage />
      </NextReactRouterBridge>
    </>
  );
}
