import { ProductsType, } from "@repo/types";
import Categories from "./Categories";
import ProductCard from "./ProductCard";
import Link from "next/link";
import Filter from "./Filter";
import { ProductType } from "@/types/product";

//TEMPORARY
// 1. Updated Interface for Health Products

// 2. The Data Array based on your Images
export const products: ProductType[] = [
  {
    id: 1,
    name: "Qadgin Complete Protein Supplement",
    tagline: "Immunity & Muscle Development",
    shortDescription:
      "High-protein formula enriched with dietary fiber, vitamins, and essential amino acids for faster recovery.",
    description:
      "Set a new standard in protein supplementation. Our Chocolate flavor protein is fortified with essential amino acids and flavonoids. Ideal for muscle development, heart health, digestion, and overall energy. Contains Skimmed Milk Protein and Soya Protein isolate.",
    price: 349.0,
    originalPrice: 399.0,
    packSize: ["200gm"],
    flavors: ["chocolate"],
    benefits: ["Muscle Growth", "Heart Health", "Digestion", "Immunity"],
    images: {
      main: "/products/c-1.jpg", // Default/Fallback image
      chocolate: ["/products/c-1.jpg"], // Specific flavor as an array
    },
    categorySlug: "supplements",
    isBestSeller: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    name: "Shilajit Energy Capsules",
    tagline: "Boosts Stamina & Performance",
    shortDescription:
      "Ayurvedic formulation with Fulvic Acid and Ginkgo Biloba to restore vigor and vitality.",
    description:
      "Experience all-day energy with our premium Shilajit capsules. Formulated to boost stamina, support muscle growth, and manage daily stress levels. Contains 500mg Shilajit (Asphaltum punjabianum) and 50mg Ginkgo Biloba per capsule.",
    price: 499.0,
    originalPrice: 599.0,
    packSize: ["30 Capsules"],
    flavors: ["natural"],
    benefits: ["Stamina", "Vigor", "Stress Management", "Muscle Energy"],
    images: {
      main: "/products/sec-1.jpg",
      natural: ["/products/sec-1.jpg"],
    },
    categorySlug: "ayurveda",
    isBestSeller: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    name: "Metabolic ACV Moringa",
    tagline: "Effervescent Tablets",
    shortDescription:
      "Apple Cider Vinegar with Mother, Moringa, Cinnamon, and Guggul extract for weight management.",
    description:
      "Delicious Orange flavored effervescent tablets designed for gut health and weight loss. Just drop, dissolve, and drink to boost immunity and reduce stress. Contains Apple Cider Vinegar, Moringa, Cinnamon, and Guggul extract.",
    price: 349.0,
    originalPrice: 399.0,
    packSize: ["15 Tablets", "30 Tablets"],
    flavors: ["orange"],
    benefits: ["Weight Loss", "Gut Health", "Immunity", "Reduced Stress"],
    images: {
      main: "/products/acv-1.jpg",
      orange: ["/products/acv-1.jpg"],
    },
    categorySlug: "weight-management",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 4,
    name: "Multivitamin Men",
    tagline: "Daily Health & Vitality",
    shortDescription:
      "Comprehensive blend of Vitamins, Minerals, and Amino Acids tailored for men's health.",
    description:
      "Fuel your day with our Multivitamin for Men. Supports strong muscles, heart health, and immunity. Enriched with Lycopene, Ginseng, and essential minerals like Zinc and Magnesium for peak performance.",
    price: 449.0,
    originalPrice: 499.0,
    packSize: ["60 Tablets"],
    flavors: ["unflavored"],
    benefits: ["Strong Muscle", "Heart Health", "Immunity", "Daily Energy"],
    images: {
      main: "/products/mvm-1.png",
      unflavored: ["/products/mvm-1.png"],
    },
    categorySlug: "vitamins",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 5,
    name: "Multivitamin Women",
    tagline: "Radiance & Balance",
    shortDescription:
      "Specially formulated with Veg Collagen, Iron, and Folic Acid for women's overall wellness.",
    description:
      "Stay active and radiant. Our Women's Multivitamin supports strong bones, hormonal balance, and skin radiance. Includes Veg Collagen Peptide, Hyaluronic Acid, and a full spectrum of vitamins for daily stress management.",
    price: 449.0,
    originalPrice: 499.0,
    packSize: ["60 Tablets"],
    flavors: ["unflavored"],
    benefits: ["Radiance", "Strong Bones", "Hormonal Balance", "Immunity"],
    images: {
      main: "/products/mvw-1.jpg",
      unflavored: ["/products/mvw-1.jpg"],
    },
    categorySlug: "vitamins",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// const fetchData = async ({
//   category,
//   sort,
//   search,
//   params,
// }: {
//   category?: string;
//   sort?: string;
//   search?: string;
//   params: "homepage" | "products";
// }) => {
//   const res = await fetch(
//     `${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/products?${category ? `category=${category}` : ""}${search ? `&search=${search}` : ""}&sort=${sort || "newest"}${params === "homepage" ? "&limit=8" : ""}`
//   );
//   const data: ProductType[] = await res.json();
//   return data;
// };
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
  // const products = await fetchData({ category, sort, search, params });
  
  return (
    <div className="w-full">
      <Categories />
      {params === "products" && <Filter />}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-12">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
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
