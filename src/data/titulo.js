// T-051: el título de la pestaña del navegador. Cada pantalla dice el suyo ("Procesadores · aura/ware")
// para que se distingan en el historial, en los favoritos del navegador y en las pestañas abiertas.
import { useEffect } from 'react'

export const MARCA = 'aura/ware'
export const TITULO_INICIO = `${MARCA} · Componentes y periféricos para tu PC`

// Sin título (el inicio) deja el general del sitio
export function useTitulo(titulo) {
  useEffect(() => {
    document.title = titulo ? `${titulo} · ${MARCA}` : TITULO_INICIO
  }, [titulo])
}
