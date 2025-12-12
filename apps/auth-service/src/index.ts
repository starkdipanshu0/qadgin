import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { clerkMiddleware } from "@hono/clerk-auth";
import { shouldBeAdmin } from "./middleware/authMiddleware.js";
import userRoute from "./routes/user.route.js";
import { producer } from "./utils/kafka.js";

const app = new Hono();

app.use(
  "/*",
  cors({
    origin: ["http://localhost:3003"],
    credentials: true,
  })
);
app.use("*", clerkMiddleware());

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

app.use("/users/*", shouldBeAdmin);
app.route("/users", userRoute);

app.onError((err, c) => {
  console.log(err);
  return c.json(
    { message: err.message || "Internal Server Error!" },
    (err as any).status || 500
  );
});

const start = async () => {
  try {
    await producer.connect();
    console.log("Auth service is running on 8003");
    serve({
      fetch: app.fetch,
      port: 8003,
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

start();
