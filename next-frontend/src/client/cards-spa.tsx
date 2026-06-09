"use client";

import { lazy, Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuthStore } from "@/shared/store/authStore";
import { ImpersonationBanner } from "@/widgets/admin";

const HomePage = lazy(() =>
  import("@/pages/home").then((m) => ({ default: m.HomePage }))
);
const LearnPage = lazy(() =>
  import("@/pages/learn").then((m) => ({ default: m.LearnPage }))
);
const ContextReadingPage = lazy(() =>
  import("@/pages/context-reading").then((m) => ({ default: m.ContextReadingPage }))
);
const ProfilePage = lazy(() =>
  import("@/pages/profile").then((m) => ({ default: m.ProfilePage }))
);
const TelegramConnectPage = lazy(() =>
  import("@/pages/telegram-connect").then((m) => ({ default: m.TelegramConnectPage }))
);
const AdminUsersPage = lazy(() =>
  import("@/pages/admin-users").then((m) => ({ default: m.AdminUsersPage }))
);
const AdminUserDetailPage = lazy(() =>
  import("@/pages/admin-user-detail").then((m) => ({ default: m.AdminUserDetailPage }))
);
const PageContainer = lazy(() =>
  import("@/shared/ui/page-container").then((m) => ({ default: m.PageContainer }))
);

function Loading() {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
      <CircularProgress />
    </Box>
  );
}

/**
 * CSR shell for cards / learn flow (uses modules from src/legacy via @/ alias).
 */
export default function CardsSpa() {
  const router = useRouter();
  const { checkAuth, isAuthenticated } = useAuthStore();
  const user = useAuthStore((s) => s.user);
  const isAdmin = Boolean(user?.isAdmin);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    void checkAuth().finally(() => setAuthChecked(true));
  }, [checkAuth]);

  useEffect(() => {
    if (authChecked && !isAuthenticated) {
      router.replace("/signin");
    }
  }, [authChecked, isAuthenticated, router]);

  if (!authChecked || !isAuthenticated) {
    return <Loading />;
  }

  return (
    <BrowserRouter>
      <ImpersonationBanner />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/learn" element={<HomePage />} />
          <Route path="/learn/:userId" element={<HomePage />} />
          <Route path="/learn/:userId/:folderId" element={<HomePage />} />
          <Route path="/learn/:userId/virtual/:kind" element={<HomePage />} />
          <Route
            path="/learn/:userId/:folderId/study"
            element={
              <PageContainer>
                <LearnPage />
              </PageContainer>
            }
          />
          <Route
            path="/learn/:userId/virtual/:kind/study"
            element={
              <PageContainer>
                <LearnPage />
              </PageContainer>
            }
          />
          <Route path="/learn/:userId/:folderId/context-reading" element={<ContextReadingPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/telegram-connect" element={<TelegramConnectPage />} />
          {isAdmin && (
            <>
              <Route path="/admin" element={<AdminUsersPage />} />
              <Route path="/admin/users/:id" element={<AdminUserDetailPage />} />
            </>
          )}
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
