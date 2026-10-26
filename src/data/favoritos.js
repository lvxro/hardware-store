// T-027: los favoritos. Se guardan en el navegador (como el carrito), así siguen ahí al volver,
// y se comparten entre pestañas. Vive en App y llega a cada tarjeta por contexto.
import { createContext, useContext, useEffect, useState } from 'react'
import productos from './catalogo'

const CLAVE = 'favoritos'
const existe = new Set(productos.map((p) => p.id))

// Lee lo guardado y descarta lo roto o los productos que ya no existen
function leer() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE) ?? '[]')
    return Array.isArray(guardado) ? guardado.filter((id) => typeof id === 'string' && existe.has(id)) : []
  } catch {
    return []
  }
}

export function useFavoritos() {
  // Lista de id, el último agregado primero
  const [ids, setIds] = useState(leer)

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(ids))
    } catch {
      // Sin almacenamiento, los favoritos duran hasta recargar
    }
  }, [ids])

  useEffect(() => {
    const alCambiar = (e) => {
      if (e.key === CLAVE) setIds(leer())
    }
    window.addEventListener('storage', alCambiar)
    return () => window.removeEventListener('storage', alCambiar)
  }, [])

  const alternar = (id) => setIds((actual) => (actual.includes(id) ? actual.filter((x) => x !== id) : [id, ...actual]))

  return {
    ids,
    cantidad: ids.length,
    es: (id) => ids.includes(id),
    alternar,
    quitarTodos: () => setIds([]),
  }
}

export const FavoritosContext = createContext(null)

export function useFavoritosCompartidos() {
  return useContext(FavoritosContext)
}
