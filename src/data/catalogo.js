// Arma la lista de productos que recorren y filtran el home, el listado, la ficha y el carrito.
// Los productos se leen de la tabla "productos" de Supabase. Si Supabase no responde, se usa
// productos.json (el archivo de Gabriel) como respaldo, así la tienda sigue andando.
import { supabase } from './supabase'
import respaldo from './productos.json'
import categorias from './categorias'
// Dólar oficial de referencia (Banco Nación). Cambiar este número cuando se actualice.
export const DOLAR = 1540

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
async function leerDeSupabase() {
  const { data, error } = await supabase
    .from('productos')
    .select('id, categoria, marca, modelo, nombre, precio_usd_aprox, imagen, descripcion, specs')
    .order('id')
    .abortSignal(AbortSignal.timeout(5000)) // si en 5 segundos no contestó, se usa el respaldo
  if (error) throw error
  if (data.length === 0) throw new Error('la tabla productos está vacía')

  const porCategoria = {}
  for (const { categoria, specs, ...comunes } of data) {
    const campos = categorias.find((cat) => cat.slug === categoria)?.campos ?? []
    porCategoria[categoria] ??= []
    porCategoria[categoria].push({ ...comunes, ...ordenarSpecs(specs, campos) })
  }
  return porCategoria
}

// Este "await" hace que el sitio espere a tener los productos antes de mostrarse
export const datos = await leerDeSupabase().catch((error) => {
  console.warn('No se pudo leer Supabase: se usa productos.json como respaldo.', error)
  return respaldo
})

const productos = categorias.flatMap((cat) =>
  (datos[cat.slug] ?? []).map((p) => ({
    ...p,
    categoria: cat.slug,
    nombre: p.nombre ?? `${p.marca} ${p.modelo}`,
    precio: Math.round((p.precio_usd_aprox * DOLAR) / 1000) * 1000,
    specs: cat.specs(p),
  })),
)

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
