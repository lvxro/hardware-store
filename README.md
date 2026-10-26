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

## Ofertas (T-021)

La tienda tiene 6 productos en oferta, con el 25 % menos que su precio de lista. Se ven en el home (sección "Ofertas"), en la página `/ofertas` y en cada tarjeta, ficha y carrito: primero el precio de lista tachado y abajo el precio de oferta.

- Qué productos están en oferta y cuánto se descuenta se define en `src/data/ofertas.js` (`IDS_EN_OFERTA` y `DESCUENTO_OFERTA`). Para cambiarlos, se reemplazan los id por otros de la tabla `productos` de Supabase.
- En un producto en oferta, `precio` ya es el precio con el 25 % menos y `precioAnterior` es el de lista. Todo lo demás (carrito, cuotas, envío gratis) parte de `precio`.
- El 10 % por pago en efectivo se calcula sobre el precio de oferta.
- En el listado, "Ofertas" reemplaza a "Destacados" en "Ordenar por": muestra primero los productos en oferta.

## Pago con Mercado Pago (T-022)

El botón "Pagar con Mercado Pago" del carrito usa Checkout Pro: el cliente paga en la página de Mercado Pago (tarjeta, débito, dinero en cuenta, cuotas) y vuelve a la tienda.

- **Cómo funciona:** el carrito manda solo los id y las cantidades a `api/checkout.js` (una función de Vercel). Esa función lee los precios de Supabase, los pasa a pesos con el mismo cálculo que la tienda (`src/data/precios.js`, ofertas incluidas) y le pide el pago a Mercado Pago. Así nadie puede cambiar el precio desde el navegador.
- **Qué se cobra:** el total de lista. El 10 % de efectivo/transferencia no se aplica en Mercado Pago. El envío no se cobra en el pago.
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
