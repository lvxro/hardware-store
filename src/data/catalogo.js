// Convierte el JSON de Gabriel (productos agrupados por categoría) en una sola lista
// que el home y el listado pueden recorrer y filtrar.
import datos from './productos.json'
import categorias from './categorias'
// Dólar oficial de referencia (Banco Nación). Cambiar este número cuando se actualice.
export const DOLAR = 1540


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
