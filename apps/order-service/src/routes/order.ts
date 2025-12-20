import { Hono } from "hono";
import { shouldBeAdmin, shouldBeUser } from "../middleware/authMiddleware";
import { getAllOrders, getOrderStats, getUserOrders, createOrderInternal } from "../controllers/order.controller";

export const orderRoute = new Hono();

// User Routes
orderRoute.get("/user-orders", shouldBeUser, getUserOrders);

// Admin Routes
orderRoute.get("/orders", shouldBeAdmin, getAllOrders);
orderRoute.get("/order-chart", shouldBeAdmin, getOrderStats);

// Internal Service Routes
orderRoute.post("/internal/create", createOrderInternal);

