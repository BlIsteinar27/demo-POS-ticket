"use client";
import { useMemo, useState } from "react";
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
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Catalogo } from "@/components/pos/catalogo";
import { PAYMENT_METHODS, MOCK_TASA } from "@/lib/mock/mocks";
import { createSale } from "./actions/sales";
import { Resumen } from "@/components/pos/resumen";
import { ModuloPago } from "@/components/pos/modulo-pago";
import Link from "next/link";

export default function Home() {
  const { cart, addToCart, updateQuantity, removeFromCart, clearCart } =
    useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [reference, setReference] = useState<string>("");

  // Cálculos derivados
  const totalUSD = useMemo(
    () => cart.reduce((acc, item) => acc + item.price_usd * item.quantity, 0),
    [cart],
  );
  const totalVES = useMemo(() => totalUSD * MOCK_TASA, [totalUSD]);
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
      tasa: MOCK_TASA,
      tasa_day: new Date(),
      payment_method: paymentMethod,
      payment_reference: isPagoMovil ? reference : undefined,
      items: cart.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        unit_price_usd: item.price_usd,
      })),
    };

    const response = await createSale(payload);

    if (response.success) {
      clearCart();
      setPaymentMethod(null);
      setReference("");
    } else {
      alert(response.error);
    }
  };

  return (
    <main className="flex flex-col md:flex-row h-screen w-full bg-zinc-50 p-2 md:p-4 gap-2 md:gap-4 overflow-hidden select-none relative">
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
