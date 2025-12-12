import { Context, Next } from "hono";
import { getAuth } from "@hono/clerk-auth";
import clerkClient from "../utils/clerk";

export const shouldBeUser = async (c: Context, next: Next) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ message: "You are not logged in!" }, 401);
  }
  c.set("userId", auth.userId);
  await next();
};

export const shouldBeAdmin = async (c: Context, next: Next) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ message: "You are not logged in!" }, 401);
  }

  const claims = auth.sessionClaims as any;
  let role = claims?.metadata?.role;

  if (!role) {
    try {
      const user = await clerkClient.users.getUser(auth.userId);
      role = user.publicMetadata.role as "user" | "admin";
    } catch (error) {
      console.error("Failed to fetch user metadata", error);
    }
  }

  if (role !== "admin") {
    return c.json({ message: "Unauthorized!" }, 403);
  }

  c.set("userId", auth.userId);
  await next();
};
