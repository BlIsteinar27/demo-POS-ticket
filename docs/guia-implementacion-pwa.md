# Guía Paso a Paso para Implementar PWA en Next.js

## Estado Actual del Proyecto

El proyecto actual **NO** es una PWA. Para convertirlo en una Progressive Web App funcional con soporte offline, se deben seguir los pasos detallados a continuación.

## Requisitos Previos

- Next.js 16.3.4 (versión actual del proyecto)
- React 19.2.8
- Node.js instalado
- Acceso a terminal para comandos

---

## Paso 1: Entender qué es una PWA

Una Progressive Web App (PWA) es una aplicación web que ofrece características similares a las aplicaciones nativas:

- **Instalación**: Puede instalarse en el dispositivo del usuario
- **Offline**: Funciona sin conexión a internet
- **Push Notifications**: Puede enviar notificaciones
- **App-like experience**: Se siente como una app nativa
- **Actualizaciones instantáneas**: Sin aprobación de app store

---

## Paso 2: Componentes Esenciales de una PWA

### 2.1 Web App Manifest
Archivo JSON que describe la aplicación:
- Nombre y nombre corto
- Iconos en diferentes tamaños
- Colores de tema
- Modo de visualización (standalone, fullscreen, etc.)
- URL de inicio

### 2.2 Service Worker
Script JavaScript que:
- Intercepta solicitudes de red
- Implementa estrategias de caché
- Permite funcionamiento offline
- Maneja sincronización en segundo plano

### 2.3 HTTPS
Las PWAs requieren HTTPS obligatoriamente (excepto en localhost)

### 2.4 Iconos PWA
Múltiples tamaños de iconos para diferentes dispositivos:
- 72x72, 96x96, 128x128, 144x144, 152x152
- 192x192, 384x384, 512x512

---

## Paso 3: Crear el Web App Manifest

### Opción A: Manifest estático (Recomendado para empezar)

Crear archivo `src/app/manifest.ts`:

```typescript
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Sistema de Gestión de Comida',
    short_name: 'POS Comida',
    description: 'Sistema de punto de venta para gestión de comida',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#E2725B',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-72x72.png',
        sizes: '72x72',
        type: 'image/png',
      },
      {
        src: '/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
      },
      {
        src: '/icon-128x128.png',
        sizes: '128x128',
        type: 'image/png',
      },
      {
        src: '/icon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
      },
      {
        src: '/icon-152x152.png',
        sizes: '152x152',
        type: 'image/png',
      },
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-384x384.png',
        sizes: '384x384',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
```

### Opción B: Manifest dinámico

Si necesitas datos dinámicos, puedes usar `app/manifest.ts/route.ts` con lógica server-side.

---

## Paso 4: Generar Iconos PWA

### Herramientas recomendadas:
- **Favicon Generator**: https://realfavicongenerator.net/
- **PWA Asset Generator**: https://www.pwabuilder.com/imageGenerator

### Pasos:
1. Sube tu logo principal (mínimo 512x512px)
2. Descarga todos los tamaños generados
3. Coloca los archivos en la carpeta `public/`
4. Asegúrate de tener los nombres correctos según tu manifest

### Estructura de carpetas:
```
public/
├── icon-72x72.png
├── icon-96x96.png
├── icon-128x128.png
├── icon-144x144.png
├── icon-152x152.png
├── icon-192x192.png
├── icon-384x384.png
├── icon-512x512.png
└── apple-touch-icon.png
```

---

## Paso 5: Crear Service Worker Manual

Crear archivo `public/sw.js`:

```javascript
const CACHE_NAME = 'pos-comida-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

// Evento de instalación - Precache de recursos
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Cache abierto');
      return cache.addAll(urlsToCache);
    })
  );
});

// Evento de activación - Limpieza de caches antiguos
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activado');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Borrando cache antiguo', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Evento fetch - Estrategia de caché
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response;
      }

      // Clone la request porque es un stream y solo se puede consumir una vez
      const fetchRequest = event.request.clone();

      return fetch(fetchRequest).then((response) => {
        // Verifica si recibimos una respuesta válida
        if (!response || response.status !== 200 || response.type === 'basic') {
          return response;
        }

        // Clona la respuesta porque es un stream
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});
```

---

## Paso 6: Registrar el Service Worker

Modificar `src/app/layout.tsx`:

```typescript
import type { Metadata } from "next";
import { Poppins, Roboto_Mono } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const robotoMono = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sistema de Gestión de Comida",
  description: "Sistema de punto de venta para gestión de comida",
  manifest: "/manifest.json",
  themeColor: "#E2725B",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "POS Comida",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${poppins.variable} ${robotoMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className="min-h-full flex flex-col font-sans select-none">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('Service Worker registrado con éxito:', registration.scope);
                  }, function(err) {
                    console.log('Error al registrar Service Worker:', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
```

---

## Paso 7: Estrategias de Caché Avanzadas

### 7.1 Cache First (para recursos estáticos)
Ideal para: CSS, JS, imágenes que no cambian frecuentemente

```javascript
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('.css') || 
      event.request.url.includes('.js') || 
      event.request.url.includes('.png')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});
```

### 7.2 Network First (para datos dinámicos)
Ideal para: API calls, datos que deben estar actualizados

```javascript
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  }
});
```

### 7.3 Stale While Revalidate
Ideal para: Balance entre velocidad y frescura

```javascript
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
        });
        return networkResponse;
      });
      return cachedResponse || fetchPromise;
    })
  );
});
```

---

## Paso 8: Implementar Fallback Offline

Crear página `src/app/offline/page.tsx`:

```typescript
export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-zinc-800 mb-2">
          Sin conexión a internet
        </h1>
        <p className="text-zinc-600 mb-4">
          Verifica tu conexión y vuelve a intentar
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#E2725B] text-white rounded-lg"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
```

Modificar service worker para usar fallback:

```javascript
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request).catch(() => {
        return caches.match('/offline');
      });
    })
  );
});
```

---

## Paso 9: Meta Tags Adicionales

Agregar en `layout.tsx`:

```typescript
export const metadata: Metadata = {
  // ... otros metadatos
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'POS Comida',
    'application-name': 'POS Comida',
    'msapplication-TileColor': '#E2725B',
    'msapplication-config': '/browserconfig.xml',
  },
};
```

---

## Paso 10: Testing de PWA

### 10.1 Chrome DevTools
1. Abre DevTools (F12)
2. Ve a la pestaña "Application"
3. Verifica:
   - **Manifest**: Debe aparecer la información del manifest
   - **Service Workers**: Debe estar activo y running
   - **Storage**: Verifica el Cache Storage

### 10.2 Lighthouse
1. Abre DevTools
2. Ve a la pestaña "Lighthouse"
3. Selecciona "Progressive Web App"
4. Ejecuta el audit

### 10.3 Testing Offline
1. En DevTools → Application → Service Workers
2. Marca "Offline"
3. Recarga la página
4. La app debe funcionar sin conexión

### 10.4 Testing en Móvil
1. Abre la app en Chrome móvil
2. Debería aparecer el prompt "Add to Home Screen"
3. Instala la app
4. Verifica que funcione como app nativa

---

## Paso 11: Consideraciones para tu Proyecto Específico

### 11.1 Datos de Supabase Offline
Tu proyecto usa Supabase para datos. Considera:

**Opción A: Caché de productos**
- Precachear la lista de productos
- Usar IndexedDB para almacenar datos offline
- Sincronizar cuando vuelva la conexión

**Opción B: Modo offline con datos locales**
- Ya tienes implementación offline en `src/lib/data/products.ts`
- El service worker debe cachear estos datos
- Considera usar Background Sync para sincronizar ventas

### 11.2 Imágenes de Productos
- Las imágenes de Supabase Storage necesitan estrategias específicas
- Considera cachear imágenes frecuentes
- Usa lazy loading para optimizar

### 11.3 Ventas Offline
- Implementa cola de ventas offline
- Usa Background Sync API cuando vuelva la conexión
- Muestra indicador de "ventas pendientes de sincronizar"

---

## Paso 12: Opciones de Librerías (Opcional)

### next-pwa (Alternativa a implementación manual)
```bash
npm install next-pwa
```

Configuración en `next.config.ts`:

```typescript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})

const nextConfig = {
  // tu config actual
}

module.exports = withPWA(nextConfig)
```

**Ventajas:**
- Configuración más simple
- Workbox integrado
- Estrategias de caché predefinidas

**Desventajas:**
- Dependencia adicional
- Menos control personalizado

---

## Paso 13: Verificación Final

### Checklist de PWA:
- [ ] Manifest creado y accesible
- [ ] Service worker registrado y activo
- [ ] Iconos en todos los tamaños requeridos
- [ ] Funciona offline
- [ ] Se puede instalar en home screen
- [ ] Meta tags correctos
- [ ] Lighthouse score > 90
- [ ] HTTPS en producción

---

## Problemas Comunes y Soluciones

### Problema: Service worker no se actualiza
**Solución:** Agregar `skipWaiting: true` en el service worker

### Problema: Iconos no aparecen
**Solución:** Verifica que los nombres coincidan con el manifest y estén en `public/`

### Problema: Offline no funciona
**Solución:** Verifica que el service worker esté interceptando las requests correctas

### Problema: Error startTime (React Compiler)
**Solución:** Ya deshabilitado en `next.config.ts`. Reinicia el servidor de desarrollo.

---

## Recursos Oficiales

- [Next.js PWA Guide](https://nextjs.org/docs/15/app/guides/progressive-web-apps)
- [MDN Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev Service Workers](https://web.dev/learn/pwa/service-workers)
- [PWA Builder](https://www.pwabuilder.com/)

---

## Nota sobre el Error startTime Actual

El error `Cannot read properties of undefined (reading 'startTime')` que aparece en la consola está relacionado con React Compiler. Ya se deshabilitó en `next.config.ts`, pero **necesitas reiniciar el servidor de desarrollo** para que el cambio surta efecto:

```bash
# Detén el servidor actual (Ctrl+C)
# Luego reinicia:
npm run dev
```

Esto debería resolver el error tanto en la página home como en la vista de productos.
