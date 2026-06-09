"use client";

import dynamic from "next/dynamic";
import { ClientPageLoader } from "@app/components/client-page-loader";

const LandingClient = dynamic(
  () =>
    import("@app/components/landing-client").then((m) => ({
      default: m.LandingClient,
    })),
  { ssr: false, loading: () => <ClientPageLoader /> }
);

type Props = {
  locale?: string;
};

/** Client-only landing shell (avoids i18n hydration mismatch on SSR). */
export function LandingPageShell({ locale }: Props) {
  return <LandingClient locale={locale} />;
}
