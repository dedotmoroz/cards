import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import styles from "@app/components/landing/landing.module.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${inter.className} ${styles.marketingRoot}`}>{children}</div>
  );
}
