"use client";

import { type ReactNode } from "react";
import { Box } from "@mui/material";
import { Footer } from "@/widgets/landing/footer.tsx";
import { HeaderCollection } from "@/shared/ui";
import { NextReactRouterBridge } from "@app/components/next-react-router-bridge";

export function ContentShell({ children }: { children: ReactNode }) {
  return (
    <NextReactRouterBridge>
      <Box
        sx={{
          minHeight: "100vh",
          boxSizing: "border-box",
          pt: { xs: "56px", sm: "64px" },
          display: "flex",
          flexDirection: "column",
        }}
      >
        <HeaderCollection />
        <Box sx={{ flex: "1 1 auto" }}>{children}</Box>
        <Box sx={{ mt: "auto", pt: 5 }}>
          <Footer />
        </Box>
      </Box>
    </NextReactRouterBridge>
  );
}
