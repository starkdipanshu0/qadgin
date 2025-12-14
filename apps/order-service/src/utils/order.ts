import { db, orders, orderItems } from "@repo/db";
import { OrderType, OrderProductType } from "@repo/types";
import clerkClient from "./clerk";

export const createOrder = async (order: OrderType) => {
  // Enrich with email if missing (e.g. from Razorpay flow)
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
    await db.transaction(async (tx) => {
      // 1. Create Order
      const [newOrder] = await tx
        .insert(orders)
        .values({
          userId: order.userId,
          amount: order.amount.toString(), // ensuring string for decimal/numeric type
          status: "PENDING", // Default status
        })
        .returning();

      if (!newOrder) {
        throw new Error("Failed to create order record");
      }

      // 2. Create Order Items
      if (order.products && order.products.length > 0) {
        const itemsToInsert = order.products.map((p: OrderProductType) => ({
          orderId: newOrder.id,
          productId: p.productId, // Now strictly typed
          quantity: p.quantity,
          price: p.price.toString(),
        }));

        await tx.insert(orderItems).values(itemsToInsert);
      }
    });

    console.log("Transaction committed for order");
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};
