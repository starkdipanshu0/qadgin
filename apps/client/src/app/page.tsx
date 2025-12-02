import ProductList from "@/components/ProductList";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle, ShieldCheck, Leaf, Truck } from "lucide-react";

const Homepage = async ({
  searchParams,
}: {
  searchParams: Promise<{ category: string }>;
}) => {
  const category = (await searchParams).category;

  return (
    <div className="bg-stone-50 min-h-screen pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative w-full overflow-hidden bg-emerald-900 text-white rounded-b-[3rem] md:rounded-b-[4rem]">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500 rounded-full blur-[120px] opacity-30 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-600 rounded-full blur-[100px] opacity-20 translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            {/* Left: Text Content */}
            <div className="space-y-6 animate-fade-in-up">
              <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-800 border border-emerald-700 text-emerald-100 text-sm font-medium tracking-wide">
                Science Meets Nature
              </span>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                Unlock Your <br />
                <span className="text-emerald-300">True Potential</span>
              </h1>
              <p className="text-lg md:text-xl text-emerald-100 max-w-lg leading-relaxed">
                Premium supplements formulated for immunity, vitality, and balance. Experience the Qadgin difference today.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/products" className="bg-white text-emerald-900 hover:bg-emerald-50 px-8 py-4 rounded-full font-semibold transition-all flex items-center gap-2">
                  Shop Now <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/about" className="px-8 py-4 rounded-full font-semibold text-white border border-emerald-700 hover:bg-emerald-800 transition-all">
                  Our Story
                </Link>
              </div>
            </div>

            {/* Right: Hero Image */}
            <div className="relative h-[400px] md:h-[500px] w-full">
              {/* Note: Replace '/hero-bottle.png' with a high-quality cutout of your Protein or Multi bottle */}
              <Image 
                src="/hero-image.png" 
                alt="Qadgin Wellness" 
                fill 
                className="object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST BADGES (Crucial for Health Brands) */}
      <div className="max-w-5xl mx-auto -mt-10 relative z-20 px-4">
        <div className="bg-white rounded-2xl shadow-xl shadow-stone-200/50 p-6 md:p-8 flex flex-wrap justify-between items-center gap-6 md:gap-0">
          <TrustItem icon={<ShieldCheck className="w-6 h-6 text-emerald-600" />} title="GMP Certified" />
          <TrustItem icon={<Leaf className="w-6 h-6 text-emerald-600" />} title="100% Natural" />
          <TrustItem icon={<CheckCircle className="w-6 h-6 text-emerald-600" />} title="Lab Tested" />
          <TrustItem icon={<Truck className="w-6 h-6 text-emerald-600" />} title="Fast Shipping" />
        </div>
      </div>

      {/* 3. SHOP BY GOAL (Visual Categories) */}
      {/* <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-stone-800">Shop by Goal</h2>
          <p className="text-stone-500 mt-2">Find the perfect supplement for your needs</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <CategoryCard title="Muscle & Strength" image="/cat-muscle.jpg" />
           <CategoryCard title="Immunity & Gut" image="/cat-immunity.jpg" />
           <CategoryCard title="Energy & Vitality" image="/cat-energy.jpg" />
           <CategoryCard title="Daily Wellness" image="/cat-wellness.jpg" />
        </div>
      </section> */}

      {/* 4. MAIN PRODUCT LIST */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="shop">
        <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-stone-800">
              {category ? `${category.charAt(0).toUpperCase() + category.slice(1)} Products` : "Best Sellers"}
            </h2>
            <Link href="/products" className="text-emerald-600 font-medium hover:underline decoration-2 underline-offset-4">
              View All Products
            </Link>
        </div>
        
        {/* Passing the category params to your existing component */}
        <ProductList category={category} params="homepage"/>
      </section>

    </div>
  );
};

/* --- Helper Components for Cleaner Code --- */

const TrustItem = ({ icon, title }: { icon: any, title: string }) => (
  <div className="flex items-center gap-3 w-1/2 md:w-auto">
    <div className="p-2 bg-emerald-50 rounded-full">{icon}</div>
    <span className="font-semibold text-stone-700 text-sm md:text-base">{title}</span>
  </div>
);

const CategoryCard = ({ title, image }: { title: string, image: string }) => (
    <Link href={`/?category=${title.toLowerCase().split(' ')[0]}`} className="group relative h-40 md:h-60 rounded-2xl overflow-hidden cursor-pointer">
        {/* Placeholder background color if image fails */}
        <div className="absolute inset-0 bg-stone-200">
             {/* You would use next/image here in production */}
             {/* <Image src={image} fill className="object-cover group-hover:scale-110 transition-transform duration-500" alt={title} /> */}
        </div>
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <span className="absolute bottom-4 left-4 text-white font-bold text-lg">{title}</span>
    </Link>
)

export default Homepage;