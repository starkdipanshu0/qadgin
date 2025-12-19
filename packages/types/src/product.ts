import { products, categories, variants } from "@repo/db";
import { type InferSelectModel } from "drizzle-orm";
import z from "zod";
import { ProductAttributes, ListingConfig, ProductContent, ProductImageState } from "./product-schema-types";

export type Product = InferSelectModel<typeof products>;
export type Variant = InferSelectModel<typeof variants>;
export type Category = InferSelectModel<typeof categories>;

// Derived Type for Frontend (Optional, but good for type safety)
export type ProductType = Omit<Product, "images" | "attributes" | "listingConfig" | "content" | "price" | "originalPrice"> & {
  images: ProductImageState;
  attributes: ProductAttributes;
  listingConfig: ListingConfig | null;
  content: ProductContent | null;
  price: number;
  originalPrice: number | null;
  variants?: Variant[];
  isVirtual?: boolean;
  variantId?: number;
  slug?: string;
};

export type ProductsType = ProductType[];

export type StripeProductType = {
  id: string;
  name: string;
  price: number;
};

// Updated Zod Schema for the Universal Product Form
export const ProductFormSchema = z.object({
  name: z.string().min(1, { message: "Product name is required!" }),
  tagline: z.string().min(1, { message: "Tagline is required!" }),
  shortDescription: z.string().max(160, { message: "Short description is too long!" }).optional(),

  price: z.number().min(0, { message: "Price must be positive!" }),
  originalPrice: z.number().min(0).optional(),

  categoryId: z.number({ message: "Category is required!" }),

  // Generic Attributes validation
  // We accept any key with string[] values
  attributes: z.record(z.string(), z.array(z.string())).optional(),

  // Images Validation
  images: z.object({
    main: z.string().min(1, { message: "Main image is required!" }),
    gallery: z.array(z.string()).optional(),
  }),

  // Listing Config (Optional)
  listingConfig: z.object({
    showVariantsAsCards: z.boolean(),
  }).optional(),

  // Variants Validation
  variants: z.array(z.object({
    name: z.string().min(1, { message: "Variant Name required" }),
    sku: z.string().min(1, { message: "SKU required" }),
    price: z.number().min(0),
    originalPrice: z.number().min(0).optional(),
    stock: z.number().default(0),
    // Attributes: simple key-value for variants usually, or match ProductAttributes
    attributes: z.any(), // Relaxed for now or z.record(z.string(), z.any())
    images: z.object({
      main: z.string().nullable().optional(),
      gallery: z.array(z.string()).optional()
    }).optional(),
    description: z.string().optional()
  })).optional(),

  // Rich Content (Optional - simplified validation for now)
  content: z.object({
    blocks: z.array(z.any())
  }).optional(),
});

export type CategoryType = Category;

export const CategoryFormSchema = z.object({
  name: z
    .string({ message: "Name is Required!" })
    .min(1, { message: "Name is Required!" }),
  slug: z
    .string({ message: "Slug is Required!" })
    .min(1, { message: "Slug is Required!" }),
});
