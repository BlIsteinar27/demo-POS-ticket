export type ProductCategory = "Comida" | "Bebida" | "Extra";

export type PaymentMethod =
  | "PAGO_MOVIL"
  | "EFECTIVO_USD"
  | "EFECTIVO_VES"
  | "PUNTO";

export interface Product {
  id: string;
  name: string;
  price_usd: number;
  category: ProductCategory;
  is_active: boolean;
  image_url?: string;
  created_at: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface SaleItemPayload {
  product_id: string;
  quantity: number;
  unit_price_usd: number;
}

export interface SalePayload {
  total_usd: number;
  total_ves: number;
  tasa: number;
  tasa_day: Date;
  payment_method: PaymentMethod;
  payment_reference?: string;
  items: SaleItemPayload[];
}
