"use client";

import { type ReactNode, useEffect } from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { CssBaseline, GlobalStyles, ThemeProvider } from "@mui/material";
import "@/i18n";
import { darkTheme, lightTheme } from "@/shared/theme/theme";
import { useThemeStore } from "@/shared/store/themeStore";

export function AppProviders({ children }: { children: ReactNode }) {
  const mode = useThemeStore((s) => s.mode);
  const hydrate = useThemeStore((s) => s.hydrate);
  const muiTheme = mode === "dark" ? darkTheme : lightTheme;

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <GlobalStyles
          styles={{
            body: {
              background: muiTheme.palette.background.default,
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
