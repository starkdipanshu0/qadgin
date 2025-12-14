import { db, categories } from "@repo/db";
import { eq } from "drizzle-orm";
import { Context } from "hono";

export const createCategory = async (c: Context) => {
  const data = await c.req.json();

  if (!data || Object.keys(data).length === 0) {
    return c.json({ message: "Request body is empty" }, 400);
  }

  try {
    const [category] = await db.insert(categories).values(data).returning();
    return c.json(category, 201);
  } catch (error) {
    console.error("Error creating category:", error);
    return c.json({ message: "Internal server error", error }, 500);
  }
};

export const updateCategory = async (c: Context) => {
  const id = Number(c.req.param("id"));
  const data = await c.req.json();

  const [category] = await db
    .update(categories)
    .set(data)
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
