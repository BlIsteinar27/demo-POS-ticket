// Helper para manejar ventas offline con localStorage
import { SalePayload } from "@/types";

export interface OfflineSale {
  id: string;
  payload: SalePayload;
  timestamp: number;
  synced: boolean;
}

const OFFLINE_SALES_KEY = "offline_sales";

// Guardar venta offline en localStorage
export function saveOfflineSale(payload: SalePayload): void {
  try {
    const offlineSales = getOfflineSales();
    const newOfflineSale: OfflineSale = {
      id: crypto.randomUUID(),
      payload,
      timestamp: Date.now(),
      synced: false,
    };

    offlineSales.push(newOfflineSale);
    localStorage.setItem(OFFLINE_SALES_KEY, JSON.stringify(offlineSales));
    console.log("✅ Venta guardada offline:", newOfflineSale.id);
  } catch (error) {
    console.error("❌ Error al guardar venta offline:", error);
  }
}

// Obtener todas las ventas offline
export function getOfflineSales(): OfflineSale[] {
  try {
    const stored = localStorage.getItem(OFFLINE_SALES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("❌ Error al leer ventas offline:", error);
    return [];
  }
}

// Marcar venta como sincronizada
export function markSaleAsSynced(saleId: string): void {
  try {
    const offlineSales = getOfflineSales();
    const updatedSales = offlineSales.map((sale) =>
      sale.id === saleId ? { ...sale, synced: true } : sale,
    );

    // Eliminar ventas sincronizadas después de un tiempo
    const syncedSales = updatedSales.filter((sale) => !sale.synced);
    localStorage.setItem(OFFLINE_SALES_KEY, JSON.stringify(syncedSales));
    console.log("✅ Venta marcada como sincronizada:", saleId);
  } catch (error) {
    console.error("❌ Error al marcar venta como sincronizada:", error);
  }
}

// Obtener count de ventas pendientes de sincronización
export function getPendingOfflineSalesCount(): number {
  const offlineSales = getOfflineSales();
  return offlineSales.filter((sale) => !sale.synced).length;
}

// Limpiar todas las ventas offline (útil para testing)
export function clearOfflineSales(): void {
  try {
    localStorage.removeItem(OFFLINE_SALES_KEY);
    console.log("✅ Ventas offline limpiadas");
  } catch (error) {
    console.error("❌ Error al limpiar ventas offline:", error);
  }
}
