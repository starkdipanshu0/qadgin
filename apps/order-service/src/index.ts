import { serve } from "@hono/node-server";
import { prisma } from "@repo/order-db";
import "./utils/types";
import { Hono } from "hono";
import { clerkMiddleware } from "@hono/clerk-auth";

import { orderRoute } from "./routes/order";
import { shouldBeUser } from "./middleware/authMiddleware";
import { Context } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

app.use("*", clerkMiddleware());
app.use(
  "/*",
  cors({
    origin: ["http://localhost:3002", "http://localhost:3000"],
    credentials: true,
  })
);

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

app.get("/test", shouldBeUser, (c: Context) => {
  const userId = c.get("userId");
  return c.json({
    message: "Order service is authenticated!",
    userId: userId,
  });
});

app.route("/", orderRoute);

const start = async () => {
  try {
    await prisma.$connect();

    serve(
      {
        fetch: app.fetch,
        port: 8001,
      },
      (info) => {
        console.log(`Order service is running on port 8001`);
      }
    );
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};
start();
