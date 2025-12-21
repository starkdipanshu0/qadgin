"use client";

import useCartStore from "@/stores/cartStore";
import { ProductType } from "@repo/types";
import { Minus, Plus, ShoppingBag, Zap } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useMemo } from "react";
import { toast } from "react-toastify";

interface ProductInteractionProps {
  product: ProductType;
  selectedAttributes: Record<string, string>;
}

const ProductInteraction = ({
  product,
  selectedAttributes,
}: ProductInteractionProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const { addToCart } = useCartStore();

  // Normalize attributes for easy rendering
  const attributes = useMemo(() => {
    return product.attributes || {};
  }, [product.attributes]);

  // Handle URL updates - Generic for ANY attribute
  const handleOptionChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);

    // Also update generic "variant" param removal if we are switching attributes?
    // If we select attributes manually, we might drift from the ?variant=ID logic
    // But page.tsx handles that by resolving attributes -> variant ID. 
    // We should probably keep 'variant' param or let page resolve new one.
    // For purity: if we change an option, we are essentially requesting a new variant combination.
    // We keep it simple: just update the attribute param. page.tsx re-resolves the variant ID.

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
    setTimeout(() => {
      // Convert generic attributes to string for legacy store support
      const specs = Object.entries(selectedAttributes)
        .map(([k, v]) => `${v}`)
        .join(" / ");

      // Try to map to legacy keys if possible for backward compat
      const legacyColor = selectedAttributes["Flavor"] || selectedAttributes["Color"] || "";
      const legacySize = selectedAttributes["Size"] || selectedAttributes["Pack Size"] || "";

      addToCart({
        ...product,
        quantity,
        selectedColor: legacyColor,
        selectedSize: specs,
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
    const specs = Object.entries(selectedAttributes)
      .map(([k, v]) => `${v}`)
      .join(" / ");
    const legacyColor = selectedAttributes["Flavor"] || selectedAttributes["Color"] || "";

    addToCart({
      ...product,
      quantity,
      selectedColor: legacyColor,
      selectedSize: specs,
      price: Number(product.price),
      originalPrice: Number(product.originalPrice || 0),
    });
    router.push('/cart');
  };

  // Pre-defined sort order or just iteration
  const attributeKeys = Object.keys(attributes);

  return (
    <div className="flex flex-col gap-8 mt-2 animate-fade-in-up">

      {/* --- DYNAMIC ATTRIBUTE SELECTORS --- */}
      {attributeKeys.map((key) => {
        const values = attributes[key];
        if (!values || values.length === 0) return null;

        return (
          <div key={key} className="flex flex-col gap-3">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              {key}
            </span>
            <div className="flex flex-wrap gap-3">
              {values.map((val) => {
                const isSelected = selectedAttributes[key] === val;
                return (
                  <button
                    key={val}
                    onClick={() => handleOptionChange(key, val)}
                    className={`
                        px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 min-w-[60px] cursor-pointer
                        ${isSelected
                        ? "bg-stone-800 border-stone-800 text-white shadow-md ring-2 ring-stone-200 ring-offset-1"
                        : "bg-white border-stone-200 text-stone-600 hover:border-emerald-400 hover:text-emerald-700"}
                    `}
                  >
                    {val}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

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