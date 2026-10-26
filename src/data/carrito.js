// T-018: el carrito. Guarda qué productos se eligieron y cuántos de cada uno.
// Vive en App (una sola copia para todo el sitio) y se guarda en el navegador,
// así no se pierde al recargar la página ni al cerrarla.
import { useEffect, useState } from 'react'
import productos from './catalogo'

const CLAVE = 'carrito' // nombre con el que se guarda en el navegador
export const MAXIMO_POR_PRODUCTO = 10 // el mismo tope que tiene la ficha

const porId = new Map(productos.map((p) => [p.id, p]))

// T-025: lo máximo que se puede llevar de un producto: 10, o menos si no hay tantas unidades
export function maximoDe(producto) {
  if (!producto || producto.stock == null) return MAXIMO_POR_PRODUCTO
  return Math.min(MAXIMO_POR_PRODUCTO, producto.stock)
}

export const sinStock = (producto) => producto?.stock === 0

// Las cantidades van de 1 al máximo del producto (si se quedó sin stock, queda en 1 y el carrito lo avisa)
const acotar = (n, id) => Math.min(Math.max(1, maximoDe(porId.get(id))), Math.max(1, Math.round(n)))

// Lee lo guardado. Si está roto o trae productos que ya no existen, los descarta.
function leer() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE) ?? '[]')
    if (!Array.isArray(guardado)) return []
    return guardado
      .filter((r) => r && porId.has(r.id) && Number.isFinite(r.cantidad) && r.cantidad > 0)
      .map((r) => ({ id: r.id, cantidad: acotar(r.cantidad, r.id) }))
  } catch {
    return []
  }
}

export function useCarrito() {
  // Cada renglón es { id, cantidad }. Los precios no se guardan: se leen siempre del catálogo.
  const [renglones, setRenglones] = useState(leer)

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(renglones))
    } catch {
      // Si el navegador no deja guardar, el carrito dura hasta recargar
    }
  }, [renglones])

  // Si el carrito cambia en otra pestaña, esta se pone al día
  useEffect(() => {
    const alCambiar = (e) => {
      if (e.key === CLAVE) setRenglones(leer())
    }
    window.addEventListener('storage', alCambiar)
    return () => window.removeEventListener('storage', alCambiar)
  }, [])

  // Si el producto ya estaba, se suma la cantidad (hasta el máximo)
  const agregar = (producto, cantidad = 1) =>
    setRenglones((actual) => {
      const existente = actual.find((r) => r.id === producto.id)
      if (!existente) return [...actual, { id: producto.id, cantidad: acotar(cantidad, producto.id) }]
      return actual.map((r) =>
        r.id === producto.id ? { ...r, cantidad: acotar(r.cantidad + cantidad, r.id) } : r,
      )
    })

  const cambiarCantidad = (id, cantidad) =>
    setRenglones((actual) => actual.map((r) => (r.id === id ? { ...r, cantidad: acotar(cantidad, id) } : r)))

  const quitar = (id) => setRenglones((actual) => actual.filter((r) => r.id !== id))

  const vaciar = () => setRenglones([])

  // Lo que usan las pantallas: cada renglón con su producto y su subtotal
  const items = renglones.map((r) => {
    const producto = porId.get(r.id)
    return {
      producto,
      cantidad: r.cantidad,
      subtotal: producto.precio * r.cantidad,
      agotado: sinStock(producto), // T-025: se quedó sin stock después de agregarlo
    }
  })

  return {
    items,
    unidades: items.reduce((suma, i) => suma + i.cantidad, 0),
    total: items.reduce((suma, i) => suma + i.subtotal, 0), // a precio de lista
    hayAgotados: items.some((i) => i.agotado),
    // Cuántas unidades de un producto hay en el carrito (0 si no está)
    cantidadDe: (id) => renglones.find((r) => r.id === id)?.cantidad ?? 0,
    agregar,
    cambiarCantidad,
    quitar,
    vaciar,
  }
}
