import type { Metadata } from "next";
import { DEFAULT_LOCALE, SITE_BASE_URL } from "@app/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_BASE_URL),
  title: {
    default: "KotCat",
    template: "%s | KotCat",
  },
  description: "Language learning with flashcards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={DEFAULT_LOCALE}>
      <body>{children}</body>
    </html>
  );
}
