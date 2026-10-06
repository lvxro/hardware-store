import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import categorias from '../data/categorias'
import productos from '../data/catalogo'
import ProductoCard from '../components/ProductoCard'

const ordenes = {
  relevancia: { nombre: 'Destacados', fn: null },
  menor: { nombre: 'Menor precio', fn: (a, b) => a.precio - b.precio },
  mayor: { nombre: 'Mayor precio', fn: (a, b) => b.precio - a.precio },
}

// Para comparar sin que importen mayúsculas ni tildes
function simple(texto) {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

// Un producto coincide si tiene todas las palabras buscadas en el nombre o en su categoría
function buscar(lista, busqueda) {
  const palabras = simple(busqueda).split(/\s+/).filter(Boolean)
  return lista.filter((p) => {
    const categoria = categorias.find((c) => c.slug === p.categoria)
    const donde = simple(`${p.nombre} ${categoria.nombre}`)
    return palabras.every((palabra) => donde.includes(palabra))
  })
}

function Chip({ activo, onClick, children }) {
  return (
    <button
      type="button"
      aria-pressed={activo}
      onClick={onClick}
      className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium ${
        activo
          ? 'border-aura bg-aura text-sobre-aura'
          : 'border-linea bg-superficie hover:border-aura hover:text-aura'
      }`}
    >
      {children}
    </button>
  )
}

function ListadoContenido({ slug, busqueda }) {
  const [orden, setOrden] = useState('relevancia')
  const [marca, setMarca] = useState(null)
  const categoria = categorias.find((c) => c.slug === slug)

  if (slug && !categoria) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <h1 className="subtitular text-3xl">No encontramos esa categoría</h1>
        <p className="mt-3 text-tenue">Elegí una de la barra de arriba o volvé al inicio.</p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-lg bg-aura px-5 py-3 font-semibold text-sobre-aura hover:opacity-90"
        >
          Ir al inicio
        </Link>
      </div>
    )
  }

  const titulo = busqueda
    ? `Resultados para “${busqueda}”`
    : categoria
      ? categoria.nombre
      : 'Todos los productos'

  let base = categoria ? productos.filter((p) => p.categoria === slug) : [...productos]
  if (busqueda) base = buscar(base, busqueda)

  // Marcas presentes en lo que se está viendo, con cuántos productos tiene cada una
  const marcas = [...new Set(base.map((p) => p.marca))]
    .map((nombre) => ({ nombre, cantidad: base.filter((p) => p.marca === nombre).length }))
    .sort((a, b) => b.cantidad - a.cantidad || a.nombre.localeCompare(b.nombre))

  let lista = marca ? base.filter((p) => p.marca === marca) : base
  if (ordenes[orden].fn) lista = [...lista].sort(ordenes[orden].fn)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav aria-label="Ruta" className="text-sm text-tenue">
        <Link to="/" className="hover:text-tinta hover:underline">
          Inicio
        </Link>
        <span className="mx-2">/</span>
        <span className="text-tinta">{categoria ? categoria.nombre : 'Todos los productos'}</span>
      </nav>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="subtitular text-3xl sm:text-4xl">{titulo}</h1>
          <p className="mt-2 text-tenue">
            {lista.length} {lista.length === 1 ? 'producto' : 'productos'}
          </p>
        </div>

        {base.length > 1 && (
          <label className="flex items-center gap-2 text-sm">
            <span className="text-tenue">Ordenar por</span>
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              className="rounded-lg border border-linea bg-superficie px-3 py-2 font-medium"
            >
              {Object.entries(ordenes).map(([clave, o]) => (
                <option key={clave} value={clave}>
                  {o.nombre}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {/* Con todo el catálogo a la vista hay demasiadas marcas: ahí se ofrece ir a una categoría */}
      {!categoria && !busqueda ? (
        <div className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {categorias.map((cat) => (
            <Link
              key={cat.slug}
              to={`/categoria/${cat.slug}`}
              className="whitespace-nowrap rounded-full border border-linea bg-superficie px-4 py-1.5 text-sm font-medium hover:border-aura hover:text-aura"
            >
              {cat.nombre}
            </Link>
          ))}
        </div>
      ) : (
        marcas.length > 1 && (
          <div
            role="group"
            aria-label="Filtrar por marca"
            className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
          >
            <Chip activo={!marca} onClick={() => setMarca(null)}>
              Todas las marcas
            </Chip>
            {marcas.map((m) => (
              <Chip key={m.nombre} activo={marca === m.nombre} onClick={() => setMarca(m.nombre)}>
                {m.nombre} <span className="opacity-70">{m.cantidad}</span>
              </Chip>
            ))}
          </div>
        )
      )}

      {lista.length === 0 ? (
        <div className="mt-8 rounded-xl border border-linea bg-superficie p-8">
          <p className="text-lg font-semibold">
            {busqueda
              ? `No hay productos que coincidan con “${busqueda}”`
              : 'Todavía no hay productos en esta categoría'}
          </p>
          {busqueda && (
            <p className="mt-2 text-tenue">
              Probá con la marca o el modelo, por ejemplo “Ryzen” o “Logitech”.
            </p>
          )}
          <Link
            to="/productos"
            className="mt-6 inline-block rounded-lg bg-aura px-5 py-3 font-semibold text-sobre-aura hover:opacity-90"
          >
            Ver todos los productos
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {lista.map((p) => (
            <ProductoCard key={p.id} producto={p} />
          ))}
        </div>
      )}
    </div>
  )
}

// T-011: listado de productos. Sirve para /productos (todos, o una búsqueda con ?q=) y /categoria/:slug
export default function Listado() {
  const { slug } = useParams()
  const [parametros] = useSearchParams()
  const busqueda = slug ? '' : (parametros.get('q') ?? '').trim()
  // La key reinicia el orden y la marca elegida al cambiar de categoría o de búsqueda
  return <ListadoContenido key={`${slug}|${busqueda}`} slug={slug} busqueda={busqueda} />
}
