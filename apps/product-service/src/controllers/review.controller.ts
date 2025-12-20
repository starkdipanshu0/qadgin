import { db, reviews, products } from "@repo/db";
import { eq, and, desc } from "drizzle-orm";
import { Context } from "hono";
import { getAuth } from "@hono/clerk-auth";

export const createReview = async (c: Context) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
        return c.json({ message: "Unauthorized" }, 401);
    }

    const { productId, rating, comment } = await c.req.json();

    if (!productId || !rating) {
        return c.json({ message: "Product ID and Rating are required" }, 400);
    }

    if (rating < 1 || rating > 5) {
        return c.json({ message: "Rating must be between 1 and 5" }, 400);
    }

    try {
        // Check if product exists
        const productExists = await db.query.products.findFirst({
            where: eq(products.id, productId),
        });

        if (!productExists) {
            return c.json({ message: "Product not found" }, 404);
        }

        // Check for existing review by this user
        const existingReview = await db.query.reviews.findFirst({
            where: and(
                eq(reviews.productId, productId),
                eq(reviews.userId, auth.userId)
            ),
        });

        if (existingReview) {
            return c.json({ message: "You have already reviewed this product" }, 409);
        }

        const [review] = await db
            .insert(reviews)
            .values({
                userId: auth.userId,
                productId: Number(productId),
                rating: Number(rating),
                comment: comment || null,
                isVerifiedPurchase: false, // TODO: Inter-service check with Order Service
            })
            .returning();

        return c.json(review, 201);
    } catch (error: any) {
        console.error("REVIEW-SERVICE: Create Failed", error);
        return c.json({ message: "Failed to create review" }, 500);
    }
};

export const getProductReviews = async (c: Context) => {
    const productId = Number(c.req.param("productId"));

    const productReviews = await db.query.reviews.findMany({
        where: eq(reviews.productId, productId),
        orderBy: [desc(reviews.createdAt)],
        with: {
            user: {
                columns: {
                    name: true,
                    role: true // Optional: show if admin reviewed?
                }
            }
        }
    });

    return c.json(productReviews);
};

export const deleteReview = async (c: Context) => {
    const id = Number(c.req.param("id"));

    // Note: Only admin should call this, middleware handles it
    const [deletedReview] = await db.delete(reviews)
        .where(eq(reviews.id, id))
        .returning();

    if (!deletedReview) {
        return c.json({ message: "Review not found" }, 404);
    }

    return c.json(deletedReview);
};
