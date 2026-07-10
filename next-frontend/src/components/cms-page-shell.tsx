"use client";

import type { CmsPage } from "@app/lib/cms/pages";
import { LocaleSync } from "@app/components/locale-sync";
import { CmsPageView } from "@app/components/cms-page-view";

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
