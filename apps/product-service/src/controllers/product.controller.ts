import { Context } from "hono";
import { prisma, Prisma } from "@repo/product-db";
import { StripeProductType } from "@repo/types";

export const createProduct = async (c: Context) => {
  const data: Prisma.ProductCreateInput = await c.req.json();

  const { flavors, images } = data;

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

  const missingFlavors = flavors.filter((flavor) => !(flavor in imagesObj));

  if (missingFlavors.length > 0) {
    return c.json({ message: "Missing images for flavors!", missingFlavors }, 400);
  }

  const product = await prisma.product.create({ data });

  const stripeProduct: StripeProductType = {
    id: product.id.toString(),
    name: product.name,
    price: product.price,
  };

  /*
  producer.send("product.created", { value: stripeProduct });
  */
  return c.json(product, 201);
};

export const updateProduct = async (c: Context) => {
  const id = c.req.param("id");
  const data: Prisma.ProductUpdateInput = await c.req.json();

  const updatedProduct = await prisma.product.update({
    where: { id: Number(id) },
    data,
  });

  return c.json(updatedProduct);
};

export const deleteProduct = async (c: Context) => {
  const id = c.req.param("id");

  const deletedProduct = await prisma.product.delete({
    where: { id: Number(id) },
  });

  /*
  producer.send("product.deleted", { value: Number(id) });
  */

  return c.json(deletedProduct);
};

export const getProducts = async (c: Context) => {
  const { sort, category, search, limit } = c.req.query();

  const orderBy = (() => {
    switch (sort) {
      case "asc":
        return { price: Prisma.SortOrder.asc };
      case "desc":
        return { price: Prisma.SortOrder.desc };
      case "oldest":
        return { createdAt: Prisma.SortOrder.asc };
      default:
        return { createdAt: Prisma.SortOrder.desc };
    }
  })();

  const products = await prisma.product.findMany({
    where: {
      category: {
        slug: category,
      },
      name: {
        contains: search,
        mode: "insensitive",
      },
    },
    orderBy,
    take: limit ? Number(limit) : undefined,
  });

  return c.json(products);
};

export const getProduct = async (c: Context) => {
  const id = c.req.param("id");
  console.log(`PRODUCT-SERVICE: Fetching product with ID: ${id}`);

  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
  });

  if (!product) {
    console.log(`PRODUCT-SERVICE: Product ${id} not found`);
  } else {
    console.log(`PRODUCT-SERVICE: Found product ${id}, Price: ${product.price}`);
  }

  return c.json(product);
};
