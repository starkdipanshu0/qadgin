import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Twitter, Youtube, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full bg-stone-50 border-t border-stone-200 mt-20 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TOP SECTION: Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* COLUMN 1: Brand & Mission */}
          <div className="flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative w-8 h-8 overflow-hidden rounded-full bg-emerald-100 flex items-center justify-center">
                 <Image src="/logo.png" alt="Qadgin" width={32} height={32} className="object-contain p-1" />
              </div>
              <span className="text-lg font-bold tracking-wide text-emerald-900">
                Qadgin
              </span>
            </Link>
            <p className="text-stone-600 text-sm leading-relaxed">
              Empowering your journey to holistic health. We provide sustainable, natural products for a balanced life.
            </p>
            <div className="flex gap-4">
              <SocialLink icon={<Instagram className="w-5 h-5" />} href="#" />
              <SocialLink icon={<Facebook className="w-5 h-5" />} href="#" />
              <SocialLink icon={<Twitter className="w-5 h-5" />} href="#" />
            </div>
          </div>

          {/* COLUMN 2: Shop */}
          <div>
            <h3 className="text-emerald-900 font-semibold mb-6">Shop Wellness</h3>
            <div className="flex flex-col gap-4 text-sm text-stone-600">
              <FooterLink href="/">Supplements</FooterLink>
              <FooterLink href="/">Organic Foods</FooterLink>
              <FooterLink href="/">Fitness Gear</FooterLink>
              <FooterLink href="/">New Arrivals</FooterLink>
            </div>
          </div>

          {/* COLUMN 3: Company */}
          <div>
            <h3 className="text-emerald-900 font-semibold mb-6">Company</h3>
            <div className="flex flex-col gap-4 text-sm text-stone-600">
              <FooterLink href="/">Our Story</FooterLink>
              <FooterLink href="/">Sustainability</FooterLink>
              <FooterLink href="/">Careers</FooterLink>
              <FooterLink href="/">Contact Us</FooterLink>
            </div>
          </div>

          {/* COLUMN 4: Newsletter */}
          <div>
            <h3 className="text-emerald-900 font-semibold mb-6">Stay Healthy</h3>
            <p className="text-stone-600 text-sm mb-4">
              Join our newsletter for wellness tips and exclusive offers.
            </p>
            <div className="flex flex-col gap-3">
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
                <Mail className="absolute right-3 top-2.5 w-4 h-4 text-stone-400" />
              </div>
              <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Copyright & Legal */}
        <div className="border-t border-stone-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-stone-500">
            © 2025 Qadgin Wellness. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-stone-500">
            <Link href="/" className="hover:text-emerald-600 transition-colors">Privacy Policy</Link>
            <Link href="/" className="hover:text-emerald-600 transition-colors">Terms of Service</Link>
            <Link href="/" className="hover:text-emerald-600 transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Helper components to keep code clean
const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link href={href} className="hover:text-emerald-600 hover:translate-x-1 transition-all duration-200 inline-block">
    {children}
  </Link>
);

const SocialLink = ({ icon, href }: { icon: React.ReactNode; href: string }) => (
  <Link href={href} className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-stone-200 text-stone-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
    {icon}
  </Link>
);

export default Footer;