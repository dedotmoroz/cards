"use client";

import dynamic from "next/dynamic";

const SignUpRoute = dynamic(() => import("@app/components/signup-route"), {
  ssr: false,
});

export default function SignUpPage() {
  return <SignUpRoute />;
}
