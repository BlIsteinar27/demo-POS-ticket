# Documentación de Lógica de Negocio y Especificaciones Técnicas
## Sistema POS PWA Ultra-Simplificado para Comida Rápida (MVP)

---

## 1. Contexto Operativo y Problema
El negocio opera como un puesto de comida rápida de calle/esquina con un flujo altamente cambiante y picos de alto volumen de clientes. 

* **Comportamiento del Cliente:** El 98% de los clientes se acerca directamente a la parrilla a consultar precios y realizar el pedido antes de ubicarse en las mesas.
* **Proceso Actual (Punto de Fricción):** El registro de comandas y pagos (especialmente transferencias por Pago Móvil) se realiza manualmente en un cuaderno de papel por la persona encargada de la atención.
* **Problema Principal:** Pérdida de tiempo en registro, errores en consolidación de datos en momentos de alta afluencia, falta de reportes diarios consolidados para el dueño y riesgo de pérdida de información.

---

## 2. Definición del Producto (MVP)
Una **Progressive Web App (PWA)** de pantalla única orientada al operador, optimizada para tablets o teléfonos inteligentes en modo horizontal o vertical, cuya interfaz simula una caja registradora táctil de respuesta inmediata.

### Objetivos Clave:
1. **Reducir el tiempo de registro:** Pasar de 20-30 segundos por pedido manual a menos de 5 segundos.
2. **Cero fricción visual:** Eliminar teclados nativos del sistema operativo y navegación entre pestañas.
3. **Consolidación en tiempo real:** Registrar automáticamente ventas por producto y método de pago para arqueo de caja instantáneo.

---

## 3. Flujo de Usuario y Lógica de Interacción

```
[ Entrada de Pedido ] ──> [ Selección de Pago ] ──> [ Ingreso de Ref. ] ──> [ Confirmación ]
    (1-2 toques)              (1 toque)               (4 dígitos)             (1 toque)
```

1. **Selección de Productos:** El operador toca los botones correspondientes a los productos consumidos. Cada toque incrementa la cantidad en el Ticket Actual.
2. **Selección del Método de Pago:**
   * `Pago Móvil` (requiere referencia).
   * `Efectivo USD` / `Efectivo VES`.
   * `Punto de Venta / Tarjeta`.
3. **Ingreso de Referencia (Solo si aplica Pago Móvil):**
   * Se habilitan los botones numéricos integrados ($0-9$).
   * El operador ingresa únicamente los últimos 4 dígitos de la referencia de Pago Móvil.
4. **Procesamiento de Venta:**
   * Al presionar `REGISTRAR VENTA`, el sistema almacena la transacción localmente e intenta la sincronización con la base de datos.
   * La interfaz muestra un aviso visual (Flash Verde / Checkmark) por $500	ext{ms}$ y borra el estado del ticket activo para la siguiente venta.

---

## 4. Requerimientos Funcionales y Reglas de Negocio

### 4.1. Módulo de Venta (POS)
* **Teclado Personalizado:** Todos los `inputs` deben tener la propiedad `inputmode="none"` o manejarse mediante estado interno de React para prevenir la apertura del teclado virtual nativo de iOS/Android.
* **Modificación del Ticket:** 
  * Opción de incrementar (`+`) o decrementar (`-`) cantidad de un ítem seleccionado.
  * Botón para `CANCELAR / LIMPIAR TICKET` completo.
* **Cálculo de Moneda Doble:** 
  * Mostrar el total acumulado en USD y la conversión automática a Moneda Local (VES) basada en la tasa del día configurada.

### 4.2. Módulo Offline First (Resiliencia de Red)
* En zonas de cobertura variable, la PWA debe guardar cada venta en `IndexedDB` o `LocalStorage`.
* Un proceso en segundo plano (Service Worker / Hook de Sincronización) intentará subir los registros pendientes a Supabase al detectar reconexión a Internet.
* Indicador visual de estado de red (`Online` / `Offline - X ventas pendientes`).

### 4.3. Módulo de Cierre de Caja (Dashboard Simplificado)
* Acceso protegido o vista inferior para el dueño/empleado al final del turno.
* Métricas a mostrar:
  * Total Facturado (USD y VES).
  * Desglose por Método de Pago (Pago Móvil, Efectivo USD, Efectivo VES).
  * Cantidad de ítems vendidos por categoría (ej. Hamburguesas: 45, Shawarmas: 30, Perros: 60).
  * Lista de referencias de Pago Móvil para cruce con cuenta bancaria.

---

## 5. Modelo de Datos (Supabase / PostgreSQL)

### Tabla: `products`
| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | `uuid` (PK) | Identificador único del producto |
| `name` | `varchar` | Nombre del producto (ej. Hamburguesa Pollo) |
| `price_usd` | `decimal(10,2)` | Precio base en USD |
| `category` | `varchar` | Categoría (Comida, Bebida, Extra) |
| `is_active` | `boolean` | Estado del producto para visualización |

### Tabla: `sales`
| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | `uuid` (PK) | Identificador de la venta |
| `total_usd` | `decimal(10,2)` | Monto total en USD |
| `total_ves` | `decimal(12,2)` | Monto total en VES |
| `payment_method` | `varchar` | Enum: `PAGO_MOVIL`, `EFECTIVO_USD`, `EFECTIVO_VES`, `PUNTO` |
| `payment_reference` | `varchar(10)` | Últimos 4 dígitos de la referencia (nullable) |
| `created_at` | `timestamp` | Fecha y hora de la transacción |

### Tabla: `sale_items`
| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | `uuid` (PK) | Identificador de la línea |
| `sale_id` | `uuid` (FK) | Relación con la venta |
| `product_id` | `uuid` (FK) | Relación con el producto |
| `quantity` | `integer` | Cantidad vendida |
| `unit_price_usd` | `decimal(10,2)` | Precio unitario aplicado al momento |

---

## 6. Stack Tecnológico Sugerido

* **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS.
* **Backend & Database:** Supabase (PostgreSQL, Row Level Security).
* **Gestión de Estado Local:** Zustand o React Context para el carrito temporal.
* **Persistencia Offline:** `idb` (IndexedDB Wrapper) o `Dexie.js`.
* **Despliegue:** Vercel (PWA optimizada).

---

## 7. Plan de Validación y Despliegue en Fase MVP

1. **Fase 1 (Prueba de Interfaz - Sin Backend):**
   * Crear la maqueta con un array estático de productos.
   * Probar el tiempo de respuesta y comodidad del teclado en la tablet/móvil real que usará la chica en el puesto.
2. **Fase 2 (Integración Base de Datos):**
   * Conectar Supabase y configurar sincronización.
3. **Fase 3 (Prueba en Vivo / Turno Piloto):**
   * Utilizar la PWA en paralelo con el cuaderno durante un turno completo de fin de semana para verificar concordancia de caja y fallos de usabilidad.
