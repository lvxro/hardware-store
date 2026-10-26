// T-032: lo que comparten el aviso de Mercado Pago (api/webhook.js) y la confirmación desde la
// página de gracias (api/confirmar.js): consultar un pago a Mercado Pago y pasarlo al pedido.
// El estado siempre sale de Mercado Pago, consultado con nuestro token: nadie puede inventarlo.
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { supabaseAdmin } from './supabase.js'
import { armarComprobante, enviarCorreo } from './comprobante.js'

export const ESTADOS = {
  approved: 'aprobado',
  pending: 'pendiente',
  in_process: 'pendiente',
  authorized: 'pendiente',
  rejected: 'rechazado',
  cancelled: 'cancelado',
  refunded: 'reintegrado',
  charged_back: 'contracargo',
}

export function direccionDelSitio(req) {
  if (process.env.SITIO_URL) return process.env.SITIO_URL.replace(/\/$/, '')
  return `https://${req.headers.host}`
}

// Pasa el estado del pago al pedido y, si se aprobó, manda el comprobante (una sola vez)
export async function actualizarPedido(pago, sitio) {
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

// Trae el pago de Mercado Pago (la fuente de verdad)
export async function consultarPago(id) {
  const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN })
  return new Payment(mp).get({ id })
}
