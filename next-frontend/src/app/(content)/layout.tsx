import type { ReactNode } from "react";
import { AppProviders } from "@app/components/providers";

export default function ContentLayout({ children }: { children: ReactNode }) {
  return <AppProviders>{children}</AppProviders>;
}
