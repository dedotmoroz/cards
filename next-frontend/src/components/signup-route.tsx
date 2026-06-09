"use client";

import { AuthPageClient } from "@app/components/auth-page-client";
import { SignUpPage } from "@/pages/signup";

export default function SignUpRoute() {
  return <AuthPageClient Page={SignUpPage} path="/signup" />;
}
