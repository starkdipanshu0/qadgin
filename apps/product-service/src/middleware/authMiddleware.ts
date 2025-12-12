import { getAuth } from "@hono/clerk-auth";
import { Context, Next } from "hono";
import { createMiddleware } from "hono/factory";
import { CustomJwtSessionClaims } from "@repo/types";
import clerkClient from "../utils/clerk";

export const shouldBeUser = createMiddleware(async (c: Context, next: Next) => {
  const auth = getAuth(c);
  const userId = auth?.userId;

  if (!userId) {
    return c.json({ message: "You are not logged in!" }, 401);
  }

  await next();
});

export const shouldBeAdmin = createMiddleware(async (c: Context, next: Next) => {
  const auth = getAuth(c);
  const userId = auth?.userId;

  if (!userId) {
    return c.json({ message: "You are not logged in!" }, 401);
  }

  const claims = auth?.sessionClaims as CustomJwtSessionClaims;
  let role = claims?.metadata?.role;

  if (!role) {
    try {
      const user = await clerkClient.users.getUser(userId);
      role = user.publicMetadata.role as "user" | "admin";
    } catch (error) {
      console.error("Failed to fetch user metadata", error);
    }
  }

  if (role !== "admin") {
    return c.json({ message: "Unauthorized!" }, 403);
  }

  await next();
});
