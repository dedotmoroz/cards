"use client";

import dynamic from "next/dynamic";
import type { CmsPage } from "@app/lib/cms/pages";
import { LocaleSync } from "@app/components/locale-sync";

const CmsPageView = dynamic(
  () =>
    import("@app/components/cms-page-view").then((m) => ({
      default: m.CmsPageView,
    })),
  { ssr: false }
);

export function CmsPageShell({
  page,
  locale,
}: {
  page: CmsPage;
  locale: string;
}) {
  return (
    <>
      <LocaleSync locale={locale} />
      <CmsPageView page={page} />
    </>
  );
}
