import Script from "next/script";

/** Loads Google Identity Services (Sign in with Google button). */
export function GoogleGsiScript() {
  return (
    <Script
      src="https://accounts.google.com/gsi/client"
      strategy="afterInteractive"
    />
  );
}
