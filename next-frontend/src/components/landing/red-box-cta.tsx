"use client";

import { ArrowForward } from "@mui/icons-material";
import { useAuthStore } from "@/shared/store/authStore";
import { useNextNavigate } from "@app/lib/navigation/use-next-navigate";
import type { AppLocale } from "@app/lib/i18n";
import { StyledWhiteButton } from "@/widgets/landing/styled-components";

type Props = {
  locale: AppLocale;
  buttonLabel: string;
  continueLabel: string;
};

export function RedBoxCta({ locale, buttonLabel, continueLabel }: Props) {
  const navigate = useNextNavigate();
  const { isAuthenticated, createGuest, user } = useAuthStore();
  const isRegistered = Boolean(user && !user.isGuest);
  const label = isRegistered ? continueLabel : buttonLabel;

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
    <StyledWhiteButton
      onClick={handleStartLearning}
      endIcon={<ArrowForward />}
      size="large"
    >
      {label}
    </StyledWhiteButton>
  );
}
