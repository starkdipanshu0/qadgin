import { Hono } from "hono";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProductBySlug,
  getProducts,
  toggleProductStatus,
  updateProduct,
} from "../controllers/product.controller";
import { shouldBeAdmin } from "../middleware/authMiddleware";

const app = new Hono();

app.post("/", shouldBeAdmin, createProduct);
app.put("/:id", shouldBeAdmin, updateProduct);
app.patch("/:id/status", shouldBeAdmin, toggleProductStatus);
app.delete("/:id", shouldBeAdmin, deleteProduct);
// Storefront
app.get("/", getProducts);
app.get("/slug/:slug", getProductBySlug);
app.get("/:id", getProductById);

export default app;
