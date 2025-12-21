import { Context } from "hono";
import { db, products, categories, variants } from "@repo/db";

import { eq, like, and, asc, desc, sql } from "drizzle-orm";



import { generateVariants, CompactProductInput } from "../utils/variant-generator";

// export const createProduct = async (c: Context) => {
//   const data = await c.req.json();

//   // Destructure new fields
//   const { attributes, images, listingConfig, content, categoryId, variants: variantsData } = data;

//   // Basic validation
//   if (!images || !images.main) {
//     return c.json({ message: "Main image is required!" }, 400);
//   }

//   // Generate Slug
//   const slug = data.name
//     .toLowerCase()
//     .trim()
//     .replace(/[^\w\s-]/g, '')
//     .replace(/[\s_-]+/g, '-')
//     .replace(/^-+|-+$/g, '');

//   const productData = {
//     name: data.name,
//     slug,
//     tagline: data.tagline,
//     shortDescription: data.shortDescription,
//     categoryId,
//     attributes,
//     images,
//     listingConfig,
//     content,
//     isBestSeller: data.isBestSeller,
//   };

//   // Transaction-like approach (Drizzle doesn't enforce strict transactions across all drivers, but sequential is fine here)
//   const [product] = await db.insert(products).values(productData).returning();

//   if (!product) {
//     return c.json({ message: "Failed to create product" }, 500);
//   }

//   if (variantsData && Array.isArray(variantsData) && variantsData.length > 0) {
//     const variantsToInsert = variantsData.map((v: any) => ({
//       productId: product.id,
//       name: v.name,
//       sku: v.sku,
//       price: String(v.price), // Price is now mandatory on variant
//       originalPrice: v.originalPrice ? String(v.originalPrice) : null,
//       stock: v.stock || 0,
//       attributes: v.attributes,
//       images: v.images,
//       description: v.description
//     }));

//     await db.insert(variants).values(variantsToInsert);
//   }

//   // Refetch with variants to return complete object
//   const fullProduct = await db.query.products.findFirst({
//     where: eq(products.id, product.id),
//     with: { variants: true }
//   });

//   return c.json(fullProduct, 201);
// };

export const createProduct = async (c: Context) => {
  const data = await c.req.json();

  // -------- Validation --------
  if (!data?.name) {
    return c.json({ message: "Product name is required" }, 400);
  }

  if (!data?.images?.main) {
    return c.json({ message: "Main image is required" }, 400);
  }

  if (data.variants && !Array.isArray(data.variants)) {
    return c.json({ message: "Variants must be an array" }, 400);
  }

  // -------- Slug Generation --------
  let baseSlug = data.name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // Ensure slug uniqueness (important)
  let slug = baseSlug;
  let suffix = 1;

  while (
    await db.query.products.findFirst({
      where: eq(products.slug, slug),
    })
  ) {
    slug = `${baseSlug}-${suffix++}`;
  }

  // -------- Transaction (Simulated) --------
  // Note: db.transaction is not supported in neon-http driver yet.
  // We execute sequentially. If second part fails, we have an orphan product (can add cleanup later).

  const [product] = await db
    .insert(products)
    .values({
      name: data.name,
      slug,
      tagline: data.tagline,
      shortDescription: data.shortDescription,
      categoryId: data.categoryId,
      attributes: data.attributes,
      images: data.images,
      listingConfig: {
        ...data.listingConfig,
        price: data.price ? String(data.price) : data.listingConfig?.price
      },
      content: data.content,
      isBestSeller: data.isBestSeller ?? false,
    })
    .returning();

  if (!product) {
    throw new Error("Product creation failed");
  }

  // -------- Variants --------
  if (Array.isArray(data.variants) && data.variants.length > 0) {
    const variantsToInsert = data.variants.map((v: any) => {
      if (!v.sku || v.price == null) {
        throw new Error("Each variant must have sku and price");
      }

      return {
        productId: product.id,
        name: v.name,
        sku: v.sku,
        price: String(v.price),
        originalPrice: v.originalPrice ? String(v.originalPrice) : null,
        stock: v.stock ?? 0,
        attributes: v.attributes,
        images: v.images,
        description: v.description,
      };
    });

    await db.insert(variants).values(variantsToInsert);
  }

  // -------- Fetch full product --------
  const fullProduct = await db.query.products.findFirst({
    where: eq(products.id, product.id),
    with: { variants: true },
  });

  return c.json(fullProduct, 201);
};

export const updateProduct = async (c: Context) => {
  const id = Number(c.req.param("id"));
  const data = await c.req.json();

  // -------- Validation --------
  if (data.variants && !Array.isArray(data.variants)) {
    return c.json({ message: "Variants must be an array" }, 400);
  }

  // If changing slug, check uniqueness (simple check, for robust app use service layer)
  if (data.slug) {
    const existing = await db.query.products.findFirst({
      where: eq(products.slug, data.slug)
    });
    if (existing && existing.id !== id) {
      return c.json({ message: "Slug already in use" }, 409);
    }
  }

  // Separate variants from product data
  const { variants: variantsData, ...rest } = data;
  const productData = {
    ...rest,
    listingConfig: {
      ...rest.listingConfig,
      price: rest.price ? String(rest.price) : rest.listingConfig?.price
    }
  };

  const [updatedProduct] = await db
    .update(products)
    .set(productData)
    .where(eq(products.id, id))
    .returning();

  if (!updatedProduct) {
    return c.json({ message: "Product not found or update failed" }, 404);
  }

  // Handle Variants Sync
  if (variantsData && Array.isArray(variantsData)) {
    // 1. Fetch existing variants to know what to delete
    const existingVariants = await db.select().from(variants).where(eq(variants.productId, id));
    const existingIds = existingVariants.map(v => v.id);

    // 2. Identify variants to update vs insert
    const incomingIds = variantsData
      .filter((v: any) => v.id)
      .map((v: any) => v.id);

    const matchId = (vId: number) => incomingIds.includes(vId);

    // 3. Delete variants not in usage
    const toDelete = existingIds.filter(eid => !matchId(eid));
    if (toDelete.length > 0) {
      for (const delId of toDelete) {
        await db.delete(variants).where(eq(variants.id, delId));
      }
    }

    // 4. Upsert (Update or Insert)
    for (const v of variantsData) {
      const variantPayload = {
        productId: id, // Ensure linked to parent
        name: v.name,
        sku: v.sku,
        price: String(v.price), // Mandatory
        originalPrice: v.originalPrice ? String(v.originalPrice) : null,
        stock: v.stock || 0,
        attributes: v.attributes,
        images: v.images,
        description: v.description
      };

      if (v.id) {
        // Update
        await db.update(variants)
          .set(variantPayload)
          .where(eq(variants.id, v.id));
      } else {
        // Insert
        await db.insert(variants).values(variantPayload);
      }
    }
  }

  return c.json(updatedProduct);
};

export const deleteProduct = async (c: Context) => {
  const id = Number(c.req.param("id"));

  // Manual Cascade Delete: Variants
  await db.delete(variants).where(eq(variants.productId, id));

  // Delete Product
  const [deletedProduct] = await db
    .delete(products)
    .where(eq(products.id, id))
    .returning();

  if (!deletedProduct) {
    return c.json({ message: "Product not found" }, 404);
  }

  /*
  producer.send("product.deleted", { value: Number(id) });
  */

  return c.json(deletedProduct);
};

export const getProducts = async (c: Context) => {
  try {
    const { sort, category, search, limit } = c.req.query();
    console.log(`PRODUCT-SERVICE: getProducts called with params:`, { sort, category, search, limit });

    // Use db.query to easily fetch relations (variants)
    // This replaces the raw select + leftJoin which makes fetching nested relations harder
    const whereConditions = [];

    if (category) {
      console.log(`PRODUCT-SERVICE: Resolving category slug: ${category}`);
      // We need to filter by category slug. db.query syntax for filtered relations is different, 
      // or we filter in-memory if dataset small, BUT robust way is where:
      // Drizzle's db.query doesn't easily support "where category slug = x" without joining.
      // So we might need to find categoryId first or use constraints.
      // For now, let's look up categoryId if category slug is provided.
      const [cat] = await db.select().from(categories).where(eq(categories.slug, category));
      if (cat) {
        whereConditions.push(eq(products.categoryId, cat.id));
      } else {
        // Category not found, strictly return nothing? or ignore?
        // Let's return empty if category specifically requested but missing
        console.log(`PRODUCT-SERVICE: Category slug '${category}' not found.`);
        return c.json([]);
      }
    }

    if (search) {
      whereConditions.push(sql`lower(${products.name}) like ${`%${search.toLowerCase()}%`}`);
    }

    const queryOptions: any = {
      with: {
        category: true,
        variants: true,
      },
      where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
    };

    if (sort === "asc") {
      queryOptions.orderBy = asc(products.createdAt); // Fallback to created, can't sort by price easily in DB now without join
    } else if (sort === "desc") {
      queryOptions.orderBy = desc(products.createdAt);
    } else if (sort === "oldest") {
      queryOptions.orderBy = asc(products.createdAt);
    } else {
      queryOptions.orderBy = desc(products.createdAt);
    }

    if (limit) {
      queryOptions.limit = Number(limit);
    }

    console.log("PRODUCT-SERVICE: Executing DB Query...");
    const dbResults = await db.query.products.findMany(queryOptions);
    console.log(`PRODUCT-SERVICE: DB Query returned ${dbResults.length} items`);

    // "Explosion" Logic: Process Virtual Cards based on VARIANTS now
    const finalResults: any[] = [];

    for (const product of dbResults) {
      try {
        // Logic to find 'Display Price' (e.g. lowest variant price)
        // Since 'price' is removed from product, we MUST compute it for the frontend card
        let displayPrice = (product.listingConfig as any)?.price || "0";
        let displayOriginalPrice = null;

        const pWithVariants = product as typeof product & { variants: any[] };
        if (pWithVariants.variants && pWithVariants.variants.length > 0) {
          // Find lowest price? or first?
          const sorted = [...pWithVariants.variants].sort((a, b) => Number(a.price) - Number(b.price));
          displayPrice = sorted[0].price;
          displayOriginalPrice = sorted[0].originalPrice;
        }

        const productWithPrice = {
          ...product,
          price: displayPrice,
          originalPrice: displayOriginalPrice
        };

        finalResults.push(productWithPrice);

        // Check if we should show variants as cards
        const config = product.listingConfig as any;
        const showVariants = config?.showVariantsAsCards;

        if (showVariants && pWithVariants.variants && pWithVariants.variants.length > 0) {
          for (const variant of pWithVariants.variants) {
            // Merge variant data onto product base
            // Validate attributes object
            const safeAttributes = (variant.attributes && typeof variant.attributes === 'object' && !Array.isArray(variant.attributes))
              ? variant.attributes
              : {};

            finalResults.push({
              ...product,
              id: `${product.id}-v-${variant.id}`, // Virtual ID
              name: variant.name || product.name,
              images: variant.images,
              price: variant.price,
              originalPrice: variant.originalPrice,
              isVirtual: true,
              variantId: variant.id,
              // TRANSFORM ATTRIBUTES
              attributes: Object.entries(safeAttributes).reduce((acc: any, [k, v]) => {
                acc[k] = Array.isArray(v) ? v : [v];
                return acc;
              }, {}),
              variants: undefined
            });
          }
        }
      } catch (err) {
        console.error(`PRODUCT-SERVICE: Error processing product ${product.id}`, err);
        // Continue to next product, don't crash entire feed
      }
    }

    console.log(`PRODUCT-SERVICE: Returning ${finalResults.length} total items (after explosion)`);
    return c.json(finalResults);
  } catch (error: any) {
    console.error("PRODUCT-SERVICE: getProducts FAILED:", error);
    return c.json({
      message: "Internal Server Error",
      details: error.message,
      stack: error.stack
    }, 500);
  }
};

export const getProduct = async (c: Context) => {
  const rawId = c.req.param("id");
  let productId = 0;
  let productSlug = "";
  let variantId = 0;

  // Check for Virtual ID (e.g., "1-v-5") OR Slug (e.g. "ultimate-whey-protein")
  const isVirtual = rawId && rawId.includes("-v-");
  const isNumeric = !isNaN(Number(rawId)) && !isVirtual; // Pure number like "1"

  if (isVirtual) {
    const parts = rawId.split("-v-");
    const pIdOrSlug = parts[0];
    variantId = Number(parts[1]);

    // Check if first part is ID or Slug
    if (!isNaN(Number(pIdOrSlug))) {
      productId = Number(pIdOrSlug);
    } else {
      // It's a slug based virtual ID? e.g. "my-product-v-5"
      productSlug = pIdOrSlug || "";
    }
  } else if (isNumeric) {
    productId = Number(rawId);
  } else {
    // Pure Slug
    productSlug = rawId || "";
  }

  console.log(`PRODUCT-SERVICE: Fetching product. ID: ${productId}, Slug: ${productSlug}, VariantId: ${variantId}`);

  let product;

  if (productId) {
    product = await db.query.products.findFirst({
      where: eq(products.id, productId),
      with: { category: true, reviews: true, variants: true }
    });
  } else if (productSlug) {
    product = await db.query.products.findFirst({
      where: eq(products.slug, productSlug),
      with: { category: true, reviews: true, variants: true }
    });
  }

  if (!product) {
    console.log(`PRODUCT-SERVICE: Product ${productId} not found`);
    return c.json(null, 404);
  }

  // Calculate Display Price from Variants
  let displayPrice = (product.listingConfig as any)?.price || "0";
  let displayOriginalPrice = null;
  const pWithVariants = product as typeof product & { variants: any[] };

  if (pWithVariants.variants && pWithVariants.variants.length > 0) {
    const sorted = [...pWithVariants.variants].sort((a, b) => Number(a.price) - Number(b.price));
    displayPrice = sorted[0].price;
    displayOriginalPrice = sorted[0].originalPrice;
  }

  // Hydration Logic for Virtual ID
  if (variantId && product.variants && product.variants.length > 0) {
    const targetVariant = product.variants.find((v: any) => v.id === variantId);

    if (targetVariant) {
      console.log(`PRODUCT-SERVICE: Hydrating with Variant ${targetVariant.id}: ${targetVariant.name}`);
      return c.json({
        ...product,
        id: rawId, // Return the virtual ID to keep URL consistent
        name: targetVariant.name,
        price: targetVariant.price,
        originalPrice: targetVariant.originalPrice, // Use variant price
        images: targetVariant.images || product.images,
        description: targetVariant.description || product.description,
        stock: targetVariant.stock,
        sku: targetVariant.sku,
        variantId: targetVariant.id,
        isVirtual: true
      });
    }
  }

  console.log(`PRODUCT-SERVICE: Found product ${productId}, Computed Price: ${displayPrice}`);
  return c.json({
    ...product,
    price: displayPrice,
    originalPrice: displayOriginalPrice
  });
};

export const toggleProductStatus = async (c: Context) => {
  const id = Number(c.req.param("id"));
  const { status } = await c.req.json();

  if (!["DRAFT", "PUBLISHED", "ARCHIVED"].includes(status)) {
    return c.json({ message: "Invalid status" }, 400);
  }

  const [updatedProduct] = await db
    .update(products)
    .set({ status })
    .where(eq(products.id, id))
    .returning();

  if (!updatedProduct) {
    return c.json({ message: "Product not found" }, 404);
  }

  return c.json(updatedProduct);
};

export const getProductBySlug = async (c: Context) => {
  const slug = c.req.param("slug");
  console.log(`PRODUCT-SERVICE: Fetching product by slug: ${slug}`);

  const product = await db.query.products.findFirst({
    where: eq(products.slug, slug),
    with: { category: true, reviews: true, variants: true }
  });

  if (!product) {
    return c.json({ message: "Product not found" }, 404);
  }

  // Calculate Display Price from Variants
  let displayPrice = (product.listingConfig as any)?.price || "0";
  let displayOriginalPrice = null;
  const pWithVariants = product as typeof product & { variants: any[] };

  if (pWithVariants.variants && pWithVariants.variants.length > 0) {
    const sorted = [...pWithVariants.variants].sort((a, b) => Number(a.price) - Number(b.price));
    displayPrice = sorted[0].price;
    displayOriginalPrice = sorted[0].originalPrice;
  }

  return c.json({
    ...product,
    price: displayPrice,
    originalPrice: displayOriginalPrice
  });
};

export const getProductById = async (c: Context) => {
  const id = Number(c.req.param("id"));
  console.log(`PRODUCT-SERVICE: Fetching product by ID: ${id}`);

  // Note: getProduct logic already existed but we split it here for clarity with route
  const product = await db.query.products.findFirst({
    where: eq(products.id, id),
    with: { category: true, reviews: true, variants: true }
  });

  if (!product) {
    return c.json({ message: "Product not found" }, 404);
  }

  // Calculate Display Price from Variants
  let displayPrice = (product.listingConfig as any)?.price || "0";
  let displayOriginalPrice = null;
  const pWithVariants = product as typeof product & { variants: any[] };

  if (pWithVariants.variants && pWithVariants.variants.length > 0) {
    const sorted = [...pWithVariants.variants].sort((a, b) => Number(a.price) - Number(b.price));
    displayPrice = sorted[0].price;
    displayOriginalPrice = sorted[0].originalPrice;
  }

  return c.json({
    ...product,
    price: displayPrice,
    originalPrice: displayOriginalPrice
  });
};

export const createProductGenerative = async (c: Context) => {
  const data = await c.req.json();

  // -------- Validation --------
  if (!data?.name || !data?.options || !Array.isArray(data.options)) {
    return c.json({ message: "Product name and options array are required" }, 400);
  }

  // -------- Slug Generation --------
  let baseSlug = data.name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  let slug = baseSlug;
  let suffix = 1;

  while (
    await db.query.products.findFirst({
      where: eq(products.slug, slug),
    })
  ) {
    slug = `${baseSlug}-${suffix++}`;
  }

  // -------- Generate Variants --------
  // This is the "Smart" part
  const generatedVariants = generateVariants({
    ...data,
    slug // Pass the unique slug we just generated
  });

  console.log(`GENERATIVE: Generated ${generatedVariants.length} variants for ${data.name}`);

  // -------- Insert Product --------
  const [product] = await db
    .insert(products)
    .values({
      name: data.name,
      slug,
      tagline: data.tagline,
      shortDescription: data.shortDescription,
      categoryId: data.categoryId,
      attributes: {
        // Store the top-level options as attributes on the parent
        ...data.options.reduce((acc: any, opt: any) => {
          acc[opt.name] = opt.values;
          return acc;
        }, {})
      },
      images: data.images,
      listingConfig: {
        price: String(data.basePrice),
        showVariantsAsCards: true // Default to true for generative products
      },
      content: data.content,
      isBestSeller: data.isBestSeller ?? false,
      status: "PUBLISHED"
    })
    .returning();

  if (!product) {
    throw new Error("Product creation failed");
  }

  // -------- Insert Variants --------
  if (generatedVariants.length > 0) {
    const variantsToInsert = generatedVariants.map((v) => ({
      productId: product.id,
      name: v.name,
      sku: v.sku,
      price: v.price,
      stock: v.stock,
      attributes: v.attributes,
      images: v.images,
    }));

    await db.insert(variants).values(variantsToInsert);
  }

  // -------- Return Result --------
  const fullProduct = await db.query.products.findFirst({
    where: eq(products.id, product.id),
    with: { variants: true },
  });

  return c.json(fullProduct, 201);
};
