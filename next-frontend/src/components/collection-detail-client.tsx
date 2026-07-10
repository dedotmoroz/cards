"use client";

import type { CollectionItem } from "@app/lib/cms/collections";
import { LocaleSync } from "@app/components/locale-sync";
import { NextReactRouterBridge } from "@app/components/next-react-router-bridge";
import { CollectionDetailPage } from "@/pages/collection";

export function CollectionDetailClient({
  locale,
  slug,
  collection,
}: {
  locale: string;
  slug: string;
  collection: CollectionItem;
}) {
  return (
    <>
      <LocaleSync locale={locale} />
      <NextReactRouterBridge>
        <CollectionDetailPage
          locale={locale}
          slug={slug}
          initialCollection={collection}
        />
      </NextReactRouterBridge>
    </>
  );
}
