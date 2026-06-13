import type { LandingPageProps } from "./types";
import { LandingPageContent } from "./landing-page-content";

export function LandingPageView(props: LandingPageProps) {
  return <LandingPageContent {...props} />;
}
