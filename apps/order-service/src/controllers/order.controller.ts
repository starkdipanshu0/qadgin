import { Context } from "hono";
import { db, orders, orderItems } from "@repo/db";
import { desc, eq, sql } from "drizzle-orm";
import { startOfMonth, subMonths } from "date-fns";
import { OrderChartType, OrderType, OrderProductType } from "@repo/types";
import clerkClient from "../utils/clerk";

// 1. Get User Orders
export const getUserOrders = async (c: Context) => {
    const userId = c.get("userId");
    const userOrders = await db
        .select()
        .from(orders)
        .where(eq(orders.userId, userId));
    return c.json(userOrders);
};

// 2. Get All Orders (Admin)
export const getAllOrders = async (c: Context) => {
    const limit = c.req.query("limit") ? Number(c.req.query("limit")) : 10;
    const allOrders = await db
        .select()
        .from(orders)
        .limit(limit)
        .orderBy(desc(orders.createdAt));
    return c.json(allOrders);
};

// 3. Get Order Stats (Admin)
export const getOrderStats = async (c: Context) => {
    const now = new Date();
    const sixMonthsAgo = startOfMonth(subMonths(now, 5));

    const query = sql`
    SELECT 
      EXTRACT(YEAR FROM created_at) as year, 
      EXTRACT(MONTH FROM created_at) as month,
      COUNT(*) as total,
      SUM(CASE WHEN status = 'success' OR status = 'PAID' THEN 1 ELSE 0 END) as successful,
      SUM(CASE WHEN status = 'success' OR status = 'PAID' THEN updated_at ELSE 0 END) as revenue
    FROM ${orders}
    WHERE created_at >= ${sixMonthsAgo} AND created_at <= ${now}
    GROUP BY year, month
    ORDER BY year, month
  `;
    // Note: fixed revenue query to likely use 'total' or 'subtotal' column if available, 
    // but keeping original logic intention or fixing it. 
    // Original query used 'amount' which doesn't exist anymore.
    // Let's use 'total' logic if possible, but for raw SQL we need the column name correctly.
    // In previous schema update we added 'total'.
    // Updating SQL query: 

    const queryFixed = sql`
    SELECT 
      EXTRACT(YEAR FROM created_at) as year, 
      EXTRACT(MONTH FROM created_at) as month,
      COUNT(*) as total,
      SUM(CASE WHEN status = 'PAID' THEN 1 ELSE 0 END) as successful,
      SUM(CASE WHEN status = 'PAID' THEN CAST(total AS DECIMAL) ELSE 0 END) as revenue
    FROM ${orders}
    WHERE created_at >= ${sixMonthsAgo} AND created_at <= ${now}
    GROUP BY year, month
    ORDER BY year, month
  `;


    const raw = await db.execute(queryFixed);

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
    ];

    const results: OrderChartType[] = [];

    for (let i = 5; i >= 0; i--) {
        const d = subMonths(now, i);
        const year = d.getFullYear();
        const month = d.getMonth() + 1;

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
};

// 4. Create Order (Internal)
// Logic originally in utils/order.ts, moving here.
export const createOrderInternal = async (c: Context) => {
    console.log("ORDER-SERVICE: Received /internal/create request");
    try {
        const orderData: OrderType = await c.req.json();
        console.log("ORDER-SERVICE: Creating Order for User:", orderData.userId);

        // Enrich with email if missing
        if (!orderData.email) {
            try {
                const user = await clerkClient.users.getUser(orderData.userId);
                if (user.emailAddresses[0]) {
                    orderData.email = user.emailAddresses[0]?.emailAddress;
                }
            } catch (error) {
                console.error("Failed to fetch user email for order:", error);
            }
        }

        // 1. Create Order (Sequential)
        console.log("ORDER-SERVICE: Inserting Order...");
        const [newOrder] = await db
            .insert(orders)
            .values({
                userId: orderData.userId,
                subtotal: orderData.subtotal.toString(),
                tax: orderData.tax.toString(),
                shipping: orderData.shipping.toString(),
                total: orderData.total.toString(),
                currency: orderData.currency || "INR",
                status: (orderData.status || "PENDING") as "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED",
            })
            .returning();

        if (!newOrder) {
            throw new Error("Failed to create order record");
        }
        console.log("ORDER-SERVICE: Order Created ID:", newOrder.id);

        // 2. Create Order Items
        if (orderData.products && orderData.products.length > 0) {
            console.log("ORDER-SERVICE: Inserting Items...");
            const itemsToInsert = orderData.products.map((p: OrderProductType) => ({
                orderId: newOrder.id,
                productId: p.productId,
                variantId: p.variantId || null,
                quantity: p.quantity,
                price: p.price.toString(),
            }));

            await db.insert(orderItems).values(itemsToInsert);
            console.log("ORDER-SERVICE: Items Inserted");
        }

        return c.json({ success: true, message: "Order created successfully", orderId: newOrder.id }, 201);
    } catch (error) {
        console.error("ORDER-SERVICE: Failed to create order:", error);
        return c.json({ success: false, message: "Failed to create order" }, 500);
    }
};
