import { getAuth } from "@hono/clerk-auth";
import { createMiddleware } from "hono/factory";
import { CustomJwtSessionClaims } from "@repo/types";

export const shouldBeUser = createMiddleware<{
  Variables: {
    userId: string;
  };
}>(async (c, next) => {
  const auth = getAuth(c);

  if (!auth?.userId) {
    return c.json({
      message: "You are not logged in.",
    });
  }

  c.set("userId", auth.userId);

  await next();
});
export const shouldBeAdmin = createMiddleware<{
  Variables: {
    userId: string;
  };
}>(async (c, next) => {
  const auth = getAuth(c);

  if (!auth?.userId) {
    return c.json({
      message: "You are not logged in.",
    });
  }

  const claims = auth.sessionClaims as CustomJwtSessionClaims;
  let role = claims?.metadata?.role;

  if (!role) {
    try {
      // Lazy load clerkClient to avoid circular dependency issues if imported top-level before env load
      const clerkClient = (await import("../utils/clerk")).default;
      const user = await clerkClient.users.getUser(auth.userId);
      console.log("Fetched role from Clerk API:", user.publicMetadata.role);
      role = user.publicMetadata.role as "user" | "admin";
    } catch (error) {
      console.error("Failed to fetch user metadata", error);
    }
  }

  if (role !== "admin") {
    return c.json({ message: "Unauthorized!" });
  }

  c.set("userId", auth.userId);

  await next();
});
