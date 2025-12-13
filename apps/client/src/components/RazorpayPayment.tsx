"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { CartItemsType, ShippingFormInputs } from "@repo/types";
import useCartStore from "@/stores/cartStore";
import { useRouter } from "next/navigation";

// Declare Razorpay on window
declare global {
    interface Window {
        Razorpay: any;
    }
}

const RazorpayPayment = ({
    shippingForm,
}: {
    shippingForm: ShippingFormInputs;
}) => {
    const { cart } = useCartStore();
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        console.log("--------------------------------------------------");
        console.log("CLIENT: Starting Payment Flow");

        try {
            const token = await getToken();
            console.log("CLIENT: Token retrieved");

            // 1. Create Order via Payment Service
            console.log("CLIENT: Calling create-order...");
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL}/sessions/create-order`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ cart }),
                }
            );

            const data = await res.json();
            console.log("CLIENT: create-order response:", data);

            if (!res.ok) {
                console.error("CLIENT: create-order failed:", data.error);
                throw new Error(data.error || "Failed to create order");
            }

            // 2. Initialize Razorpay Options
            console.log("CLIENT: Initializing Razorpay with options...");
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: data.amount,
                currency: data.currency,
                name: "Qadgin Ecommerce",
                description: "Order Payment",
                order_id: data.orderId,
                handler: async function (response: any) {
                    console.log("CLIENT: Razorpay success callback received:", response);
                    try {
                        // 3. Verify Payment
                        console.log("CLIENT: Calling verify endpoint...");
                        const verifyRes = await fetch(
                            `${process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL}/sessions/verify`,
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify({
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature,
                                    cart: cart,
                                }),
                            }
                        );

                        const verifyData = await verifyRes.json();
                        console.log("CLIENT: verify response:", verifyData);

                        if (verifyData.success) {
                            console.log("CLIENT: Payment Verified. Redirecting...");
                            router.push("/return?status=success");
                        } else {
                            console.error("CLIENT: Payment verification failed API check");
                            alert("Payment verification failed");
                        }
                    } catch (err) {
                        console.error("CLIENT: Verification error:", err);
                        alert("Payment verification failed");
                    }
                },
                prefill: {
                    name: "User",
                    email: shippingForm.email,
                    contact: "",
                },
                theme: {
                    color: "#3399cc",
                },
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.on("payment.failed", function (response: any) {
                console.error("CLIENT: Razorpay payment failed event:", response.error);
                alert(response.error.description);
            });
            rzp1.open();
        } catch (error) {
            console.error("CLIENT: Payment initialization failed:", error);
            alert("Something went wrong initializing payment.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {/* Load Razorpay script if not loaded globally, or assume layout loads it. 
            Better to load it via a Script component in this component or parent. 
            For now, assuming user will add Script tag or we verify. */}
            <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? "Processing..." : "Pay with Razorpay"}
            </button>
        </div>
    );
};

export default RazorpayPayment;
