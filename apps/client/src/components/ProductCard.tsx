"use client";

import useCartStore from "@/stores/cartStore";
import { ProductType } from "@/types/product";
import { ShoppingBag, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
// import { useRouter } from "next/navigation"; // Uncomment if you want to redirect

const ProductCard = ({ product }: { product: ProductType }) => {
  const [selectedFlavor, setSelectedFlavor] = useState<string>(product.flavors[0] || "");
  const [currentImage, setCurrentImage] = useState<string>(
    product.images[product.flavors[0]] || Object.values(product.images)[0]
  );

  const { addToCart } = useCartStore();
  // const router = useRouter(); 

  // Update image when flavor changes
  useEffect(() => {
    if (product.images[selectedFlavor]) {
      setCurrentImage(product.images[selectedFlavor]);
    }
  }, [selectedFlavor, product.images]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({
      ...product,
      quantity: 1,
      selectedSize: product.packSize[0],
      selectedColor: selectedFlavor,
    });
    toast.success("Added to cart");
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({
      ...product,
      quantity: 1,
      selectedSize: product.packSize[0],
      selectedColor: selectedFlavor,
    });
    toast.success("Redirecting to checkout...");
    // router.push('/checkout'); // Add your checkout route here
  };

  return (
    <div className="group flex flex-col bg-white rounded-xl border border-stone-100 overflow-hidden hover:shadow-lg transition-all duration-300">

      {/* 1. IMAGE SECTION */}
      <Link href={`/products/${product.id}`} className="relative bg-stone-50 aspect-[4/5] overflow-hidden block">

        {/* --- BADGES CONTAINER --- */}
        <div className="absolute top-0 left-0 z-20 flex flex-col items-start gap-1">
          {/* BESTSELLER TAG */}
          {product.isBestSeller && (
            <span className="bg-amber-400 text-amber-950 text-[10px] font-extrabold px-3 py-1 rounded-br-lg shadow-sm">
              BESTSELLER
            </span>
          )}

          {/* DISCOUNT TAG */}
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="ml-2 mt-1 bg-white/90 backdrop-blur text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-stone-100 shadow-sm">
              -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
            </span>
          )}
        </div>

        <Image
          src={currentImage}
          alt={product.name}
          fill
          className="object-contain p-5 group-hover:scale-105 transition-transform duration-500"
        />
      </Link>

      {/* 2. MINIMAL INFO SECTION */}
      <div className="p-3 flex flex-col gap-1 flex-grow">

        {/* Tagline */}
        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider truncate">
          {product.tagline}
        </p>

        {/* Name */}
        <Link href={`/products/${product.id}`}>
          <h3 className="text-sm font-semibold text-stone-800 leading-tight line-clamp-2 hover:text-emerald-700 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* 3. FOOTER: Price & Dual Actions */}
        <div className="mt-auto pt-4 flex items-end justify-between gap-2">

          {/* Price Column */}
          <div className="flex flex-col leading-none mb-1">
            <span className="text-xs text-stone-400 font-medium mb-0.5">{product.packSize[0]}</span>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-stone-900">₹{product.price}</span>
              {product.originalPrice && (
                <span className="text-[10px] text-stone-400 line-through">₹{product.originalPrice}</span>
              )}
            </div>
          </div>

          {/* Actions Column */}
          <div className="flex items-center gap-2">
            {/* Cart Icon Button (Secondary) */}
            < button
              onClick={handleAddToCart}
              className="w-9 h-9 rounded-full border border-stone-200 text-stone-600 flex items-center justify-center hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
              title="Add to Cart"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>

            {/* Buy Now Button (Primary) */}
            < button
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