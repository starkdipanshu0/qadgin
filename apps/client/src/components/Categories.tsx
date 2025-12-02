"use client";

import {
  LayoutGrid,
  ShieldCheck,
  Dumbbell,
  Leaf,
  Zap,
  Pill,
  Flower2,
  Flame,
  X
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const categories = [
  { name: "All", icon: LayoutGrid, slug: "all" },
  { name: "Immunity", icon: ShieldCheck, slug: "immunity" },
  { name: "Muscle", icon: Dumbbell, slug: "muscle" },
  { name: "Gut Health", icon: Leaf, slug: "gut-health" },
  { name: "Energy", icon: Zap, slug: "energy" },
  { name: "Vitamins", icon: Pill, slug: "vitamins" },
  { name: "Ayurveda", icon: Flower2, slug: "ayurveda" },
  { name: "Weight Loss", icon: Flame, slug: "weight-loss" },
];

const Categories = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const selectedCategory = searchParams.get("category") || "all";

  // Find the current category name for the header
  const activeCategoryName = categories.find(c => c.slug === selectedCategory)?.name || "All Products";

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    // Logic: If clicking the active one, clear it (toggle off), else set it
    if (value === selectedCategory && value !== 'all') {
        params.delete("category");
    } else {
        params.set("category", value);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="w-full mb-8 space-y-4">
      
      {/* 1. Smart Header: Tells user what they are looking at */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold text-stone-500">
          Showing: <span className="text-emerald-700 font-bold">{activeCategoryName}</span>
        </h3>
        {selectedCategory !== 'all' && (
            <button 
                onClick={() => handleChange('all')}
                className="text-xs text-stone-400 hover:text-red-500 flex items-center gap-1 transition-colors"
            >
                <X className="w-3 h-3" /> Clear Filter
            </button>
        )}
      </div>

      {/* 2. The Organic Cluster Container */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 md:gap-3">
        {categories.map((category) => {
            const isSelected = category.slug === selectedCategory;
            const Icon = category.icon;
            
            return (
                <button
                key={category.slug}
                onClick={() => handleChange(category.slug)}
                className={`
                    group relative flex items-center justify-center sm:justify-start gap-2 px-4 py-3 sm:py-2 rounded-xl text-sm font-medium transition-all duration-200 border
                    ${
                    isSelected
                        ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-200 ring-2 ring-emerald-100 ring-offset-1"
                        : "bg-white border-stone-200 text-stone-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                    }
                `}
                >
                {/* Icon Animation: Bounces slightly on hover */}
                <Icon className={`w-4 h-4 ${isSelected ? 'fill-emerald-500/20' : 'group-hover:scale-110 transition-transform'}`} />
                
                <span>{category.name}</span>
                
                {/* Visual Indicator dot for active state (Desktop only) */}
                {isSelected && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                )}
                </button>
            );
        })}
      </div>
    </div>
  );
};

export default Categories;