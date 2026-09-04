"use server";

import { createClient } from "@/lib/supabase/server";

export async function saveTasa(tasa: number) {
  const supabase = await createClient();

  // Validaciones
  if (!tasa || tasa <= 0) {
    return { success: false, error: "La tasa debe ser un valor positivo" };
  }

  if (tasa > 10000) {
    return { success: false, error: "La tasa no puede ser mayor a 10000" };
  }

  // Insertar nueva tasa
  const { data, error } = await supabase
    .from("tasas")
    .insert({ tasa })
    .select()
    .single();

  if (error) {
    console.error("Error al guardar tasa:", error);
    return { success: false, error: "Error al guardar la tasa" };
  }

  return { success: true, data };
}

export async function getLatestTasa() {
  const supabase = await createClient();

  // Obtener la tasa más reciente
  const { data, error } = await supabase
    .from("tasas")
    .select("tasa, created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No hay tasas registradas
      return { success: true, data: null };
    }
    console.error("Error al obtener tasa:", error);
    return { success: false, error: "Error al obtener la tasa" };
  }

  return { success: true, data };
}

export async function getTasaHistory(limit: number = 10) {
  const supabase = await createClient();

  // Obtener historial de tasas
  const { data, error } = await supabase
    .from("tasas")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error al obtener historial de tasas:", error);
    return { success: false, error: "Error al obtener el historial" };
  }

  return { success: true, data };
}
