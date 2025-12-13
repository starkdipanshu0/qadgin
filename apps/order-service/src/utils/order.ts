import { prisma } from "@repo/order-db";
import { OrderType } from "@repo/types";
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
    const savedOrder = await prisma.order.create({
      data: {
        userId: order.userId,
        email: order.email!,
        amount: order.amount,
        status: order.status,
        products: order.products,
      },
    });

  } catch (error) {
    console.log(error);
    throw error;
  }
};
