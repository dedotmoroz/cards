"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useAuthStore } from "@/shared/store/authStore";
import { useNextNavigate } from "@app/lib/navigation/use-next-navigate";
import { GoogleGsiScript } from "@app/components/google-gsi-script";
import styles from "./landing.module.css";

const LandingAuthDialog = dynamic(
  () =>
    import("./landing-auth-dialog").then((m) => ({
      default: m.LandingAuthDialog,
    })),
  { ssr: false }
);

type Props = {
  loginLabel: string;
  logoutLabel: string;
};

export function LandingHeaderAuth({ loginLabel, logoutLabel }: Props) {
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const { logout } = useAuthStore();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNextNavigate();

  useEffect(() => {
    const runCheck = () => {
      void checkAuth().then(() => {
        setIsLoggedIn(useAuthStore.getState().isAuthenticated);
      });
    };

    if (typeof requestIdleCallback !== "undefined") {
      const id = requestIdleCallback(runCheck);
      return () => cancelIdleCallback(id);
    }

    const timer = window.setTimeout(runCheck, 0);
    return () => window.clearTimeout(timer);
  }, [checkAuth]);

  const handleLogout = useCallback(async () => {
    await logout();
    setIsLoggedIn(false);
  }, [logout]);

  const handleAuthSuccess = useCallback(() => {
    setIsLoggedIn(true);
    navigate("/learn");
  }, [navigate]);

  return (
    <>
      {isLoggedIn ? (
        <button
          type="button"
          className={styles.authButtonOutlined}
          onClick={() => void handleLogout()}
        >
          {logoutLabel}
        </button>
      ) : (
        <button
          type="button"
          className={styles.authButtonContained}
          onClick={() => setAuthDialogOpen(true)}
        >
          {loginLabel}
        </button>
      )}
      {authDialogOpen ? (
        <>
          <GoogleGsiScript />
          <LandingAuthDialog
            open={authDialogOpen}
            onClose={() => setAuthDialogOpen(false)}
            onSuccess={handleAuthSuccess}
          />
        </>
      ) : null}
    </>
  );
}
