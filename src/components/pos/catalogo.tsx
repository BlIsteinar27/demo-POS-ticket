"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Product } from "@/types";
import { fetchProducts, useOnlineStatus } from "@/lib/data/products";

interface CatalogoProps {
  addToCart: (product: Product) => void;
}

export function Catalogo({ addToCart }: CatalogoProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const data = await fetchProducts();
    setProducts(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <section className="flex-1 flex items-center justify-center h-full">
        <p className="text-zinc-500">Cargando productos...</p>
      </section>
    );
  }

  return (
    <section className="flex-1 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3 content-start overflow-y-auto pr-1 pb-2">
      {!isOnline && (
        <div className="col-span-2 md:col-span-2 lg:col-span-3 bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-xs text-yellow-800 text-center">
          ⚠️ Modo offline - usando datos locales
        </div>
      )}
      {products.map((product) => (
        <Button
          key={product.id}
          onClick={() => addToCart(product)}
          variant="outline"
          disabled={!product.is_active}
          className={`h-16 md:h-20 p-2 md:p-3 bg-gradient-to-br from-white to-accent/10 rounded-xl shadow-sm hover:border-primary hover:bg-accent/20 active:scale-95 flex items-center gap-2 md:gap-3 text-left border ${
            !product.is_active ? "opacity-50 grayscale" : ""
          }`}
        >
          {product.image_url && (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-10 h-10 md:w-12 md:h-12 object-cover rounded-lg flex-shrink-0"
            />
          )}
          <div className="flex flex-col items-start justify-center flex-1 min-w-0">
            <span className="font-bold text-xs md:text-sm leading-tight text-foreground truncate">
              {product.name}
            </span>
            <span className="text-xs md:text-sm font-semibold text-primary">
              ${product.price_usd.toFixed(2)}
            </span>
          </div>
        </Button>
      ))}
    </section>
  );
}
