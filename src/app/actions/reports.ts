"use server";

import { createClient } from "@/lib/supabase/server";

export async function getSalesReport(startDate?: Date, endDate?: Date) {
  const supabase = await createClient();

  let query = supabase
    .from("sales")
    .select("*")
    .order("created_at", { ascending: false });

  if (startDate) {
    query = query.gte("created_at", startDate.toISOString());
  }

  if (endDate) {
    query = query.lte("created_at", endDate.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error al obtener reporte de ventas:", error);
    return { success: false, error: "Error al cargar reporte" };
  }

  // Calcular métricas
  const totalUSD = data.reduce((sum, sale) => sum + Number(sale.total_usd), 0);
  const totalVES = data.reduce((sum, sale) => sum + Number(sale.total_ves), 0);

  // Desglose por método de pago
  const paymentMethods = data.reduce(
    (acc, sale) => {
      const method = sale.payment_method;
      acc[method] = (acc[method] || 0) + Number(sale.total_usd);
      return acc;
    },
    {} as Record<string, number>
  );

  // Referencias de Pago Móvil
  const pagoMovilRefs = data
    .filter((sale) => sale.payment_method === "PAGO_MOVIL" && sale.payment_reference)
    .map((sale) => ({
      reference: sale.payment_reference,
      amount: sale.total_usd,
      date: sale.created_at,
    }));

  return {
    success: true,
    data: {
      totalUSD,
      totalVES,
      paymentMethods,
      pagoMovilRefs,
      salesCount: data.length,
    },
  };
}

export async function getSalesByCategory(startDate?: Date, endDate?: Date) {
  const supabase = await createClient();

  let query = supabase
    .from("sale_items")
    .select(`
      quantity,
      unit_price_usd,
      products (
        category,
        name
      )
    `);

  if (startDate || endDate) {
    // Necesitamos join con sales para filtrar por fecha
    query = supabase
      .from("sale_items")
      .select(`
        quantity,
        unit_price_usd,
        products (
          category,
          name
        ),
        sales (
          created_at
        )
      `);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error al obtener ventas por categoría:", error);
    return { success: false, error: "Error al cargar ventas por categoría" };
  }

  // Filtrar por fecha si se proporcionaron
  let filteredData = data;
  if (startDate || endDate) {
    filteredData = data.filter((item: any) => {
      if (!item.sales?.created_at) return false;
      const saleDate = new Date(item.sales.created_at);
      if (startDate && saleDate < startDate) return false;
      if (endDate && saleDate > endDate) return false;
      return true;
    });
  }

  // Agrupar por categoría
  const byCategory = filteredData.reduce(
    (acc, item: any) => {
      const category = item.products?.category || "Sin categoría";
      const quantity = item.quantity;
      const total = Number(item.unit_price_usd) * quantity;

      if (!acc[category]) {
        acc[category] = { count: 0, total: 0, items: [] as any[] };
      }

      acc[category].count += quantity;
      acc[category].total += total;
      acc[category].items.push({
        name: item.products?.name,
        quantity,
        total,
      });

      return acc;
    },
    {} as Record<string, { count: number; total: number; items: any[] }>
  );

  return {
    success: true,
    data: byCategory,
  };
}

export async function getTodaySales() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return getSalesReport(today, tomorrow);
}
