import { Hono } from "hono";
import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
} from "../controllers/product.controller";
import { shouldBeAdmin } from "../middleware/authMiddleware";

const app = new Hono();

app.post("/", shouldBeAdmin, createProduct);
app.put("/:id", shouldBeAdmin, updateProduct);
app.delete("/:id", shouldBeAdmin, deleteProduct);
app.get("/", getProducts);
app.get("/:id", getProduct);

export default app;
