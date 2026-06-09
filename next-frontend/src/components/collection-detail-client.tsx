"use client";

import dynamic from "next/dynamic";
import { Route, Routes } from "react-router-dom";
import { LocaleSync } from "@app/components/locale-sync";
import { NextReactRouterBridge } from "@app/components/next-react-router-bridge";
import { ClientPageLoader } from "@app/components/client-page-loader";

const CollectionDetailPage = dynamic(
  () => import("@/pages/collection").then((m) => ({ default: m.CollectionDetailPage })),
  { ssr: false, loading: () => <ClientPageLoader /> }
);

export function CollectionDetailClient({ locale }: { locale: string }) {
  return (
    <>
      <LocaleSync locale={locale} />
      <NextReactRouterBridge>
        <Routes>
          <Route
            path="/collections/:locale/:slug"
            element={<CollectionDetailPage />}
          />
        </Routes>
      </NextReactRouterBridge>
    </>
  );
}
