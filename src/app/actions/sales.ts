"use server";

import { createClient } from "@/lib/supabase/server";
import { SalePayload } from "@/types";

export async function createSale(payload: SalePayload) {
  const supabase = await createClient();

  // 1. Validaciones de negocio en servidor
  if (!payload.items || payload.items.length === 0) {
    return { success: false, error: "El carrito no puede estar vacío." };
  }

  if (payload.payment_method === "PAGO_MOVIL") {
    if (!payload.payment_reference || payload.payment_reference.length !== 4) {
      return { success: false, error: "Referencia de Pago Móvil inválida." };
    }
  }

  // 2. Insertar cabecera de la venta
  const { data: saleData, error: saleError } = await supabase
    .from("sales")
    .insert({
      total_usd: payload.total_usd,
      total_ves: payload.total_ves,
      tasa: payload.tasa,
      tasa_day: payload.tasa_day,
      payment_method: payload.payment_method,
      payment_reference: payload.payment_reference || null,
    })
    .select("id")
    .single();

  if (saleError || !saleData) {
    console.error("Error al registrar venta:", saleError);
    return { success: false, error: "Error interno al guardar la venta." };
  }

  // 3. Insertar detalle de productos (sale_items)
  const itemsToInsert = payload.items.map((item) => ({
    sale_id: saleData.id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price_usd: item.unit_price_usd,
  }));

  const { error: itemsError } = await supabase
    .from("sale_items")
    .insert(itemsToInsert);

  if (itemsError) {
    console.error("Error al registrar items de venta:", itemsError);
    // Nota: Si usas una Postgres Function / RPC en Supabase puedes hacer rollback automático.
    return { success: false, error: "Error al guardar el detalle del ticket." };
  }

  return { success: true, saleId: saleData.id };
}