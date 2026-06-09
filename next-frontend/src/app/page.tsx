import type { Metadata } from "next";
import { LandingPageShell } from "@app/components/landing-page-shell";

export const metadata: Metadata = {
  title: "KotCat",
  description: "Learn languages with smart flashcards",
};

export default function HomePage() {
  return <LandingPageShell />;
}
