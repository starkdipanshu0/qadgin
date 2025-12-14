
import { pgTable, text, serial, timestamp, integer, boolean, pgEnum, decimal, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const orderStatusEnum = pgEnum("order_status", ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]);

// Users
export const users = pgTable("users", {
    id: text("id").primaryKey(), // Clerk ID
    name: text("name"),
    email: text("email").unique(),
    role: text("role").default("user"),
    createdAt: timestamp("created_at").defaultNow(),
});

// Categories
export const categories = pgTable("categories", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").unique().notNull(),
});

// Products
export const products = pgTable("products", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    tagline: text("tagline"),
    shortDescription: text("short_description"),
    description: text("description"),
    price: decimal("price").notNull(),
    originalPrice: decimal("original_price"),
    packSize: json("pack_size").$type<string[]>(),
    flavors: json("flavors").$type<string[]>(),
    benefits: json("benefits").$type<string[]>(),
    images: json("images").$type<string[]>(),
    isBestSeller: boolean("is_best_seller").default(false),
    categoryId: integer("category_id").references(() => categories.id),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// Orders
export const orders = pgTable("orders", {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(), // Link to Clerk ID, but loosely coupled or we can enforce FK if we sync users
    status: orderStatusEnum("status").default("PENDING"),
    amount: decimal("amount").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// Order Items
export const orderItems = pgTable("order_items", {
    id: serial("id").primaryKey(),
    orderId: integer("order_id").references(() => orders.id),
    productId: integer("product_id").references(() => products.id),
    quantity: integer("quantity").notNull(),
    price: decimal("price").notNull(), // Snapshot price at time of order
});

// Order Events (Tracking)
export const orderEvents = pgTable("order_events", {
    id: serial("id").primaryKey(),
    orderId: integer("order_id").references(() => orders.id),
    status: text("status").notNull(), // "Out for delivery", etc.
    timestamp: timestamp("timestamp").defaultNow(),
});

// Reviews
export const reviews = pgTable("reviews", {
    id: serial("id").primaryKey(),
    productId: integer("product_id").references(() => products.id),
    userId: text("user_id").notNull(),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    isVerifiedPurchase: boolean("is_verified_purchase").default(false),
    createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const productsRelations = relations(products, ({ one, many }) => ({
    category: one(categories, {
        fields: [products.categoryId],
        references: [categories.id],
    }),
    reviews: many(reviews),
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
