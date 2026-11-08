// T-022: el pago con Mercado Pago, del lado del navegador.
// Le pide al servidor (api/checkout.js) que arme el pago y devuelve la dirección de Mercado Pago.
// Solo se mandan los id y las cantidades: los precios los pone el servidor.

// Lo que se está por pagar se guarda en esta pestaña antes de ir a Mercado Pago: al volver,
// el carrito se vacía y la página de gracias (pages/ResultadoPago.jsx) muestra lo que se compró.
const CLAVE_COMPRA = 'ultima-compra'

export function guardarCompra(items, envio = 0) {
  try {
    sessionStorage.setItem(
      CLAVE_COMPRA,
      JSON.stringify({ items: items.map((i) => ({ id: i.producto.id, cantidad: i.cantidad })), envio }),
    )
  } catch {
    // Sin almacenamiento, la página de gracias se muestra sin el detalle
  }
}

export function leerCompra() {
  try {
    const guardada = JSON.parse(sessionStorage.getItem(CLAVE_COMPRA) ?? '[]')
    // Antes de T-048 se guardaba solo la lista de productos
    if (Array.isArray(guardada)) return { items: guardada, envio: 0 }
    return { items: Array.isArray(guardada?.items) ? guardada.items : [], envio: Number(guardada?.envio) || 0 }
  } catch {
    return { items: [], envio: 0 }
  }
}

export async function iniciarPago(items, cp, costoEnvio = 0) {
  // T-031: el servidor pide la sesión para saber quién compra (y de ahí sale el correo del pedido)
  let token
  try {
    const { supabase } = await import('./supabase')
    const { data } = await supabase.auth.getSession()
    token = data.session?.access_token
  } catch {
    // sin conexión con Supabase: se trata como sin sesión
  }
  if (!token) return { error: 'Iniciá sesión para comprar.' }

  let respuesta
  try {
    respuesta = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        carrito: items.map((i) => ({ id: i.producto.id, cantidad: i.cantidad })),
        cp, // T-048: el servidor calcula el envío con este código postal
      }),
    })
  } catch {
    return { error: 'No pudimos conectarnos. Revisá tu conexión y volvé a probar.' }
  }

  const datos = await respuesta.json().catch(() => ({}))
  if (!respuesta.ok || !datos.url) {
    return { error: datos.error ?? 'No pudimos iniciar el pago. Probá de nuevo en un rato.' }
  }
  guardarCompra(items, costoEnvio)
  return { url: datos.url }
}

// T-032: al volver de Mercado Pago, se le pide al servidor que confirme el pago (api/confirmar.js).
// Así el pedido queda al día en Mis pedidos aunque el aviso de Mercado Pago tarde.
// No muestra nada: si falla, el aviso automático lo va a actualizar igual.
export async function confirmarPago(pedido, pago) {
  try {
    const { supabase } = await import('./supabase')
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    if (!token) return null
    const respuesta = await fetch('/api/confirmar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ pedido, pago }),
    })
    return respuesta.ok ? await respuesta.json() : null
  } catch {
    return null
  }
}
