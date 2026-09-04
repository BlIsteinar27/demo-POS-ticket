# Debugging Completo: Problemas RLS en Supabase Storage y Tabla Products

## Contexto del Proyecto
- **Proyecto:** Sistema de gestión de comida
- **Stack:** Next.js 19, Supabase, TypeScript
- **Funcionalidad afectada:** Upload de imágenes de productos y creación de productos

## Errores Encontrados

### Error 1: Storage RLS (RESUELTO PARCIALMENTE)
```
Error [StorageApiError]: new row violates row-level security policy
status: 400, statusCode: '403', code: 'AccessDenied'
```

**Contexto:**
- Bucket "products" creado como PUBLIC
- 0 políticas RLS definidas inicialmente
- Cliente Supabase usa `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Solución aplicada:**
```sql
-- Política INSERT para uploads
CREATE POLICY "Permitir uploads al bucket products"
ON storage.objects FOR INSERT
TO authenticated, anon
WITH CHECK (bucket_id = 'products');

-- Política SELECT para metadatos (RETURNING *)
CREATE POLICY "Permitir lectura de metadatos del bucket products"
ON storage.objects FOR SELECT
TO authenticated, anon
USING (bucket_id = 'products');
```

**Resultado:** Upload de imagen parece funcionar (POST 200), pero aparece nuevo error.

### Error 2: Permisos en storage.objects
```
ERROR: 42501: must be owner of table objects
```

**Contexto:** Al intentar ejecutar:
```sql
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
```

**Análisis:** El usuario no tiene permisos de owner en la tabla `storage.objects` del schema `storage`.

### Error 3: RLS en tabla products (ERROR ACTUAL)
```
Error al crear producto: {
  code: '42501',
  message: 'new row violates row-level security policy for table "products"'
}
```

**Contexto:**
- Upload de imagen funciona: `image_url:"https://.../products/1788549024929.jpg"`
- Falla al insertar en tabla `public.products`
- Server Action: `createProduct()` en `src/app/actions/products.ts`

## Configuración Actual

### Archivo: src/lib/supabase/server.ts
```typescript
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,  // ← Usa ANON key
    { cookies: { ... } }
  );
}
```

### Archivo: src/lib/migrations/setup.sql (Políticas RLS actuales)
```sql
-- Tabla products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura publica de productos activos" 
    ON public.products FOR SELECT USING (is_active = true);
    // ❌ NO HAY POLÍTICA INSERT PARA PRODUCTS

-- Tabla sales  
CREATE POLICY "Permitir insercion de ventas" 
    ON public.sales FOR INSERT WITH CHECK (true);  // ✅ Tiene INSERT

-- Tabla sale_items
CREATE POLICY "Permitir insercion de items de venta" 
    ON public.sale_items FOR INSERT WITH CHECK (true);  // ✅ Tiene INSERT
```

### Archivo: src/app/actions/products.ts (Líneas 23-69)
```typescript
export async function createProduct(
  product: Omit<Product, "id" | "created_at">,
) {
  const supabase = await createClient();  // ← Usa ANON key
  
  // Validaciones...
  
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
  // ↑ Aquí falla por falta de política INSERT
}
```

## Análisis de la Causa Raíz

### Problema Principal
**La tabla `public.products` tiene RLS habilitado pero SÓLO tiene política SELECT, no INSERT.**

- ✅ Tiene: `CREATE POLICY ... FOR SELECT USING (is_active = true)`
- ❌ Falta: `CREATE POLICY ... FOR INSERT WITH CHECK (...)`

### Por qué funciona sales pero no products
- `sales` y `sale_items` tienen políticas INSERT con `WITH CHECK (true)`
- `products` solo tiene política SELECT

### Flujo del error actual
1. ✅ Upload de imagen a Storage funciona (políticas INSERT/SELECT aplicadas)
2. ✅ Se obtiene URL pública: `https://.../products/1788549024929.jpg`
3. ❌ Al insertar en `public.products`, RLS bloquea por falta de política INSERT
4. ❌ Error: `new row violates row-level security policy for table "products"`

## Hipótesis

### Hipótesis Principal
**Falta política INSERT en la tabla `public.products`.** El setup.sql original solo configuró lectura pero no escritura para productos.

### Hipótesis Secundaria
**El usuario no tiene permisos suficientes** para modificar `storage.objects` (error "must be owner"), lo que sugiere que:
- Es un proyecto de Supabase con credenciales limitadas
- O necesita usar service_role key para operaciones administrativas

## Soluciones Propuestas

### Solución 1: Agregar política INSERT a products (RECOMENDADA)
```sql
-- Agregar al setup.sql o ejecutar directamente en SQL Editor
CREATE POLICY "Permitir insercion de productos"
ON public.products FOR INSERT
TO authenticated, anon
WITH CHECK (true);
```

### Solución 2: Usar service_role key en servidor
```typescript
// En src/lib/supabase/server.ts (solo para operaciones admin)
if (operation === 'admin') {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,  // ← Bypass RLS
    { cookies: { ... } }
  );
}
```

### Solución 3: Política INSERT más restrictiva (SEGURA)
```sql
CREATE POLICY "Permitir insercion de productos autenticados"
ON public.products FOR INSERT
TO authenticated
WITH CHECK (true);
```

## Preguntas para Claude

1. **¿Es correcto que falte la política INSERT en `public.products`?**
2. **¿Por qué el setup.sql original incluyó INSERT para sales/sale_items pero no para products?**
3. **¿El error "must be owner of table objects" indica que no podemos modificar storage.objects?**
4. **¿Deberíamos usar service_role key para operaciones de administración o mejor corregir las políticas RLS?**
5. **¿Hay alguna otra configuración de RLS que estemos pasando por alto?**

## Archivos Relacionados

- `src/lib/supabase/server.ts` - Configuración cliente Supabase
- `src/lib/supabase/client.ts` - Configuración cliente browser
- `src/app/actions/products.ts` - Server Actions para productos
- `src/lib/migrations/setup.sql` - Migraciones y políticas RLS
- `src/app/admin/productos/page.tsx` - Página de administración de productos
- `next.config.ts` - Configuración Next.js (bodySizeLimit: 5mb)

## Environment Variables (Necesarias)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (posiblemente faltante)

## Logs de Error Completos

### Log 1: Upload funcionando, pero insert fallando
```
POST /admin/productos 200 in 2.0s (next.js: 19ms, application-code: 1993ms)
  └─ ƒ uploadProductImage({}) in 1958ms src/app/actions/products.ts
POST /admin/productos 200 in 2.4s (next.js: 8ms, application-code: 2.4s)
  └─ ƒ uploadProductImage({}) in 2357ms src/app/actions/products.ts
Error al crear producto: {
  code: '42501',
  details: null,
  hint: null,
  message: 'new row violates row-level security policy for table "products"'
}
```

### Log 2: Intento de modificar storage.objects
```
Error: Failed to run sql query: ERROR: 42501: must be owner of table objects
```

## Estado Actual
- ✅ Storage policies aplicadas (parecen funcionar)
- ❌ Tabla products sin política INSERT
- ❌ Sin permisos para modificar storage.objects
- ⏳ Esperando solución para política INSERT en products
