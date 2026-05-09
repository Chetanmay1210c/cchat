import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(
  req: NextRequest
) {
  const token =
    req.cookies.get("token");

  const isLoggedIn =
    !!token;

  const pathname =
    req.nextUrl.pathname;

  // =====================
  // BLOCK LOGIN/SIGNUP
  // =====================

  if (
    isLoggedIn &&
    (
      pathname === "/login" ||
      pathname === "/signup"
    )
  ) {
    return NextResponse.redirect(
      new URL(
        "/dashboard",
        req.url
      )
    );
  }

  // =====================
  // PROTECT DASHBOARD
  // =====================

  if (
    !isLoggedIn &&
    pathname.startsWith(
      "/dashboard"
    )
  ) {
    return NextResponse.redirect(
      new URL(
        "/login",
        req.url
      )
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/signup",
    "/dashboard/:path*",
  ],
};