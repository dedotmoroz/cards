"use client";

import { useEffect, useState } from "react";
import { Box, Button } from "@mui/material";
import { useAuthStore } from "@/shared/store/authStore";
import { AuthDialog } from "@/entities/user/auth-dialog";
import { useNextNavigate } from "@app/lib/navigation/use-next-navigate";
import type { AppLocale } from "@app/lib/i18n";
import { localePath } from "@app/lib/i18n/server";
import Link from "next/link";
import { LanguageSwitcherNext } from "./language-switcher-next";
import { StyledHeaderTop, StyledLogo } from "@/widgets/landing/styled-components";

type Props = {
  locale: AppLocale;
  loginLabel: string;
  logoutLabel: string;
};

export function LandingHeader({ locale, loginLabel, logoutLabel }: Props) {
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const { isAuthenticated, logout } = useAuthStore();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const navigate = useNextNavigate();

  useEffect(() => {
    void checkAuth().finally(() => setAuthReady(true));
  }, [checkAuth]);

  const handleLogout = async () => {
    await logout();
  };

  const handleAuthSuccess = () => {
    navigate("/learn");
  };

  return (
    <>
      <StyledHeaderTop>
        <StyledLogo>
          <Link href={localePath(locale)} style={{ display: "block", width: "100%", height: 24 }} aria-label="KotCat">
            <Box component="span" />
          </Link>
        </StyledLogo>
        <Box display="flex" alignItems="center" gap={2}>
          <LanguageSwitcherNext locale={locale} />
          {authReady && isAuthenticated ? (
            <Button
              variant="outlined"
              onClick={handleLogout}
              sx={{ textTransform: "none", background: "#fff" }}
            >
              {logoutLabel}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={() => setAuthDialogOpen(true)}
              sx={{ textTransform: "none", background: "#000" }}
            >
              {loginLabel}
            </Button>
          )}
        </Box>
      </StyledHeaderTop>
      <AuthDialog
        open={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}
