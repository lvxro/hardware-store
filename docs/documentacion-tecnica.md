# Documentación técnica de aura/ware

Cómo está armada la tienda, cómo instalarla y cómo seguir el trabajo. Es el entregable de la tarjeta **T-064**.
El README tiene el detalle de cada función con su tarjeta; este documento es el mapa general.

| | |
|---|---|
| Sitio publicado | https://aurawarestore.vercel.app |
| Repositorio | https://github.com/lvxro/hardware-store |
| Base de datos | Supabase (Postgres) |
| Pagos | Mercado Pago, Checkout Pro |
| Hosting | Vercel (sitio y funciones) |

## 1. Qué es

Una tienda online de componentes y periféricos de PC. El cliente mira productos, arma un carrito, crea una cuenta, paga con Mercado Pago, ve sus pedidos y el estado del envío. Un administrador carga productos, controla el stock y marca los envíos.

Hay tres roles:

| Rol | Qué puede hacer |
|---|---|
| Visitante | Ver productos, buscar, filtrar, comparar, armar una PC, usar el carrito y los favoritos |
| Cliente (cuenta con correo confirmado) | Todo lo anterior, más pagar, ver Mis pedidos y recuperar la contraseña |
| Administrador (correo en la tabla `administradores`) | Todo lo anterior, más el panel `/admin`: productos, stock, historial de stock, pedidos y envíos |

## 2. Tecnologías

| Parte | Tecnología |
|---|---|
| Interfaz | React 19, React Router 7, Tailwind CSS 4 |
| Empaquetado | Vite 8 |
| Cuentas y base de datos | Supabase (Auth, Postgres, reglas RLS), `@supabase/supabase-js` |
| Pagos | Mercado Pago (`mercadopago`), funciones de Vercel en `api/` |
| Correo | `nodemailer` por SMTP |
| Calidad | ESLint (`npm run lint`) |

No hay servidor propio: lo que no puede hacer el navegador lo hacen las funciones de `api/` (Vercel) y las funciones de Postgres (Supabase).

## 3. Cómo está armado

```
Navegador (React)
  │  lee productos, cuentas, pedidos propios  ──►  Supabase  (Auth + Postgres con RLS)
  │  pide el pago  ──►  api/checkout.js ──────────►  Mercado Pago
  │                                                    │ avisa el pago
  │                                  api/webhook.js ◄──┘
  └─ vuelve de Mercado Pago ──►  api/confirmar.js     (pone el pedido al día)
                                  └─► Supabase (clave secreta) + mail del comprobante
```

La regla que ordena todo: **el navegador nunca decide plata ni estados**. Los precios, el envío y el estado del pago los calcula el servidor; la seguridad de los datos está en Supabase y no en las pantallas.

### Carpetas

| Carpeta | Contenido |
|---|---|
| `src/pages/` | Una pantalla por ruta (ver sección 4) |
| `src/components/` | Piezas que se repiten: encabezado, tarjeta de producto, seguimiento de envío, compatibilidad |
| `src/data/` | Lógica y reglas sin pantalla: catálogo, precios, carrito, sesión, envío, compatibilidad, pedidos |
| `api/` | Funciones de Vercel: checkout, webhook, confirmar, producto (vista previa) |
| `api/_lib/` | Lo que comparten las funciones: cliente de Supabase, pedidos, comprobante por mail |
| `supabase/` | Scripts SQL y plantillas de correo que se cargan en el panel de Supabase |
| `public/` | Imágenes, íconos y `precarga.js` |
| `scripts/` | `generar-seed.mjs`: arma `supabase/seed.sql` desde `src/data/productos.json` |

### Reglas compartidas entre el navegador y el servidor

Estos archivos no importan nada del navegador, así que los usan las pantallas y también `api/`. Así lo que ve el cliente es lo mismo que cobra el servidor.

| Archivo | Qué define |
|---|---|
| `src/data/precios.js` | El dólar de referencia y la conversión a pesos |
| `src/data/reglas.js` | Descuento por efectivo (10 %), cuotas, envío gratis desde USD 500 |
| `src/data/envio.js` | Zonas y tarifas por código postal, costo del envío |
| `src/data/ofertas.js` | Qué productos están en oferta y el descuento (25 %) |

## 4. Pantallas y rutas

| Ruta | Pantalla | Quién |
|---|---|---|
| `/` | Home | Todos |
| `/productos`, `/categoria/:slug`, `/ofertas` | Listado con filtros, orden y rango de precio | Todos |
| `/producto/:id` | Ficha con especificaciones, cuotas y cálculo de envío | Todos |
| `/carrito` | Carrito, compatibilidad, envío y pago | Todos (pagar pide cuenta) |
| `/favoritos` | Lista de favoritos | Todos |
| `/arma-tu-pc` | Armador de PC paso a paso | Todos |
| `/comparador` | Comparador de productos | Todos |
| `/registro`, `/ingresar`, `/cuenta-confirmada` | Cuentas | Todos |
| `/recuperar-contrasena`, `/nueva-contrasena` | Recuperar contraseña | Todos |
| `/compra/:estado` | Página de gracias (aprobada, pendiente, rechazada) | Cliente |
| `/mis-pedidos` | Historial y seguimiento del envío | Cliente |
| `/admin` | Panel de administración | Administrador |

## 5. Flujos importantes

### 5.1 Una compra, de punta a punta

1. El cliente carga el carrito (se guarda en el navegador) y escribe su código postal.
2. Toca **Pagar**. El navegador manda a `api/checkout.js` **solo** los códigos de producto, las cantidades y el código postal.
3. `api/checkout.js` verifica la sesión, comprueba que el correo esté confirmado, vuelve a leer precio y stock de Supabase, calcula el envío, anota un pedido (`pedidos`) y crea el pago en Mercado Pago. Devuelve la dirección de pago.
4. El cliente paga en Mercado Pago y vuelve a `/compra/:estado`.
5. Mercado Pago avisa a `api/webhook.js` y, en paralelo, la página de gracias llama a `api/confirmar.js`. Las dos consultan el pago a Mercado Pago con nuestro token y actualizan el pedido con `api/_lib/pedidos.js`.
6. Cuando el pago queda aprobado se descuenta el stock una sola vez (`descontar_stock`) y se manda el comprobante por correo una sola vez (`mail_enviado`).

Por qué hay dos caminos al paso 5: el aviso de Mercado Pago a veces tarda o falla, y `confirmar.js` hace que el pedido quede al día igual.

### 5.2 Envío (T-047 y T-048)

- **Costo:** `src/data/envio.js` define ocho zonas por rango de código postal. Es gratis desde `ENVIO_GRATIS_DESDE`. El servidor lo recalcula y lo cobra como un renglón más del pago. El total del pedido lo incluye y el envío se obtiene como *total menos productos*, por eso no tiene columna propia.
- **Estado:** `envio` en `pedidos` (`preparando`, `en_camino`, `entregado`). Solo se cambia con la función `cambiar_envio`, que acepta únicamente administradores y pedidos con el pago aprobado. El estado del pago nunca se toca.

### 5.3 Stock

El stock cambia por tres caminos: el panel de administración (función `ajustar_stock`, que pide un motivo), una venta aprobada (`descontar_stock`, que solo puede llamar el servidor) o una edición directa de la fila de `productos` por un administrador. Un trigger de Postgres anota **cualquiera** de los tres en `movimientos_stock` con quién, cuándo, cuántas unidades y por qué (una edición directa queda con el motivo `edicion` y una venta con el suyo, así se distinguen de un ajuste hecho desde el panel).

### 5.4 Cuentas

Supabase Auth con correo y contraseña (mínimo 8 caracteres). El registro manda un correo de confirmación; el enlace vuelve a `/cuenta-confirmada`. Recuperar contraseña usa `resetPasswordForEmail` y `updateUser`. Las plantillas de los correos están en `supabase/*.html`.

## 6. Base de datos

Tablas, todas con **RLS activado**:

| Tabla | Para qué | Quién lee | Quién escribe |
|---|---|---|---|
| `productos` | Catálogo, precio en USD, stock, `specs` (jsonb) | Cualquiera | Administradores |
| `pedidos` | Compras: ítems, total, estado, pago, envío | El cliente (por su correo) y los administradores | Solo el servidor (clave secreta) y las funciones |
| `movimientos_stock` | Historial de cambios de stock | Administradores | El trigger y las funciones |
| `administradores` | Lista de correos con acceso al panel | Nadie desde la web | Se carga a mano en Supabase |

Funciones de Postgres:

| Función | Qué hace | Quién puede llamarla |
|---|---|---|
| `es_admin()` | Dice si el correo de la sesión está en `administradores`; la usan las reglas RLS | Todos (devuelve falso si no es admin) |
| `ajustar_stock(producto, stock, motivo, nota)` | Cambia el stock y deja el motivo | Administradores |
| `descontar_stock(pedido)` | Descuenta el stock de un pedido pagado, una sola vez | Solo el servidor |
| `cambiar_envio(pedido, envio)` | Cambia el estado de envío | Administradores |
| `anotar_movimiento_stock()` | Trigger: escribe el historial | Automático |

### Scripts SQL: en qué orden correrlos

En Supabase → SQL Editor, una base nueva necesita, en este orden:

1. `tabla-productos.sql` y `seed.sql` (productos y carga inicial)
2. `tabla-pedidos.sql`
3. `admin-stock.sql` (stock, tabla `administradores`, reglas de escritura)
4. `pedidos-historial.sql` (lectura de pedidos para clientes y administradores)
5. `historial-stock.sql` (historial de movimientos y `ajustar_stock`)
6. `estado-envio.sql` (estado de envío)

Los scripts se pueden volver a correr sin romper nada. Después hay que cargar en `administradores` el correo de cada administrador.

## 7. Variables de entorno (Vercel → Settings → Environment Variables)

Nunca van en el código. Después de cambiarlas hay que volver a desplegar.

| Variable | Obligatoria | Para qué |
|---|---|---|
| `MP_ACCESS_TOKEN` | Sí | Access Token de Mercado Pago (de prueba o de producción) |
| `SUPABASE_SERVICE_ROLE_KEY` | Sí | Clave secreta de Supabase para anotar pedidos. Sin ella el pago se cobra pero el pedido no queda anotado |
| `MP_WEBHOOK_SECRET` | Recomendada | Clave de firma de los avisos de Mercado Pago |
| `MP_WEBHOOK_ESTRICTO` | No | Con `1`, rechaza avisos con firma inválida |
| `SITIO_URL` | No | Dirección pública del sitio; si falta se toma de la solicitud |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Para el correo | Servidor de correo del comprobante. Sin ellas el pago funciona, pero no sale el mail |
| `MAIL_REMITENTE` | No | Remitente, por ejemplo `aura/ware <ventas@dominio.com>` |

El navegador solo conoce la URL de Supabase y la clave pública, que están en `src/data/supabase.js` y no dan acceso a nada que las reglas RLS no permitan.

Configuración de Supabase Auth (Authentication → URL Configuration): la Site URL es la del sitio publicado y las Redirect URLs incluyen el sitio y `http://localhost:5173`. Para que lleguen los correos de confirmación y de recuperar contraseña, Supabase necesita un **SMTP propio** (Authentication → SMTP Settings): con su servicio de fábrica solo entrega a miembros de la organización y con un límite muy bajo.

## 8. Cómo instalarla

Requisitos: Node.js (el proyecto no fija una versión; se probó con Node 22) y una cuenta de Supabase.

```bash
git clone https://github.com/lvxro/hardware-store.git
cd hardware-store
npm ci
npm run dev        # http://localhost:5173
```

- `npm run dev` levanta solo la parte de React. Sin Supabase la tienda usa `src/data/productos.json` como respaldo, aunque tarda unos 5 segundos en decidirlo.
- Para probar el pago en la computadora hace falta `npx vercel dev` con las variables en `.env.local` (que no se sube). Mercado Pago no vuelve solo a la tienda ni avisa al webhook si la dirección es `http`.
- Para usar otro proyecto de Supabase hay que cambiar la URL y la clave pública en `src/data/supabase.js` y la dirección en `connect-src` de `vercel.json`.

Comandos: `npm run lint` (revisión de código), `npm run build` (versión de producción en `dist/`), `npm run preview`.

## 9. Publicación

Vercel publica solo cada vez que se actualiza `main`. Cada rama y cada pull request tienen además una vista previa propia. `vercel.json` define:

- la redirección de todas las rutas a `index.html` y de `/producto/:id` a `api/producto.js` (vista previa al compartir);
- los encabezados de seguridad (política de contenido, bloqueo de iframes, HSTS);
- el caché: un año para `/assets`, sin caché para `/api`.

## 10. Seguridad

| Medida | Dónde |
|---|---|
| Los datos están protegidos por reglas RLS, no por las pantallas | `supabase/*.sql` |
| Precios, stock y envío se recalculan en el servidor; el navegador solo manda códigos y cantidades | `api/checkout.js` |
| Comprar exige sesión y correo confirmado; el correo del pedido sale de la sesión, no del navegador | `api/checkout.js` |
| El estado del pago sale siempre de Mercado Pago, consultado con nuestro token | `api/_lib/pedidos.js` |
| Stock y mail del comprobante se aplican una sola vez por pedido | `stock_descontado`, `mail_enviado` |
| La clave secreta de Supabase solo vive en Vercel | variables de entorno |
| Encabezados de seguridad y política de contenido | `vercel.json` |
| `npm audit` sin vulnerabilidades en las dependencias de producción | |

Observaciones conocidas del panel de seguridad de Supabase (todas revisadas):

- `es_admin()` la puede ejecutar cualquiera por `/rest/v1/rpc/es_admin`. Es a propósito: las reglas RLS la necesitan y solo devuelve verdadero o falso para la sesión que la llama.
- `administradores` no tiene reglas de lectura. También es a propósito: nadie la lee desde la web y solo `es_admin()` la consulta.
- La protección contra contraseñas filtradas (Authentication → Sign In / Providers → Password security) está desactivada. Conviene activarla si el plan de Supabase lo permite.

## 11. Cómo seguir el trabajo

- **Ramas y commits:** una rama por tarjeta (`feature/T-XXX-nombre`), commits que mencionan el ID y todo entra a `main` por pull request.
- **Revisión cruzada:** Alvaro revisa a Gabriel, Gabriel revisa a Juan y Juan revisa a Alvaro. Una tarjeta pasa a *Hecho* solo cuando su pull request está mergeado.
- **Tablero y documentación:** el Google Sheet del equipo (hojas Tareas, Sprints, Documentación y Retrospectiva) tiene el estado de cada tarjeta y qué se hizo en cada sprint.
- **Agregar una función:** si toca la base, se escribe un script en `supabase/` que se pueda correr más de una vez; si toca el cobro, el cálculo va en el servidor; si la regla la ven el navegador y el servidor, va en un archivo de `src/data/` sin importaciones del navegador; y se agrega su sección al README.

## 12. Lo que queda fuera de esta versión

- Cobrar con credenciales de producción de Mercado Pago (T-044, queda en el backlog por decisión del equipo).
- Factura electrónica de ARCA: el comprobante por correo dice "Documento no válido como factura".
- Las tarifas de envío son de ejemplo y hay que ajustarlas a las del correo real (`src/data/envio.js`).
- Fotos reales de los productos (T-042): hoy se muestran dibujos hechos para el sitio.
