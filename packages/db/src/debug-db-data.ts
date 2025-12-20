
import "dotenv/config";
import { db } from "./index";
import { products, variants, orders, orderItems } from "./schema";
import { eq } from "drizzle-orm";

async function main() {
    console.log("--- DEBUGGING DATA ---");

    // 1. Check Products
    const allProducts = await db.select().from(products);
    console.log("Products:", allProducts.map(p => ({ id: p.id, name: p.name })));

    // 2. Check Variants
    const allVariants = await db.select().from(variants);
    console.log("Variants:", allVariants.map(v => ({ id: v.id, productId: v.productId, name: v.name })));

    // 3. Check the problematic order (ID 2 according to screenshot)
    const order = await db.select().from(orders).where(eq(orders.id, 2));
    console.log("Order #2:", order);

    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, 2));
    console.log("Order #2 Items:", items);

    process.exit(0);
}

main();
