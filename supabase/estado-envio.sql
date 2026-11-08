-- T-047: estado de envío de los pedidos.
-- Correr en Supabase → SQL Editor, después de tabla-pedidos.sql y admin-stock.sql.
-- Se puede correr más de una vez sin romper nada.
--
-- El estado del pago (aprobado, pendiente...) lo escribe Mercado Pago y no se toca.
-- El envío va aparte, en tres columnas nuevas de pedidos:
--   envio             preparando, en_camino o entregado (vacío: todavía no se empezó)
--   envio_actualizado cuándo se cambió por última vez
--   envio_por         el correo del administrador que lo cambió
-- La web no puede escribir en pedidos: el cambio pasa por cambiar_envio, que solo
-- deja usar a los administradores y solo en pedidos con el pago aprobado.

alter table public.pedidos add column if not exists envio text;
alter table public.pedidos add column if not exists envio_actualizado timestamptz;
alter table public.pedidos add column if not exists envio_por text;

alter table public.pedidos drop constraint if exists pedidos_envio_valido;
alter table public.pedidos
  add constraint pedidos_envio_valido check (envio is null or envio in ('preparando', 'en_camino', 'entregado'));

create or replace function public.cambiar_envio(p_pedido uuid, p_envio text)
returns public.pedidos
language plpgsql
security definer
set search_path = public
as $$
declare
  v_fila public.pedidos;
begin
  if not public.es_admin() then
    raise exception 'Solo los administradores pueden cambiar el envío';
  end if;
  if p_envio not in ('preparando', 'en_camino', 'entregado') then
    raise exception 'Estado de envío no válido: %', p_envio;
  end if;

  update public.pedidos
     set envio = p_envio,
         envio_actualizado = now(),
         envio_por = nullif(auth.jwt() ->> 'email', '')
   where id = p_pedido and estado = 'aprobado'
  returning * into v_fila;

  if v_fila.id is null then
    raise exception 'El pedido no existe o todavía no tiene el pago aprobado';
  end if;
  return v_fila;
end;
$$;

revoke all on function public.cambiar_envio(uuid, text) from public, anon;
grant execute on function public.cambiar_envio(uuid, text) to authenticated;
