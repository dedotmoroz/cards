"use client";

import type { EcosystemItem } from "@app/lib/cms/ecosystems";
import { LocaleSync } from "@app/components/locale-sync";
import { NextReactRouterBridge } from "@app/components/next-react-router-bridge";
import { EcosystemDetailPage } from "@/pages/ecosystem";

export function EcosystemDetailClient({
  locale,
  slug,
  item,
}: {
  locale: string;
  slug: string;
  item: EcosystemItem;
}) {
  return (
    <>
      <LocaleSync locale={locale} />
      <NextReactRouterBridge>
        <EcosystemDetailPage locale={locale} slug={slug} initialItem={item} />
      </NextReactRouterBridge>
    </>
  );
}
