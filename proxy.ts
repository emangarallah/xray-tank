import { auth } from "@/lib/auth/server";

export default auth.middleware({
  loginUrl: "/auth",
  publicRoutes: ["/", "/auth", "/api/tanks", "/api/telemetry", "/api/health"],
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
