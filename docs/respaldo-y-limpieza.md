# Respaldo de la base de datos y limpieza de datos de prueba

Guía de la tarjeta **T-065**. Hay que hacerlo en este orden y en este momento del sprint 6:

| Cuándo | Qué | Archivo |
|---|---|---|
| Ahora y antes de cualquier cambio grande | Hacer una copia de seguridad | `supabase/respaldo.sql` |
| Después de las pruebas de compra completa (T-050 y T-054, hasta el 14/11) y antes de la demo (16/11) | Borrar los pedidos de prueba y devolver el stock | `supabase/limpiar-datos-prueba.sql` |

**Por qué se limpia después de las pruebas y no antes:** cada prueba de compra crea pedidos nuevos y descuenta stock. Si se limpia antes, hay que limpiar de nuevo.

## 1. Copia de seguridad

1. En Supabase → SQL Editor, pegar `supabase/respaldo.sql` y correrlo.
2. Crea cuatro tablas nuevas en el esquema `respaldo`, con la fecha y la hora en el nombre: `pedidos_AAAAMMDD_HHMM`, `productos_...`, `movimientos_stock_...` y `administradores_...`.
3. Comprobar que las copias tienen las mismas filas que las originales:

```sql
select count(*) from public.pedidos;
select count(*) from respaldo.pedidos_AAAAMMDD_HHMM;  -- con el nombre que quedó
```

Las copias tienen RLS activado y sin reglas, y el esquema no está abierto a la web: nadie las puede leer desde la tienda. Se puede correr todas las veces que haga falta; cada vez queda una copia nueva.

**Copia fuera de la base (recomendado):** estas copias viven en el mismo proyecto de Supabase. Para tener una fuera, bajar cada tabla desde Table Editor → Export → CSV y guardarla fuera del repositorio. `pedidos` tiene correos de clientes: **no se sube a GitHub.**

### Última copia hecha

El 10/11/2026 a las 09:13 se hizo una copia con el sufijo `20261110_0913`: 7 pedidos, 105 productos, 1 movimiento de stock y 3 administradores. Las cuatro tablas se verificaron contra las originales.

### Volver atrás una tabla

Ejemplo con `pedidos` (cambiar el sufijo por el de la copia que se quiere recuperar):

```sql
-- Recuperar los pedidos borrados sin tocar los que ya existen
insert into public.pedidos
select * from respaldo.pedidos_20261110_0913
on conflict (id) do nothing;
```

Si se limpió el stock y hay que volver al valor anterior de los productos:

```sql
update public.productos p
   set stock = r.stock
  from respaldo.productos_20261110_0913 r
 where r.id = p.id;
```

## 2. Limpieza de datos de prueba

El estado de la base el 10/11/2026: 7 pedidos de prueba (3 aprobados que descontaron stock y 4 pendientes que nunca se pagaron) y 1 ajuste manual de stock de prueba (`cpu-011`, motivo "rotura", -1 unidad). Los 3 pedidos aprobados descontaron 7 unidades en 6 productos (`cpu-002` × 2 y una unidad de `gpu-001`, `gpu-002`, `mb-003`, `mon-002` y `ram-001`).

1. Correr `supabase/respaldo.sql` otra vez, para tener una copia justo antes de limpiar.
2. Pegar `supabase/limpiar-datos-prueba.sql` en el SQL Editor y correrlo **tal cual**. Es un simulacro: muestra en la pestaña de mensajes cuántos pedidos borraría y cuántas unidades devolvería, y no cambia nada.
3. Si los números coinciden con lo esperado, cambiar `confirmar boolean := false;` por `true` y correrlo de nuevo.
4. Si se quiere dejar el historial de stock vacío para la demo, cambiar también `borrar_historial_stock` a `true`. Por defecto el historial se conserva, porque tiene los ajustes manuales y es lo que muestra el feedback del profesor (T-052).
5. Comprobar:

```sql
select count(*) from public.pedidos;                              -- 0
select stock, count(*) from public.productos group by stock;      -- casi todos en 10
```

Qué toca y qué no: devuelve el stock de los productos vendidos, borra pedidos y, si se pide, el historial de stock. **No** borra productos, cuentas de usuario ni administradores.

### Cosas a tener en cuenta

- Todo pedido creado hasta el momento de correrlo se considera de prueba. Si ya hubo una venta real, hay que cambiar `corte` por la fecha del último pedido de prueba.
- Un ajuste manual de stock que no vino de un pedido (por ejemplo `cpu-003` en 16 unidades o `cpu-011` en 9) no lo toca el script. Se corrige a mano desde el panel de administración, con su motivo.
- **Estado de la prueba del script:** se revisó la lógica y se diseñó el simulacro, pero **no se pudo probar contra la base real**: el servidor de Supabase pidió una confirmación manual para correr la prueba (que borra datos dentro de una transacción que se deshace) y no fue respondida. Por eso el primer paso es el simulacro.
