import { useState } from 'react'
import { Link } from 'react-router-dom'
import productos from '../data/catalogo'
import { useFavoritosCompartidos } from '../data/favoritos'
import { maximoDe } from '../data/carrito'
import ProductoCard from '../components/ProductoCard'
import { Corazon } from '../components/BotonFavorito'
import { useTitulo } from '../data/titulo'

// T-027: los productos guardados, el último primero.
// Desde acá se pueden pasar todos al carrito de una vez (los que tienen stock).

const porId = new Map(productos.map((p) => [p.id, p]))

export default function Favoritos({ onAgregarAlCarrito, cantidadEnCarrito }) {
  const favoritos = useFavoritosCompartidos()
  useTitulo('Favoritos')
  const [aviso, setAviso] = useState('')
  const lista = favoritos.ids.map((id) => porId.get(id)).filter(Boolean)
  // Los que se pueden sumar al carrito: con stock y sin haber llegado al tope
  const sumables = lista.filter((p) => cantidadEnCarrito(p.id) < maximoDe(p))

  const agregarTodos = () => {
    sumables.forEach((p) => onAgregarAlCarrito(p, 1))
    setAviso(`${sumables.length === 1 ? 'Se agregó 1 producto' : `Se agregaron ${sumables.length} productos`} al carrito.`)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold sm:text-4xl">Favoritos</h1>
          {lista.length > 0 && (
            <p className="mt-1 text-muted tabular-nums">
              {lista.length} {lista.length === 1 ? 'producto guardado' : 'productos guardados'}
            </p>
          )}
        </div>
        {lista.length > 0 && (
          <div className="flex flex-wrap items-center gap-4">
            {sumables.length > 0 && (
              <button
                type="button"
                onClick={agregarTodos}
                className="rounded-[3px] bg-lime px-4 py-2.5 font-mono text-sm font-bold text-bg hover:shadow-glow"
              >
                Agregar {sumables.length === lista.length ? 'todos' : sumables.length} al carrito
              </button>
            )}
            <button type="button" onClick={favoritos.quitarTodos} className="text-sm text-muted underline-offset-4 hover:text-white hover:underline">
              Quitar todos
            </button>
          </div>
        )}
      </div>

      {aviso && (
        <p role="status" className="entra-deslizando mt-4 text-sm" style={{ animationDelay: '0ms' }}>
          {aviso}{' '}
          <Link to="/carrito" className="font-medium text-lime underline-offset-4 hover:underline">
            Ver carrito
          </Link>
        </p>
      )}

      {lista.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-[3px] border border-line bg-surface px-6 py-14 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-raised text-muted">
            <Corazon className="h-8 w-8" />
          </span>
          <p className="mt-5 text-xl font-semibold">Todavía no guardaste nada</p>
          <p className="mt-2 max-w-sm text-muted">
            Tocá el corazón de cualquier producto y lo vas a encontrar acá, sin tener que buscarlo de nuevo.
          </p>
          <Link to="/productos" className="mt-7 inline-block rounded-[3px] bg-lime px-6 py-3 font-mono font-bold text-bg hover:shadow-glow">
            Ver todos los productos
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {lista.map((p) => (
            <li key={p.id}>
              <ProductoCard producto={p} />
            </li>
          ))}
        </ul>
      )}

      {lista.length > 0 && (
        <p className="mt-10 text-xs text-muted">Los favoritos se guardan en este navegador.</p>
      )}
    </div>
  )
}
