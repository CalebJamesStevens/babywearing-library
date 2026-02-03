import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth/server";

const authMiddleware = auth.middleware({
  loginUrl: "/login",
});

export default function middleware(request: NextRequest) {
  if (
    request.headers.get("next-action") ||
    request.headers.get("x-action") ||
    request.headers.get("rsc")
  ) {
    return NextResponse.next();
  }

  return authMiddleware(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth|login|auth).*)"],
};
