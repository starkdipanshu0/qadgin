import { Hono } from "hono";
import { razorpay } from "../utils/razorpay";
import { shouldBeUser } from "../middleware/authMiddleware";
import { CartItemsType } from "@repo/types";
import { getProductPrice } from "../utils/product";
import crypto from "crypto";

const sessionRoute = new Hono();

sessionRoute.post("/create-order", shouldBeUser, async (c) => {
  const { cart }: { cart: CartItemsType } = await c.req.json();
  const userId = c.get("userId");

  let totalAmount = 0;

  // Calculate total amount by fetching prices
  for (const item of cart) {
    const price = await getProductPrice(item.id);
    totalAmount += Number(price) * item.quantity;
  }

  try {
    const options = {
      amount: totalAmount * 100, // Amount in paise
      currency: "INR",
      receipt: userId,
    };

    const order = await razorpay.orders.create(options);

    return c.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.log(error);
    return c.json({ error: "Error creating Razorpay order" }, 500);
  }
});

sessionRoute.post("/verify", shouldBeUser, async (c) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, cart } = await c.req.json();
  const userId = c.get("userId");

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return c.json({ error: "Missing required parameters" }, 400);
  }

  const generated_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

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



    return c.json({ success: true, message: "Payment verified successfully" });
  } else {
    return c.json({ success: false, message: "Invalid signature" }, 400);
  }
});

export default sessionRoute;
