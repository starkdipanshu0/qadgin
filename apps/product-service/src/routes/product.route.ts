import { Hono } from "hono";
import {
  createProduct,
  deleteProduct,
  getProduct,
  getProductById,
  getProductBySlug,
  getProducts,
  toggleProductStatus,
  updateProduct,
  createProductGenerative,
} from "../controllers/product.controller";
import { shouldBeAdmin } from "../middleware/authMiddleware";

const app = new Hono();

app.post("/", shouldBeAdmin, createProduct);
app.post("/generate", shouldBeAdmin, createProductGenerative);
app.put("/:id", shouldBeAdmin, updateProduct);
app.patch("/:id/status", shouldBeAdmin, toggleProductStatus);
app.delete("/:id", shouldBeAdmin, deleteProduct);
// Storefront
app.get("/", getProducts);
app.get("/slug/:slug", getProductBySlug);
app.get("/:id", getProduct);

export default app;
