import { Prisma, prisma } from "@repo/product-db";
import { Context } from "hono";

export const createCategory = async (c: Context) => {
  const data: Prisma.CategoryCreateInput = await c.req.json();

  if (!data || Object.keys(data).length === 0) {
    return c.json({ message: "Request body is empty" }, 400);
  }

  try {
    const category = await prisma.category.create({ data });
    return c.json(category, 201);
  } catch (error) {
    console.error("Error creating category:", error);
    return c.json({ message: "Internal server error", error }, 500);
  }
};

export const updateCategory = async (c: Context) => {
  const id = c.req.param("id");
  const data: Prisma.CategoryUpdateInput = await c.req.json();

  const category = await prisma.category.update({
    where: { id: Number(id) },
    data,
  });

  return c.json(category);
};

export const deleteCategory = async (c: Context) => {
  const id = c.req.param("id");

  const category = await prisma.category.delete({
    where: { id: Number(id) },
  });

  return c.json(category);
};

export const getCategories = async (c: Context) => {
  const categories = await prisma.category.findMany();

  return c.json(categories);
};
