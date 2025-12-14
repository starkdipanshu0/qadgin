"use client";

import useCartStore from "@/stores/cartStore";
import { ProductType } from "@repo/types";
import { Minus, Plus, ShoppingBag, Zap } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

interface ProductInteractionProps {
  product: ProductType;
  initialSelectedSize: string;
  initialSelectedFlavor: string;
}

const ProductInteraction = ({
  product,
  initialSelectedSize,
  initialSelectedFlavor,
}: ProductInteractionProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const { addToCart } = useCartStore();

  // Handle URL updates for Flavor/Size to keep server sync
  const handleOptionChange = (key: "size" | "flavor", value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleQuantityChange = (type: "increment" | "decrement") => {
    if (type === "increment") {
      setQuantity((prev) => prev + 1);
    } else {
      if (quantity > 1) {
        setQuantity((prev) => prev - 1);
      }
    }
  };

  const handleAddToCart = () => {
    setIsAdding(true);
    // Simulate a small delay for better UX feel
    setTimeout(() => {
      addToCart({
        ...product,
        quantity,
        selectedColor: initialSelectedFlavor, // Mapping Flavor -> Color for store compatibility
        selectedSize: initialSelectedSize,
        price: Number(product.price),
        originalPrice: Number(product.originalPrice || 0),
      });
      toast.success(
        <div>
          <span className="font-bold">{product.name}</span> added to your regimen.
        </div>
      );
      setIsAdding(false);
    }, 500);
  };

  const handleBuyNow = () => {
    addToCart({
      ...product,
      quantity,
      selectedColor: initialSelectedFlavor,
      selectedSize: initialSelectedSize,
      price: Number(product.price),
      originalPrice: Number(product.originalPrice || 0),
    });
    router.push('/cart'); // Direct to cart/checkout
  };

  return (
    <div className="flex flex-col gap-8 mt-2 animate-fade-in-up">

      {/* --- FLAVOR SELECTOR --- */}
      {product.flavors && product.flavors.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
            Select Flavor
          </span>
          <div className="flex flex-wrap gap-3">
            {product && product.flavors.length > 0 && product.flavors.map((flavor: any) => {
              const isSelected = initialSelectedFlavor === flavor;
              return (
                <button
                  key={flavor}

                  onClick={() => handleOptionChange("flavor", flavor)}
                  className={`
                        px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 capitalize
                        ${isSelected
                      ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-200 ring-2 ring-emerald-100 ring-offset-1"
                      : "bg-white border-stone-200 text-stone-600 hover:border-emerald-400 hover:text-emerald-700"}
                    `}
                >
                  {flavor}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* --- PACK SIZE SELECTOR --- */}
      {product.packSize && product.packSize.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
            Pack Size
          </span>
          <div className="flex flex-wrap gap-3">
            {product.packSize.map((size: any) => {
              const isSelected = initialSelectedSize === size;
              return (
                <button
                  key={size}
                  onClick={() => handleOptionChange("size", size)}
                  className={`
                        px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 min-w-[80px]
                        ${isSelected
                      ? "bg-stone-800 border-stone-800 text-white shadow-md"
                      : "bg-white border-stone-200 text-stone-600 hover:border-stone-400"}
                    `}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* --- QUANTITY & ACTIONS ROW --- */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-stone-100">

        {/* Quantity Stepper */}
        <div className="flex items-center justify-between bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 sm:w-1/3">
          <button
            onClick={() => handleQuantityChange("decrement")}
            className="text-stone-400 hover:text-stone-800 transition-colors disabled:opacity-50"
            disabled={quantity <= 1}
          >
            <Minus className="w-5 h-5" />
          </button>
          <span className="text-lg font-bold text-stone-800 w-8 text-center">{quantity}</span>
          <button
            onClick={() => handleQuantityChange("increment")}
            className="text-stone-400 hover:text-stone-800 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Main Actions */}
        <div className="flex gap-3 sm:w-2/3">
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70 disabled:cursor-wait"
          >
            <ShoppingBag className="w-5 h-5" />
            {isAdding ? "Adding..." : "Add to Cart"}
          </button>

          <button
            onClick={handleBuyNow}
            className="w-14 flex items-center justify-center bg-stone-100 text-stone-800 border border-stone-200 rounded-xl hover:bg-stone-200 hover:border-stone-300 transition-all active:scale-95"
            title="Buy Now"
          >
            <Zap className="w-5 h-5 fill-stone-800" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductInteraction;