-- T-052: historial de movimientos de stock.
-- Correr en Supabase → SQL Editor, después de admin-stock.sql. Se puede correr más de una vez.
--
-- Cada vez que cambia el stock de un producto queda una fila: cuándo, quién, cuántas unidades,
-- de cuánto a cuánto y por qué. Lo anota la base de datos sola (un trigger sobre productos), así
-- no importa desde dónde se cambie: el panel, una venta de Mercado Pago o el Table Editor.

-- 1) La tabla
create table if not exists public.movimientos_stock (
  id bigint generated always as identity primary key,
  creado timestamptz not null default now(),
  producto_id text not null,          -- sin clave foránea: si el producto se borra, su historial queda
  producto_nombre text,               -- el nombre que tenía en ese momento
  cambio integer not null,            -- +5 entraron, -2 salieron
  stock_anterior integer not null,
  stock_nuevo integer not null,
  motivo text not null check (motivo in (
    'venta',       -- pago aprobado de Mercado Pago (lo hace descontar_stock)
    'ingreso',     -- llegó mercadería
    'correccion',  -- el conteo no coincidía
    'devolucion',  -- un cliente devolvió el producto
    'rotura',      -- rotura, pérdida o faltante
    'otro',
    'alta',        -- producto nuevo cargado con stock
    'edicion',     -- se cambió el stock desde "Editar producto"
    'baja',        -- se borró el producto
    'sistema'      -- cambio hecho desde el panel de Supabase, sin sesión de la tienda
  )),
  nota text check (char_length(nota) <= 200),
  pedido_id uuid,                     -- solo en las ventas
  usuario text                        -- correo de quien lo hizo; vacío si fue automático
);

create index if not exists movimientos_stock_creado on public.movimientos_stock (creado desc);
create index if not exists movimientos_stock_producto on public.movimientos_stock (producto_id, creado desc);

-- Solo los administradores lo leen. Nadie lo escribe ni lo borra desde la web:
-- las filas las pone el trigger de abajo, así el historial no se puede tocar.
alter table public.movimientos_stock enable row level security;

drop policy if exists "Administradores ven el historial de stock" on public.movimientos_stock;
create policy "Administradores ven el historial de stock"
  on public.movimientos_stock for select to authenticated
  using (public.es_admin());

grant select on public.movimientos_stock to authenticated;

-- 2) El trigger que anota cada cambio.
--    El motivo y la nota llegan en dos variables que duran solo lo que dura la operación
--    (las ponen ajustar_stock y descontar_stock). Si no vienen, se deduce del tipo de cambio.
create or replace function public.anotar_movimiento_stock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_motivo text := nullif(current_setting('auraware.motivo', true), '');
  v_nota text := nullif(current_setting('auraware.nota', true), '');
  v_pedido uuid := nullif(current_setting('auraware.pedido', true), '')::uuid;
  v_usuario text := nullif(auth.jwt() ->> 'email', '');
begin
  if tg_op = 'INSERT' then
    if coalesce(new.stock, 0) > 0 then
      insert into public.movimientos_stock
        (producto_id, producto_nombre, cambio, stock_anterior, stock_nuevo, motivo, nota, usuario)
      values (new.id, new.nombre, new.stock, 0, new.stock, 'alta', v_nota, v_usuario);
    end if;
    return new;
  end if;

  if tg_op = 'DELETE' then
    if coalesce(old.stock, 0) > 0 then
      insert into public.movimientos_stock
        (producto_id, producto_nombre, cambio, stock_anterior, stock_nuevo, motivo, nota, usuario)
      values (old.id, old.nombre, -old.stock, old.stock, 0, 'baja', v_nota, v_usuario);
    end if;
    return old;
  end if;

  -- UPDATE: solo si cambió el stock
  if new.stock is distinct from old.stock then
    insert into public.movimientos_stock
      (producto_id, producto_nombre, cambio, stock_anterior, stock_nuevo, motivo, nota, pedido_id, usuario)
    values (
      new.id, new.nombre, coalesce(new.stock, 0) - coalesce(old.stock, 0),
      coalesce(old.stock, 0), coalesce(new.stock, 0),
      coalesce(v_motivo, case when v_usuario is null then 'sistema' else 'edicion' end),
      v_nota, v_pedido, v_usuario
    );
  end if;
  return new;
end;
$$;
revoke all on function public.anotar_movimiento_stock() from public, anon, authenticated;

drop trigger if exists anotar_movimiento_stock on public.productos;
create trigger anotar_movimiento_stock
  after insert or delete or update of stock on public.productos
  for each row execute function public.anotar_movimiento_stock();

-- 3) Ajuste a mano desde el panel, con su motivo.
--    Corre con los permisos de quien la llama: si no es administrador, la regla de
--    admin-stock.sql no le deja actualizar y no pasa nada.
create or replace function public.ajustar_stock(p_producto text, p_stock integer, p_motivo text, p_nota text default null)
returns public.productos
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_fila public.productos;
begin
  if p_motivo not in ('ingreso', 'correccion', 'devolucion', 'rotura', 'otro') then
    raise exception 'Motivo no válido: %', p_motivo;
  end if;

  perform set_config('auraware.motivo', p_motivo, true);
  perform set_config('auraware.nota', coalesce(left(trim(p_nota), 200), ''), true);

  update public.productos set stock = p_stock where id = p_producto
  returning * into v_fila;

  if v_fila.id is null then
    raise exception 'No se pudo cambiar el stock de %', p_producto;
  end if;
  return v_fila;
end;
$$;
revoke all on function public.ajustar_stock(text, integer, text, text) from public, anon;
grant execute on function public.ajustar_stock(text, integer, text, text) to authenticated;

-- 4) La venta: la misma descontar_stock de admin-stock.sql, que ahora avisa que es una venta
--    y de qué pedido. (Está igual en admin-stock.sql, para que correr ese archivo de nuevo no la pise.)
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

  perform set_config('auraware.motivo', 'venta', true);
  perform set_config('auraware.pedido', p_pedido::text, true);

  update public.productos p
     set stock = greatest(p.stock - (i ->> 'cantidad')::int, 0)
    from jsonb_array_elements(v_items) as i
   where p.id = i ->> 'id';
end;
$$;
revoke all on function public.descontar_stock(uuid) from public, anon, authenticated;
