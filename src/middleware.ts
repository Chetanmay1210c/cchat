import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET!;

export function middleware(
  req: NextRequest
) {
  const token =
    req.cookies.get(
      "token"
    )?.value;

  const pathname =
    req.nextUrl.pathname;

  let isLoggedIn =
    false;

  // ✅ VERIFY JWT
  if (token) {
    try {
      jwt.verify(
        token,
        JWT_SECRET
      );

      isLoggedIn = true;
    } catch {
      isLoggedIn = false;
    }
  }

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