import ProductInteraction from "@/components/ProductInteraction";

// Make sure your ProductType definition in @repo/types includes the new health fields (tagline, packSize, flavors, etc.)
import { ProductType } from "@repo/types";
import { Check, ChevronRight, ShieldCheck, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Mock fetcher - replace with actual API call
const fetchProduct = async (id: string) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/products/${id}`);
    if (!res.ok) return undefined;
    const rawProduct = await res.json();
    const product: ProductType = {
      ...rawProduct,
      price: Number(rawProduct.price),
      originalPrice: rawProduct.originalPrice ? Number(rawProduct.originalPrice) : null,
    };
    return product;
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return undefined;
  }
}

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const product = await fetchProduct(id);

  if (!product) return { title: "Product Not Found" };

  return {
    title: `${product.name} | Qadgin Wellness`,
    description: product.shortDescription || (product.description || "").substring(0, 150),
  };
};

const ProductPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ flavor?: string; size?: string }>;
}) => {
  const { size, flavor } = await searchParams;
  const { id } = await params;

  const product = await fetchProduct(id);

  if (!product) {
    return <div className="text-center py-20 text-stone-500">Product not found.</div>;
  }

  // 1. Determine Defaults based on new data structure (Attributes)
  // 1. Determine Defaults based on new data structure (Attributes)
  const getFirst = (keys: string[]) => {
    if (!product.attributes) return "";
    for (const key of keys) {
      const vals = product.attributes[key];
      if (vals && vals.length > 0) return vals[0];
    }
    return "";
  };

  // Logic to handle Virtual Product Pre-selection
  let virtualFlavor = "";
  let virtualSize = "";

  if (product.isVirtual && product.variantId && product.variants) {
    const vId = product.variantId;
    const v = product.variants.find((item) => item.id === vId);
    if (v && v.attributes) {
      // Attributes are string[] in DB/Types, but usually length 1 for variants?
      // accessing first element safely
      const attrs = v.attributes;
      virtualFlavor = attrs["Flavor"]?.[0] || attrs["Color"]?.[0] || attrs["Variant"]?.[0] || "";
      virtualSize = attrs["Size"]?.[0] || attrs["Pack Size"]?.[0] || attrs["Weight"]?.[0] || "";
    }
  }

  const defaultFlavor = getFirst(["Flavor", "Color", "Variant"]);
  const defaultSize = getFirst(["Size", "Pack Size", "Weight"]);

  const selectedFlavor = flavor || virtualFlavor || defaultFlavor || "";
  const selectedSize = size || virtualSize || defaultSize || "";

  // 2. Find Active Variant
  // We check for variants that match the selected attributes
  const activeVariant = product.variants?.find((v) => {
    const vAttrs = v.attributes;
    if (!vAttrs) return false;

    // Check if variant has the selected attribute values
    // We treat variant attributes as single string or array
    const hasValue = (val: string) => {
      if (!val) return true; // checking empty is partial match? No, if selected is empty, we ignore
      return Object.values(vAttrs).some(vVal =>
        Array.isArray(vVal) ? vVal.includes(val) : vVal === val
      );
    };

    // Strict match if both selected?
    // For now: try to match flavor AND size if they are selected
    if (selectedFlavor && selectedSize) return hasValue(selectedFlavor) && hasValue(selectedSize);
    if (selectedFlavor) return hasValue(selectedFlavor);
    if (selectedSize) return hasValue(selectedSize);
    return false;
  });

  // 3. Determine Image based on variant or fallback to main
  let currentImage = "";
  if (activeVariant?.images?.main) {
    currentImage = activeVariant.images.main;
  } else if (product.images?.main) {
    currentImage = product.images.main;
  }

  console.log("current image:", currentImage);

  // 4. Resolve Price/Name Overrides based on Active Variant
  const effectiveProduct = {
    ...product,
    name: activeVariant?.name || product.name,
    price: activeVariant?.price ? Number(activeVariant.price) : product.price,
    originalPrice: activeVariant?.originalPrice ? Number(activeVariant.originalPrice) : product.originalPrice,
    // Note: We don't override the image here because logic above (currentImage) handles it
  };

  // 4. Calculate Discount
  const hasDiscount = effectiveProduct.originalPrice && effectiveProduct.originalPrice > effectiveProduct.price;
  const discountPercentage = hasDiscount
    ? Math.round(((effectiveProduct.originalPrice! - effectiveProduct.price) / effectiveProduct.originalPrice!) * 100)
    : 0;

  return (
    <div className="bg-white min-h-screen pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* --- BREADCRUMBS --- */}
        <nav className="flex items-center gap-2 text-sm text-stone-500 py-6">
          <Link href="/" className="hover:text-emerald-700 transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/shop" className="hover:text-emerald-700 transition-colors">Shop</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-stone-800 font-medium truncate max-w-[200px]">{effectiveProduct.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

          {/* --- LEFT COLUMN: IMAGE --- */}
          <div className="relative aspect-[4/5] bg-stone-50 rounded-2xl overflow-hidden border border-stone-100 sticky top-24">
            {/* Badges */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
              {product.isBestSeller && (
                <span className="bg-amber-400 text-amber-950 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                  Bestseller
                </span>
              )}
              {hasDiscount && (
                <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                  -{discountPercentage}% OFF
                </span>
              )}
            </div>

            {currentImage ? (
              <Image
                src={currentImage}
                alt={effectiveProduct.name}
                fill
                className="object-contain p-8 animate-fade-in"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-300">No Image</div>
            )}

          </div>

          {/* --- RIGHT COLUMN: DETAILS & BUY BOX --- */}
          <div className="flex flex-col gap-8 pt-2">

            {/* HEADER INFO */}
            <div>
              {product.tagline && (
                <p className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-2">
                  {product.tagline}
                </p>
              )}
              <h1 className="text-3xl md:text-4xl font-bold text-stone-900 tracking-tight mb-4">
                {effectiveProduct.name}
              </h1>

              {/* Rating Mockup */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex text-yellow-400">★★★★★</div>
                <span className="text-sm text-stone-500">(128 Reviews)</span>
              </div>

              {/* Price Block */}
              <div className="flex items-end gap-3 mb-6">
                <span className="text-3xl font-bold text-emerald-800">
                  ₹{effectiveProduct.price.toFixed(2)}
                </span>
                {hasDiscount && (
                  <span className="text-lg text-stone-400 line-through mb-1">
                    ₹{effectiveProduct.originalPrice!.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Short Description */}
              <p className="text-stone-600 leading-relaxed text-lg">
                {product.shortDescription}
              </p>
            </div>

            {/* SEPARATOR */}
            <hr className="border-stone-200" />

            {/* INTERACTIVE BUY BOX AREA */}
            {/* We pass the *initial* selected values from URL params to the client component */}
            <ProductInteraction
              product={effectiveProduct}
              initialSelectedSize={selectedSize}
              initialSelectedFlavor={selectedFlavor}
            />

            {/* TRUST SIGNALS (Replaces generic payment icons) */}
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="flex items-center gap-3 text-stone-700 text-sm font-medium p-3 bg-stone-50 rounded-lg border border-stone-100">
                <Truck className="w-5 h-5 text-emerald-600" />
                <span>Free Shipping over ₹500</span>
              </div>
              <div className="flex items-center gap-3 text-stone-700 text-sm font-medium p-3 bg-stone-50 rounded-lg border border-stone-100">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Secure Checkout</span>
              </div>
              {/* Add more like "Non-GMO", "GMP Certified" based on your product data */}
            </div>

            {/* ACCORDIONS FOR DETAILED INFO */}
            <div className="flex flex-col border-t border-stone-200 divide-y divide-stone-200">
              {/* Description Accordion */}
              <details className="group py-4 cursor-pointer" open>
                <summary className="flex items-center justify-between font-bold text-stone-800 list-none">
                  Product Details
                  <span className="transition group-open:rotate-180">
                    <ChevronRight className="w-5 h-5" />
                  </span>
                </summary>
                <p className="text-stone-600 mt-4 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </details>

              {/* Ingredients Mockup - You would map real data here */}
              <details className="group py-4 cursor-pointer">
                <summary className="flex items-center justify-between font-bold text-stone-800 list-none">
                  Key Ingredients & Benefits
                  <span className="transition group-open:rotate-180">
                    <ChevronRight className="w-5 h-5" />
                  </span>
                </summary>
                <ul className="mt-4 space-y-2 text-stone-600">
                  {/* Try to find a 'Benefits' or 'Features' attribute */}
                  {(product.attributes?.["Benefits"] || product.attributes?.["Features"] || []).map(benefit => (
                    <li key={benefit} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </details>

              {/* Shipping Info Accordion */}
              <details className="group py-4 cursor-pointer">
                <summary className="flex items-center justify-between font-bold text-stone-800 list-none">
                  Shipping & Returns
                  <span className="transition group-open:rotate-180">
                    <ChevronRight className="w-5 h-5" />
                  </span>
                </summary>
                <div className="text-stone-600 mt-4 text-sm space-y-2">
                  <p>We ship worldwide. Standard shipping typically takes 3-5 business days.</p>
                  <p>If you're not satisfied, return within 30 days for a full refund.</p>
                </div>
              </details>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;