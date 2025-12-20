import { Hono } from "hono";
import { createReview, deleteReview, getProductReviews } from "../controllers/review.controller";
import { shouldBeAdmin, shouldBeUser } from "../middleware/authMiddleware";

const app = new Hono();

app.post("/", shouldBeUser, createReview);
app.get("/product/:productId", getProductReviews);
app.delete("/:id", shouldBeAdmin, deleteReview);

export default app;
