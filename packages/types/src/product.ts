import { products, categories } from "@repo/db";
import { type InferSelectModel } from "drizzle-orm";
import z from "zod";

export type Product = InferSelectModel<typeof products>;
export type Category = InferSelectModel<typeof categories>;

export type ProductType = Omit<Product, "images" | "price" | "originalPrice"> & {
  images: {
    main: string;
    [key: string]: string | string[];
  };
  price: number;
  originalPrice: number | null;
};

export type ProductsType = ProductType[];

export type StripeProductType = {
  id: string;
  name: string;
  price: number;
};

export const ProductFormSchema = z
  .object({
    name: z
      .string({ message: "Product name is required!" })
      .min(1, { message: "Product name is required!" }),
    shortDescription: z
      .string({ message: "Short description is required!" })
      .min(1, { message: "Short description is required!" })
      .max(60),
    description: z
      .string({ message: "Description is required!" })
      .min(1, { message: "Description is required!" }),
    tagline: z
      .string({ message: "Tagline is required!" })
      .min(1, { message: "Tagline is required!" }),
    price: z
      .number({ message: "Price is required!" })
      .min(1, { message: "Price is required!" }),
    originalPrice: z
      .number({ message: "Original Price is required!" })
      .min(1, { message: "Original Price is required!" }),
    categorySlug: z
      .string({ message: "Category is required!" })
      .min(1, { message: "Category is required!" }),
    images: z.record(z.string(), z.string(), {
      message: "Image for each flavor is required!",
    }),
    flavors: z.array(z.string()).min(1, { message: "Flavor is required!" }),
    packSize: z.array(z.string()).min(1, { message: "Pack Size is required!" }),
    benefits: z.array(z.string()).min(1, { message: "Benefits are required!" }),
  })
  .refine(
    (data) => {
      const missingImages = data.flavors.filter(
        (flavor: string) => !data.images?.[flavor]
      );
      return missingImages.length === 0;
    },
    {
      message: "Image is required for each selected flavor!",
      path: ["images"],
    }
  );

export type CategoryType = Category;

export const CategoryFormSchema = z.object({
  name: z
    .string({ message: "Name is Required!" })
    .min(1, { message: "Name is Required!" }),
  slug: z
    .string({ message: "Slug is Required!" })
    .min(1, { message: "Slug is Required!" }),
});
