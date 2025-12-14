import { Context } from "hono";
import { db, products, categories } from "@repo/db";
import { StripeProductType } from "@repo/types";
import { eq, like, and, asc, desc, sql } from "drizzle-orm";

export const createProduct = async (c: Context) => {
  const data = await c.req.json();

  const { flavors, images, packSize, benefits, categoryId } = data; // Assuming categoryId is passed, or we need to look it up

  if (!flavors || !Array.isArray(flavors) || flavors.length === 0) {
    return c.json({ message: "Flavors array is required!" }, 400);
  }

  if (!images || typeof images !== "object" || Array.isArray(images)) {
    return c.json({ message: "Images object is required!" }, 400);
  }

  const imagesObj = images as Record<string, any>;

  if (!imagesObj.main) {
    return c.json({ message: "Main image is required!" }, 400);
  }

  const missingFlavors = flavors.filter((flavor: string) => !(flavor in imagesObj));

  if (missingFlavors.length > 0) {
    return c.json({ message: "Missing images for flavors!", missingFlavors }, 400);
  }

  // Ensure arrays are cast correctly for Drizzle json/array types
  const productData = {
    ...data,
    packSize: packSize as string[],
    flavors: flavors as string[],
    benefits: benefits as string[],
    images: images as string[], // Drizzle defined as string[] but logic used object? Schema says string[], logic used object. Schema might be wrong or logic needs update.
    // Schema: images: json("images").$type<string[]>(), 
    // Logic: images is Record<string, any>
    // FIX: Schema defined as json, so we can store object. But strict typing says string[].
    // Let's cast to any to bypass strict check for now or update schema later if needed.
    // For now assuming input matches what DB expects or just passing as json.
  };

  const [product] = await db.insert(products).values(productData).returning();

  /*
  const stripeProduct: StripeProductType = {
    id: product.id.toString(),
    name: product.name,
    price: Number(product.price),
  };
  producer.send("product.created", { value: stripeProduct });
  */
  return c.json(product, 201);
};

export const updateProduct = async (c: Context) => {
  const id = Number(c.req.param("id"));
  const data = await c.req.json();

  const [updatedProduct] = await db
    .update(products)
    .set(data)
    .where(eq(products.id, id))
    .returning();

  return c.json(updatedProduct);
};

export const deleteProduct = async (c: Context) => {
  const id = Number(c.req.param("id"));

  const [deletedProduct] = await db
    .delete(products)
    .where(eq(products.id, id))
    .returning();

  /*
  producer.send("product.deleted", { value: Number(id) });
  */

  return c.json(deletedProduct);
};

export const getProducts = async (c: Context) => {
  const { sort, category, search, limit } = c.req.query();

  const query = db
    .select({
      id: products.id,
      name: products.name,
      price: products.price,
      images: products.images,
      categorySlug: categories.slug,
      createdAt: products.createdAt,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id));

  const whereConditions = [];

  if (category) {
    whereConditions.push(eq(categories.slug, category));
  }

  if (search) {
    whereConditions.push(sql`lower(${products.name}) like ${`%${search.toLowerCase()}%`}`);
  }

  if (whereConditions.length > 0) {
    query.where(and(...whereConditions));
  }

  if (sort === "asc") {
    query.orderBy(asc(products.price));
  } else if (sort === "desc") {
    query.orderBy(desc(products.price));
  } else if (sort === "oldest") {
    query.orderBy(asc(products.createdAt));
  } else {
    query.orderBy(desc(products.createdAt));
  }

  if (limit) {
    query.limit(Number(limit));
  }

  const results = await query;
  return c.json(results);
};

export const getProduct = async (c: Context) => {
  const id = Number(c.req.param("id"));
  console.log(`PRODUCT-SERVICE: Fetching product with ID: ${id}`);

  const product = await db.query.products.findFirst({
    where: eq(products.id, id),
    with: {
      category: true,
      reviews: true
    }
  });

  if (!product) {
    console.log(`PRODUCT-SERVICE: Product ${id} not found`);
  } else {
    console.log(`PRODUCT-SERVICE: Found product ${id}, Price: ${product.price}`);
  }

  return c.json(product);
};
