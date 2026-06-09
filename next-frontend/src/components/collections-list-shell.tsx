"use client";

import dynamic from "next/dynamic";
import type { CollectionListItem } from "@app/lib/cms/collections";
import { LocaleSync } from "@app/components/locale-sync";

const CollectionsListView = dynamic(
  () =>
    import("@app/components/collections-list-view").then((m) => ({
      default: m.CollectionsListView,
    })),
  { ssr: false }
);

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
