// T-022: Mercado Pago avisa acá cada vez que un pago cambia de estado.
// La página /compra/aprobada no alcanza para saber si se cobró (cualquiera puede abrirla):
// lo que vale es esto, porque se consulta el pago directo a Mercado Pago.
//
// T-024: actualiza el pedido en Supabase (tabla pedidos) y, cuando el pago se aprueba, le manda
// al cliente el comprobante de aura/ware por mail. Mercado Pago repite los avisos: el mail sale una sola vez.
// Todo queda también en los logs de Vercel (Deployments → Functions → Logs).
import { createHmac, timingSafeEqual } from 'node:crypto'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { supabaseAdmin } from './_lib/supabase.js'
import { armarComprobante, enviarCorreo } from './_lib/comprobante.js'

const ESTADOS = {
  approved: 'aprobado',
  pending: 'pendiente',
  in_process: 'pendiente',
  authorized: 'pendiente',
  rejected: 'rechazado',
  cancelled: 'cancelado',
  refunded: 'reintegrado',
  charged_back: 'contracargo',
}

function direccionDelSitio(req) {
  if (process.env.SITIO_URL) return process.env.SITIO_URL.replace(/\/$/, '')
  return `https://${req.headers.host}`
}

// Pasa el estado del pago al pedido y, si se aprobó, manda el comprobante (una sola vez)
async function actualizarPedido(pago, sitio) {
  const id = pago.external_reference
  if (!supabaseAdmin || !id) return

  const datosPago = {
    estado: ESTADOS[pago.status] ?? pago.status,
    pago_id: String(pago.id),
    medio: pago.payment_type_id,
    cuotas: pago.installments ?? null,
  }

  if (pago.status !== 'approved') {
    const { error } = await supabaseAdmin.from('pedidos').update(datosPago).eq('id', id)
    if (error) throw error
    return
  }

  // T-025: descuenta el stock una sola vez por pedido (la función de Supabase se fija si ya lo hizo).
  // Si falla (por ejemplo, si todavía no se corrió supabase/admin-stock.sql), queda en los logs y sigue.
  const { error: errorStock } = await supabaseAdmin.rpc('descontar_stock', { p_pedido: id })
  if (errorStock) console.error('No se pudo descontar el stock', id, errorStock)

  // Se "reserva" el envío marcando la hora solo si todavía no tenía. Si dos avisos llegan juntos,
  // uno solo consigue la fila: el otro no manda nada.
  const { data: pedido, error } = await supabaseAdmin
    .from('pedidos')
    .update({ ...datosPago, mail_enviado: new Date().toISOString() })
    .eq('id', id)
    .is('mail_enviado', null)
    .select()
    .maybeSingle()
  if (error) throw error
  if (!pedido) {
    // Ya se había mandado, o el pedido no existe: igual se deja el estado al día
    await supabaseAdmin.from('pedidos').update(datosPago).eq('id', id)
    return
  }

  // El correo de la cuenta de la tienda; si compró sin iniciar sesión, el que usó en Mercado Pago
  const para = pedido.correo ?? pago.payer?.email
  if (!para) {
    console.warn('Pedido aprobado sin correo para el comprobante', id)
    return
  }

  try {
    const enviado = await enviarCorreo({ para, ...armarComprobante(pedido, pago, sitio) })
    if (!enviado) {
      // Sin correo configurado no tiene sentido que Mercado Pago reintente: queda sin marcar y listo
      await supabaseAdmin.from('pedidos').update({ mail_enviado: null }).eq('id', id)
      return
    }
    console.log('Comprobante enviado', { pedido: id, para })
  } catch (e) {
    // Se libera la marca para que el próximo aviso de Mercado Pago vuelva a intentar
    await supabaseAdmin.from('pedidos').update({ mail_enviado: null }).eq('id', id)
    throw e
  }
}

// Comprueba que el aviso venga de Mercado Pago con la clave secreta del webhook
// (panel de Mercado Pago → tu aplicación → Webhooks → "Clave secreta"). Si no está cargada, no se valida.
function firmaValida(req, idDelPago) {
  const secreto = process.env.MP_WEBHOOK_SECRET
  if (!secreto) return true
  const firma = String(req.headers['x-signature'] ?? '')
  const partes = Object.fromEntries(firma.split(',').map((p) => p.trim().split('=')))
  if (!partes.ts || !partes.v1) return false
  const idPedido = req.headers['x-request-id'] ?? ''
  const plantilla = `id:${idDelPago};request-id:${idPedido};ts:${partes.ts};`
  const esperada = createHmac('sha256', secreto).update(plantilla).digest('hex')
  return esperada.length === partes.v1.length && timingSafeEqual(Buffer.from(esperada), Buffer.from(partes.v1))
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const tipo = req.query.type ?? req.body?.type
  const id = String(req.query['data.id'] ?? req.body?.data?.id ?? '')

  // Mercado Pago también avisa otras cosas (órdenes, contracargos): por ahora solo importan los pagos
  if (tipo !== 'payment' || !id) return res.status(200).end()

  if (!firmaValida(req, id.toLowerCase())) {
    console.warn('Aviso de Mercado Pago con firma inválida', { id })
    return res.status(401).end()
  }

  try {
    const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN })
    const pago = await new Payment(mp).get({ id })
    console.log('Pago de Mercado Pago', {
      id: pago.id,
      estado: pago.status, // approved, pending, in_process, rejected, refunded…
      detalle: pago.status_detail,
      pedido: pago.external_reference,
      total: pago.transaction_amount,
      cuotas: pago.installments,
      correo: pago.payer?.email,
      productos: pago.additional_info?.items?.map((i) => `${i.quantity} × ${i.id}`),
    })
    await actualizarPedido(pago, direccionDelSitio(req))
    return res.status(200).end()
  } catch (e) {
    // Con un error, Mercado Pago vuelve a avisar más tarde
    console.error('No se pudo procesar el pago', id, e)
    return res.status(500).end()
  }
}
