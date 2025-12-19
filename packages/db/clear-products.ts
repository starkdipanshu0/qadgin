
import { db, products, variants } from "./src";
import { sql } from "drizzle-orm";
import "dotenv/config";

async function main() {
    console.log("Clearing variants...");
    await db.delete(variants);
    console.log("Clearing products...");
    await db.delete(products);
    console.log("Done!");
    process.exit(0);
}

main().catch(console.error);
