"use client";

import { CssBaseline, ThemeProvider } from "@mui/material";
import "@/i18n";
import { theme } from "@/shared/theme/theme";
import { AuthDialog } from "@/entities/user/auth-dialog";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export function LandingAuthDialog({ open, onClose, onSuccess }: Props) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthDialog open={open} onClose={onClose} onSuccess={onSuccess} />
    </ThemeProvider>
  );
}
