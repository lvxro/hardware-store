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
