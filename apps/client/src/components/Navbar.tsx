import Image from "next/image";
import Link from "next/link";
import SearchBar from "./SearchBar";
import ShoppingCartIcon from "./ShoppingCartIcon";
import ProfileButton from "./ProfileButton";
import { Bell, Menu, Search } from "lucide-react"; // Added Menu for mobile
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

const Navbar = () => {
  const navLinks = [
    { name: "Shop", href: "/shop" },
    { name: "Wellness", href: "/wellness" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* LEFT: Logo & Brand */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-10 h-10 overflow-hidden rounded-full bg-emerald-50 flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Qadgin Logo"
                width={40}
                height={40}
                className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <span className="hidden md:block text-xl font-semibold tracking-tight text-slate-800 group-hover:text-emerald-700 transition-colors">
              Qadgin
            </span>
          </Link>

          {/* CENTER: Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors duration-200"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-4 md:gap-6">
            {/* Search Bar - You might want to hide the full bar on mobile and show an icon instead */}
            <div className="hidden md:block">
              <SearchBar />
            </div>
            <button className="md:hidden text-slate-600">
                <Search className="w-5 h-5" />
            </button>

            {/* Notifications */}
            <button className="relative group">
              <Bell className="w-5 h-5 text-slate-600 group-hover:text-emerald-600 transition-colors" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full border-2 border-white"></span>
            </button>

            {/* Cart */}
            <div className="text-slate-600 hover:text-emerald-600 transition-colors">
              <ShoppingCartIcon />
            </div>

            {/* Auth */}
            <div className="flex items-center">
              <SignedOut>
                <div className="hidden md:flex gap-2">
                    <SignInButton mode="modal">
                        <button className="text-sm font-medium text-slate-600 hover:text-emerald-600 px-3 py-2">Sign In</button>
                    </SignInButton>
                    <span className="text-slate-300">|</span>
                    <SignUpButton mode="modal">
                        <button className="text-sm font-medium bg-emerald-600 text-white px-4 py-2 rounded-full hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-200">
                            Get Started
                        </button>
                    </SignUpButton>
                </div>
                {/* Simple Login Icon for Mobile */}
                <div className="md:hidden">
                    <SignInButton />
                </div>
              </SignedOut>

              <SignedIn>
                <ProfileButton />
              </SignedIn>
            </div>

            {/* Mobile Menu Trigger (Visual only - logic requires state) */}
            <button className="md:hidden text-slate-600">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;