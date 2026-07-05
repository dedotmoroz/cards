"use client";

import dynamic from "next/dynamic";

const CardsSpa = dynamic(() => import("@app/client/cards-spa"), { ssr: false });

export default function AdminAppPage() {
  return <CardsSpa />;
}
