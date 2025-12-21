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
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const resolvedSearchParams = await searchParams;
  // const { variant } = resolvedSearchParams; // We extract variant ID if explicit
  const variantParam = resolvedSearchParams.variant as string | undefined;

  const { id } = await params;
  const product = await fetchProduct(id);

  if (!product) {
    return <div className="text-center py-20 text-stone-500">Product not found.</div>;
  }

  // Helper to extract attributes from a variant object
  const extractVariantAttrs = (v: any) => {
    const attrs = v.attributes;
    // Fallback legacy logic for initial state if needed, but we rely on matching logic mainly
    const f = attrs["Flavor"]?.[0] || attrs["Color"]?.[0] || attrs["Variant"]?.[0] || "";
    const s = attrs["Size"]?.[0] || attrs["Pack Size"]?.[0] || attrs["Weight"]?.[0] || "";
    return { f, s };
  };

  // 1. Identify "Target Variant" Logic
  // Hierarchy: 
  // A. Explicit ?variant=ID (Strongest)
  // B. Attribute Match from ?color=red&size=xl
  // C. Virtual Product ID (from URL segment)
  // D. Default (First variant)

  let activeVariantID: number | undefined;

  // A. Explicit ID
  if (variantParam && product.variants) {
    const v = product.variants.find((item) => String(item.id) === String(variantParam));
    if (v) activeVariantID = v.id;
  }

  // B. Attribute Matching (if no explicit variant found yet)
  if (!activeVariantID && product.variants) {
    const matchingVariant = product.variants.find(v => {
      if (!v.attributes) return false;
      // Check if EVERY param provided in URL matches this variant
      // We ignore 'variant' param here
      const urlKeys = Object.keys(resolvedSearchParams).filter(k => k !== "variant");
      if (urlKeys.length === 0) return false;

      return urlKeys.every(key => {
        const urlValue = resolvedSearchParams[key];
        if (!urlValue || typeof urlValue !== 'string') return true; // Skip complex params

        // Variant attribute values (array or string)
        const vVals = v.attributes?.[key]; // Key case sensitivity??
        // Try exact match first, then case-insensitive key search if needed?
        // ProductCard sends explicit keys (e.g. "Flavor"), so exact match should work.

        if (!vVals) return false; // Variant doesn't have this attribute involved

        const valuesArr = Array.isArray(vVals) ? vVals : [vVals];
        return valuesArr.includes(urlValue);
      });
    });

    if (matchingVariant) activeVariantID = matchingVariant.id;
  }

  // C. Virtual ID from segment
  if (!activeVariantID && product.isVirtual && product.variantId) {
    activeVariantID = product.variantId;
  }

  // Resolve Active Variant Object
  const activeVariant = activeVariantID
    ? product.variants?.find(v => v.id === activeVariantID)
    : undefined;

  // Derive Selections for UI (fallback to defaults if no active variant)
  const selectedAttributes: Record<string, string> = {};

  if (activeVariant && activeVariant.attributes) {
    // If we have an active variant, its attributes are the selection
    Object.entries(activeVariant.attributes as Record<string, any>).forEach(([k, v]) => {
      if (Array.isArray(v) && v.length > 0) selectedAttributes[k] = v[0];
      else if (typeof v === 'string') selectedAttributes[k] = v;
    });
  } else if (product.attributes) {
    // Fallback: Select first option for every available attribute
    Object.entries(product.attributes as Record<string, any>).forEach(([k, v]) => {
      if (Array.isArray(v) && v.length > 0) selectedAttributes[k] = v[0];
    });
  }

  // 3. Determine Image based on variant or fallback to main
  // 3. Determine Image based on variant or fallback to main
  // Use optional chaining and logical OR to safely resolve string | undefined
  const currentImage = activeVariant?.images?.main || product.images?.main || "";

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
              selectedAttributes={selectedAttributes}
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