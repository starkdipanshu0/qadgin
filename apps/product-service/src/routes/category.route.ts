import { Hono } from "hono";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory,
} from "../controllers/category.controller";
import { shouldBeAdmin } from "../middleware/authMiddleware";

const app = new Hono();

app.post("/", shouldBeAdmin, createCategory);
app.put("/:id", shouldBeAdmin, updateCategory);
app.delete("/:id", shouldBeAdmin, deleteCategory);
app.get("/", getCategories);
app.get("/:id", getCategoryById);

export default app;
