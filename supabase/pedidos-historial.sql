-- T-031: historial de pedidos.
-- Correr en Supabase → SQL Editor, después de tabla-pedidos.sql y admin-stock.sql.
-- Se puede correr más de una vez sin romper nada.
--
-- Hasta ahora la web no podía leer la tabla pedidos (solo el servidor). Con estas reglas:
--  - cada cliente ve únicamente los pedidos hechos con el correo de su cuenta;
--  - los administradores (tabla administradores) ven todos.
-- Escribir sigue pudiendo solo el servidor (api/checkout.js y api/webhook.js).

drop policy if exists "Clientes ven sus pedidos" on public.pedidos;
create policy "Clientes ven sus pedidos"
  on public.pedidos for select to authenticated
  using (lower(correo) = lower(coalesce(auth.jwt() ->> 'email', '')));

drop policy if exists "Administradores ven todos los pedidos" on public.pedidos;
create policy "Administradores ven todos los pedidos"
  on public.pedidos for select to authenticated
  using (public.es_admin());

grant select on public.pedidos to authenticated;

-- Para que la lista de "Mis pedidos" salga rápido aunque haya muchos
create index if not exists pedidos_correo_creado on public.pedidos (lower(correo), creado desc);
