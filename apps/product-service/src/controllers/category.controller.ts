import { Prisma, prisma } from "@repo/product-db";
import { Request, Response } from "express";

export const createCategory = async (req: Request, res: Response) => {
  console.log("createCategory req.body:", req.body);
  const data: Prisma.CategoryCreateInput = req.body;

  if (!data || Object.keys(data).length === 0) {
    return res.status(400).json({ message: "Request body is empty" });
  }

  try {
    const category = await prisma.category.create({ data });
    res.status(201).json(category);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data: Prisma.CategoryUpdateInput = req.body;

  const category = await prisma.category.update({
    where: { id: Number(id) },
    data,
  });

  return res.status(200).json(category);
};

export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;

  const category = await prisma.category.delete({
    where: { id: Number(id) },
  });

  return res.status(200).json(category);
};

export const getCategories = async (req: Request, res: Response) => {
  const categories = await prisma.category.findMany();

  return res.status(200).json(categories);
};
