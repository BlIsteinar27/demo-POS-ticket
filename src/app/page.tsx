import { useState } from "react";
import { CartItem, Product } from "@/types";

export default function Home() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [reference, setReference] = useState<string>("");

  const addCart = (product: CartItem) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      // 2. Si ya está, modificamos el carrito sumando 1 a la cantidad que YA tenía
      const updatedCart = cart.map((item) => {
        if (item.id === product.id) {
          return { ...item, quantity: item.quantity + 1 }; 
        }
        return item;
      });
      setCart(updatedCart);
    } else {
      // 3. Si es nuevo, lo agregamos con cantidad inicial = 1
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };
  const updateQuantity = (product: CartItem, quantity: number) => {
    const updatedCart = cart.map((item) => {
      if (item.id === product.id) {
        return { ...item, quantity };
      }
      return item;
    });
    setCart(updatedCart);
  };

  const removeCart = (product: CartItem) => {
    setCart(cart.filter((item) => item.id !== product.id));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black"></div>
  );
}
