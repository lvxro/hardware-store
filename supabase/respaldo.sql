-- T-065: copia de seguridad de los datos, dentro de la misma base de Supabase.
-- Correr en Supabase → SQL Editor. No borra ni cambia nada de las tablas de la tienda.
--
-- Crea las copias pedidos_AAAAMMDD_HHMM, productos_..., movimientos_stock_... y administradores_...
-- en el esquema "respaldo", con la fecha y la hora de cuando se corre. Cada vez que se corre
-- queda una copia nueva. Con RLS activado y sin reglas: la web no puede leerlas.
--
-- Esto protege de un borrado o un cambio por error, pero vive en el mismo proyecto de Supabase.
-- Para una copia fuera de la base, bajar también cada tabla desde Table Editor → Export → CSV.
--
-- Para volver atrás una tabla (ejemplo con pedidos), ver docs/respaldo-y-limpieza.md.

create schema if not exists respaldo;
revoke all on schema respaldo from public, anon, authenticated;

do $$
declare
  v_marca text := to_char(now() at time zone 'America/Argentina/Buenos_Aires', 'YYYYMMDD_HH24MI');
  v_tabla text;
  v_copia text;
  v_filas bigint;
begin
  foreach v_tabla in array array['pedidos', 'productos', 'movimientos_stock', 'administradores'] loop
    v_copia := v_tabla || '_' || v_marca;
    execute format('create table respaldo.%I as table public.%I', v_copia, v_tabla);
    execute format('alter table respaldo.%I enable row level security', v_copia);
    execute format('select count(*) from respaldo.%I', v_copia) into v_filas;
    raise notice 'respaldo.% : % filas', v_copia, v_filas;
  end loop;
end
$$;
