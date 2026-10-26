// Arma la lista de productos que recorren y filtran el home, el listado, la ficha y el carrito.
// Los productos se leen de la tabla "productos" de Supabase. Si Supabase no responde, se usa
// productos.json (el archivo de Gabriel) como respaldo, así la tienda sigue andando.
import categorias from './categorias'
import { IDS_EN_OFERTA } from './ofertas'
import { precioDeProducto } from './precios'
// El dólar de referencia se cambia en precios.js
export { DOLAR } from './precios'

// La base de datos no guarda el orden de las especificaciones: se acomodan según "campos"
// de categorias.js. Si alguna no está en esa lista, queda al final.
function ordenarSpecs(specs, campos) {
  const claves = [
    ...campos.filter((clave) => clave in specs),
    ...Object.keys(specs).filter((clave) => !campos.includes(clave)),
  ]
  return Object.fromEntries(claves.map((clave) => [clave, specs[clave]]))
}

// Lee la tabla y la devuelve con la misma forma que productos.json: { categoria: [productos] }
// Si una promesa tarda más de "ms", se rinde
function conLimite(promesa, ms) {
  return Promise.race([promesa, new Promise((_, no) => setTimeout(() => no(new Error('tardó demasiado')), ms))])
}

// T-028: las filas de la tabla. index.html ya empezó a pedirlas mientras bajaba este archivo;
// si ese pedido falló, se pide de nuevo con la biblioteca de Supabase.
async function filasDeSupabase() {
  if (window.__catalogo) {
    try {
      const filas = await conLimite(window.__catalogo, 5000)
      if (Array.isArray(filas)) return filas
    } catch {
      // se prueba de nuevo abajo
    }
  }
  const { supabase } = await import('./supabase') // T-028: solo si el pedido de index.html falló
  const { data, error } = await supabase
    .from('productos')
    // "*" y no una lista: así, si la columna stock (T-025) todavía no existe, la tienda sigue andando
    .select('*')
    .order('id')
    .abortSignal(AbortSignal.timeout(5000)) // si en 5 segundos no contestó, se usa el respaldo
  if (error) throw error
  return data
}

async function leerDeSupabase() {
  const data = await filasDeSupabase()
  if (data.length === 0) throw new Error('la tabla productos está vacía')

  const porCategoria = {}
  for (const { categoria, specs = {}, ...comunes } of data) {
    const campos = categorias.find((cat) => cat.slug === categoria)?.campos ?? []
    porCategoria[categoria] ??= []
    porCategoria[categoria].push({ ...comunes, ...ordenarSpecs(specs, campos) })
  }
  return porCategoria
}

// Este "await" hace que el sitio espere a tener los productos antes de mostrarse
// El respaldo se baja solo si hace falta (T-028: así no pesa en la carga normal)
export const datos = await leerDeSupabase().catch(async (error) => {
  console.warn('No se pudo leer Supabase: se usa productos.json como respaldo.', error)
  return (await import('./productos.json')).default
})

// T-021: en un producto en oferta, "precio" ya es el precio con el 25 % menos y "precioAnterior"
// es el de lista (el que se muestra tachado). Fuera de oferta, "precioAnterior" no existe.
const productos = categorias.flatMap((cat) =>
  (datos[cat.slug] ?? []).map((p) => ({
    ...p,
    categoria: cat.slug,
    nombre: p.nombre ?? `${p.marca} ${p.modelo}`,
    ...precioDeProducto(p.id, p.precio_usd_aprox),
    // T-025: unidades disponibles. null = sin control de stock (por ejemplo, con el respaldo productos.json)
    stock: Number.isInteger(p.stock) ? p.stock : null,
    specs: cat.specs(p),
  })),
)

// Los productos en oferta, en el orden de IDS_EN_OFERTA
export const ofertas = IDS_EN_OFERTA.map((id) => productos.find((p) => p.id === id)).filter(Boolean)

export function productosDe(slug) {
  return productos.filter((p) => p.categoria === slug)
}

export function precioDesde(slug) {
  return Math.min(...productosDe(slug).map((p) => p.precio))
}

export function formatoPrecio(valor) {
  return `$ ${valor.toLocaleString('es-AR')}`
}

export default productos
