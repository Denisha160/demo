"use client";

import { useMutation } from "@tanstack/react-query";
import { useCart } from "@/components/providers/CartProvider";

interface AddToCartPayload {
  productId: number;
  quantity: number;
}

async function addToCartApi({ productId, quantity }: AddToCartPayload) {
  const res = await fetch("https://dummyjson.com/carts/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: 1,
      products: [{ id: productId, quantity }],
    }),
  });

  if (!res.ok) throw new Error("Failed to add to cart");
  return res.json();
}

interface AddToCartButtonProps {
  productId: number;
}

export default function AddToCartButton({ productId }: AddToCartButtonProps) {
  const { incrementCart } = useCart();

  const { mutate, status, reset } = useMutation({
    mutationFn: addToCartApi,
    onSuccess: (_data, variables) => {
      incrementCart(variables.quantity);
      setTimeout(reset, 2000);
    },
    onError: () => {
      setTimeout(reset, 2000);
    },
  });

  const handleClick = () => {
    if (status === "idle") {
      mutate({ productId, quantity: 1 });
    }
  };

  const buttonConfig = {
    idle: {
      text: "Add to Cart",
      className:
        "cursor-pointer w-full py-5 bg-gradient-to-r from-pink-500 to-fuchsia-600 hover:from-pink-600 hover:to-fuchsia-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-pink-500/25 active:scale-[0.98] flex items-center justify-center gap-2",
    },
    pending: {
      text: "Adding...",
      className:
        "w-full py-5 bg-gradient-to-r from-pink-400 to-fuchsia-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 opacity-80 cursor-not-allowed",
    },
    success: {
      text: "✓ Added to Cart!",
      className:
        "w-full py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-green-500/25 scale-[0.99]",
    },
    error: {
      text: "Failed – Try Again",
      className:
        "w-full py-5 bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg",
    },
  };

  const config =
    buttonConfig[status as keyof typeof buttonConfig] ?? buttonConfig.idle;

  return (
    <button
      onClick={handleClick}
      disabled={status === "pending"}
      className={config.className}
    >
      {status === "pending" && (
        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
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
      )}
      {status === "idle" && (
        <svg
          className="w-5 h-5"
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
      )}
      {config.text}
    </button>
  );
}
