import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { shouldBeAdmin, shouldBeUser } from "./middleware/authMiddleware.js";
import productRouter from "./routes/product.route";
import categoryRouter from "./routes/category.route";

const app = new Hono();

app.use(
  "/*",
  cors({
    origin: ["http://localhost:3002", "http://localhost:3003"],
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

app.get("/test", shouldBeUser, (c) => {
  const auth = getAuth(c);
  return c.json({ message: "Product service authenticated", userId: auth?.userId });
});

app.get("/test-admin", shouldBeAdmin, (c) => {
  const auth = getAuth(c);
  return c.json({ message: "Product service authenticated", userId: auth?.userId });
});

app.route("/products", productRouter);
app.route("/categories", categoryRouter);

app.onError((err, c) => {
  console.log(err);
  return c.json(
    { message: err.message || "Internal Server Error!" },
    (err as any).status || 500
  );
});

const start = async () => {
  try {
    const server = serve({
      fetch: app.fetch,
      port: 8000,
    });
    console.log("Product service is running on 8000");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

start();
