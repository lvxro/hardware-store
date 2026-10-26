// T-022: arma el pago en Mercado Pago (Checkout Pro).
// La página del carrito manda solo { id, cantidad } de cada producto. Los precios se leen acá,
// de la tabla productos de Supabase, para que nadie pueda cambiarlos desde el navegador.
// Devuelve la dirección de Mercado Pago a la que hay que mandar al cliente.
import { randomUUID } from 'node:crypto'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { supabasePublico as supabase, supabaseAdmin } from './_lib/supabase.js'
import { precioDeProducto } from '../src/data/precios.js'

const MAXIMO_POR_PRODUCTO = 10 // el mismo tope que el carrito (src/data/carrito.js)
const MAXIMO_RENGLONES = 50

// La dirección pública de la tienda, para que Mercado Pago sepa adónde volver.
// SITIO_URL se puede fijar en Vercel; si no está, se usa la del pedido (sirve también en las previews).
function direccionDelSitio(req) {
  if (process.env.SITIO_URL) return process.env.SITIO_URL.replace(/\/$/, '')
  const protocolo = req.headers['x-forwarded-proto'] ?? 'https'
  return `${protocolo}://${req.headers.host}`
}

// Deja solo renglones válidos y junta los repetidos
function limpiarCarrito(carrito) {
  if (!Array.isArray(carrito) || carrito.length === 0 || carrito.length > MAXIMO_RENGLONES) return null
  const cantidades = new Map()
  for (const renglon of carrito) {
    const id = typeof renglon?.id === 'string' ? renglon.id : null
    const cantidad = Number(renglon?.cantidad)
    if (!id || !Number.isInteger(cantidad) || cantidad < 1) return null
    cantidades.set(id, Math.min(MAXIMO_POR_PRODUCTO, (cantidades.get(id) ?? 0) + cantidad))
  }
  return cantidades
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Método no permitido.' })
  }

  if (!process.env.MP_ACCESS_TOKEN) {
    console.error('Falta la variable de entorno MP_ACCESS_TOKEN')
    return res.status(500).json({ error: 'El pago con Mercado Pago todavía no está configurado.' })
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body ?? {})
  const cantidades = limpiarCarrito(body.carrito)
  if (!cantidades) return res.status(400).json({ error: 'El carrito no es válido.' })

  const { data: filas, error } = await supabase
    .from('productos')
    .select('id, nombre, marca, modelo, precio_usd_aprox, imagen')
    .in('id', [...cantidades.keys()])
  if (error) {
    console.error('No se pudo leer Supabase', error)
    return res.status(503).json({ error: 'No pudimos confirmar los precios. Probá de nuevo en un rato.' })
  }
  if (filas.length !== cantidades.size) {
    return res.status(409).json({ error: 'Algún producto del carrito ya no está a la venta. Revisá el carrito.' })
  }

  const sitio = direccionDelSitio(req)
  const items = filas.map((p) => ({
    id: p.id,
    title: p.nombre ?? `${p.marca} ${p.modelo}`,
    quantity: cantidades.get(p.id),
    unit_price: precioDeProducto(p.id, Number(p.precio_usd_aprox)).precio,
    currency_id: 'ARS',
    ...(p.imagen ? { picture_url: new URL(p.imagen, sitio).href } : {}),
  }))

  // El correo del cliente, si inició sesión, para que Mercado Pago lo complete solo
  const correo = typeof body.correo === 'string' && /^\S+@\S+\.\S+$/.test(body.correo) ? body.correo : null
  // Número de pedido propio: vuelve en el aviso de Mercado Pago (api/webhook.js) y en la vuelta a la tienda
  const pedido = randomUUID()
  const conHttps = sitio.startsWith('https://')

  // T-024: el pedido queda anotado antes de ir a Mercado Pago. Con el aviso del pago (api/webhook.js)
  // se marca aprobado y se manda el comprobante. Si no se puede anotar, el pago sigue igual.
  if (supabaseAdmin) {
    const marcaDe = new Map(filas.map((p) => [p.id, p.marca]))
    const { error: errorPedido } = await supabaseAdmin.from('pedidos').insert({
      id: pedido,
      correo,
      items: items.map((i) => ({
        id: i.id,
        nombre: i.title,
        marca: marcaDe.get(i.id),
        cantidad: i.quantity,
        precio: i.unit_price,
      })),
      total: items.reduce((suma, i) => suma + i.unit_price * i.quantity, 0),
    })
    if (errorPedido) console.error('No se pudo anotar el pedido', pedido, errorPedido)
  }

  try {
    const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN })
    const preferencia = await new Preference(mp).create({
      body: {
        items,
        ...(correo ? { payer: { email: correo } } : {}),
        external_reference: pedido,
        statement_descriptor: 'AURAWARE',
        back_urls: {
          success: `${sitio}/compra/aprobada`,
          pending: `${sitio}/compra/pendiente`,
          failure: `${sitio}/compra/rechazada`,
        },
        // Mercado Pago solo vuelve solo a la tienda (y avisa por webhook) si la dirección es https
        ...(conHttps
          ? { auto_return: 'approved', notification_url: `${sitio}/api/webhook` }
          : {}),
      },
      requestOptions: { idempotencyKey: pedido },
    })
    return res.status(200).json({ url: preferencia.init_point, pedido })
  } catch (e) {
    console.error('Mercado Pago rechazó la preferencia', e)
    return res.status(502).json({ error: 'Mercado Pago no respondió. Probá de nuevo en un rato.' })
  }
}
