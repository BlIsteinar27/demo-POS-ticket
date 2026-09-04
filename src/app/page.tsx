"use client";
import { useMemo, useState, useEffect } from "react";
import { PaymentMethod, SalePayload } from "@/types";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  Delete,
  Smartphone,
  DollarSign,
  Banknote,
  CreditCard,
  BarChart3,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Catalogo } from "@/components/pos/catalogo";
import { PAYMENT_METHODS } from "@/lib/mock/mocks";
import { createSale } from "./actions/sales";
import { getLatestTasa } from "./actions/tasas";
import { Resumen } from "@/components/pos/resumen";
import { ModuloPago } from "@/components/pos/modulo-pago";
import Link from "next/link";
import sweetAlertHelper from "@/lib/sweet-alert-helper";
import {
  saveOfflineSale,
  getOfflineSales,
  markSaleAsSynced,
  getPendingOfflineSalesCount,
} from "@/lib/offline-sales";

export default function Home() {
  const { cart, addToCart, updateQuantity, removeFromCart, clearCart } =
    useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [reference, setReference] = useState<string>("");
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSales, setPendingSales] = useState(0);
  const [currentTasa, setCurrentTasa] = useState<number>(280); // Tasa por defecto

  // Cargar tasa vigente al iniciar
  useEffect(() => {
    const loadTasa = async () => {
      const result = await getLatestTasa();
      if (result.success && result.data) {
        setCurrentTasa(result.data.tasa);
      }
    };
    loadTasa();
  }, []);

  // Detectar estado de conexión
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) {
        syncOfflineSales();
      }
    };

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    updateOnlineStatus();

    // Actualizar contador de ventas pendientes
    const interval = setInterval(() => {
      setPendingSales(getPendingOfflineSalesCount());
    }, 5000);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
      clearInterval(interval);
    };
  }, []);

  // Sincronizar ventas offline cuando hay conexión
  const syncOfflineSales = async () => {
    const offlineSales = getOfflineSales().filter((sale) => !sale.synced);

    for (const offlineSale of offlineSales) {
      try {
        const response = await createSale(offlineSale.payload);
        if (response.success) {
          markSaleAsSynced(offlineSale.id);
          sweetAlertHelper.toastSuccess("Venta sincronizada correctamente");
        }
      } catch (error) {
        console.error("Error al sincronizar venta:", error);
      }
    }

    setPendingSales(getPendingOfflineSalesCount());
  };

  // Cálculos derivados
  const totalUSD = useMemo(
    () => cart.reduce((acc, item) => acc + item.price_usd * item.quantity, 0),
    [cart],
  );
  const totalVES = useMemo(
    () => totalUSD * currentTasa,
    [totalUSD, currentTasa],
  );
  // Manejo de teclado táctil
  const handleNumpadPress = (digit: string) => {
    if (reference.length < 4) {
      setReference((prev) => prev + digit);
    }
  };

  const handleNumpadDelete = () => {
    setReference((prev) => prev.slice(0, -1));
  };

  // Validaciones de envío
  const isPagoMovil = paymentMethod === "PAGO_MOVIL";
  const isValidReference = !isPagoMovil || reference.length === 4;
  const canRegister =
    cart.length > 0 && paymentMethod !== null && isValidReference;

  const handleRegisterSale = async () => {
    if (!canRegister || !paymentMethod) return;

    const payload: SalePayload = {
      total_usd: Number(totalUSD.toFixed(2)),
      total_ves: Number(totalVES.toFixed(2)),
      tasa: currentTasa,
      tasa_day: new Date(),
      payment_method: paymentMethod,
      payment_reference: isPagoMovil ? reference : undefined,
      items: cart.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        unit_price_usd: item.price_usd,
      })),
    };

    // Si estamos offline, guardar la venta localmente
    if (!isOnline) {
      saveOfflineSale(payload);
      clearCart();
      setPaymentMethod(null);
      setReference("");
      setPendingSales(getPendingOfflineSalesCount());
      sweetAlertHelper.toastSuccess(
        "Venta guardada offline (se sincronizará cuando haya conexión)",
      );
      return;
    }

    // Si estamos online, intentar registrar la venta normalmente
    const response = await createSale(payload);

    if (response.success) {
      clearCart();
      setPaymentMethod(null);
      setReference("");
      sweetAlertHelper.toastSuccess("Venta registrada correctamente");
    } else {
      // Si falla la conexión, guardar offline
      sweetAlertHelper.warning("Sin conexión", "Guardando venta offline...");
      saveOfflineSale(payload);
      clearCart();
      setPaymentMethod(null);
      setReference("");
      setPendingSales(getPendingOfflineSalesCount());
    }
  };

  return (
    <main className="flex flex-col md:flex-row h-screen w-full bg-zinc-50 p-2 md:p-4 gap-2 md:gap-4 overflow-hidden select-none relative">
      {/* Indicador de conexión y ventas pendientes */}
      <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10 flex items-center gap-2">
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            isOnline ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {isOnline ? (
            <Wifi className="w-3 h-3" />
          ) : (
            <WifiOff className="w-3 h-3" />
          )}
          <span className="hidden sm:inline">
            {isOnline ? "En línea" : "Sin conexión"}
          </span>
        </div>
        {pendingSales > 0 && (
          <Badge variant="destructive" className="text-xs">
            {pendingSales} pendiente{pendingSales > 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      {/* Botón de Reportes - posicionado mejor para móvil */}
      <Link
        href="/admin"
        className="absolute top-2 right-2 md:top-4 md:right-4 z-10"
      >
        <Button
          variant="outline"
          size="sm"
          className="bg-white shadow-sm h-8 md:h-auto px-2 md:px-4"
        >
          <BarChart3 className="w-4 h-4 md:mr-2" />
          <span className="hidden md:inline">Reportes</span>
        </Button>
      </Link>

      {/* 1. Catálogo de productos */}
      <div className="flex-1 md:w-1/2 order-1 md:order-1 min-h-0">
        <Catalogo addToCart={addToCart} />
      </div>

      {/* 2. Resumen del Ticket y Módulo de Pago */}
      <section className="flex-1 md:w-1/2 bg-white rounded-xl p-3 md:p-4 shadow-md flex flex-col justify-between border order-2 md:order-2 min-h-0">
        <Resumen
          cart={cart}
          clearCart={clearCart}
          updateQuantity={updateQuantity}
        />
        <ModuloPago
          totalVES={totalVES}
          totalUSD={totalUSD}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          isPagoMovil={isPagoMovil}
          reference={reference}
          setReference={setReference}
          handleNumpadPress={handleNumpadPress}
          handleNumpadDelete={handleNumpadDelete}
          handleRegisterSale={handleRegisterSale}
          canRegister={canRegister}
        />
      </section>
    </main>
  );
}
