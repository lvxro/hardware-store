-- T-025: stock de productos y administradores de la tienda.
-- Correr en Supabase → SQL Editor, después de tabla-productos.sql (y de tabla-pedidos.sql si ya existe).
-- Se puede correr más de una vez sin romper nada.

-- 1) Stock de cada producto. Los que ya estaban arrancan con 10 unidades; se ajustan desde /admin.
alter table public.productos
  add column if not exists stock integer not null default 10 check (stock >= 0);

-- 2) Quiénes son administradores: por correo. Para agregar uno:
--    insert into public.administradores (correo) values ('tu-correo@gmail.com');
--    La persona tiene que tener cuenta en la tienda con ese correo, ya confirmado.
create table if not exists public.administradores (
  correo text primary key check (correo = lower(correo))
);
alter table public.administradores enable row level security;
-- Sin reglas: nadie la lee ni la escribe desde la web. Se maneja desde el panel de Supabase.

-- ¿El que hace el pedido es administrador? Mira el correo de la sesión (ya confirmado por Supabase Auth).
create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.administradores
    where correo = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
revoke all on function public.es_admin() from public;
grant execute on function public.es_admin() to anon, authenticated;

-- 3) Los administradores pueden agregar, editar y borrar productos. Todos los demás, solo leer
--    (la regla de lectura ya existía en tabla-productos.sql).
drop policy if exists "Administradores agregan productos" on public.productos;
create policy "Administradores agregan productos"
  on public.productos for insert to authenticated
  with check (public.es_admin());

drop policy if exists "Administradores editan productos" on public.productos;
create policy "Administradores editan productos"
  on public.productos for update to authenticated
  using (public.es_admin()) with check (public.es_admin());

drop policy if exists "Administradores borran productos" on public.productos;
create policy "Administradores borran productos"
  on public.productos for delete to authenticated
  using (public.es_admin());

grant insert, update, delete on public.productos to authenticated;

-- 4) Descontar stock cuando Mercado Pago aprueba un pago (lo llama api/webhook.js con la clave secreta).
--    Descuenta una sola vez por pedido, aunque Mercado Pago avise varias veces. Nunca deja stock negativo.
create or replace function public.descontar_stock(p_pedido uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_items jsonb;
begin
  update public.pedidos
     set stock_descontado = true
   where id = p_pedido and not stock_descontado
  returning items into v_items;

  if v_items is null then
    return; -- ya se había descontado, o el pedido no existe
  end if;

  update public.productos p
     set stock = greatest(p.stock - (i ->> 'cantidad')::int, 0)
    from jsonb_array_elements(v_items) as i
   where p.id = i ->> 'id';
end;
$$;
revoke all on function public.descontar_stock(uuid) from public, anon, authenticated;

-- La columna que marca si ya se descontó (solo si la tabla de pedidos existe)
do $$
begin
  if to_regclass('public.pedidos') is not null then
    alter table public.pedidos add column if not exists stock_descontado boolean not null default false;
  end if;
end $$;
