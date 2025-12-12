import { Hono } from "hono";
const webhookRoute = new Hono();
webhookRoute.get("/", (c) => {
    return c.json({
        status: "ok webhook",
        uptime: process.uptime(),
        timestamp: Date.now(),
    });
});
// Razorpay webhooks can be implemented here if needed in future
// For now, we rely on the client-side verification flow as primary
export default webhookRoute;
