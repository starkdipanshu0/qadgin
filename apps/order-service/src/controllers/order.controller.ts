import { Context } from "hono";
import { db, orders, orderItems, products, variants, orderEvents } from "@repo/db";
import { desc, eq, inArray, sql, and } from "drizzle-orm";
import { startOfMonth, subMonths } from "date-fns";
import { OrderChartType, OrderType, OrderProductType, CreateOrderInput } from "@repo/types";
import clerkClient from "../utils/clerk";

// 1. Get User Orders
export const getUserOrders = async (c: Context) => {
    const userId = c.get("userId");
    const limit = c.req.query("limit") ? Number(c.req.query("limit")) : 20;
    const offset = c.req.query("offset") ? Number(c.req.query("offset")) : 0;

    const userOrders = await db
        .select()
        .from(orders)
        .where(eq(orders.userId, userId))
        .orderBy(desc(orders.createdAt))
        .limit(limit)
        .offset(offset);

    return c.json(userOrders);
};

// 2. Get All Orders (Admin)
export const getAllOrders = async (c: Context) => {
    const limit = c.req.query("limit") ? Number(c.req.query("limit")) : 20;
    const offset = c.req.query("offset") ? Number(c.req.query("offset")) : 0;
    // Future: Add status filter if needed

    const allOrders = await db
        .select()
        .from(orders)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(orders.createdAt));
    return c.json(allOrders);
};

// 3. Get Order Stats (Admin)
export const getOrderStats = async (c: Context) => {
    const now = new Date();
    const sixMonthsAgo = startOfMonth(subMonths(now, 5));

    const queryFixed = sql`
    SELECT 
      EXTRACT(YEAR FROM created_at) as year, 
      EXTRACT(MONTH FROM created_at) as month,
      COUNT(*) as total,
      SUM(CASE WHEN status IN ('PAID', 'SHIPPED', 'DELIVERED') THEN 1 ELSE 0 END) as successful,
      SUM(CASE WHEN status IN ('PAID', 'SHIPPED', 'DELIVERED') THEN CAST(total AS DECIMAL) ELSE 0 END) as revenue
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
// 4. Create Order (Internal)
// Logic originally in utils/order.ts, moving here.
export const createOrderInternal = async (c: Context) => {
    console.log("ORDER-SERVICE: Received /internal/create request");

    // 1. Parse Data
    const orderData = await c.req.json<CreateOrderInput>();

    console.log("ORDER-SERVICE: Creating Order for User:", orderData.userId);

    if (!orderData.products || orderData.products.length === 0) {
        return c.json({ success: false, message: "No products in order" }, 400);
    }

    // 2. Idempotency Check
    if (orderData.paymentId) {
        const existingOrder = await db.query.orders.findFirst({
            where: eq(orders.paymentId, orderData.paymentId),
        });

        if (existingOrder) {
            console.log("ORDER-SERVICE: Idempotent Success (Order exists):", existingOrder.id);
            return c.json({ success: true, message: "Order already exists", orderId: existingOrder.id }, 200);
        }
    }

    try {
        // Enriched Email
        let userEmail = orderData.email;
        if (!userEmail) {
            try {
                const user = await clerkClient.users.getUser(orderData.userId);
                userEmail = user.emailAddresses[0]?.emailAddress;
            } catch (error) {
                console.error("Failed to fetch user email for order:", error);
            }
        }

        // 3. fetch Products for Verification & Snapshotting
        const productIds = orderData.products.map((p: any) => p.productId);
        const dbProducts = await db
            .select()
            .from(products)
            .where(inArray(products.id, productIds));

        // Also fetch variants if any
        const variantIds = orderData.products
            .map((p: any) => p.variantId)
            .filter((id: any): id is number => !!id);

        let dbVariants: any[] = [];
        if (variantIds.length > 0) {
            dbVariants = await db
                .select()
                .from(variants)
                .where(inArray(variants.id, variantIds));
        }

        // 4. Calculate Verified Totals & Prepare Items
        let verifiedSubtotal = 0;
        const itemsToInsert: any[] = [];

        for (const item of orderData.products) {
            const product = dbProducts.find((p) => p.id === item.productId);
            if (!product) {
                console.error(`Product not found: ${item.productId}`);
                continue; // Skip or throw? strict: throw.
                // throw new Error(`Product ${item.productId} not found`);
            }

            let price = Number(product.listingConfig?.price || 0);
            let name = product.name;
            let sku = product.slug; // Fallback SKU
            let variantName = null;

            // Variant logic - MANDATORY
            if (!item.variantId) {
                return c.json({ success: false, message: `Product ${product.name} (ID: ${item.productId}) requires a variant to be selected.` }, 400);
            }

            const variant = dbVariants.find((v) => v.id === item.variantId);
            if (variant) {
                price = Number(variant.price);
                variantName = variant.name;
                sku = variant.sku;
            } else {
                // STRICT VALIDATION: If variant ID is sent, it MUST exist.
                console.error(`Variant not found: ${item.variantId}`);
                return c.json({ success: false, message: `Variant ${item.variantId} not found` }, 400);
            }

            // Trusting payload price is dangerous. Use DB price.
            const lineTotal = price * item.quantity;
            verifiedSubtotal += lineTotal;

            itemsToInsert.push({
                // orderId will be set later
                productId: item.productId,
                variantId: item.variantId || null,
                quantity: item.quantity,
                price: price.toString(), // Store unit price at time of purchase
                name: name,
                variantName: variantName,
                sku: sku
            });
        }

        const tax = Number(orderData.tax || 0);
        const shipping = Number(orderData.shipping || 0);
        const verifiedTotal = verifiedSubtotal + tax + shipping;

        // 5. Insert Order (Sequential)
        console.log("ORDER-SERVICE: Inserting Order...");
        const [newOrder] = await db
            .insert(orders)
            .values({
                userId: orderData.userId,
                paymentId: orderData.paymentId || null,
                // Use verified totals
                subtotal: verifiedSubtotal.toFixed(2),
                tax: tax.toFixed(2),
                shipping: shipping.toFixed(2),
                total: verifiedTotal.toFixed(2),

                currency: orderData.currency || "INR",
                status: (orderData.status || "PENDING") as any,
            })
            .returning();

        if (!newOrder) {
            throw new Error("Failed to create order record");
        }
        console.log("ORDER-SERVICE: Order Created ID:", newOrder.id);

        // 6. Insert Items
        if (itemsToInsert.length > 0) {
            console.log("ORDER-SERVICE: Inserting Items...");
            const finalItems = itemsToInsert.map(i => ({ ...i, orderId: newOrder.id }));

            await db.insert(orderItems).values(finalItems);
            console.log("ORDER-SERVICE: Items Inserted");
        }

        // 7. Insert Initial Event
        await db.insert(orderEvents).values({
            orderId: newOrder.id,
            status: "Order Placed",
        });
        console.log("ORDER-SERVICE: Initial Event Created");

        return c.json({ success: true, message: "Order created successfully", orderId: newOrder.id }, 201);
    } catch (error) {
        console.error("ORDER-SERVICE: Failed to create order:", error);
        return c.json({ success: false, message: "Failed to create order" }, 500);
    }
};
