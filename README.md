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
