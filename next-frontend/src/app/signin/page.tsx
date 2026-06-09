"use client";

import dynamic from "next/dynamic";

const SignInRoute = dynamic(() => import("@app/components/signin-route"), {
  ssr: false,
});

export default function SignInPage() {
  return <SignInRoute />;
}
