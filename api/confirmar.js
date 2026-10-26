// T-032: la página de gracias llama acá al volver de Mercado Pago, para que el pedido quede al día
// aunque el aviso automático (api/webhook.js) tarde o falle.
// Recibe { pedido, pago } (los dos vienen en la dirección de vuelta). Se consulta el pago a Mercado Pago
// y solo se actualiza si es de ese pedido y el pedido es de la cuenta que llama.
import { supabaseAdmin, supabasePublico } from './_lib/supabase.js'
import { actualizarPedido, consultarPago, direccionDelSitio, ESTADOS } from './_lib/pedidos.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!supabaseAdmin) return res.status(503).json({ error: 'Pedidos sin configurar.' })

  const origen = req.headers.origin
  if (origen && origen !== direccionDelSitio(req) && origen !== `https://${req.headers.host}`) {
    return res.status(403).end()
  }

  const token = String(req.headers.authorization ?? '').replace(/^Bearer\s+/i, '')
  const { data: sesion } = token ? await supabasePublico.auth.getUser(token) : { data: null }
  const correo = sesion?.user?.email?.toLowerCase()
  if (!correo) return res.status(401).json({ error: 'Iniciá sesión.' })

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body ?? {})
  const pedidoId = String(body.pedido ?? '')
  const pagoId = String(body.pago ?? '')
  if (!/^[0-9a-f-]{36}$/i.test(pedidoId) || !/^\d{1,20}$/.test(pagoId)) {
    return res.status(400).json({ error: 'Datos no válidos.' })
  }

  const { data: pedido } = await supabaseAdmin.from('pedidos').select('id, correo').eq('id', pedidoId).maybeSingle()
  if (!pedido || pedido.correo?.toLowerCase() !== correo) return res.status(404).json({ error: 'Pedido no encontrado.' })

  try {
    const pago = await consultarPago(pagoId)
    if (pago.external_reference !== pedidoId) return res.status(409).json({ error: 'El pago no es de este pedido.' })
    await actualizarPedido(pago, direccionDelSitio(req))
    return res.status(200).json({ estado: ESTADOS[pago.status] ?? pago.status })
  } catch (e) {
    console.error('No se pudo confirmar el pago', pagoId, e)
    return res.status(502).json({ error: 'No pudimos consultar a Mercado Pago.' })
  }
}
