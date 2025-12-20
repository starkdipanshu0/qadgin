import { Hono } from "hono";
import { shouldBeAdmin, shouldBeUser } from "../middleware/authMiddleware";
import { getAllOrders, getOrderStats, getUserOrders, createOrderInternal } from "../controllers/order.controller";

export const orderRoute = new Hono();

// User Routes
orderRoute.get("/me/orders", shouldBeUser, getUserOrders);

// Admin Routes
orderRoute.get("/admin/orders", shouldBeAdmin, getAllOrders);
orderRoute.get("/admin/order-stats", shouldBeAdmin, getOrderStats);

// Internal Service Routes
orderRoute.post("/internal/create", createOrderInternal);


