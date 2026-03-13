"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/components/providers/CartProvider";
import { useSearch } from "@/components/providers/SearchProvider";
import { useRouter } from "next/navigation";

const categories = [
  "Women Ethnic",
  "Women Western",
  "Men",
  "Kids",
  "Home & Kitchen",
  "Beauty & Health",
  "Jewellery & Accessories",
  "Electronics",
  "Sports & Fitness",
  "Bags & Footwear",
];

const MeeshoNavbar = () => {
  const [localQuery, setLocalQuery] = useState("");
  const { cartCount } = useCart();
  const { setSearchQuery } = useSearch();
  const [wishlistCount] = useState(7);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localQuery.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [localQuery, setSearchQuery]);

  const handleSearch = () => {
    const q = localQuery.trim();
    setSearchQuery(q);
    router.push("/");
  };

  const handleClear = () => {
    setLocalQuery("");
    setSearchQuery("");
  };

  const handleCartItems = () => {
    router.push("/products/cart");
  };

  return (
    <nav className="w-full sticky top-0 z-50 font-sans">
      {/* ── Main Navbar ── */}
      <div className="bg-white dark:bg-gray-950 shadow-md border-b border-gray-100 dark:border-white/5">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex-shrink-0 flex items-center gap-1.5 group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-fuchsia-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
              <svg
                className="w-4 h-4 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM5.17 5H21l-1.68 9.39A2 2 0 0117.35 16H8.64a2 2 0 01-1.97-1.67L5.17 5zM3 3H1v2h2l3.6 7.59L5.25 15c-.16.28-.25.61-.25.95C5 17.1 6.1 18 7 18h14v-2H7.42a.25.25 0 01-.25-.25l.03-.12.9-1.63H17c.75 0 1.41-.41 1.75-1.03L21.7 6H5.21L4.27 3H3z" />
              </svg>
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-pink-600 to-fuchsia-600 bg-clip-text text-transparent hidden sm:block">
              MyApp
            </span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-auto">
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-gray-400 pointer-events-none">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search for sarees, kurtis, tops and more..."
                className="w-full pl-10 pr-20 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200"
              />
              {/* Clear button */}
              {localQuery && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-20 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  aria-label="Clear search"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
              <button
                type="button"
                onClick={handleSearch}
                className="absolute right-2 bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white rounded-lg px-3 py-1.5 text-xs font-bold hover:opacity-90 transition-opacity active:scale-95"
              >
                Search
              </button>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl hover:bg-pink-50 dark:hover:bg-white/5 transition-colors group"
                aria-label="Profile"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-fuchsia-500 flex items-center justify-center text-white font-bold text-sm shadow">
                  D
                </div>
                <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 group-hover:text-pink-600 hidden sm:block">
                  Profile
                </span>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-white/5">
                    <p className="font-bold text-gray-900 dark:text-white text-sm">
                      Hi, Denisha 👋
                    </p>
                    <p className="text-xs text-gray-400">denisha@email.com</p>
                  </div>
                  {[
                    { label: "My Orders", icon: "📦" },
                    { label: "My Wishlist", icon: "❤️" },
                    { label: "My Account", icon: "👤" },
                    { label: "Meesho Credit", icon: "💰" },
                    { label: "Notifications", icon: "🔔" },
                    { label: "Help Center", icon: "🤝" },
                  ].map((item) => (
                    <button
                      key={item.label}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-white/5 hover:text-pink-600 dark:hover:text-pink-400 transition-colors text-left"
                    >
                      <span>{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                  <div className="border-t border-gray-100 dark:border-white/5 mt-1 pt-1">
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-400/10 transition-colors text-left">
                      <span>🚪</span> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist */}
            <button
              aria-label="Wishlist"
              className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl hover:bg-pink-50 dark:hover:bg-white/5 transition-colors group"
            >
              <svg
                className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 group-hover:text-pink-600 hidden sm:block">
                Wishlist
              </span>
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 right-1 bg-pink-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              aria-label="Cart"
              className="cursor-pointer relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl hover:bg-pink-50 dark:hover:bg-white/5 transition-colors group"
              onClick={handleCartItems}
            >
              <svg
                className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 group-hover:text-pink-600 hidden sm:block">
                Cart
              </span>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 right-1 bg-fuchsia-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MeeshoNavbar;
