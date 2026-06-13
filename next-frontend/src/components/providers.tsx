"use client";

import { type ReactNode } from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { CssBaseline, GlobalStyles, ThemeProvider } from "@mui/material";
import "@/i18n";
import { theme } from "@/shared/theme/theme";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles
          styles={{
            body: {
              background: theme.palette.background.default,
              backgroundAttachment: "fixed",
              minHeight: "100vh",
            },
            ".picker-dialog": {
              position: "fixed !important",
              top: "50% !important",
              left: "50% !important",
              transform: "translate(-50%, -50%) !important",
              zIndex: "20000 !important",
            },
          }}
        />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
