"use client";

import dynamic from "next/dynamic";
import { Route, Routes } from "react-router-dom";
import { LocaleSync } from "@app/components/locale-sync";
import { NextReactRouterBridge } from "@app/components/next-react-router-bridge";
import { ClientPageLoader } from "@app/components/client-page-loader";

const EcosystemDetailPage = dynamic(
  () => import("@/pages/ecosystem").then((m) => ({ default: m.EcosystemDetailPage })),
  { ssr: false, loading: () => <ClientPageLoader /> }
);

export function EcosystemDetailClient({ locale }: { locale: string }) {
  return (
    <>
      <LocaleSync locale={locale} />
      <NextReactRouterBridge>
        <Routes>
          <Route
            path="/ecosystem/:locale/:slug"
            element={<EcosystemDetailPage />}
          />
        </Routes>
      </NextReactRouterBridge>
    </>
  );
}
