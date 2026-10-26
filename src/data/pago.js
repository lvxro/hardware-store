// T-022: el pago con Mercado Pago, del lado del navegador.
// Le pide al servidor (api/checkout.js) que arme el pago y devuelve la dirección de Mercado Pago.
// Solo se mandan los id y las cantidades: los precios los pone el servidor.

// Lo que se está por pagar se guarda en esta pestaña antes de ir a Mercado Pago: al volver,
// el carrito se vacía y la página de gracias (pages/ResultadoPago.jsx) muestra lo que se compró.
const CLAVE_COMPRA = 'ultima-compra'

export function guardarCompra(items) {
  try {
    sessionStorage.setItem(
      CLAVE_COMPRA,
      JSON.stringify(items.map((i) => ({ id: i.producto.id, cantidad: i.cantidad }))),
    )
  } catch {
    // Sin almacenamiento, la página de gracias se muestra sin el detalle
  }
}

export function leerCompra() {
  try {
    const guardada = JSON.parse(sessionStorage.getItem(CLAVE_COMPRA) ?? '[]')
    return Array.isArray(guardada) ? guardada : []
  } catch {
    return []
  }
}

export async function iniciarPago(items, correo) {
  let respuesta
  try {
    respuesta = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        carrito: items.map((i) => ({ id: i.producto.id, cantidad: i.cantidad })),
        correo: correo || undefined,
      }),
    })
  } catch {
    return { error: 'No pudimos conectarnos. Revisá tu conexión y volvé a probar.' }
  }

  const datos = await respuesta.json().catch(() => ({}))
  if (!respuesta.ok || !datos.url) {
    return { error: datos.error ?? 'No pudimos iniciar el pago. Probá de nuevo en un rato.' }
  }
  guardarCompra(items)
  return { url: datos.url }
}
