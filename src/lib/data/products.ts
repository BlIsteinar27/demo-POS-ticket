import { useState, useEffect } from "react";
import { Product } from "@/types";

export async function fetchProducts(): Promise<Product[]> {
  try {
    // Cargar desde Supabase
    const { getProducts } = await import("@/app/actions/products");
    const result = await getProducts();

    if (result.success && result.data) {
      console.log("✅ Productos cargados desde Supabase");
      return result.data;
    }

    console.log("⚠️ No hay productos en Supabase");
    return [];
  } catch (error) {
    console.error("❌ Error al cargar productos desde Supabase:", error);
    return [];
  }
}

export function isOnline(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
