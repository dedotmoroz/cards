"use client";

import { StyledShowButton } from "@/widgets/landing/styled-components";

type Props = {
  label: string;
};

export function ScrollToFeaturesButton({ label }: Props) {
  return (
    <StyledShowButton
      variant="outlined"
      onClick={() => {
        document.getElementById("features-section")?.scrollIntoView({
          behavior: "smooth",
        });
      }}
    >
      {label}
    </StyledShowButton>
  );
}
