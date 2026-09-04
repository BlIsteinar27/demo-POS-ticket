-- ============================================
-- TODAS LAS ACCIONES CRUD PÚBLICAS - SIN RESTRICCIONES
-- ============================================

-- Products
DROP POLICY IF EXISTS "Permitir insercion de productos" ON public.products;
DROP POLICY IF EXISTS "Permitir lectura publica de productos activos" ON public.products;

CREATE POLICY "Public access to products"
ON public.products FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Sales
DROP POLICY IF EXISTS "Permitir insercion de ventas" ON public.sales;
DROP POLICY IF EXISTS "Permitir lectura de ventas para reportes" ON public.sales;

CREATE POLICY "Public access to sales"
ON public.sales FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Sale Items
DROP POLICY IF EXISTS "Permitir insercion de items de venta" ON public.sale_items;

CREATE POLICY "Public access to sale items"
ON public.sale_items FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- VERIFICACIÓN
-- ============================================

SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename IN ('products', 'sales', 'sale_items')
ORDER BY tablename, cmd;
