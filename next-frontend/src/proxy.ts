import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_LOCALE } from "@app/lib/i18n";
import {
  LOCALE_COOKIE,
  resolvePreferredLocale,
} from "@app/lib/i18n/locale-preference";

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname !== "/") {
    return NextResponse.next();
  }

  const locale = resolvePreferredLocale(
    request.cookies.get(LOCALE_COOKIE)?.value,
    request.headers.get("accept-language"),
  );

  if (locale === DEFAULT_LOCALE) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL(`/${locale}`, request.url));
}

export const config = {
  matcher: ["/"],
};
