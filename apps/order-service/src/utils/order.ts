import { Order } from "@repo/order-db";
import { OrderType } from "@repo/types";
import { producer } from "./kafka";
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

  const newOrder = new Order(order);

  try {
    const savedOrder = await newOrder.save();
    producer.send("order.created", {
      value: {
        email: savedOrder.email,
        amount: savedOrder.amount,
        status: savedOrder.status,
      },
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};
