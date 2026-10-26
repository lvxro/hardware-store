// T-022: Mercado Pago avisa acá cada vez que un pago cambia de estado.
// La página /compra/aprobada no alcanza para saber si se cobró (cualquiera puede abrirla):
// lo que vale es esto, porque se consulta el pago directo a Mercado Pago.
//
// Por ahora solo deja el pago en los logs de Vercel (Deployments → Functions → Logs).
// Cuando haya una tabla de pedidos, este es el lugar para guardarlo y descontar stock.
import { createHmac, timingSafeEqual } from 'node:crypto'
import { MercadoPagoConfig, Payment } from 'mercadopago'

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
    return res.status(200).end()
  } catch (e) {
    // Con un error, Mercado Pago vuelve a avisar más tarde
    console.error('No se pudo consultar el pago', id, e)
    return res.status(500).end()
  }
}
