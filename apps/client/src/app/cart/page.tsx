"use client";

import ShippingForm from "@/components/ShippingForm";
import StripePaymentForm from "@/components/StripePaymentForm";
import useCartStore from "@/stores/cartStore";
import { ShippingFormInputs } from "@repo/types";
import {
    ArrowRight,
    Check,
    ChevronRight,
    Gift,
    Lock,
    Minus,
    Plus,
    ShieldCheck,
    Trash2,
    X
} from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

// Mock Upsell Products (In real app, fetch based on cart items)
const upsellProducts = [
    { id: 99, name: "Vitamin C Booster", price: 19.90, image: "/products/vit-c.png" },
    { id: 98, name: "Bamboo Shaker", price: 12.50, image: "/products/shaker.png" },
];

const steps = [
    { id: 1, title: "Bag" },
    { id: 2, title: "Shipping" },
    { id: 3, title: "Payment" },
];

const CartPage = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [shippingForm, setShippingForm] = useState<ShippingFormInputs>();

    const activeStep = parseInt(searchParams.get("step") || "1");
    const { cart, removeFromCart, addToCart } = useCartStore(); // Assuming addToCart handles quantity updates

    // Logic
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shippingThreshold = 60;
    const isFreeShipping = subtotal >= shippingThreshold || subtotal === 0;
    const shippingFee = isFreeShipping ? 0 : 9.99;
    const total = subtotal + shippingFee;

    // Handler for Quantity Update
    const updateQty = (item: any, delta: number) => {
        if (item.quantity + delta < 1) return;
        addToCart({ ...item, quantity: delta }); // Note: Your store might need a specific updateQuantity function
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row font-sans text-stone-900">

            {/* LEFT COLUMN: THE JOURNEY (65% Width) */}
            <div className="w-full lg:w-[65%] bg-white px-6 py-12 lg:p-16 lg:pl-24 xl:pl-32 order-2 lg:order-1 border-r border-stone-100">

                {/* Minimal Header */}
                <div className="flex items-center gap-4 mb-12 text-sm font-medium text-stone-400 uppercase tracking-widest">
                    {steps.map((step, i) => (
                        <div key={step.id} className="flex items-center gap-4">
                            <span className={step.id === activeStep ? "text-stone-900 border-b-2 border-emerald-500 pb-1" : ""}>
                                {step.title}
                            </span>
                            {i !== steps.length - 1 && <ChevronRight className="w-3 h-3" />}
                        </div>
                    ))}
                </div>

                {/* Content Area */}
                <div className="max-w-2xl">
                    {activeStep === 1 ? (
                        <>
                            <div className="flex justify-between items-end mb-8">
                                <h1 className="text-4xl font-light tracking-tight text-emerald-950">Your Wellness Bag</h1>
                                <span className="text-stone-500">{cart.length} items</span>
                            </div>

                            {cart.length > 0 ? (
                                <div className="flex flex-col gap-8">
                                    {cart.map((item) => (
                                        <div key={`${item.id}-${item.selectedSize}`} className="flex gap-6 items-start group">
                                            {/* Product Image */}
                                            <div className="relative w-28 h-36 bg-stone-50 rounded-lg overflow-hidden shrink-0">
                                                <Image
                                                    src={((): string => {
                                                        const imgs = item.images as any;
                                                        const flavorImg = imgs?.[item.selectedColor];
                                                        if (Array.isArray(flavorImg) && flavorImg[0]) return flavorImg[0];
                                                        if (typeof flavorImg === "string" && flavorImg) return flavorImg;
                                                        return imgs?.main || "";
                                                    })()}
                                                    alt={item.name}
                                                    fill
                                                    className="object-contain p-2 mix-blend-multiply"
                                                />
                                            </div>

                                            {/* Details */}
                                            <div className="flex-grow flex flex-col h-36 justify-between py-1">
                                                <div>
                                                    <div className="flex justify-between items-start">
                                                        <h3 className="text-lg font-medium text-stone-800">{item.name}</h3>
                                                        <button onClick={() => removeFromCart(item)} className="text-stone-300 hover:text-red-400 transition-colors">
                                                            <X className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                    <p className="text-stone-500 text-sm mt-1 capitalize">{item.flavors ? item.selectedColor : item.selectedSize}</p>
                                                </div>

                                                <div className="flex justify-between items-end">
                                                    {/* Modern Quantity Pill */}
                                                    <div className="flex items-center border border-stone-200 rounded-full px-3 py-1.5 gap-4">
                                                        <button onClick={() => updateQty(item, -1)} className="text-stone-400 hover:text-emerald-600"><Minus className="w-3 h-3" /></button>
                                                        <span className="text-sm font-medium w-2 text-center">{item.quantity}</span>
                                                        <button onClick={() => updateQty(item, 1)} className="text-stone-400 hover:text-emerald-600"><Plus className="w-3 h-3" /></button>
                                                    </div>
                                                    <span className="text-lg font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* UPSELL SECTION (The "New" Touch) */}
                                    <div className="mt-12 pt-12 border-t border-dashed border-stone-200">
                                        <h4 className="text-sm font-bold uppercase tracking-wider text-stone-400 mb-6">Completing the Routine</h4>
                                        <div className="fl      ex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                            {upsellProducts.map(product => (
                                                <div key={product.id} className="min-w-[200px] border border-stone-100 rounded-xl p-4 flex gap-3 items-center hover:border-emerald-200 transition-colors cursor-pointer bg-stone-50/50">
                                                    <div className="relative w-12 h-12 bg-white rounded-md overflow-hidden shrink-0">
                                                        {/* Mock Image */}
                                                        <div className="absolute inset-0 bg-stone-200" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-stone-800">{product.name}</p>
                                                        <p className="text-xs text-stone-500">₹{product.price}</p>
                                                        <button className="text-[10px] font-bold text-emerald-600 hover:underline mt-1">Add +</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-20">
                                    <h2 className="text-2xl font-light text-stone-400">Your bag is empty.</h2>
                                    <button onClick={() => router.push('/shop')} className="mt-6 border-b-2 border-emerald-600 text-emerald-800 pb-0.5 hover:text-emerald-600">Browse Collection</button>
                                </div>
                            )}
                        </>
                    ) : activeStep === 2 ? (
                        <div className="animate-fade-in">
                            <h2 className="text-2xl font-light mb-8">Shipping Address</h2>
                            <ShippingForm setShippingForm={setShippingForm} />
                        </div>
                    ) : activeStep === 3 && shippingForm ? (
                        <div className="animate-fade-in">
                            <h2 className="text-2xl font-light mb-8">Secure Payment</h2>
                            <StripePaymentForm shippingForm={shippingForm} />
                        </div>
                    ) : null}
                </div>
            </div>


            {/* RIGHT COLUMN: THE SUMMARY ANCHOR (35% Width) */}
            <div className="w-full lg:w-[35%] bg-stone-50 px-6 py-12 lg:p-12 order-1 lg:order-2 flex flex-col h-auto lg:min-h-screen border-l border-white lg:sticky lg:top-0">
                <div className="max-w-md mx-auto w-full lg:mt-20">

                    {/* Free Shipping Tracker */}
                    {!isFreeShipping && subtotal > 0 && (
                        <div className="mb-8">
                            <div className="flex items-center gap-2 text-sm text-stone-600 mb-2">
                                <Gift className="w-4 h-4 text-emerald-500" />
                                <span>Add <span className="font-bold text-stone-900">₹{(shippingThreshold - subtotal).toFixed(2)}</span> for free shipping</span>
                            </div>
                            <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${(subtotal / shippingThreshold) * 100}%` }}></div>
                            </div>
                        </div>
                    )}

                    {/* Summary Details */}
                    <h2 className="text-lg font-bold text-emerald-950 mb-6">Order Summary</h2>

                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between text-stone-600 text-sm">
                            <span>Subtotal</span>
                            <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-stone-600 text-sm">
                            <span>Shipping</span>
                            <span>{isFreeShipping ? "Free" : `₹${shippingFee}`}</span>
                        </div>
                        <div className="flex justify-between text-stone-600 text-sm">
                            <span>Tax Estimate</span>
                            <span>Calculated at checkout</span>
                        </div>
                    </div>

                    <div className="border-t border-stone-200 pt-6 mb-8 flex justify-between items-baseline">
                        <span className="text-lg font-medium text-stone-900">Total</span>
                        <span className="text-3xl font-light text-emerald-900">₹{total.toFixed(2)}</span>
                    </div>

                    {/* Main Action Button */}
                    {activeStep === 1 ? (
                        <button
                            onClick={() => router.push("/cart?step=2", { scroll: false })}
                            disabled={cart.length === 0}
                            className="w-full bg-stone-900 text-white h-14 rounded-xl font-bold tracking-wide hover:bg-emerald-700 transition-all shadow-xl shadow-stone-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between px-6 group"
                        >
                            <span>Checkout</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    ) : (
                        <div className="bg-white p-4 rounded-lg border border-stone-100 shadow-sm text-sm text-stone-500">
                            <p className="mb-2 font-medium text-stone-900">Items in Order:</p>
                            <div className="flex -space-x-2 overflow-hidden py-2">
                                {cart.map((item, i) => (
                                    i < 4 && <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-stone-200">
                                        {/* Miniature images would go here */}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Trust Footer */}
                    <div className="mt-8 flex justify-center gap-6 text-stone-400 grayscale opacity-70">
                        <div className="flex items-center gap-1.5">
                            <Lock className="w-3 h-3" /> <span className="text-[10px] font-bold uppercase">SSL Encrypted</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <ShieldCheck className="w-3 h-3" /> <span className="text-[10px] font-bold uppercase">30-Day Returns</span>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
};

export default CartPage;   