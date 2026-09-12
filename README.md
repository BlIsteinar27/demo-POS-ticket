# Sistema de Gestión de Comida (POS)

Sistema de Punto de Venta (POS) para gestión de ventas de comida con soporte offline, múltiples métodos de pago y conversión de moneda en tiempo real.

## 🚀 Características

- **Catálogo de Productos**: Gestión de productos organizados por categorías (Comida, Bebida, Extra)
- **Múltiples Métodos de Pago**:
  - Pago Móvil (con referencia de 4 dígitos)
  - Efectivo USD
  - Efectivo VES
  - Punto de Venta
- **Conversión de Moneda**: Cálculo automático de USD a VES con tasas de cambio actualizadas
- **Soporte Offline**: Funcionalidad completa para ventas sin conexión a internet
  - Almacenamiento local de ventas cuando no hay conexión
  - Sincronización automática cuando se restablece la conexión
  - Indicador de estado de conexión en tiempo real
- **Panel de Administración**:
  - Reportes de ventas diarias
  - Desglose por método de pago
  - Ventas por categoría de producto
  - Referencias de Pago Móvil
- **Interfaz Responsive**: Diseño adaptativo para móviles y escritorio
- **Backend con Supabase**: Base de datos en la nube para almacenamiento de ventas y productos

## 🛠️ Tecnologías

- **Frontend**: Next.js 16, React 19, TypeScript
- **Estilos**: Tailwind CSS 4, shadcn/ui
- **Backend**: Supabase (Database y Auth)
- **Iconos**: Lucide React
- **Notificaciones**: SweetAlert2
- **Estado**: React Hooks (useState, useEffect, useMemo)

## 📋 Requisitos Previos

- Node.js 20 o superior
- npm, yarn, pnpm o bun
- Cuenta de Supabase configurada
- Variables de entorno configuradas

## 🔧 Instalación

1. Clonar el repositorio:

```bash
git clone <repository-url>
cd sistema-gestion-comida
```

2. Instalar dependencias:

```bash
npm install
# o
yarn install
# o
pnpm install
# o
bun install
```

3. Configurar variables de entorno:
   Crear un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

## 🚀 Iniciar Desarrollo

Ejecutar el servidor de desarrollo:

```bash
npm run dev
# o
yarn dev
# o
pnpm dev
# o
bun dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador para ver la aplicación.

## 📁 Estructura del Proyecto

```
sistema-gestion-comida/
├── src/
│   ├── app/
│   │   ├── actions/          # Server Actions para operaciones de base de datos
│   │   │   ├── products.ts   # Gestión de productos
│   │   │   ├── sales.ts      # Registro de ventas
│   │   │   ├── reports.ts    # Generación de reportes
│   │   │   └── tasas.ts      # Gestión de tasas de cambio
│   │   ├── admin/            # Panel de administración
│   │   ├── api/              # Rutas API
│   │   ├── layout.tsx        # Layout principal
│   │   └── page.tsx          # Página principal (POS)
│   ├── components/
│   │   ├── pos/              # Componentes del sistema POS
│   │   │   ├── catalogo.tsx  # Catálogo de productos
│   │   │   ├── modulo-pago.tsx # Módulo de pago
│   │   │   └── resumen.tsx   # Resumen del ticket
│   │   └── ui/               # Componentes UI reutilizables
│   ├── hooks/
│   │   └── useCart.ts        # Hook personalizado para carrito
│   ├── lib/
│   │   ├── supabase/         # Cliente de Supabase
│   │   ├── data/             # Datos estáticos
│   │   ├── mock/             # Datos de prueba
│   │   └── utils.ts          # Utilidades
│   └── types/
│       └── index.ts          # Definiciones de tipos TypeScript
├── public/                   # Archivos estáticos
└── package.json
```

## 💡 Uso

### Sistema POS (Página Principal)

1. **Agregar Productos**: Haz clic en los productos del catálogo para agregarlos al carrito
2. **Modificar Cantidades**: Usa los controles en el resumen para ajustar cantidades
3. **Seleccionar Método de Pago**: Elige entre Pago Móvil, Efectivo USD, Efectivo VES o Punto
4. **Ingresar Referencia**: Para Pago Móvil, ingresa los últimos 4 dígitos de la referencia
5. **Registrar Venta**: El botón se activa cuando todo está completo
6. **Modo Offline**: Las ventas se guardan localmente cuando no hay conexión

### Panel de Administración

Accede a `/admin` para ver:

- Total de ventas en USD y VES
- Cantidad de ventas realizadas
- Desglose por método de pago
- Ventas por categoría de producto
- Referencias de Pago Móvil registradas

## 🔒 Seguridad

- Validación de datos en servidor
- Manejo seguro de referencias de pago
- Autenticación con Supabase
- Variables de entorno para configuración sensible

## 📱 Responsive Design

La aplicación está optimizada para funcionar en:

- Dispositivos móviles (diseño vertical)
- Tablets
- Escritorio (diseño horizontal)

## 🔄 Sincronización Offline

El sistema automáticamente:

- Detecta cambios en el estado de conexión
- Guarda ventas localmente cuando está offline
- Sincroniza ventas pendientes cuando se restablece la conexión
- Muestra indicador de ventas pendientes de sincronización

## 🧪 Testing

Para ejecutar pruebas (cuando estén disponibles):

```bash
npm test
```

## 🏗️ Build para Producción

```bash
npm run build
npm start
```

## 📚 Recursos

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de Tailwind CSS](https://tailwindcss.com/docs)
- [Documentación de shadcn/ui](https://ui.shadcn.com)

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y confidencial.

## 👥 Soporte

Para soporte técnico, contacta al equipo de desarrollo.
