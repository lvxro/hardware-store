// T-051: la vista previa de un producto al compartir su enlace (WhatsApp, Instagram, Discord, etc.).
// Esos programas no ejecutan JavaScript: leen las etiquetas que vienen en el HTML. Como la tienda arma
// las pantallas en el navegador, todas las direcciones devolvían el mismo index.html con el mismo título.
// vercel.json manda /producto/:id a esta función, que devuelve ese mismo index.html pero con el nombre,
// el precio y la descripción del producto en las etiquetas. Para el cliente no cambia nada: la tienda
// carga igual y React toma el control.
import { supabasePublico as supabase } from './_lib/supabase.js'
import { precioDeProducto } from '../src/data/precios.js'
import { PORCENTAJE_EFECTIVO, precioEfectivo } from '../src/data/reglas.js'
import categorias from '../src/data/categorias.js'

const MARCA = 'aura/ware'
const ID_VALIDO = /^[a-z]{2,4}-\d{3,4}$/ // la forma de los códigos del catálogo ("cpu-001"), igual que en api/checkout.js

const pesos = (n) => `$ ${Math.round(Number(n)).toLocaleString('es-AR')}`

// El nombre y la descripción vienen de la base de datos: se escapan para que no rompan el HTML
const esc = (t) =>
  String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

function direccionDelSitio(req) {
  if (process.env.SITIO_URL) return process.env.SITIO_URL.replace(/\/$/, '')
  const protocolo = req.headers['x-forwarded-proto'] ?? 'https'
  return `${protocolo}://${req.headers.host}`
}

// El index.html publicado: la misma página que recibe cualquier otra dirección de la tienda
async function leerPlantilla(sitio) {
  const respuesta = await fetch(`${sitio}/index.html`, { signal: AbortSignal.timeout(4000) })
  if (!respuesta.ok) throw new Error(`index.html respondió ${respuesta.status}`)
  return respuesta.text()
}

async function leerProducto(id) {
  const { data, error } = await supabase
    .from('productos')
    .select('id, categoria, marca, modelo, nombre, descripcion, precio_usd_aprox')
    .eq('id', id)
    .abortSignal(AbortSignal.timeout(4000))
    .maybeSingle()
  if (error) throw error
  return data
}

// Saca las etiquetas de vista previa que ya trae index.html, para no repetirlas
function limpiar(html) {
  return html
    .replace(/\s*<meta\s+(?:property|name)="(?:og|twitter|product):[^"]*"[^>]*>/g, '')
    .replace(/\s*<link\s+rel="canonical"[^>]*>/g, '')
}

export function conVistaPrevia(plantilla, producto, sitio) {
  const nombre = producto.nombre || `${producto.marca} ${producto.modelo}`
  const { precio, precioAnterior, enOferta } = precioDeProducto(producto.id, Number(producto.precio_usd_aprox))
  const categoria = categorias.find((c) => c.slug === producto.categoria)?.nombre

  const titulo = `${nombre} · ${pesos(precio)}`
  const descripcion = [
    enOferta ? `Oferta: ${pesos(precio)} (antes ${pesos(precioAnterior)}).` : `${pesos(precio)}.`,
    `${pesos(precioEfectivo(precio))} en efectivo o transferencia (${PORCENTAJE_EFECTIVO}% menos).`,
    producto.descripcion,
    categoria ? `${categoria} en ${MARCA}.` : null,
  ]
    .filter(Boolean)
    .join(' ')
  const direccion = `${sitio}/producto/${producto.id}`
  const imagen = `${sitio}/og-auraware.png`

  const etiquetas = `
    <link rel="canonical" href="${esc(direccion)}" />
    <meta property="og:type" content="product" />
    <meta property="og:site_name" content="${MARCA}" />
    <meta property="og:locale" content="es_AR" />
    <meta property="og:title" content="${esc(titulo)}" />
    <meta property="og:description" content="${esc(descripcion)}" />
    <meta property="og:url" content="${esc(direccion)}" />
    <meta property="og:image" content="${esc(imagen)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="product:price:amount" content="${precio}" />
    <meta property="product:price:currency" content="ARS" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(titulo)}" />
    <meta name="twitter:description" content="${esc(descripcion)}" />
    <meta name="twitter:image" content="${esc(imagen)}" />`

  return limpiar(plantilla)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(nombre)} · ${MARCA}</title>`)
    .replace(/<meta\s+name="description"[^>]*>/, `<meta name="description" content="${esc(descripcion)}" />`)
    .replace('</head>', `${etiquetas}\n  </head>`)
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD')
    return res.status(405).send('Método no permitido.')
  }

  const sitio = direccionDelSitio(req)
  const id = String(req.query?.id ?? '')

  let plantilla
  try {
    plantilla = await leerPlantilla(sitio)
  } catch (error) {
    console.error('No se pudo leer index.html', error)
    return res.status(502).send('No pudimos cargar la tienda. Probá de nuevo en unos minutos.')
  }

  // Si el producto no existe o Supabase no responde, se devuelve la página común: la tienda
  // decide qué mostrar (por ejemplo, "Producto no encontrado")
  let html = plantilla
  if (ID_VALIDO.test(id)) {
    try {
      const producto = await leerProducto(id)
      if (producto) html = conVistaPrevia(plantilla, producto, sitio)
    } catch (error) {
      console.warn('No se pudo leer el producto para la vista previa', id, error)
    }
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  // Los programas de mensajería piden el enlace una vez y lo guardan: 5 minutos de caché alcanzan
  // para que un precio nuevo se vea pronto sin pegarle a Supabase en cada pedido
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600')
  return res.status(200).send(html)
}
