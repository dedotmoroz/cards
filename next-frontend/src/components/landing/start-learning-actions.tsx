"use client";

import { ArrowForward } from "@mui/icons-material";
import { Box } from "@mui/material";
import { useAuthStore } from "@/shared/store/authStore";
import { useNextNavigate } from "@app/lib/navigation/use-next-navigate";
import type { AppLocale } from "@app/lib/i18n";
import { StyledInButton } from "@/widgets/landing/styled-components";

type Props = {
  locale: AppLocale;
  startLabel: string;
  continueLabel: string;
};

export function StartLearningActions({
  locale,
  startLabel,
  continueLabel,
}: Props) {
  const navigate = useNextNavigate();
  const { isAuthenticated, createGuest, user } = useAuthStore();
  const isRegistered = Boolean(user && !user.isGuest);
  const label = isRegistered ? continueLabel : startLabel;

  const handleStartLearning = async () => {
    if (isAuthenticated) {
      navigate("/learn");
      return;
    }
    try {
      await createGuest(locale);
      navigate("/learn");
    } catch (error) {
      console.error("Failed to create guest:", error);
    }
  };

  return (
    <StyledInButton
      variant="contained"
      endIcon={<ArrowForward />}
      onClick={handleStartLearning}
    >
      {label}
    </StyledInButton>
  );
}
