import "dotenv/config";
import { db } from "./src";
import { categories } from "./src/schema";
import { sql } from "drizzle-orm";

async function verify() {
    console.log("Verifying Categories Table...");

    try {
        // 1. Check if table exists and get columns (Postgres specific)
        const columns = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'categories';
    `);

        console.log("Table Columns:", columns.rows);

        // 2. Try to fetch existing categories
        const all = await db.select().from(categories);
        console.log("Existing Categories:", all);

        const specific = await db.select().from(categories).where(sql`${categories.slug} = 'performance-supplements'`);
        console.log("Found Performance Supplements:", specific);

        // 3. Try a raw insert to see if it fails here too
        console.log("Attempting Test Insert...");
        const result = await db.insert(categories).values({
            name: "Test Cat " + Date.now(),
            slug: "test-cat-" + Date.now(),
            description: "Test Desc",
            image: "http://test.com/img.jpg"
        }).returning();
        console.log("Test Insert Success:", result);

    } catch (err) {
        console.error("Verification Failed:", err);
    }
}

verify();
