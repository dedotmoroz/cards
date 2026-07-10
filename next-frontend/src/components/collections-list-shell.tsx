"use client";

import type { CollectionListItem } from "@app/lib/cms/collections";
import { LocaleSync } from "@app/components/locale-sync";
import { CollectionsListView } from "@app/components/collections-list-view";

export function CollectionsListShell(props: {
  locale: string;
  collections: CollectionListItem[];
}) {
  return (
    <>
      <LocaleSync locale={props.locale} />
      <CollectionsListView {...props} />
    </>
  );
}
