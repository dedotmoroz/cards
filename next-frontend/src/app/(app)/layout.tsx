import type { ReactNode } from "react";
import { AppProviders } from "@app/components/providers";
import { GoogleGsiScript } from "@app/components/google-gsi-script";
import { TurnstileScript } from "@app/components/turnstile-script";

export default function AppShellLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <GoogleGsiScript />
      <TurnstileScript />
      <AppProviders>{children}</AppProviders>
    </>
  );
}
