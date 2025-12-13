import { Hono } from "hono";
import { razorpay } from "../utils/razorpay";
import { shouldBeUser } from "../middleware/authMiddleware";
import { CartItemsType } from "@repo/types";
import { getProductPrice } from "../utils/product";
import crypto from "crypto";

const sessionRoute = new Hono();

sessionRoute.post("/create-order", shouldBeUser, async (c) => {
  console.log("PAYMENT-SERVICE: Received /create-order request");
  const { cart }: { cart: CartItemsType } = await c.req.json();
  const userId = c.get("userId");
  console.log(`PAYMENT-SERVICE: Processing for user ${userId}, items: ${cart.length}`);

  let totalAmount = 0;

  // Calculate total amount by fetching prices
  for (const item of cart) {
    const price = await getProductPrice(item.id);
    totalAmount += Number(price) * item.quantity;
  }
  console.log("PAYMENT-SERVICE: Calculated Total Amount (INR):", totalAmount);

  try {
    const options = {
      amount: totalAmount * 100, // Amount in paise
      currency: "INR",
      receipt: userId,
    };

    const order = await razorpay.orders.create(options);
    console.log("PAYMENT-SERVICE: Razorpay Order Created:", order.id);

    return c.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.log("PAYMENT-SERVICE: Error creating Razorpay order:", error);
    return c.json({ error: "Error creating Razorpay order" }, 500);
  }
});

sessionRoute.post("/verify", shouldBeUser, async (c) => {
  console.log("PAYMENT-SERVICE: Received /verify request");
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, cart } = await c.req.json();
  const userId = c.get("userId");

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    console.error("PAYMENT-SERVICE: Missing required parameters for verification");
    return c.json({ error: "Missing required parameters" }, 400);
  }

  const generated_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  console.log(`PAYMENT-SERVICE: Signature Match: ${generated_signature === razorpay_signature}`);

  if (generated_signature === razorpay_signature) {
    // Payment is successful

    // Fetch product details for Kafka event
    const products = await Promise.all(
      cart.map(async (item: any) => {
        const price = await getProductPrice(item.id);
        return {
          name: item.name,
          quantity: item.quantity,
          price: price
        }
      })
    );

    const totalAmount = products.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    console.log("PAYMENT-SERVICE: Payment verified. Triggering Order Service...");

    // Call Order Service Synchronously
    try {
      const orderServiceRes = await fetch("http://localhost:8001/internal/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          email: "",
          amount: totalAmount * 100,
          status: "success",
          products: products,
        }),
      });
      const orderResJson = await orderServiceRes.json();
      console.log("PAYMENT-SERVICE: Order Service Response:", orderResJson);

    } catch (err) {
      console.error("PAYMENT-SERVICE: Failed to create order in order-service:", err);
    }

    return c.json({ success: true, message: "Payment verified successfully" });
  } else {
    console.error("PAYMENT-SERVICE: Invalid Signature");
    return c.json({ success: false, message: "Invalid signature" }, 400);
  }
});

export default sessionRoute;
