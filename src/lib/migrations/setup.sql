-- 1. Habilitar extensión para generación de UUIDs si no está activa
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Creación de tipos ENUM para categorías y métodos de pago
CREATE TYPE product_category AS ENUM ('Comida', 'Bebida', 'Extra');
CREATE TYPE payment_method AS ENUM ('PAGO_MOVIL', 'EFECTIVO_USD', 'EFECTIVO_VES', 'PUNTO');

-- 3. Tabla: PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    price_usd NUMERIC(10, 2) NOT NULL CHECK (price_usd >= 0),
    category product_category NOT NULL DEFAULT 'Comida',
    is_active BOOLEAN NOT NULL DEFAULT true,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Tabla: SALES
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    total_usd NUMERIC(10, 2) NOT NULL CHECK (total_usd >= 0),
    total_ves NUMERIC(12, 2) NOT NULL CHECK (total_ves >= 0),
    tasa NUMERIC(10, 2) NOT NULL CHECK (tasa > 0),
    tasa_day TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    payment_method payment_method NOT NULL,
    payment_reference VARCHAR(10),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Validación: Si es PAGO_MOVIL, la referencia debe tener exactamente 4 dígitos
    CONSTRAINT check_pago_movil_ref CHECK (
        (payment_method = 'PAGO_MOVIL' AND payment_reference IS NOT NULL AND length(payment_reference) = 4) OR
        (payment_method != 'PAGO_MOVIL')
    )
);

-- 5. Tabla: SALE_ITEMS
CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price_usd NUMERIC(10, 2) NOT NULL CHECK (unit_price_usd >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Índices para acelerar el reporte de cierre de caja por rango de fechas
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON public.sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_payment_method ON public.sales(payment_method);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON public.sale_items(sale_id);

-- 7. Configuración de Políticas de Seguridad (RLS) - Todo público sin restricciones

-- Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.products FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.products TO anon, authenticated;

CREATE POLICY "Public access to products"
ON public.products FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Sales
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.sales FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.sales TO anon, authenticated;

CREATE POLICY "Public access to sales"
ON public.sales FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Sale Items
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.sale_items FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.sale_items TO anon, authenticated;

CREATE POLICY "Public access to sale items"
ON public.sale_items FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 8. Configuración de Storage para imágenes de productos
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('products', 'products', true, 52428800) -- 50MB en bytes
ON CONFLICT (id) DO NOTHING;

-- Configurar RLS en storage.objects para el bucket products
-- Asegurar que RLS esté habilitado (por defecto en Supabase)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Política INSERT: Permitir uploads al bucket products
CREATE POLICY "Permitir uploads al bucket products"
ON storage.objects FOR INSERT
TO authenticated, anon
WITH CHECK (bucket_id = 'products');

-- Política SELECT: Permitir leer metadatos del bucket products (requerido por RETURNING *)
CREATE POLICY "Permitir lectura de metadatos del bucket products"
ON storage.objects FOR SELECT
TO authenticated, anon
USING (bucket_id = 'products');

-- 9. Datos iniciales de prueba (MOCK_PRODUCTS)
INSERT INTO public.products (id, name, price_usd, category, is_active)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Hamburguesa Doble', 5.00, 'Comida', true),
    ('22222222-2222-2222-2222-222222222222', 'Perro Caliente', 2.50, 'Comida', true),
    ('33333333-3333-3333-3333-333333333333', 'Refresco', 1.50, 'Bebida', true)
ON CONFLICT (id) DO NOTHING;