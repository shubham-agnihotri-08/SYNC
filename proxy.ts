import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "./lib/auth"

export function proxy(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value
  const { pathname } = request.nextUrl

  // Public routes
  if (pathname === "/login") {
    // If already logged in, redirect to appropriate dashboard
    if (token) {
      const payload = verifyToken(token)
      if (payload) {
        const redirectUrl = payload.role === "ADMIN" ? "/admin/dashboard" : "/employee/dashboard"
        return NextResponse.redirect(new URL(redirectUrl, request.url))
      }
    }
    return NextResponse.next()
  }

  // Protected routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/employee")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Role-based access control
    if (pathname.startsWith("/admin") && payload.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/employee/dashboard", request.url))
    }

    if (pathname.startsWith("/employee") && payload.role !== "EMPLOYEE") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
