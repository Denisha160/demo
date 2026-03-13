"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface CartContextType {
  cartCount: number;
  incrementCart: (quantity?: number) => void;
}

const CartContext = createContext<CartContextType>({
  cartCount: 0,
  incrementCart: () => {},
});

export const useCart = () => useContext(CartContext);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartCount, setCartCount] = useState(0);

  const incrementCart = (quantity = 1) => {
    setCartCount((prev) => prev + quantity);
  };

  return (
    <CartContext.Provider value={{ cartCount, incrementCart }}>
      {children}
    </CartContext.Provider>
  );
}
