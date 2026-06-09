"use client";

import { PageLayout } from "@/entities";
import type { CmsPage } from "@app/lib/cms/pages";
import { ContentShell } from "./content-shell";
import { StrapiBlocks } from "./strapi-blocks";

export function CmsPageView({ page }: { page: CmsPage }) {
  return (
    <ContentShell>
      <PageLayout title={page.title} content={<StrapiBlocks content={page.content} />} />
    </ContentShell>
  );
}
