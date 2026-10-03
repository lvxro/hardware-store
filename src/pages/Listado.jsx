import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import categorias from '../data/categorias'
import productos from '../data/catalogo'
import ProductoCard from '../components/ProductoCard'

const ordenes = {
  relevancia: { nombre: 'Destacados', fn: null },
  menor: { nombre: 'Menor precio', fn: (a, b) => a.precio - b.precio },
  mayor: { nombre: 'Mayor precio', fn: (a, b) => b.precio - a.precio },
}

// T-011: listado de productos. Sirve para /productos (todos) y /categoria/:slug
export default function Listado() {
  const { slug } = useParams()
  const [orden, setOrden] = useState('relevancia')
  const categoria = categorias.find((c) => c.slug === slug)

  if (slug && !categoria) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-semibold">No encontramos esa categoría</h1>
        <p className="mt-2 text-tenue">Elegí una de la barra de arriba o volvé al inicio.</p>
        <Link to="/" className="mt-4 inline-block font-medium text-pcb hover:underline">
          Ir al inicio
        </Link>
      </div>
    )
  }

  let lista = categoria ? productos.filter((p) => p.categoria === slug) : [...productos]
  if (ordenes[orden].fn) lista = [...lista].sort(ordenes[orden].fn)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav aria-label="Ruta" className="text-sm text-tenue">
        <Link to="/" className="hover:text-tinta hover:underline">
          Inicio
        </Link>
        <span className="mx-2">/</span>
        <span className="text-tinta">{categoria ? categoria.nombre : 'Todos los productos'}</span>
      </nav>

      <div className="mt-4 mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-linea pb-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {categoria ? categoria.nombre : 'Todos los productos'}
          </h1>
          <p className="mt-1 text-sm text-tenue">{lista.length} productos</p>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <span className="text-tenue">Ordenar por</span>
          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
            className="rounded border border-linea bg-superficie px-2 py-1.5"
          >
            {Object.entries(ordenes).map(([clave, o]) => (
              <option key={clave} value={clave}>
                {o.nombre}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {lista.map((p) => (
          <ProductoCard key={p.id} producto={p} />
        ))}
      </div>
    </div>
  )
}
