import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { CustomJwtSessionClaims } from "@repo/types";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/unauthorized(.*)"]);
console.log("wergthyjhukl 23456789");
export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();

    const { userId, sessionClaims } = await auth();

    // if (userId && sessionClaims) {
    //   const userRole = (sessionClaims as CustomJwtSessionClaims).metadata?.role ?? (sessionClaims as any).public_metadata?.role;
    //   console.log("userRole ", userRole);
    //   if (userRole !== "admin") {
    //     return Response.redirect(new URL("/unauthorized", req.url));
    //   }
    // }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
