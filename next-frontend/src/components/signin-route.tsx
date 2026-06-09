"use client";

import { AuthPageClient } from "@app/components/auth-page-client";
import { SignInPage } from "@/pages/signin";

export default function SignInRoute() {
  return <AuthPageClient Page={SignInPage} path="/signin" />;
}
