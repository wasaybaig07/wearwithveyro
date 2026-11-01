"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Search, ShoppingBag } from "lucide-react";
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";
import CartDrawer from "@/components/cart/CartDrawer";
import { useCartStore } from "@/store/useCartStore";
import { useSearchStore } from "@/store/useSearchStore";

const navLinks = [
  { label: "HOME", href: "/" },
  { label: "SHIRTS", href: "/shop" },
];

const SHOP_PATHS = ["/shop", "/items"];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const totalItems = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const { isSignedIn } = useUser();
  const { isOpen: searchOpen, query: searchQuery, setQuery, open: openSearch, close: closeSearch } = useSearchStore();
  const searchRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const isShop = SHOP_PATHS.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!isShop) closeSearch();
  }, [pathname, isShop]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const close = () => setIsMenuOpen(false);

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-black/15">
        <div className="max-w-[1600px] mx-auto px-container-margin flex justify-between items-center h-16">
          <Link href="/" className="font-headline-md text-headline-md tracking-tighter text-primary select-none">
            wearveyro
          </Link>
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => {
              const isActive =
                (link.href === "/" && pathname === "/") ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.label}
                  className={`font-label-bold text-label-bold tracking-wider whitespace-nowrap transition-all ${
                    isActive
                      ? "text-primary-fixed hover:line-through"
                      : "text-secondary hover:text-primary hover:line-through"
                  }`}
                  href={link.href}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4 md:gap-6 text-primary">
            {isShop && (searchOpen ? (
              <div className="flex items-center border-b border-black/30 focus-within:border-primary-fixed transition-colors">
                <Search size={16} className="text-secondary shrink-0" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="SEARCH SHIRTS..."
                  className="bg-transparent border-none focus:ring-0 outline-none px-2 py-1 w-40 md:w-56 font-label-bold text-sm text-primary placeholder:text-black/30 tracking-wider"
                />
                <button
                  onClick={closeSearch}
                  className="text-secondary hover:text-primary transition-colors cursor-pointer shrink-0"
                  aria-label="Close search"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={openSearch}
                className="hover:text-primary-fixed transition-colors cursor-pointer"
                aria-label="Open search"
              >
                <Search size={20} />
              </button>
            ))}
            {isSignedIn ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/profile/orders"
                  className="font-label-bold text-[11px] uppercase tracking-widest text-secondary hover:text-primary-fixed transition-colors hidden md:block"
                >
                  My Orders
                </Link>
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-6 h-6 border border-black/15",
                      userButtonTrigger:
                        "hover:text-primary-fixed transition-colors",
                      userButtonPopoverCard:
                        "bg-surface-container border border-black/15 shadow-none",
                      userButtonPopoverActionButton:
                        "text-primary hover:bg-black/5",
                      userButtonPopoverActionButtonText: "font-label-bold text-xs",
                      userButtonPopoverFooter: "hidden",
                    },
                  }}
                />
              </div>
            ) : (
              <SignInButton mode="modal">
                <button className="font-label-bold text-[11px] uppercase tracking-widest text-secondary hover:text-primary-fixed transition-colors cursor-pointer">
                  Sign In
                </button>
              </SignInButton>
            )}
            <div className="relative">
              <button
                onClick={() => {
                  console.log("Cart trigger pressed");
                  setIsCartOpen(true);
                }}
                className="hover:text-primary-fixed transition-colors cursor-pointer"
                aria-label="Shopping bag"
              >
                <ShoppingBag size={20} />
              </button>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-fixed text-on-primary-fixed text-[10px] font-bold px-1.5 py-0.5 select-none leading-none">
                  {totalItems}
                </span>
              )}
            </div>
            <button
              onClick={() => setIsMenuOpen(true)}
              className="md:hidden hover:text-primary-fixed transition-colors cursor-pointer"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="fixed inset-0 z-[100] h-screen w-screen bg-black flex flex-col px-container-margin pt-24 pb-12">
            <button
              onClick={close}
              className="absolute top-5 right-5 text-white hover:text-primary-fixed transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X size={28} />
            </button>
            <nav className="flex flex-col gap-6">
              {navLinks.map((link) => {
                const isActive =
                  (link.href === "/" && pathname === "/") ||
                  (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.label}
                    className={`font-label-bold text-2xl tracking-widest transition-all ${
                      isActive
                        ? "text-primary-fixed hover:line-through"
                        : "text-white hover:text-primary-fixed hover:line-through"
                    }`}
                    href={link.href}
                    onClick={close}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </>
  );
}
