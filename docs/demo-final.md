# Demo final y retrospectiva del proyecto

Material de la tarjeta **T-035**. La demo y la retrospectiva son el **lunes 16/11/2026**; este documento deja todo preparado para que el equipo lo ajuste y lo ensaye. Los tiempos y el reparto son una **propuesta**: lo que diga el profesor sobre la duración manda.

## 1. Mensaje central

aura/ware es una tienda online de componentes de PC que **ya vende**: el cliente elige, arma su carrito, crea una cuenta, paga con Mercado Pago, sigue su pedido y el administrador gestiona stock y envíos. El profesor lo había planteado así en la review del sprint 3: el objetivo de poder vender online está cumplido y lo comercial queda para después.

## 2. Guion (propuesta de 15 minutos)

| Min | Parte | Qué se muestra | Quién (propuesto) |
|---|---|---|---|
| 0–2 | Apertura | El problema, el equipo, la metodología (Scrum, 6 sprints, tablero Kanban) y el resultado en una frase | Gabriel (Scrum Master) |
| 2–5 | El cliente descubre | Home, categorías, buscador, filtro por marca y precio, ofertas, ficha con especificaciones y cuotas | Alvaro (Product Owner) |
| 5–7 | Ayudas para elegir | Verificador de compatibilidad en el carrito, Arma tu PC y comparador de productos | Alvaro |
| 7–11 | La compra | Iniciar sesión, carrito, código postal y costo de envío, pago con Mercado Pago (cuenta compradora de prueba), página de gracias | Gabriel |
| 11–13 | Después de comprar | Mis pedidos con la barra de seguimiento; el administrador marca el pedido como "En camino" y el cliente lo ve cambiar | Gabriel |
| 13–14 | El panel | Cargar un producto, ajustar stock con su motivo, historial de movimientos | Gabriel |
| 14–15 | Calidad y diseño | Pruebas en celular, casos de prueba, accesibilidad, decisiones de diseño | Juan (UX/UI y QA) |
| +5 | Retrospectiva | Ver sección 5 | Todo el equipo |

Si hay menos tiempo, se recortan **Arma tu PC** y **el panel**, que se pueden mostrar en 30 segundos cada uno. **La compra y el seguimiento del envío no se recortan**: son lo que demuestra que la tienda vende.

## 3. Antes de la demo: lista de control

Hacer el día anterior y repetir una hora antes.

**Datos**
- [ ] Pruebas de compra completa terminadas (T-050 y T-054).
- [ ] Copia de seguridad hecha (`supabase/respaldo.sql`).
- [ ] Pedidos de prueba borrados y stock devuelto (`supabase/limpiar-datos-prueba.sql`, primero el simulacro). Ver `docs/respaldo-y-limpieza.md`.
- [ ] Los productos que se van a mostrar tienen stock (no "Sin stock").

**Cuentas**
- [ ] Una cuenta de cliente **ya creada y con el correo confirmado**, para iniciar sesión en vivo. No mostrar el registro en vivo: sin SMTP propio en Supabase, el correo de confirmación solo le llega a miembros de la organización.
- [ ] Una cuenta de administrador (su correo está en la tabla `administradores`).
- [ ] Una cuenta compradora de prueba de Mercado Pago, con su tarjeta de prueba a mano.

**Servicios**
- [ ] `MP_ACCESS_TOKEN` de prueba cargado en Vercel y un pago de prueba aprobado de punta a punta.
- [ ] `supabase/estado-envio.sql` aplicado (ya está aplicado en producción desde el 10/11): los botones de envío del panel responden.
- [ ] Si se quiere mostrar el correo de comprobante: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER` y `SMTP_PASS` cargados en Vercel y una compra de prueba que haya llegado al correo. Si no, **no se promete** en la demo.
- [ ] La versión publicada (https://aurawarestore.vercel.app) carga rápido en el celular y en la computadora que se va a usar.

**Equipo y sala**
- [ ] Internet probado en el lugar, con el celular como respaldo para compartir datos.
- [ ] Navegador en pantalla completa, zoom adecuado, sesiones y pestañas ya abiertas, notificaciones apagadas.
- [ ] Un integrante maneja la pantalla y otro habla, para no perder el hilo.

## 4. Si algo falla en vivo

| Qué falla | Qué hacer |
|---|---|
| Supabase no responde | La tienda muestra el catálogo de respaldo (`productos.json`) pasados unos 5 segundos. Se explica y se sigue: es una decisión de diseño del sprint 2 |
| Mercado Pago no abre o no vuelve | Mostrar la página de gracias y Mis pedidos con un pedido aprobado que se dejó preparado antes |
| El administrador no puede cambiar el envío | Mostrarlo con capturas y explicar la regla (solo administradores, solo pedidos aprobados) |
| No hay internet | Capturas y video corto de la compra completa, grabados el día anterior |

Dejar grabado un **video corto de la compra completa** y capturas de cada pantalla es el mejor seguro.

## 5. Retrospectiva del proyecto (borrador)

Datos para llegar con los números claros (hoja Sprints y hoja Tareas, al 10/11/2026):

| Sprint | Planificadas | Hechas |
|---|---|---|
| 0 | 7 | 7 |
| 1 | 9 | 9 |
| 2 | 4 | 4 |
| 3 | 13 | 13 |
| 4 | 9 | 9 |
| 5 | 10 | 4 |
| 6 | 10 | 0 (en curso) |

Seis tarjetas se cerraron con atraso (T-022, T-023, T-024, T-029, T-052 y T-057).

### Qué salió bien

- La tienda **completa el cobro con Mercado Pago** (en modo de prueba), guarda cada pedido y el cliente lo sigue desde Mis pedidos.
- La seguridad está en la base de datos y en el servidor: precios, stock y envío los calcula el servidor y las reglas de Supabase protegen los datos.
- El proyecto está **bien documentado y organizado**, como dijo el profesor: cada sprint tiene su documentación con evidencia, y la metodología se respetó.
- El equipo **replanificó** a partir del feedback del profesor (6 sprints, sprint final solo de cierre) en vez de apurar.
- Las funciones se probaron en el navegador antes de entregarse y los problemas se encontraron con datos (logs de Vercel, base de datos) y no a ciegas.

### Qué mejorar

- **Reparto de la carga:** a lo largo del proyecto el trabajo quedó desparejo entre los integrantes, y apareció en las retrospectivas de los sprints 1, 2 y 3. Al 10/11 hay 6 tarjetas del sprint 5 sin terminar: 5 de Juan (diseño, QA y gestión) y 1 de Alvaro (frontend).
- **Tablero al día:** hubo tarjetas en Hecho en una hoja y en otro estado en otra, y tarjetas sin fecha de fin real. La regla de "Hecho solo con el pull request mergeado" no siempre se cumplió.
- **Trabajo sin tarjeta:** en los sprints 2 y 3 hubo mucho trabajo que no estaba en el tablero.
- **Estimaciones:** el sprint 4 se planificó con más tarjetas de las que entraban, y eso llevó a la replanificación.
- **Lo que depende de servicios reales** (correo, cobro con credenciales de producción) se dejó para el final y no llegó a probarse del todo.

### Acciones para el próximo proyecto

| Acción | Responsable | Cuándo |
|---|---|---|
| Revisar el reparto de tarjetas en cada daily y reasignar a tiempo, sin esperar a que venzan | Scrum Master | Cada daily |
| Configurar servicios externos (SMTP, credenciales de pago) en el sprint 1 o 2, no al final | Backend | Sprint 1 o 2 |
| Dejar constancia del uso de IA en cada commit (`Co-Authored-By`) | Todo el equipo | Desde el primer commit |
| Crear la tarjeta antes de empezar cualquier trabajo | Todo el equipo | Siempre |
| Un solo lugar para el estado de cada tarjeta, o una revisión semanal que compare las hojas | Product Owner | Cada review |

### Para decir en voz alta

El proyecto cumplió su objetivo —vender online— y lo que más nos enseñó no fue técnico: **repartir y seguir el trabajo** es lo difícil. Y la IA aceleró la programación y la documentación, pero las decisiones, las pruebas y las revisiones siguieron siendo de personas (ver `docs/uso-de-ia.md`).

## 6. Pendiente para que la tarjeta pase a Hecho

La demo y la retrospectiva se hacen el 16/11, con el equipo. Este documento es el material de preparación. La tarjeta pasa a Hecho **después** de la demo, cuando se cargue en la hoja Retrospectiva lo que el equipo realmente diga y decida.
