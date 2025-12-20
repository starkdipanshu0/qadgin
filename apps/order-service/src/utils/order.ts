import { db, orders, orderItems } from "@repo/db";
import { OrderType, OrderProductType } from "@repo/types";
import clerkClient from "./clerk";

export const createOrder = async (order: OrderType) => {
  // Enrich with email if missing
  if (!order.email) {
    try {
      const user = await clerkClient.users.getUser(order.userId);
      if (!user.emailAddresses[0]) {
        throw new Error("User has no email address");
      }
      order.email = user.emailAddresses[0]?.emailAddress;
    } catch (error) {
      console.error("Failed to fetch user email for order:", error);
    }
  }

  try {
    // 1. Create Order (Sequential, no transaction due to driver limitations)
    console.log("ORDER-SERVICE: Inserting Order...");
    const [newOrder] = await db
      .insert(orders)
      .values({
        userId: order.userId,
        // Map financial fields
        subtotal: order.subtotal.toString(),
        tax: order.tax.toString(),
        shipping: order.shipping.toString(),
        total: order.total.toString(),
        currency: order.currency || "INR",
        status: "PENDING",
      })
      .returning();

    if (!newOrder) {
      throw new Error("Failed to create order record");
    }
    console.log("ORDER-SERVICE: Order Created ID:", newOrder.id);

    // 2. Create Order Items
    if (order.products && order.products.length > 0) {
      console.log("ORDER-SERVICE: Inserting Items...");
      const itemsToInsert = order.products.map((p: OrderProductType) => ({
        orderId: newOrder.id,
        productId: p.productId,
        variantId: p.variantId || null, // Handle variantId
        quantity: p.quantity,
        price: p.price.toString(),
      }));

      await db.insert(orderItems).values(itemsToInsert);
      console.log("ORDER-SERVICE: Items Inserted");
    }

    return newOrder;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};
