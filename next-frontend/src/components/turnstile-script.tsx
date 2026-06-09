import Script from "next/script";

/** Cloudflare Turnstile (captcha on signup / guest registration). */
export function TurnstileScript() {
  return (
    <Script
      src="https://challenges.cloudflare.com/turnstile/v0/api.js"
      strategy="afterInteractive"
    />
  );
}
