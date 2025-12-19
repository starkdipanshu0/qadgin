import {
    pgTable,
    text,
    serial,
    timestamp,
    integer,
    boolean,
    pgEnum,
    decimal,
    json,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import {
    ProductAttributes,
    ProductImageState,
    ListingConfig,
    ProductContent,
} from "./types";

/* =====================================================
   ENUMS
===================================================== */

export const orderStatusEnum = pgEnum("order_status", [
    "PENDING",
    "PAID",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
]);

/* =====================================================
   USERS
===================================================== */

export const users = pgTable("users", {
    id: text("id").primaryKey(), // Clerk ID
    name: text("name"),
    email: text("email").unique(),
    role: text("role").default("user"),
    createdAt: timestamp("created_at").defaultNow(),
});

/* =====================================================
   CATEGORIES
===================================================== */

export const categories = pgTable("categories", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").unique().notNull(),
    description: text("description"),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow(),
});

/* =====================================================
   PRODUCTS
===================================================== */

export const products = pgTable("products", {
    id: serial("id").primaryKey(),

    name: text("name").notNull(),
    slug: text("slug").unique(),
    tagline: text("tagline"),
    shortDescription: text("short_description"),
    // Rich content & configs
    content: json("content").$type<ProductContent>(),
    attributes: json("attributes").$type<ProductAttributes>(),
    images: json("images").$type<ProductImageState>(),
    listingConfig: json("listing_config").$type<ListingConfig>(),

    // Legacy / fallback description
    description: text("description"),

    isBestSeller: boolean("is_best_seller").default(false),

    categoryId: integer("category_id").references(() => categories.id),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

/* =====================================================
   VARIANTS
===================================================== */

export const variants = pgTable("variants", {
    id: serial("id").primaryKey(),

    productId: integer("product_id")
        .references(() => products.id)
        .notNull(),

    name: text("name").notNull(), // e.g. "Red / XL"
    sku: text("sku").unique().notNull(),

    price: decimal("price").notNull(),
    compareAtPrice: decimal("compare_at_price"),

    stock: integer("stock").default(0).notNull(),

    attributes: json("attributes").$type<ProductAttributes>(),
    images: json("images").$type<ProductImageState>(),

    description: text("description"),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

/* =====================================================
   ORDERS
===================================================== */

export const orders = pgTable("orders", {
    id: serial("id").primaryKey(),

    userId: text("user_id").notNull(), // Clerk ID (loosely coupled)

    status: orderStatusEnum("status").default("PENDING"),

    subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
    tax: decimal("tax", { precision: 10, scale: 2 }).default("0"),
    shipping: decimal("shipping", { precision: 10, scale: 2 }).default("0"),
    total: decimal("total", { precision: 10, scale: 2 }).notNull(),

    currency: text("currency").default("INR"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

/* =====================================================
   ORDER ITEMS
===================================================== */

export const orderItems = pgTable("order_items", {
    id: serial("id").primaryKey(),

    orderId: integer("order_id").references(() => orders.id),
    productId: integer("product_id").references(() => products.id),
    variantId: integer("variant_id").references(() => variants.id),

    quantity: integer("quantity").notNull(),
    price: decimal("price").notNull(), // Snapshot price
});

/* =====================================================
   ORDER EVENTS (TRACKING)
===================================================== */

export const orderEvents = pgTable("order_events", {
    id: serial("id").primaryKey(),

    orderId: integer("order_id").references(() => orders.id),
    status: text("status").notNull(), // "Out for delivery", etc.

    createdAt: timestamp("created_at").defaultNow()
});

/* =====================================================
   REVIEWS
===================================================== */

export const reviews = pgTable("reviews", {
    id: serial("id").primaryKey(),

    productId: integer("product_id").references(() => products.id),
    userId: text("user_id").notNull(),

    rating: integer("rating").notNull(),
    comment: text("comment"),

    isVerifiedPurchase: boolean("is_verified_purchase").default(false),
    createdAt: timestamp("created_at").defaultNow(),
});

/* =====================================================
   RELATIONS
===================================================== */

export const productsRelations = relations(products, ({ one, many }) => ({
    category: one(categories, {
        fields: [products.categoryId],
        references: [categories.id],
    }),
    variants: many(variants),
    reviews: many(reviews),
}));

export const variantsRelations = relations(variants, ({ one }) => ({
    product: one(products, {
        fields: [variants.productId],
        references: [products.id],
    }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
    products: many(products),
}));

export const ordersRelations = relations(orders, ({ many }) => ({
    items: many(orderItems),
    events: many(orderEvents),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
    order: one(orders, {
        fields: [orderItems.orderId],
        references: [orders.id],
    }),
    product: one(products, {
        fields: [orderItems.productId],
        references: [products.id],
    }),
}));

export const orderEventsRelations = relations(orderEvents, ({ one }) => ({
    order: one(orders, {
        fields: [orderEvents.orderId],
        references: [orders.id],
    }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
    product: one(products, {
        fields: [reviews.productId],
        references: [products.id],
    }),
    user: one(users, {
        fields: [reviews.userId],
        references: [users.id],
    }),
}));
