import { Hono } from "hono";
import { shouldBeAdmin, shouldBeUser } from "../middleware/authMiddleware";
import { db, orders } from "@repo/db";
import { desc, eq, sql, and, gte, lte } from "drizzle-orm";
import { startOfMonth, subMonths } from "date-fns";
import { OrderChartType } from "@repo/types";
import { createOrder } from "../utils/order";

export const orderRoute = new Hono();

orderRoute.get("/user-orders", shouldBeUser, async (c) => {
  const userId = c.get("userId");
  const userOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId));
  return c.json(userOrders);
});

orderRoute.get("/orders", shouldBeAdmin, async (c) => {
  const limit = c.req.query("limit") ? Number(c.req.query("limit")) : 10;
  const allOrders = await db
    .select()
    .from(orders)
    .limit(limit)
    .orderBy(desc(orders.createdAt));
  return c.json(allOrders);
});

orderRoute.get("/order-chart", shouldBeAdmin, async (c) => {
  const now = new Date();
  const sixMonthsAgo = startOfMonth(subMonths(now, 5));

  // Postgres aggregation
  const query = sql`
    SELECT 
      EXTRACT(YEAR FROM created_at) as year, 
      EXTRACT(MONTH FROM created_at) as month,
      COUNT(*) as total,
      SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful,
      SUM(CASE WHEN status = 'success' THEN amount ELSE 0 END) as revenue
    FROM ${orders}
    WHERE created_at >= ${sixMonthsAgo} AND created_at <= ${now}
    GROUP BY year, month
    ORDER BY year, month
  `;

  const raw = await db.execute(query);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const results: OrderChartType[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = subMonths(now, i);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;

    // db.execute with neon-http returns an object with rows
    const rows = (raw as any).rows ?? [];

    const match = rows.find(
      (item: any) => Number(item.year) === year && Number(item.month) === month
    );

    results.push({
      month: monthNames[month - 1] as string,
      total: match ? Number(match.total) : 0,
      successful: match ? Number(match.successful) : 0,
      revenue: match ? Number(match.revenue) : 0,
    });
  }

  return c.json(results);
});

// Internal route for synchronous order creation (replacing Kafka)
orderRoute.post("/internal/create", async (c) => {
  console.log("ORDER-SERVICE: Received /internal/create request");
  try {
    // Authenticate technically (e.g. check for a secret header if we wanted security, 
    // but for now relying on internal network/logic as per instructions to keep it simple first)
    const orderData = await c.req.json();
    console.log("ORDER-SERVICE: Creating Order for User:", orderData.userId);

    // Use the existing logic
    await createOrder(orderData);
    console.log("ORDER-SERVICE: Order successfully created in DB");

    return c.json({ success: true, message: "Order created successfully" }, 201);
  } catch (error) {
    console.error("ORDER-SERVICE: Failed to create order:", error);
    return c.json({ success: false, message: "Failed to create order" }, 500);
  }
});
