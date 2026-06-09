"use client";

import { BlocksRenderer, type BlocksContent } from "@strapi/blocks-react-renderer";

export function StrapiBlocks({ content }: { content: unknown }) {
  if (!content) return null;
  return <BlocksRenderer content={content as BlocksContent} />;
}
