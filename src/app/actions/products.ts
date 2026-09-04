"use server";

import { createClient } from "@/lib/supabase/server";
import { Product } from "@/types";
import { revalidatePath } from "next/cache";

export async function getProducts() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error al obtener productos:", error);
    return { success: false, error: "Error al cargar productos" };
  }

  return { success: true, data };
}

export async function createProduct(
  product: Omit<Product, "id" | "created_at">,
) {
  const supabase = await createClient();

  // Validaciones según restricciones de base de datos
  if (product.name.length > 100) {
    return {
      success: false,
      error: "El nombre no puede exceder 100 caracteres",
    };
  }

  if (product.name.trim().length === 0) {
    return { success: false, error: "El nombre no puede estar vacío" };
  }

  if (product.price_usd < 0) {
    return { success: false, error: "El precio no puede ser negativo" };
  }

  // Validar máximo 2 decimales en precio
  const priceStr = product.price_usd.toString();
  if (priceStr.includes(".") && priceStr.split(".")[1].length > 2) {
    return { success: false, error: "El precio debe tener máximo 2 decimales" };
  }

  const { data, error } = await supabase
    .from("products")
    .insert({
      name: product.name.trim(),
      price_usd: product.price_usd,
      category: product.category,
      is_active: product.is_active,
      image_url: product.image_url || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error al crear producto:", error);
    return { success: false, error: "Error al crear producto" };
  }

  revalidatePath("/admin/productos");
  return { success: true, data };
}

export async function updateProduct(id: string, product: Partial<Product>) {
  const supabase = await createClient();

  // Primero obtener el producto actual para verificar si la imagen cambió
  const { data: currentProduct, error: fetchError } = await supabase
    .from("products")
    .select("image_url")
    .eq("id", id)
    .single();

  if (fetchError) {
    console.error("Error al obtener producto actual:", fetchError);
    return { success: false, error: "Error al obtener producto actual" };
  }

  // Validaciones según restricciones de base de datos
  if (product.name !== undefined) {
    if (product.name.length > 100) {
      return {
        success: false,
        error: "El nombre no puede exceder 100 caracteres",
      };
    }
    if (product.name.trim().length === 0) {
      return { success: false, error: "El nombre no puede estar vacío" };
    }
  }

  if (product.price_usd !== undefined) {
    if (product.price_usd < 0) {
      return { success: false, error: "El precio no puede ser negativo" };
    }
    // Validar máximo 2 decimales en precio
    const priceStr = product.price_usd.toString();
    if (priceStr.includes(".") && priceStr.split(".")[1].length > 2) {
      return {
        success: false,
        error: "El precio debe tener máximo 2 decimales",
      };
    }
  }

  const { data, error } = await supabase
    .from("products")
    .update({
      name: product.name?.trim(),
      price_usd: product.price_usd,
      category: product.category,
      is_active: product.is_active,
      image_url: product.image_url,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error al actualizar producto:", error);
    return { success: false, error: "Error al actualizar producto" };
  }

  // Si la imagen cambió y la antigua existe, eliminarla del storage
  if (
    product.image_url !== undefined &&
    product.image_url !== currentProduct?.image_url &&
    currentProduct?.image_url
  ) {
    await deleteImageFromStorage(currentProduct.image_url);
  }

  revalidatePath("/admin/productos");
  return { success: true, data };
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();

  // Primero obtener el producto para tener la URL de la imagen
  const { data: product, error: fetchError } = await supabase
    .from("products")
    .select("image_url")
    .eq("id", id)
    .single();

  if (fetchError) {
    console.error("Error al obtener producto:", fetchError);
    return { success: false, error: "Error al obtener producto" };
  }

  // Verificar si el producto tiene ventas asociadas (integridad referencial)
  const { data: sales, error: checkError } = await supabase
    .from("sale_items")
    .select("sale_id")
    .eq("product_id", id)
    .limit(1);

  if (checkError) {
    console.error("Error al verificar ventas del producto:", checkError);
    return { success: false, error: "Error al verificar ventas del producto" };
  }

  if (sales && sales.length > 0) {
    return {
      success: false,
      error:
        "No se puede eliminar: el producto tiene ventas asociadas. Use desactivar en su lugar.",
    };
  }

  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    console.error("Error al eliminar producto:", error);
    return { success: false, error: "Error al eliminar producto" };
  }

  // Eliminar la imagen del storage si existe
  if (product?.image_url) {
    await deleteImageFromStorage(product.image_url);
  }

  revalidatePath("/admin/productos");
  return { success: true };
}

export async function toggleProductActive(id: string, isActive: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("products")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) {
    console.error("Error al cambiar estado de producto:", error);
    return { success: false, error: "Error al cambiar estado" };
  }

  revalidatePath("/admin/productos");
  return { success: true };
}

export async function uploadProductImage(
  file: File,
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  const supabase = await createClient();

  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from("products")
      .upload(filePath, file);

    if (error) {
      console.error("Error al subir imagen:", error);
      return { success: false, error: "Error al subir imagen" };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("products").getPublicUrl(filePath);

    return { success: true, imageUrl: publicUrl };
  } catch (error) {
    console.error("Error al subir imagen:", error);
    return { success: false, error: "Error al subir imagen" };
  }
}

async function deleteImageFromStorage(imageUrl: string): Promise<void> {
  if (!imageUrl) return;

  try {
    const supabase = await createClient();

    // Extraer el nombre del archivo de la URL
    const url = new URL(imageUrl);
    const pathname = url.pathname;
    const fileName = pathname.split("/").pop();

    if (fileName) {
      const { error } = await supabase.storage
        .from("products")
        .remove([fileName]);

      if (error) {
        console.error("Error al eliminar imagen del storage:", error);
      }
    }
  } catch (error) {
    console.error("Error al eliminar imagen del storage:", error);
  }
}
