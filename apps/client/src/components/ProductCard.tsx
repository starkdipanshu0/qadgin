"use client";

import useCartStore from "@/stores/cartStore";
import { ProductType } from "@repo/types";
import { ShoppingBag, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-toastify";

const ProductCard = ({ product }: { product: ProductType }) => {
  // Helper: Get first available attribute value to default selection
  const getPrimaryAttr = () => {
    if (!product.attributes) return "";
    const keys = Object.keys(product.attributes);
    if (keys.length === 0) return "";
    const firstKey = keys[0];
    if (!firstKey) return "";
    return product.attributes[firstKey]?.[0] || "";
  };

  // Helper: Get all attributes as string (e.g. "Red / XL")
  const getSpecsString = () => {
    if (!product.attributes) return "";
    return Object.values(product.attributes)
      .flat()
      .slice(0, 2) // Limit to 2 for card
      .join(" / ");
  };

  const [selectedAttr] = useState<string>(getPrimaryAttr());

  const { addToCart } = useCartStore();

  // 2. CALCULATE IMAGE (Derived State)
  const getDisplayImage = (): string => {
    if (!product.images) return "";

    // Check variants matching the primary attribute
    if (product.variants && selectedAttr) {
      const matchingVariant = product.variants.find((v) => {
        if (!v.attributes) return false;
        return Object.values(v.attributes).some((values) =>
          Array.isArray(values) && values.includes(selectedAttr)
        );
      });

      if (matchingVariant?.images?.main) {
        return matchingVariant.images.main;
      }
    }
    return product.images.main || "";
  };

  const displayImage = getDisplayImage();

  // 3. CALCULATE URL
  const getProductUrl = () => {
    if (product.isVirtual && product.variantId) {
      const base = product.slug || product.id;
      return `/products/${base}-v-${product.variantId}`;
    }
    return `/products/${product.slug || product.id}`;
  };

  const productUrl = getProductUrl();
  const specs = getSpecsString();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();

    addToCart({
      ...product,
      variants: undefined,
      content: null,
      listingConfig: null,
      quantity: 1,
      // Map dynamic specs to legacy cart fields
      selectedSize: specs,
      selectedColor: selectedAttr,
      price: Number(product.price),
      originalPrice: Number(product.originalPrice || 0),
      isBestSeller: product.isBestSeller ?? false,
    });
    toast.success("Added to cart");
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();

    addToCart({
      ...product,
      variants: undefined,
      content: null,
      listingConfig: null,
      quantity: 1,
      selectedSize: specs,
      selectedColor: selectedAttr,
      price: Number(product.price),
      originalPrice: Number(product.originalPrice || 0),
      isBestSeller: product.isBestSeller ?? false,
    });
    toast.success("Redirecting to checkout...");
  };

  return (
    <div className="group flex flex-col bg-white rounded-xl border border-stone-100 overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* 1. IMAGE SECTION */}
      <Link
        href={productUrl}
        className="relative bg-stone-50 aspect-[4/5] overflow-hidden block"
      >
        {/* --- BADGES CONTAINER --- */}
        <div className="absolute top-0 left-0 z-20 flex flex-col items-start gap-1">
          {product.isBestSeller && (
            <span className="bg-amber-400 text-amber-950 text-[10px] font-extrabold px-3 py-1 rounded-br-lg shadow-sm">
              BESTSELLER
            </span>
          )}

          {Number(product.originalPrice) > Number(product.price) && (
            <span className="ml-2 mt-1 bg-white/90 backdrop-blur text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-stone-100 shadow-sm">
              -
              {Math.round(
                ((Number(product.originalPrice) - Number(product.price)) /
                  Number(product.originalPrice)) *
                100
              )}
              %
            </span>
          )}
        </div>

        {/* RENDER IMAGE */}
        {displayImage ? (
          <Image
            src={displayImage}
            alt={product.name}
            width={500}
            height={500}
            className="object-cover rounded-lg w-full h-full"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
            No Image
          </div>
        )}
      </Link>

      {/* 2. MINIMAL INFO SECTION */}
      <div className="p-3 flex flex-col gap-1 flex-grow">
        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider truncate">
          {product.tagline}
        </p>

        <Link href={productUrl}>
          <h3 className="text-sm font-semibold text-stone-800 leading-tight line-clamp-2 hover:text-emerald-700 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* 3. FOOTER: Price & Specs */}
        <div className="mt-auto pt-4 flex items-end justify-between gap-2">
          <div className="flex flex-col leading-none mb-1">
            {/* DYNAMIC SPECS (Red / XL) instead of just Size */}
            <span className="text-xs text-stone-400 font-medium mb-0.5 truncate max-w-[100px]" title={specs}>
              {specs}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-stone-900">
                ₹{product.price}
              </span>
              {product.originalPrice && (
                <span className="text-[10px] text-stone-400 line-through">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>
          </div>

          {/* Actions Column */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddToCart}
              className="w-9 h-9 rounded-full border border-stone-200 text-stone-600 flex items-center justify-center hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
              title="Add to Cart"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>

            <button
              onClick={handleBuyNow}
              className="h-9 px-4 rounded-full bg-stone-900 text-white text-xs font-bold hover:bg-emerald-600 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Zap className="w-3 h-3 fill-current" />
              <span>BUY</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
