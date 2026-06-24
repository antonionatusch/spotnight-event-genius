# SpotNight

SpotNight es un MVP mobile-first para digitalizar reservas, mesas VIP y control de ingreso en boliches y eventos nocturnos. La demo está desplegada en:

https://spotnight.netlify.app/

## Contexto

SpotNight nace como proyecto académico de la materia **Gestión de la Innovación Tecnológica y Emprendimiento - IT513**. El problema identificado en la noche cruceña es la operación informal mediante listas de WhatsApp, reservas manuales, poca trazabilidad, favoritismo en puerta y conflictos por mesas o ingresos.

La propuesta de valor es unificar en una sola plataforma:

- Exploración de eventos.
- Reserva de entradas, mesas, sillas o zonas VIP.
- Selección visual de ubicación mediante croquis interactivo.
- Generación de QR/código de reserva.
- Validación de ingreso por staff.
- Dashboard operativo para propietarios.
- Auditoría de eventos como ingresos, duplicados y cancelaciones.

## Producto

El MVP está pensado para demostrar valor de negocio ante docentes, usuarios piloto, dueños de boliches e inversionistas. La solución apunta a boliches, clubes nocturnos, promotores y organizadores de eventos que necesitan ordenar la operación de reservas y acceso sin depender de hardware especializado.

## Roles De Demo

- **Usuario:** explora eventos, reserva, selecciona ubicación y recibe su QR.
- **Propietario:** revisa métricas, eventos, reservas y puede cancelar reservas.
- **Staff:** valida QRs en puerta y puede cancelar reservas por código.

## Accesos

| Panel       | Ruta               | Contraseña  |
| ----------- | ------------------ | ----------- |
| Propietario | `/owner/dashboard` | `owner2026` |
| Staff       | `/staff/check-in`  | `staff2026` |

Estas contraseñas son solo para la demo académica. No representan un sistema de autenticación productivo.

## Video demostrativo

Se puede encontrar en [Google Drive.](https://drive.google.com/file/d/1aMSLxXmieE5mJYCS73MbYygwCu48zHrV/view?usp=sharing)

## Flujos Principales

1. Home: el usuario entra a `/` y revisa eventos disponibles.
2. Detalle: entra a `/event/:id` para ver descripción, horario, ubicación y tickets.
3. Selección de ubicación: para mesa, silla o VIP entra a `/select-table/:eventId` y usa el croquis de La Tuti Viruli.
4. Reserva: confirma datos en `/reserve/:eventId`.
5. QR: obtiene su comprobante en `/reservation/:id`.
6. Staff: valida el ingreso desde `/staff/check-in` escaneando QR o ingresando el código manualmente.
7. Propietario: revisa métricas y reservas desde `/owner/dashboard`.

## Reglas De Cancelación

- Si el **propietario** cancela una reserva, el usuario recibe un popup en tiempo real indicando que la reserva fue cancelada y que **no habrá devoluciones**.
- Si el **staff** cancela una reserva, el usuario recibe un popup en tiempo real indicando que **sí corresponde devolución** y que debe coordinarla con el staff.
- Las cancelaciones se registran como eventos de auditoría para diferenciar quién hizo la acción.

## Funcionalidades Implementadas

- Interfaz mobile-first con estética nightlife premium.
- Selector de roles para demo.
- Croquis interactivo de La Tuti Viruli con Planta Baja y Planta Alta/VIP.
- Estados de ubicación: disponible, seleccionada, reservada y ocupada.
- Reservas con estado `Confirmada`, `Ingresó` o `Cancelada`.
- QR con datos de reserva, evento, tipo de ticket y ubicación.
- Control de ingreso por cámara o código manual.
- Detección de QR duplicado.
- Dashboard de propietario con métricas de reservas, ingresos y ocupación.
- Sincronización con Supabase si las variables de entorno están configuradas.
- Fallback local con datos mock para demo.
- Pipeline CI/CD hacia Netlify mediante GitHub Actions.

## Stack

- React 19
- TypeScript
- Vite
- TanStack Router / TanStack Start
- Tailwind CSS
- Zustand
- Supabase
- Capacitor
- Netlify

## Requisitos Locales

- Node.js `20.19+` o `22.12+`.
- npm.
- Android Studio si se quiere probar Capacitor en Android.

## Variables De Entorno

Crear un archivo `.env` basado en `.env.template`:

```bash
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_PUBLISHABLE_KEY=tu_publishable_key
```

El código también acepta `VITE_SUPABASE_ANON_KEY` como alternativa a `VITE_SUPABASE_PUBLISHABLE_KEY`.

## Uso Local

Instalar dependencias:

```bash
npm ci
```

Levantar desarrollo:

```bash
npm run dev
```

La app usa Vite y está configurada para correr en el puerto `8081`.

Build de producción:

```bash
npm run build
```

El build publica los archivos estáticos en:

```txt
dist/client
```

Preview local del build:

```bash
npm run preview
```

Lint:

```bash
npm run lint
```

Formateo:

```bash
npm run format
```

## Capacitor

Generar build web y sincronizar Android:

```bash
npm run cap:build
```

Abrir Android Studio:

```bash
npm run cap:open
```

El script `cap:build` ejecuta internamente:

```bash
npm run build && npx cap sync android
```

## Netlify

Configuración usada por `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist/client"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

El redirect permite que rutas como `/event/:id`, `/owner/dashboard` o `/staff/check-in` funcionen al refrescar la página.

## CI/CD

El workflow `.github/workflows/netlify-deploy.yml` ejecuta:

- `npm ci`
- `npm run build`
- deploy a Netlify en cada push a `main`

Secrets necesarios en GitHub:

```txt
NETLIFY_AUTH_TOKEN
NETLIFY_SITE_ID
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

Si los secrets están guardados en un environment de GitHub llamado `Prod`, el workflow puede declarar `environment: Prod` para acceder a ellos.

## Equipo Académico

- Ana Isabela Aguilera Balcázar
- Jorge Marco Araníbar Román
- Juan Sebastián Giles Zapata
- Antonio Miguel Natusch Zarco

Docente: Dra. Karem Esther Infantas Soto.

## Nota

Este repositorio es un MVP de demostración. Algunas funciones usan datos mock o Supabase según configuración. No incluye pagos reales ni autenticación productiva.
