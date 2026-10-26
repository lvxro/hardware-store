import { useState } from 'react'
import { useFavoritosCompartidos } from '../data/favoritos'

// T-027: el corazón para guardar un producto en favoritos.
// "chico" va sobre el dibujo de las tarjetas; el normal, en la ficha al lado de "Agregar al carrito".
export function Corazon({ lleno, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill={lleno ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
    </svg>
  )
}

export default function BotonFavorito({ producto, chico = false }) {
  const favoritos = useFavoritosCompartidos()
  // Cambia en cada toque, así la animación arranca de nuevo
  const [toques, setToques] = useState(0)
  if (!favoritos) return null
  const activo = favoritos.es(producto.id)

  const alTocar = (e) => {
    // En la tarjeta, el corazón está encima del enlace a la ficha: que no la abra
    e.preventDefault()
    e.stopPropagation()
    favoritos.alternar(producto.id)
    setToques((t) => t + 1)
  }

  const etiqueta = activo ? `Quitar ${producto.nombre} de favoritos` : `Guardar ${producto.nombre} en favoritos`

  if (chico) {
    return (
      <button
        type="button"
        onClick={alTocar}
        aria-pressed={activo}
        aria-label={etiqueta}
        title={activo ? 'Quitar de favoritos' : 'Guardar en favoritos'}
        className={`flex h-8 w-8 items-center justify-center rounded-full border bg-bg/85 backdrop-blur-sm hover:border-lime hover:text-lime ${
          activo ? 'border-lime text-lime' : 'border-line-strong text-white'
        }`}
      >
        <span key={toques} className={toques && activo ? 'salta' : ''}>
          <Corazon lleno={activo} className="h-4 w-4" />
        </span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={alTocar}
      aria-pressed={activo}
      aria-label={etiqueta}
      title={activo ? 'Quitar de favoritos' : 'Guardar en favoritos'}
      className={`flex shrink-0 items-center justify-center rounded-[3px] border px-4 hover:border-lime hover:text-lime ${
        activo ? 'border-lime text-lime' : 'border-line-strong text-white'
      }`}
    >
      <span key={toques} className={toques && activo ? 'salta' : ''}>
        <Corazon lleno={activo} className="h-5 w-5" />
      </span>
    </button>
  )
}
