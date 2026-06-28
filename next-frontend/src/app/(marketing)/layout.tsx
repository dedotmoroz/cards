import { Roboto } from "next/font/google";
import type { ReactNode } from "react";
import styles from "@app/components/landing/landing.module.css";

const roboto = Roboto({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${roboto.className} ${styles.marketingRoot}`}>{children}</div>
  );
}
