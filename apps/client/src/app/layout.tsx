import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ToastContainer } from "react-toastify";
import { ClerkProvider } from "@clerk/nextjs";
import DebugToken from "@/components/DebugToken";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Qadgin - Health & Wellness",
  description: "Premium vitamins & natural wellness products for better living.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900`}
          suppressHydrationWarning
        >
          {/* Razorpay Script */}
          <script src="https://checkout.razorpay.com/v1/checkout.js" defer></script>

          <DebugToken />
          {/* 🔥 Navbar should be full width */}
          <Navbar />

          {/* 🔥 Only the content should be centered */}
          <main className="w-full mx-auto px-4 md:px-6 lg:px-8 pt-6">
            {children}
          </main>

          {/* 🔥 Footer full width but centered inside */}
          <Footer />

          <ToastContainer position="bottom-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
