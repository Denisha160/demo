"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";

interface CartProduct {
  id: number;
  title: string;
  price: number;
  quantity: number;
  total: number;
  discountPercentage: number;
  discountedTotal: number;
  thumbnail: string;
}

interface Cart {
  id: number;
  products: CartProduct[];
  total: number;
  discountedTotal: number;
  userId: number;
  totalProducts: number;
  totalQuantity: number;
}

interface CartsResponse {
  carts: Cart[];
  total: number;
  skip: number;
  limit: number;
}

async function fetchCarts(): Promise<CartsResponse> {
  const res = await fetch("https://dummyjson.com/carts");
  if (!res.ok) throw new Error("Failed to fetch carts");
  return res.json();
}

async function deleteCart(cartId: number): Promise<void> {
  const res = await fetch(`https://dummyjson.com/carts/${cartId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete cart");
  return res.json();
}

export default function AddToCart() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery<CartsResponse>({
    queryKey: ["carts"],
    queryFn: fetchCarts,
  });

  // Delete cart mutation — optimistically removes from UI on success
  const {
    mutate: removeCart,
    isPending: isDeleting,
    variables: deletingId,
  } = useMutation({
    mutationFn: deleteCart,
    onSuccess: (_data, cartId) => {
      // Remove the deleted cart from cached data without a full refetch
      queryClient.setQueryData<CartsResponse>(["carts"], (old) => {
        if (!old) return old;
        return {
          ...old,
          carts: old.carts.filter((c) => c.id !== cartId),
          total: old.total - 1,
        };
      });
    },
  });

  // ── Loading ─────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-4">
          <svg
            className="animate-spin w-10 h-10 text-pink-500"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Loading your cart...
          </p>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a]">
        <div className="text-center">
          <p className="text-red-500 font-bold text-lg mb-2">
            Failed to load cart
          </p>
          <p className="text-gray-400 text-sm">
            {(error as Error)?.message ?? "Unknown error"}
          </p>
        </div>
      </div>
    );
  }

  const carts = data?.carts ?? [];
  const allProducts: CartProduct[] = carts.flatMap((c) => c.products);
  const grandTotal = carts.reduce((sum, c) => sum + c.discountedTotal, 0);
  const grandSavings = carts.reduce(
    (sum, c) => sum + (c.total - c.discountedTotal),
    0,
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">
              My Cart 🛒
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {allProducts.length} item{allProducts.length !== 1 ? "s" : ""} in
              your cart
            </p>
          </div>
          <Link
            href="/"
            className="text-sm font-semibold text-pink-600 dark:text-pink-400 hover:underline"
          >
            ← Continue Shopping
          </Link>
        </div>

        {carts.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🛍️</div>
            <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Your cart is empty
            </p>
            <p className="text-gray-400 text-sm mb-6">
              Add some products to get started
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white font-bold rounded-xl shadow hover:opacity-90 transition-opacity"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Groups — one card per cart */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {carts.map((cart) => {
                const isThisDeleting = isDeleting && deletingId === cart.id;
                return (
                  <div
                    key={cart.id}
                    className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm transition-all duration-300 overflow-hidden ${
                      isThisDeleting
                        ? "opacity-50 scale-[0.99] pointer-events-none"
                        : ""
                    }`}
                  >
                    {/* Cart header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/10">
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            Cart #{cart.id}
                          </p>
                          <p className="text-xs text-gray-400">
                            {cart.totalProducts} product
                            {cart.totalProducts !== 1 ? "s" : ""} · Qty{" "}
                            {cart.totalQuantity}
                          </p>
                        </div>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={() => removeCart(cart.id)}
                        disabled={isDeleting}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-500 hover:text-white hover:bg-red-500 border border-red-200 dark:border-red-400/30 hover:border-red-500 rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                      >
                        {isThisDeleting ? (
                          <>
                            <svg
                              className="animate-spin w-3 h-3"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8z"
                              />
                            </svg>
                            Removing...
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2.5}
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Remove Cart
                          </>
                        )}
                      </button>
                    </div>

                    {/* Products inside this cart */}
                    <div className="divide-y divide-gray-50 dark:divide-white/5">
                      {cart.products.map((product, idx) => (
                        <div
                          key={`${product.id}-${idx}`}
                          className="flex gap-4 px-5 py-4"
                        >
                          {/* Thumbnail */}
                          <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5">
                            <Image
                              src={product.thumbnail}
                              alt={product.title}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">
                              {product.title}
                            </h3>
                            <p className="text-xs text-gray-400 mt-0.5">
                              Qty: {product.quantity}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-sm font-black text-gray-900 dark:text-white">
                                ₹{product.discountedTotal.toLocaleString()}
                              </span>
                              <span className="text-xs line-through text-gray-400">
                                ₹{product.total.toLocaleString()}
                              </span>
                              <span className="text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-400/10 px-1.5 py-0.5 rounded-full">
                                {product.discountPercentage}% OFF
                              </span>
                            </div>
                          </div>

                          {/* Per unit */}
                          <div className="text-right flex-shrink-0">
                            <p className="text-[10px] text-gray-400">
                              per unit
                            </p>
                            <p className="text-sm font-bold text-pink-600 dark:text-pink-400">
                              ₹{product.price}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Cart footer total */}
                    <div className="flex items-center justify-between px-5 py-3 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/10">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        Cart total
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-gray-900 dark:text-white">
                          ₹{cart.discountedTotal.toLocaleString()}
                        </span>
                        <span className="text-xs line-through text-gray-400">
                          ₹{cart.total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm p-6 sticky top-24">
                <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4">
                  Order Summary
                </h2>

                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal ({allProducts.length} items)</span>
                    <span className="font-semibold">
                      ₹{(grandTotal + grandSavings).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Discount</span>
                    <span className="font-semibold">
                      − ₹{grandSavings.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Delivery</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      FREE
                    </span>
                  </div>
                  <div className="border-t border-gray-100 dark:border-white/10 pt-3 flex justify-between text-gray-900 dark:text-white font-black text-base">
                    <span>Total</span>
                    <span>₹{grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                <p className="text-xs text-green-600 dark:text-green-400 font-semibold mt-3">
                  🎉 You save ₹{grandSavings.toLocaleString()} on this order!
                </p>

                <button className="mt-5 w-full py-4 bg-gradient-to-r from-pink-500 to-fuchsia-600 hover:from-pink-600 hover:to-fuchsia-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-pink-500/25 active:scale-[0.98]">
                  Place Order
                </button>
                <p className="text-center text-xs text-gray-400 mt-3">
                  Safe & Secure Payments 🔒
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
