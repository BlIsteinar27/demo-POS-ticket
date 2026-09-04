-- ============================================
-- RESET DE BASE DE DATOS Y SEED INICIAL
-- ============================================
-- Este script truncará todas las tablas y volverá a insertar
-- los datos iniciales como si se acabara de ejecutar el setup
-- ============================================

-- 1. Truncar tablas en orden correcto (respetando foreign keys)
TRUNCATE TABLE public.sale_items CASCADE;
TRUNCATE TABLE public.sales CASCADE;
TRUNCATE TABLE public.tasas CASCADE;
TRUNCATE TABLE public.products CASCADE;

-- 2. Reiniciar sequences si es necesario (para UUID no es necesario, pero por seguridad)
-- No aplicable para UUID, pero si se usara SEQUENCE se reiniciaría aquí

-- 3. Reinsertar datos iniciales de productos (MOCK_PRODUCTS)
INSERT INTO public.products (id, name, price_usd, category, is_active)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'Hamburguesa Doble', 5.00, 'Comida', true),
    ('22222222-2222-2222-2222-222222222222', 'Perro Caliente', 2.50, 'Comida', true),
    ('33333333-3333-3333-3333-333333333333', 'Refresco', 1.50, 'Bebida', true);

-- 4. Reinsertar tasa inicial
INSERT INTO public.tasas (id, tasa)
VALUES ('44444444-4444-4444-4444-444444444444', 280.00);

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Verificar productos
SELECT 'Productos insertados:' as info, COUNT(*) as total FROM public.products;

-- Verificar tasa
SELECT 'Tasa inicial:' as info, tasa FROM public.tasas ORDER BY created_at DESC LIMIT 1;

-- Verificar que no haya ventas
SELECT 'Ventas (debe ser 0):' as info, COUNT(*) as total FROM public.sales;

-- Verificar que no haya items de venta
SELECT 'Items de venta (debe ser 0):' as info, COUNT(*) as total FROM public.sale_items;
