import { getCollections } from "@app/lib/cms/collections";
import { getEcosystems } from "@app/lib/cms/ecosystems";
import { getPages } from "@app/lib/cms/pages";
import type { CmsPage } from "@app/lib/cms/pages";
import type { CollectionListItem } from "@app/lib/cms/collections";
import type { EcosystemListItem } from "@app/lib/cms/ecosystems";

export type FooterData = {
  pages: CmsPage[];
  collections: CollectionListItem[];
  ecosystems: EcosystemListItem[];
};

export async function fetchFooterData(locale: string): Promise<FooterData> {
  const [pages, collections, ecosystems] = await Promise.all([
    getPages(locale).catch(() => [] as CmsPage[]),
    getCollections(locale).catch(() => [] as CollectionListItem[]),
    getEcosystems(locale).catch(() => [] as EcosystemListItem[]),
  ]);
  return { pages, collections, ecosystems };
}
