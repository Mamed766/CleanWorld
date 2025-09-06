// middleware.js
import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// next-intl: brauzer dilini söndürürük, defaultLocale = "az"
const intlMiddleware = createMiddleware({
  ...routing,
  localeDetection: false,
});

export default function middleware(req) {
  const { pathname } = req.nextUrl;
  const LOCALES = routing.locales; // ["az", "en"]
  const DEFAULT_LOCALE = routing.defaultLocale || "az";

  // URL-dən 1-ci segmenti götür (locale?)
  const seg = pathname.split("/")[1];
  const hasLocaleInPath = LOCALES.includes(seg);

  // Cookie-dən dil (NEXT_LOCALE) oxu
  const cookieLocale = req.cookies.get("NEXT_LOCALE")?.value;

  // 1) Locale YOXDURSA → cookie varsa ora, yoxdursa default locale-ə yönləndir
  if (!hasLocaleInPath) {
    const targetLocale = LOCALES.includes(cookieLocale)
      ? cookieLocale
      : DEFAULT_LOCALE;

    const url = req.nextUrl.clone();
    url.pathname = `/${targetLocale}${pathname}`;
    return NextResponse.redirect(url);
  }

  // 2) Auth / yönləndirmə qaydaları (locale-aware)
  const token = req.cookies.get("token")?.value;
  const adminToken = req.cookies.get("adminToken")?.value;

  const isProtectedRoute =
    pathname.startsWith("/admin") || pathname === "/updateprofile";

  const isPublicRoute =
    pathname.endsWith("/login") || pathname.endsWith("/register");

  const isAdminRoute =
    pathname.startsWith("/en/admin") || pathname.startsWith("/az/admin");
  const isAdminLogin =
    pathname === "/en/admin/login" || pathname === "/az/admin/login";

  // Admin: login'e yönlendir (locale-aware)
  if (isAdminRoute && !isAdminLogin && !adminToken) {
    return NextResponse.redirect(new URL(`/${seg}/admin/login`, req.nextUrl));
  }

  // Kullanıcı: korumalı sayfalar üçün login'e yönlendir (locale-aware)
  if (!token && isProtectedRoute && !isAdminRoute) {
    return NextResponse.redirect(new URL(`/${seg}/login`, req.nextUrl));
  }

  // Girişliyken login/register'a getməsin (locale-aware)
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL(`/${seg}`, req.nextUrl));
  }

  // 3) next-intl middleware-i işlə
  const response = intlMiddleware(req);

  // 4) URL-dəki locale cookie-də fərqlidirsə → cookie-ni güncəllə (6 ay)
  if (cookieLocale !== seg) {
    response.cookies.set("NEXT_LOCALE", seg, {
      path: "/",
      maxAge: 60 * 60 * 24 * 180, // 180 gün
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|trpc|_next|_vercel|.*\\..*).*)", // next-intl
    "/(en|az)/admin/:path*",
    "/(en|az)/updateprofile",
    "/(en|az)/login",
    "/(en|az)/register",
  ],
};
