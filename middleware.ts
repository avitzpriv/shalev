import { auth } from "@/app/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;

  const isProtectedRoute =
    nextUrl.pathname.startsWith("/dashboard") ||
    nextUrl.pathname.startsWith("/admin") ||
    nextUrl.pathname.startsWith("/api/admin");

  const isChangePasswordPage = nextUrl.pathname === "/auth/change-password";

  if (isProtectedRoute && !isLoggedIn) {
    return Response.redirect(new URL("/auth/login", nextUrl));
  }

  // If logged in but mustChangePassword → force redirect
  if (isLoggedIn && !isChangePasswordPage) {
    const mustChange = (req.auth as any)?.token?.mustChangePassword;
    if (mustChange) {
      return Response.redirect(new URL("/auth/change-password", nextUrl));
    }
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|patient).*)"],
};
