# Cómo usamos IA en aura/ware

Resumen escrito para la tarjeta **T-056**. El profesor pidió que, al inicio del próximo semestre, el equipo muestre cómo usó IA para documentar y programar el proyecto, para compartir las buenas prácticas y que no queden encapsuladas.

> **Alcance de este documento.** Lo escribió Gabriel a partir de su propio uso (programar con Claude Code y mantener el tablero y la documentación) y de lo que se puede comprobar en el repositorio y en el Sheet. **El uso de IA de Alvaro y Juan no se puede ver desde el historial** (un commit solo deja constancia de la IA si quien lo hizo agregó la línea de coautoría), así que su parte está marcada con `[completar]` para que la escriban ellos.

## 1. Qué herramienta y para qué

| Uso | Herramienta | Quién | Qué se hizo |
|---|---|---|---|
| Programar funciones | Claude Code (agente que lee y edita el repositorio y corre comandos) | Gabriel | Pantallas, funciones de Vercel, scripts SQL, pruebas |
| Mantener el tablero | Claude con acceso al Google Sheet | Gabriel | Hojas Tareas, Sprints, Documentación y Retrospectiva |
| Documentar | Claude | Gabriel | README, documentación técnica (T-064), este resumen |
| Transcribir el feedback del profesor | Audios del profesor pasados a texto y ordenados en tarjetas | Gabriel | Replanificación a 6 sprints y tarjetas T-052 a T-066 |
| Revisar la base de datos | Claude con acceso de lectura y escritura a Supabase | Gabriel | Validar scripts SQL, revisar tablas, reglas y alertas de seguridad |
| `[completar]` | `[completar]` | Alvaro | `[completar]` |
| `[completar]` | `[completar]` | Juan | `[completar]` |

## 2. Qué muestra el repositorio

Al día de hoy `main` tiene 80 commits. **8 están firmados con `Co-Authored-By: Claude`**, todos de tarjetas de Gabriel o de tarjetas que se hicieron en sus sesiones:

| Tarjeta | Qué se hizo con IA |
|---|---|
| T-019 | Registro, inicio de sesión y correo de confirmación con Supabase Auth |
| T-021 | Sección de ofertas y orden por ofertas |
| T-028 | Recuperar contraseña (dos commits) |
| T-051 | Títulos por página y vista previa al compartir |
| T-047 | Estado de envío del pedido desde el panel |
| T-048 | Costo de envío por código postal |

Los otros 72 commits no llevan la marca. **No significa que no hayan usado IA**: significa que el historial no lo dice. Por eso, la primera mejora para el próximo semestre es la regla de la sección 5.

## 3. Cómo trabajamos con la IA

El patrón que se repitió en las tarjetas de Gabriel:

1. **Se parte de la tarjeta del tablero**, con su historia de usuario y sus horas. La IA no decide qué construir.
2. **Primero se lee, después se escribe.** Antes de tocar nada se revisa lo que ya existe (por ejemplo, para T-048 se miró cómo ya calculaba el envío la ficha y qué datos tenía el carrito).
3. **Una rama por tarjeta** (`feature/T-XXX`), commits con el ID, y el pull request lo abre una persona del equipo y lo revisa otra. La IA propone y las personas aprueban.
4. **Se prueba antes de entregar**: lint, build y una prueba en navegador con Supabase y Mercado Pago simulados. Los scripts SQL se validan dentro de una transacción que se deshace.
5. **Se documenta en el mismo momento**: sección en el README y fila en la hoja Documentación con qué se hizo, cómo se resolvió y dónde está la evidencia.

## 4. Lo que funcionó y lo que falló

### Funcionó bien

- **Documentar con precisión.** Las filas de la hoja Documentación nombran archivos, funciones y decisiones reales, y se pueden contrastar con el código.
- **Probar de punta a punta sin gastar plata.** Simular Supabase y Mercado Pago permitió probar el carrito, el envío y el panel sin hacer compras.
- **Detectar problemas que a ojo no se ven.** Revisando la base de datos real se encontró que T-047 estaba mergeado y marcado como Hecho pero sin sus columnas ni su función en producción: los botones del panel habrían dado error. Se aplicó el script (que ya estaba validado) y se comprobaron los permisos.
- **Diagnosticar sin adivinar.** Cuando "no manda el correo de recuperación", la causa no estaba en el código: Supabase solo entrega con su servicio de fábrica a miembros de la organización. Se confirmó mirando que ninguna cuenta tenía `recovery_sent_at`.
- **Ordenar el feedback del profesor** en tarjetas con responsable y fecha, y replanificar los sprints a partir de él.

### Falló o hubo que corregir

- **Una prueba que decía "todo bien" sin probar nada.** Un recorrido por las pantallas dio "sin fallas" cuando la app ni se había dibujado (la prueba no esperaba al catálogo). Se detectó porque todas las pantallas tenían el mismo título y cero encabezados, y se corrigió esperando a que la pantalla se dibuje de verdad. **Lección: desconfiar de una prueba que pasa a la primera y mirar qué comprobó realmente.**
- **Estados desincronizados.** La tarjeta T-033 figuraba Hecho en Tareas y En progreso en Documentación; T-047 aparecía Por hacer y Vencida cuando ya estaba hecha y mergeada. La IA actualiza el Sheet, pero **no sabe lo que pasó por fuera de la conversación**: si alguien mergea un pull request, hay que decírselo o revisar GitHub.
- **Avisos del entorno que parecían errores.** El repositorio local marcó varias veces "commit sin pushear" cuando el remoto ya lo tenía. Se verificó con `git ls-remote` antes de volver a empujar.
- **Conflictos entre ramas.** T-047 y T-048 tocaban los mismos archivos y el segundo pull request tuvo conflictos. Se resolvieron conservando las dos funciones. **Lección: avisar cuando dos tarjetas tocan los mismos archivos.**
- **Cosas que la IA no puede hacer por nosotros.** Cargar el SMTP en Vercel y en Supabase, autorizar el acceso a Vercel y mergear pull requests siguen siendo de una persona. La contraseña de aplicación de Gmail se ingresó solo por el usuario, nunca se le pasó a la IA.

### Límites que conviene decir en voz alta

- La IA escribe código que parece correcto con mucha seguridad. Lo que da confianza es la prueba y la revisión de otra persona, no la explicación.
- Mucho de lo probado fue con servicios simulados. **El cobro real con Mercado Pago y el envío real del correo no se probaron** con la IA.
- Los precios de envío son de ejemplo: los puso la IA como punto de partida y hay que ajustarlos a la tarifa real.

## 5. Buenas prácticas que proponemos para el próximo semestre

Son propuestas para que el equipo las acepte o las cambie.

1. **Dejar constancia.** Todo commit hecho con ayuda de IA lleva la línea `Co-Authored-By`. Así el historial cuenta lo que pasó.
2. **La IA no mergea.** Todo pull request lo abre una persona y lo revisa otra, igual que siempre.
3. **Probar lo que importa en el navegador**, y desconfiar de una prueba que nunca falló.
4. **No pasar secretos a la IA** (claves, contraseñas, tokens). Se cargan directamente en Vercel o en Supabase.
5. **Pedir que explique antes de cambiar datos reales**, y preferir scripts que se pueden volver a correr y que no borran nada.
6. **Actualizar el tablero en el momento** y revisar que Tareas y Documentación digan lo mismo.
7. **Cada integrante cuenta su experiencia** en la sección 6, para que el aprendizaje no quede solo en una persona.

## 6. Experiencia de Alvaro y Juan

`[completar]` Para cada uno: qué herramienta usó, para qué tarjetas, qué resultó útil, qué tuvo que corregir y qué le recomendaría al próximo equipo. Alcanza con un párrafo corto cada uno.

## 7. Para la presentación

Si hay que mostrarlo en pocos minutos, estos son los cuatro mensajes:

- La IA aceleró la programación y la documentación, pero **las decisiones, las revisiones y los merges fueron de personas**.
- Funcionó mejor cuando se la usó con el tablero y las reglas del equipo: una tarjeta, una rama, una prueba, una fila de documentación.
- Falló en lo que no ve: lo que pasó fuera de la conversación y lo que depende de servicios reales.
- La mejora concreta es dejar constancia del uso de IA en cada commit.
