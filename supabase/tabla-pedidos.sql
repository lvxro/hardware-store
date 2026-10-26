-- Tabla de pedidos de la tienda (T-023: historial de pedidos del cliente).
-- Cada pedido es de un cliente (usuario_id). Lo comprado se guarda en "items" con el nombre y el
-- precio de ese momento, así el historial no cambia aunque después cambien los precios o el catálogo.
-- Es la base para la T-027 (reglas de seguridad de pedidos), que va a completar quién puede escribir.
create table public.pedidos (
  id uuid primary key default gen_random_uuid(),  -- el mismo número de pedido que arma api/checkout.js
  usuario_id uuid not null references auth.users (id) on delete cascade,
  creado_en timestamptz not null default now(),
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'pagado', 'rechazado', 'enviado', 'entregado', 'cancelado')),
  total integer not null check (total >= 0),      -- en pesos
  items jsonb not null default '[]'::jsonb        -- [{ "id": "cpu-002", "nombre": "...", "cantidad": 1, "precio": 231000 }]
);

create index pedidos_por_cliente on public.pedidos (usuario_id, creado_en desc);

-- Seguridad: cada cliente solo puede ver sus propios pedidos. La web no puede insertar, editar ni
-- borrar: eso lo tiene que hacer el servidor (api/checkout.js y api/webhook.js) cuando se guarden los pedidos.
alter table public.pedidos enable row level security;

create policy "Cada cliente ve sus pedidos"
  on public.pedidos for select
  to authenticated
  using (usuario_id = auth.uid());

grant select on public.pedidos to authenticated;

-- Para probar el historial antes de que el checkout guarde pedidos, se puede cargar uno a mano
-- desde el SQL Editor de Supabase (reemplazá el id por el de un usuario de Authentication → Users):
--
-- insert into public.pedidos (usuario_id, estado, total, items) values (
--   '00000000-0000-0000-0000-000000000000',
--   'pagado',
--   231000,
--   '[{"id": "cpu-002", "nombre": "AMD Ryzen 5 7600X", "cantidad": 1, "precio": 231000}]'
-- );
