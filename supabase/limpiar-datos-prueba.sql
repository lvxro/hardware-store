-- T-065: borra los pedidos de prueba y devuelve el stock que descontaron, antes de la demo.
-- Correr en Supabase → SQL Editor, DESPUÉS de correr supabase/respaldo.sql y de terminar las pruebas
-- de compra (T-050 y T-054): cualquier pedido creado hasta el momento de correrlo se considera de prueba.
--
-- Por defecto es un SIMULACRO: cuenta qué haría y no cambia nada. Para borrar de verdad,
-- cambiar "confirmar" a true más abajo y volver a correr.
--
-- Qué hace cuando confirmar = true:
--   1) Devuelve a cada producto las unidades que descontaron los pedidos pagados (stock_descontado).
--   2) Borra los pedidos creados hasta "corte".
--   3) Si borrar_historial_stock = true, vacía también el historial de movimientos de stock.
--      Si es false, el historial queda como está (incluidos los ajustes manuales de prueba).
-- No toca productos (salvo el stock), cuentas de usuario ni administradores.

do $$
declare
  confirmar boolean := false;            -- true para borrar de verdad
  corte timestamptz := now();            -- se consideran de prueba los pedidos creados hasta este momento
  borrar_historial_stock boolean := false;

  v_pedidos int;
  v_pagados int;
  v_productos int;
  v_unidades int;
  v_movimientos int;
begin
  select count(*), count(*) filter (where stock_descontado)
    into v_pedidos, v_pagados
    from public.pedidos where creado <= corte;

  select count(*), coalesce(sum(u), 0)
    into v_productos, v_unidades
    from (
      select sum((i ->> 'cantidad')::int) as u
        from public.pedidos p, jsonb_array_elements(p.items) i
       where p.creado <= corte and p.stock_descontado
       group by i ->> 'id'
    ) t;

  select count(*) into v_movimientos from public.movimientos_stock;

  raise notice 'Pedidos a borrar: % (% con el stock descontado)', v_pedidos, v_pagados;
  raise notice 'Stock a devolver: % unidades en % productos', v_unidades, v_productos;
  raise notice 'Movimientos de stock en el historial: % (se borran: %)', v_movimientos, borrar_historial_stock;

  if not confirmar then
    raise notice 'SIMULACRO: no se cambió nada. Para borrar de verdad, poner confirmar = true.';
    return;
  end if;

  -- 1) El stock vuelve a lo que era antes de las ventas de prueba
  update public.productos pr
     set stock = pr.stock + v.unidades
    from (
      select i ->> 'id' as producto_id, sum((i ->> 'cantidad')::int) as unidades
        from public.pedidos p, jsonb_array_elements(p.items) i
       where p.creado <= corte and p.stock_descontado
       group by i ->> 'id'
    ) v
   where pr.id = v.producto_id;

  -- 2) Fuera los pedidos de prueba
  delete from public.pedidos where creado <= corte;

  -- 3) El historial de stock, solo si se pidió
  if borrar_historial_stock then
    delete from public.movimientos_stock;
  end if;

  raise notice 'LISTO: % pedidos borrados y % unidades devueltas al stock.', v_pedidos, v_unidades;
end
$$;
