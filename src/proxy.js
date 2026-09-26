// src/proxy.js
import { NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function proxy(req) {
  const sessionCookie = getSessionCookie(req);
  const { pathname } = req.nextUrl;

  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/settings") ||
    (pathname.startsWith("/notes") && !pathname.startsWith("/notes/public"));

  if (isProtected && !sessionCookie) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (sessionCookie && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/notes/:path*",
    "/login",
  ],
};