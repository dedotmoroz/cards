import type { Metadata } from "next";
import { AnalyticsScripts } from "@app/components/analytics-scripts";
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

const themeInitScript = `(function(){try{var t=localStorage.getItem('kotcat-theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}else{document.documentElement.setAttribute('data-theme','light');}}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={DEFAULT_LOCALE} data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <AnalyticsScripts />
        {children}
      </body>
    </html>
  );
}
