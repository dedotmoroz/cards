import type { Metadata } from "next";
import { DEFAULT_LOCALE, SITE_BASE_URL, SUPPORTED_LOCALES } from "@app/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_BASE_URL),
  title: {
    default: "KotCat",
    template: "%s | KotCat",
  },
  description: "Language learning with flashcards",
  alternates: {
    languages: Object.fromEntries(
      SUPPORTED_LOCALES.map((lang) => [
        lang,
        lang === DEFAULT_LOCALE ? "/" : `/${lang}`,
      ])
    ),
  },
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
