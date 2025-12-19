import { db, categories } from "@repo/db";
import { eq } from "drizzle-orm";
import { Context } from "hono";

export const createCategory = async (c: Context) => {
  const { name, slug, description, image } = (await c.req.json()) as {
    name: string;
    slug: string;
    description?: string;
    image?: string;
  };

  console.log("CATEGORY-SERVICE: Received payload:", { name, slug, description, image });

  if (!name || !slug) {
    console.error("CATEGORY-SERVICE: Missing Name or Slug");
    return c.json({ message: "Name and slug are required" }, 400);
  }

  try {
    console.log("CATEGORY-SERVICE: Attempting DB Insert...");
    const [category] = await db.insert(categories).values({
      name,
      slug,
      description,
      image,
    }).returning();
    console.log("CATEGORY-SERVICE: DB Insert Success:", category);
    return c.json(category, 201);
  } catch (error: any) {
    console.error("CATEGORY-SERVICE: DB Insert Failed Full Error:", JSON.stringify(error, null, 2));
    console.error("CATEGORY-SERVICE: Error Message:", error.message);
    // Explicitly return message to client
    return c.json({
      message: "Database Error",
      details: error.message,
      code: error.code,
      fullError: error
    }, 500);
  }
};

export const updateCategory = async (c: Context) => {
  const id = Number(c.req.param("id"));
  const { name, slug, description, image } = (await c.req.json()) as {
    name?: string;
    slug?: string;
    description?: string;
    image?: string;
  };

  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (slug !== undefined) updateData.slug = slug;
  if (description !== undefined) updateData.description = description;
  if (image !== undefined) updateData.image = image;

  const [category] = await db
    .update(categories)
    .set(updateData)
    .where(eq(categories.id, id))
    .returning();

  return c.json(category);
};

export const deleteCategory = async (c: Context) => {
  const id = Number(c.req.param("id"));

  const [category] = await db
    .delete(categories)
    .where(eq(categories.id, id))
    .returning();

  return c.json(category);
};

export const getCategories = async (c: Context) => {
  const allCategories = await db.select().from(categories);

  return c.json(allCategories);
};

export const getCategoryById = async (c: Context) => {
  const id = Number(c.req.param("id"));
  const [category] = await db.select().from(categories).where(eq(categories.id, id));

  if (!category) {
    return c.json({ message: "Category not found" }, 404);
  }

  return c.json(category);
};
