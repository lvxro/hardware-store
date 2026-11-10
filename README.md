# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Base de datos (Supabase)

Los productos están en la tabla `productos` de Supabase y la tienda los lee desde `src/data/catalogo.js`.

- **Agregar o editar productos:** desde el panel de Supabase, en Table Editor → `productos`. Lo que cambia según la categoría (socket, núcleos, etc.) va en la columna `specs`.
- **`supabase/tabla-productos.sql`:** cómo se creó la tabla. La web solo puede leerla.
- **`supabase/seed.sql`:** la carga inicial de productos. Se genera con `node scripts/generar-seed.mjs` a partir de `src/data/productos.json`.
- **Respaldo:** si Supabase no responde, la tienda muestra los productos de `src/data/productos.json` y avisa en la consola del navegador.

## Cuentas de usuario (T-019)

El registro y el inicio de sesión los maneja Supabase Auth (correo y contraseña), sin backend propio. La contraseña la guarda Supabase cifrada; nuestro código nunca la almacena.

- **Páginas:** `/registro` y `/ingresar` (`src/pages/Acceso.jsx`). En el encabezado, el ícono de persona lleva a iniciar sesión; con sesión abierta muestra la inicial del cliente y un menú con "Cerrar sesión".
- **Lógica:** `src/data/sesion.js` (`useSesion`), que vive en `App` igual que el carrito. La sesión se guarda en el navegador y se renueva sola.
- **Configuración en el panel de Supabase** (Authentication):
  - Providers → Email activado.
  - URL Configuration → Site URL `https://aurawarestore.vercel.app` y, en Redirect URLs, también `http://localhost:5173`, para que el enlace del correo de confirmación vuelva a la tienda.
  - Si "Confirm email" está activado, tras registrarse el cliente debe confirmar su correo antes de ingresar; la web ya muestra ese aviso.

### Correo de confirmación

Al registrarse, el cliente recibe un mail para verificar su correo. El diseño está en `supabase/plantilla-confirmar-correo.html`. Al tocar el botón, Supabase confirma la cuenta, abre la sesión y lo manda a `/cuenta-confirmada` (`src/pages/CuentaConfirmada.jsx`), que lo lleva a la tienda a los pocos segundos. Si el enlace venció o ya se usó, esa página lo avisa.

La plantilla no se aplica sola: hay que cargarla en el panel de Supabase.

- **Authentication → Email Templates → Confirm signup:** asunto `Verificá tu cuenta en aura/ware` y, como contenido, el HTML de `supabase/plantilla-confirmar-correo.html`. El enlace del botón es `{{ .ConfirmationURL }}`, que completa Supabase.
- **Authentication → URL Configuration → Redirect URLs:** agregar `https://aurawarestore.vercel.app/**` y `http://localhost:5173/**`. Si la dirección no está en la lista, Supabase manda al cliente a la Site URL y se pierde la página de confirmación.
- **Vencimiento:** el mail dice que el enlace expira en 15 minutos. Hay que poner la expiración del correo en 900 segundos (Authentication → Providers → Email); por defecto es 1 hora.
- **Remitente:** con el envío de mails que trae Supabase, el remitente es el de Supabase. Para que figure `aura/ware` hace falta configurar un SMTP propio (Authentication → SMTP Settings) con un dominio del equipo.

### Recuperar contraseña (T-028)

Si el cliente se olvida la contraseña, en `/ingresar` toca "¿Te olvidaste la contraseña?" y llega a `/recuperar-contrasena` (`src/pages/RecuperarContrasena.jsx`). Escribe su correo y Supabase le manda un mail con un botón. Al tocarlo vuelve a `/nueva-contrasena` (`src/pages/NuevaContrasena.jsx`), donde elige la contraseña nueva (mínimo 8 caracteres, repetida) y queda con la sesión abierta. La lógica está en `src/data/sesion.js` (`pedirRecuperacion` y `cambiarClave`).

- La pantalla no dice si el correo tiene cuenta o no, así nadie puede averiguar qué correos están registrados.
- Al cambiar la contraseña se cierran las sesiones de los demás dispositivos; la actual sigue abierta.
- Si el enlace venció o ya se usó, `/nueva-contrasena` lo avisa y ofrece pedir uno nuevo.
- Los errores de Supabase (misma contraseña que la actual, demasiados intentos, mail que no salió) se traducen a mensajes en español.

Para que funcione hay que cargar el mail en el panel de Supabase, igual que el de confirmación:

- **Authentication → Emails → Reset password:** asunto `Cambiá tu contraseña en aura/ware` y, como contenido, el HTML de `supabase/plantilla-recuperar-contrasena.html`.
- **Redirect URLs:** las mismas del mail de confirmación (`https://aurawarestore.vercel.app/**` y `http://localhost:5173/**`). Si falta alguna, el enlace no vuelve a `/nueva-contrasena`.
- **SMTP propio:** el envío que trae Supabase tiene un límite muy bajo de mails por hora y no deja usar plantillas propias. Hace falta el mismo SMTP que para el mail de confirmación.
- **Vencimiento:** el mail dice 15 minutos, que es la misma configuración del mail de confirmación (900 segundos).

## Ofertas (T-021)

La tienda tiene 6 productos en oferta, con el 25 % menos que su precio de lista. Se ven en el home (sección "Ofertas"), en la página `/ofertas` y en cada tarjeta, ficha y carrito: primero el precio de lista tachado y abajo el precio de oferta.

- Qué productos están en oferta y cuánto se descuenta se define en `src/data/ofertas.js` (`IDS_EN_OFERTA` y `DESCUENTO_OFERTA`). Para cambiarlos, se reemplazan los id por otros de la tabla `productos` de Supabase.
- En un producto en oferta, `precio` ya es el precio con el 25 % menos y `precioAnterior` es el de lista. Todo lo demás (carrito, cuotas, envío gratis) parte de `precio`.
- El 10 % por pago en efectivo se calcula sobre el precio de oferta.
- En el listado, "Ofertas" reemplaza a "Destacados" en "Ordenar por": muestra primero los productos en oferta.

## Pago con Mercado Pago (T-022)

El botón "Pagar con Mercado Pago" del carrito usa Checkout Pro: el cliente paga en la página de Mercado Pago (tarjeta, débito, dinero en cuenta, cuotas) y vuelve a la tienda.

- **Cómo funciona:** el carrito manda solo los id y las cantidades a `api/checkout.js` (una función de Vercel). Esa función lee los precios de Supabase, los pasa a pesos con el mismo cálculo que la tienda (`src/data/precios.js`, ofertas incluidas) y le pide el pago a Mercado Pago. Así nadie puede cambiar el precio desde el navegador.
- **Qué se cobra:** el total de lista. El 10 % de efectivo/transferencia no se aplica en Mercado Pago. El envío sí se cobra, como un renglón más del pago (T-048): se calcula en el servidor con el código postal.
- **Vuelta a la tienda:** `/compra/aprobada`, `/compra/pendiente` y `/compra/rechazada` (`src/pages/ResultadoPago.jsx`). Con el pago aprobado, el carrito se vacía.
- **Confirmación del cobro:** Mercado Pago avisa cada pago a `api/webhook.js`, que lo consulta y lo deja en los logs de Vercel. La página `/compra/aprobada` sola no prueba que se cobró. Cuando haya tabla de pedidos, ahí se guarda.

### Configuración

En Vercel → Settings → Environment Variables:

- `MP_ACCESS_TOKEN` (obligatoria): el Access Token de la aplicación en Mercado Pago Developers. Primero el de prueba (credenciales de prueba); para cobrar de verdad, el de producción.
- `MP_WEBHOOK_SECRET` (recomendada): la clave secreta de Webhooks de la aplicación. Con ella, el webhook rechaza avisos que no vengan de Mercado Pago.
- `SITIO_URL` (opcional): por ejemplo `https://aurawarestore.vercel.app`. Si no está, se usa la dirección desde la que se pidió el pago.

Después de cargarlas hay que volver a desplegar. En el panel de Mercado Pago, en Webhooks, la URL es `https://aurawarestore.vercel.app/api/webhook` con el evento "Pagos".

### Probar en la computadora

`npm run dev` no levanta las funciones de `api/`. Para probar el pago en local: `npx vercel dev` (con las variables en `.env.local`, que no se sube). En `http` Mercado Pago no vuelve solo a la tienda ni avisa al webhook: eso se prueba en el deploy de Vercel.

## Pedidos y comprobante por mail (T-024)

Cada vez que alguien toca "Pagar con Mercado Pago" se anota un pedido en la tabla `pedidos` de Supabase (`supabase/tabla-pedidos.sql`). Cuando Mercado Pago avisa que el pago se aprobó, `api/webhook.js` marca el pedido como aprobado y le manda al cliente el comprobante de aura/ware por mail (`api/_lib/comprobante.js`, misma estética que el mail de confirmación de cuenta). Mercado Pago repite los avisos, pero el mail sale una sola vez. Aparte, Mercado Pago manda su propio comprobante de pago.

El mail va al correo de la cuenta de la tienda; si el cliente compró sin iniciar sesión, al que usó en Mercado Pago. Dice "Documento no válido como factura": la factura electrónica de ARCA es otro trámite.

### Configuración

1. **Tabla:** en Supabase → SQL Editor, correr `supabase/tabla-pedidos.sql`.
2. **Clave secreta de Supabase:** en Supabase → Project Settings → API Keys, la clave `service_role` (o la "secret"). En Vercel, como `SUPABASE_SERVICE_ROLE_KEY`. Nunca va en el código ni en el navegador.
3. **Correo (SMTP)**, en Vercel:
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
   - `MAIL_REMITENTE` (opcional), por ejemplo `aura/ware <ventas@tudominio.com>`
   - Con Gmail: `smtp.gmail.com`, puerto `465`, la casilla como usuario y una "contraseña de aplicación" (Cuenta de Google → Seguridad → Verificación en dos pasos → Contraseñas de aplicaciones).
   - Con Resend (necesita dominio propio): `smtp.resend.com`, puerto `465`, usuario `resend` y la API key como contraseña.

Después, redesplegar. Sin estas variables el pago funciona igual, solo que no se anotan pedidos ni sale el mail.

## Panel de administración y stock (T-025)

En `/admin` un administrador agrega, edita y borra productos y ajusta el stock. La seguridad está en Supabase: aunque alguien abra la página, la base de datos solo deja cambiar productos a los correos de la tabla `administradores`.

1. En Supabase → SQL Editor, correr `supabase/admin-stock.sql` (crea la columna `stock`, la tabla `administradores` y las reglas). Los productos que ya estaban arrancan con 10 unidades.
2. Agregar los administradores, con una cuenta ya creada y confirmada en la tienda:
   `insert into public.administradores (correo) values ('correo@ejemplo.com');` (en minúsculas)
3. Con esa cuenta, el menú de la cuenta muestra "Panel de administración".

La tienda muestra "Sin stock" y "Últimas unidades", y no deja agregar más de lo que hay. `api/checkout.js` vuelve a controlar el stock antes de cobrar, y `api/webhook.js` lo descuenta cuando Mercado Pago aprueba el pago (necesita `SUPABASE_SERVICE_ROLE_KEY` y la tabla `pedidos`).

## Filtro de precio (T-026) y favoritos (T-027)

- En cada listado, "Precio" desde/hasta (precio de lista), combinable con marca y orden.
- El corazón de cada producto lo guarda en `/favoritos`. Se guarda en el navegador, como el carrito.

## Compatibilidad (T-029)

`src/data/compatibilidad.js` cruza procesador y placa madre (socket), memoria con placa o procesador (DDR4/DDR5), avisa si un procesador no tiene video integrado y estima la fuente. Se ve en el carrito (panel "Compatibilidad"), en la ficha y en las tarjetas, y en procesadores, placas y memorias aparece "Solo compatibles con tu carrito".

## Velocidad y seguridad (T-028, T-030)

- `public/precarga.js` pide el catálogo mientras baja el resto del sitio, y guarda una copia por 10 minutos para que las visitas siguientes no esperen a Supabase. El precio y el stock que valen se vuelven a leer al pagar.
- Las páginas y la biblioteca de Supabase se bajan aparte, cuando hacen falta. `/assets` queda en caché por un año.
- `vercel.json` agrega encabezados de seguridad: política de contenido (CSP) que solo permite scripts propios, nada de iframes de otros sitios, HSTS y otros.
- `api/checkout.js` solo acepta pedidos de la propia tienda, en JSON y con códigos de producto válidos.
- Si se suma un servicio externo (analytics, chat, etc.), hay que agregarlo a la CSP en `vercel.json` o el navegador lo va a bloquear.

## Historial de pedidos y compra con cuenta (T-031)

- Para comprar hace falta una cuenta con el correo confirmado. `api/checkout.js` verifica la sesión con Supabase y el pedido queda a nombre de ese correo (no del que mande el navegador). Sin sesión, el carrito muestra "Iniciá sesión para comprar" y vuelve al carrito después de entrar.
- `/mis-pedidos` (menú de la cuenta → Mis pedidos): cada cliente ve sus compras con fecha, productos, total, estado y número de operación.
- `/admin` → pestaña Pedidos: todas las ventas, total vendido, ventas del día, búsqueda y filtro por estado.
- Configuración: correr `supabase/pedidos-historial.sql` (reglas de lectura) y tener `SUPABASE_SERVICE_ROLE_KEY` en Vercel, que es lo que permite registrar los pedidos.

## Títulos por página y vista previa al compartir (T-051)

**Título de la pestaña.** Cada pantalla pone el suyo con el hook `useTitulo` (`src/data/titulo.js`): "Procesadores · aura/ware", "Carrito · aura/ware", y en la ficha el nombre del producto. El inicio deja el general del sitio. Así se distinguen en el historial, en los favoritos del navegador y en las pestañas abiertas.

**Vista previa al compartir.** WhatsApp, Instagram o Discord no ejecutan JavaScript: leen las etiquetas Open Graph del HTML. Como la tienda arma las pantallas en el navegador, todas las direcciones devolvían el mismo `index.html`. Ahora:

- `index.html` trae la vista previa general del sitio, con la imagen `public/og-auraware.png` (1200 × 630).
- `vercel.json` manda `/producto/:id` a la función `api/producto.js`, que devuelve ese mismo `index.html` con el nombre, el precio (de oferta si corresponde), el precio en efectivo y la descripción del producto. Para el cliente no cambia nada: React carga igual.
- Si el producto no existe, el código no tiene la forma de un código del catálogo o Supabase no responde, se devuelve la página común y la tienda decide qué mostrar.
- La respuesta se guarda 5 minutos en la caché de Vercel, para no consultar Supabase en cada pedido.

Para probarlo, después de publicar, pegar el enlace de un producto en WhatsApp o en <https://www.opengraph.xyz>. Si cambia el precio y la vista previa muestra el viejo, WhatsApp la guarda por su cuenta: se renueva con un enlace distinto (por ejemplo, agregando `?v=2`).

Limitación: todos los productos usan la misma imagen de la marca, porque todavía no hay fotos reales (T-042). Cuando estén en `public/img`, `api/producto.js` puede usarlas.

## Historial de stock (T-052)

Cada cambio de stock queda anotado en la tabla `movimientos_stock`: cuándo, quién, cuántas unidades, de cuánto a cuánto y por qué. Se ve en `/admin`, pestaña **Historial de stock**, o con el botón **Historial** de cada producto.

- **Cómo se anota:** lo hace la base de datos con un trigger sobre `productos`, así no se escapa ningún cambio (panel, ventas o Table Editor). Nadie puede editar ni borrar el historial desde la web; solo los administradores lo leen.
- **Motivos:** al ajustar el stock desde el panel se elige uno: ingreso de mercadería, corrección de conteo, devolución, rotura o pérdida, u otro, con una nota opcional. Las ventas de Mercado Pago quedan como **Venta** con el número de pedido, y no se pueden cargar a mano, así que se distinguen siempre. Los cambios desde "Editar producto", las altas, las bajas y los cambios hechos en el panel de Supabase llevan su propio motivo.
- **Para activarlo:** correr `supabase/historial-stock.sql` en Supabase → SQL Editor (después de `admin-stock.sql`). Hasta que se corra, el panel sigue guardando el stock como antes y la pestaña avisa que falta el archivo.

## Estado de envío del pedido (T-047)

El estado del pago (aprobado, pendiente...) lo escribe Mercado Pago y no se toca. El envío va aparte, en tres columnas nuevas de `pedidos`: `envio` (`preparando`, `en_camino` o `entregado`; vacío si todavía no se empezó), `envio_actualizado` y `envio_por` (el correo de quien lo cambió).

- **Administrador:** en `/admin` → Pedidos, al abrir un pedido con el pago aprobado aparecen los botones **Preparando / En camino / Entregado**. En la lista se ve el envío al lado del estado, y el filtro **Por enviar** muestra los pagados que todavía no se entregaron.
- **Cliente:** en `/mis-pedidos`, los pedidos aprobados muestran una barra de cuatro pasos (Pago aprobado → Preparando → En camino → Entregado) y la fecha del último cambio. Un pedido recién aprobado está en el primer paso.
- **Seguridad:** la web no puede escribir en `pedidos`. El cambio pasa por la función `cambiar_envio`, que solo deja usar a los administradores y solo en pedidos con el pago aprobado.
- **Para activarlo:** correr `supabase/estado-envio.sql` en Supabase → SQL Editor (después de `tabla-pedidos.sql` y `admin-stock.sql`). Se puede correr más de una vez. Hasta entonces, Mis pedidos sigue funcionando sin la barra y el panel avisa que falta el archivo.

## Costo de envío por código postal (T-048)

El cliente ve cuánto le sale el envío antes de pagar.

- **Tarifas:** `src/data/envio.js` define ocho zonas por rango de código postal (CABA, Gran Buenos Aires, Santa Fe y Entre Ríos, Litoral y Noreste, Noroeste, Córdoba y Cuyo, interior de Buenos Aires y La Pampa, Patagonia). Los precios son de ejemplo: para cambiarlos se edita `ZONAS`. El envío es gratis desde `ENVIO_GRATIS_DESDE` (`src/data/reglas.js`).
- **Ficha de producto:** "Calcular" muestra la zona y el costo (o "Envío gratis"). El código postal queda guardado en el navegador y se reutiliza en el carrito.
- **Carrito:** campo de código postal, costo del envío y **Total a pagar con envío**. Sin un código válido el botón de pagar queda bloqueado.
- **Checkout:** `api/checkout.js` recalcula el envío en el servidor con el código postal (el navegador no manda el precio) y lo cobra como un renglón más de Mercado Pago. El total del pedido incluye el envío.
- **Después de pagar:** el envío se muestra en Mis pedidos, en el detalle del panel de administración y en el comprobante por correo. No tiene columna propia: es el total menos la suma de los productos, así que no hace falta correr SQL.
