import { ProductsType, CategoryType } from "@repo/types";
import Categories from "./Categories";
import ProductCard from "./ProductCard";
import Link from "next/link";
import Filter from "./Filter";

const fetchData = async ({
  category,
  sort,
  search,
  params,
}: {
  category?: string;
  sort?: string;
  search?: string;
  params: "homepage" | "products";
}) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/products?${category ? `category=${category}` : ""}${search ? `&search=${search}` : ""}&sort=${sort || "newest"}${params === "homepage" ? "&limit=8" : ""}`
    );
    console.log("ressssss", res);
    if (!res.ok) {
      console.error("Failed to fetch products:", res.status, res.statusText);
      return [];
    }
    const data: ProductsType = await res.json();
    console.log("data", data);
    if (!Array.isArray(data)) {
      console.error("Fetched products data is not an array:", data);
      return [];
    }
    return data;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

const fetchCategories = async () => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/categories`);
    if (!res.ok) return [];
    const data: CategoryType[] = await res.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
};
const ProductList = async ({
  category,
  sort,
  search,
  params,
}: {
  category: string;
  sort?: string;
  search?: string;
  params: "homepage" | "products";
}) => {
  const [products, categories] = await Promise.all([
    fetchData({ category, sort, search, params }),
    fetchCategories(),
  ]);

  // SMART FILTERING: Hide "Base Product" if "Virtual Variants" exist for it.
  const productsWithVariants = new Set<string>();

  if (Array.isArray(products)) {
    products.forEach((p) => {
      // Logic assumes Virtual ID format: "BaseID-v-VariantID"
      const pId = String(p.id);
      if (p.isVirtual && pId.includes("-v-")) {
        const baseId = pId.split("-v-")[0];
        if (baseId) {
          productsWithVariants.add(baseId);
        }
      }
    });
  }

  const displayProducts = Array.isArray(products)
    ? products.filter((p) => {
      // If it's a base product (not virtual), hide it if we have variants
      if (!p.isVirtual) {
        return !productsWithVariants.has(String(p.id));
      }
      return true;
    })
    : [];

  return (
    <div className="w-full">
      <Categories categories={categories} />
      {params === "products" && <Filter />}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {displayProducts.length > 0 ? (
          displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500 text-lg">No products found.</p>
          </div>
        )}
      </div>
      <Link
        href={category ? `/products/?category=${category}` : "/products"}
        className="flex justify-end mt-4 underline text-sm text-gray-500"
      >
        View all products
      </Link>
    </div>
  );
};

export default ProductList;
