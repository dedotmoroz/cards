"use client";

import dynamic from "next/dynamic";
import type { EcosystemListItem } from "@app/lib/cms/ecosystems";
import { LocaleSync } from "@app/components/locale-sync";

const EcosystemsListView = dynamic(
  () =>
    import("@app/components/ecosystems-list-view").then((m) => ({
      default: m.EcosystemsListView,
    })),
  { ssr: false }
);

export function EcosystemsListShell(props: {
  locale: string;
  items: EcosystemListItem[];
}) {
  return (
    <>
      <LocaleSync locale={props.locale} />
      <EcosystemsListView locale={props.locale} items={props.items} />
    </>
  );
}
