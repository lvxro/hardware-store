-- Tabla de productos de la tienda.
-- Las columnas son los datos que tienen todos los productos. Lo que cambia según la
-- categoría (socket, núcleos, memoria, etc.) va junto en "specs", así no hace falta
-- una tabla por categoría.
create table public.productos (
  id text primary key,                -- "cpu-001", "gpu-003", etc.
  categoria text not null,            -- igual al "slug" de src/data/categorias.js
  marca text not null,
  modelo text not null,
  nombre text not null,
  precio_usd_aprox numeric not null check (precio_usd_aprox >= 0),
  imagen text,
  descripcion text,
  specs jsonb not null default '{}'::jsonb
);

-- Seguridad: la web solo puede leer. Como no hay ninguna regla para insertar, editar
-- o borrar, eso solo se puede hacer desde el panel de Supabase.
alter table public.productos enable row level security;

create policy "Cualquiera puede ver los productos"
  on public.productos for select
  to anon, authenticated
  using (true);

grant select on public.productos to anon, authenticated;
