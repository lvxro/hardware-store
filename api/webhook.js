// T-022: Mercado Pago avisa acá cada vez que un pago cambia de estado.
// La página /compra/aprobada no alcanza para saber si se cobró (cualquiera puede abrirla):
// lo que vale es esto, porque se consulta el pago directo a Mercado Pago.
//
// T-024: actualiza el pedido en Supabase (tabla pedidos) y, cuando el pago se aprueba, le manda
// al cliente el comprobante de aura/ware por mail. Mercado Pago repite los avisos: el mail sale una sola vez.
// Todo queda también en los logs de Vercel (Deployments → Functions → Logs).
//
// T-032: la firma ya no frena el aviso. El pago igual se consulta a Mercado Pago con nuestro token,
// así que un aviso falso no puede aprobar nada: como mucho hace que preguntemos de más.
// Con MP_WEBHOOK_ESTRICTO=1 en Vercel, los avisos con firma inválida se rechazan.
import { createHmac, timingSafeEqual } from 'node:crypto'
import { actualizarPedido, consultarPago, direccionDelSitio } from './_lib/pedidos.js'

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
    // Datos para revisar por qué no coincide, sin mostrar la clave
    console.warn('Aviso de Mercado Pago con firma que no coincide', {
      id,
      conFirma: Boolean(req.headers['x-signature']),
      conRequestId: Boolean(req.headers['x-request-id']),
    })
    if (process.env.MP_WEBHOOK_ESTRICTO === '1') return res.status(401).end()
  }

  try {
    const pago = await consultarPago(id)
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
