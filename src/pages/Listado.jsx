import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import categorias from '../data/categorias'
import productos, { productosDe } from '../data/catalogo'
import guias from '../data/guias'
import ProductoCard from '../components/ProductoCard'
import Vitrina from '../components/Vitrina'

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

// El botón principal de la vista, en lima
const boton = 'inline-block rounded-[3px] bg-lime px-4 py-2 font-mono text-sm font-bold text-bg hover:shadow-glow'

const selector =
  'rounded-[3px] border border-line-strong bg-surface px-2.5 py-1.5 font-medium text-white hover:border-line-hover'

/* ---------- Portada de la categoría: título, bajada y dos productos en grande ---------- */

function Portada({ categoria }) {
  const lista = productosDe(categoria.slug)
  // Dos productos de marcas distintas, para que no se vean dos dibujos casi iguales
  const primero = lista[0]
  const segundo = lista.find((p) => p.marca !== primero.marca) ?? lista[1]
  const guia = guias[categoria.slug]

  return (
    <header className="mt-3 grid gap-x-10 gap-y-8 border border-line bg-surface px-5 pb-6 pt-8 sm:px-10 sm:pt-10 lg:grid-cols-[1fr_1.5fr] lg:items-center lg:pb-10">
      <div>
        <h1 className="text-3xl font-semibold sm:text-4xl">{categoria.nombre}</h1>
        {guia && <p className="mt-3 max-w-sm text-sm text-muted sm:text-base">{guia.bajada}</p>}
      </div>
      <div className="grid grid-cols-2 gap-x-4">
        {[primero, segundo].filter(Boolean).map((p) => (
          <Link key={p.id} to={`/producto/${p.id}`} className="group block">
            <Vitrina producto={p} categoria={p.categoria} className="aspect-[4/3]" />
            <span className="mt-2 block text-center text-xs text-lime underline-offset-4 group-hover:underline sm:text-sm">
              {p.nombre}
            </span>
          </Link>
        ))}
      </div>
    </header>
  )
}

/* ---------- Preguntas frecuentes de la categoría ---------- */

function Preguntas({ preguntas }) {
  return (
    <section aria-labelledby="preguntas" className="mx-auto mt-16 max-w-3xl">
      <h2 id="preguntas" className="text-center text-2xl font-semibold">
        Preguntas frecuentes
      </h2>
      <div className="mt-6 border-b border-line">
        {preguntas.map(([pregunta, respuesta]) => (
          <details key={pregunta} className="group border-t border-line">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium text-white [&::-webkit-details-marker]:hidden">
              {pregunta}
              <span
                aria-hidden="true"
                className="text-2xl font-normal leading-none text-muted transition-transform duration-200 group-open:rotate-45 group-open:text-lime"
              >
                +
              </span>
            </summary>
            <p className="max-w-2xl pb-5 text-sm text-muted">{respuesta}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

function ListadoContenido({ slug, busqueda }) {
  const [orden, setOrden] = useState('relevancia')
  const [marca, setMarca] = useState(null)
  const categoria = categorias.find((c) => c.slug === slug)

  if (slug && !categoria) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <h1 className="text-2xl font-semibold">No encontramos esa categoría</h1>
        <p className="mt-2 text-muted">Elegí una de la barra de arriba o volvé al inicio.</p>
        <Link to="/" className={`mt-5 ${boton}`}>
          Ir al inicio
        </Link>
      </div>
    )
  }

  const titulo = busqueda ? `Resultados para “${busqueda}”` : 'Todos los productos'

  let base = categoria ? productos.filter((p) => p.categoria === slug) : [...productos]
  if (busqueda) base = buscar(base, busqueda)

  // Marcas presentes en lo que se está viendo, con cuántos productos tiene cada una
  const marcas = [...new Set(base.map((p) => p.marca))]
    .map((nombre) => ({ nombre, cantidad: base.filter((p) => p.marca === nombre).length }))
    .sort((a, b) => b.cantidad - a.cantidad || a.nombre.localeCompare(b.nombre))

  let lista = marca ? base.filter((p) => p.marca === marca) : base
  if (ordenes[orden].fn) lista = [...lista].sort(ordenes[orden].fn)

  const guia = categoria ? guias[categoria.slug] : null

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <nav aria-label="Ruta" className="text-sm text-muted">
        <Link to="/" className="border-b-2 border-transparent hover:border-lime hover:text-white">
          Inicio
        </Link>
        <span className="mx-2">/</span>
        <span className="text-white">{categoria ? categoria.nombre : 'Todos los productos'}</span>
      </nav>

      {categoria ? (
        <Portada categoria={categoria} />
      ) : (
        <header className="mt-3">
          <h1 className="text-2xl font-semibold sm:text-3xl">{titulo}</h1>
          {/* Con todo el catálogo a la vista, accesos a cada categoría */}
          {!busqueda && (
            <nav aria-label="Categorías" className="mt-4 flex flex-wrap gap-2">
              {categorias.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/categoria/${cat.slug}`}
                  className="rounded-full border border-line-strong px-3 py-1 font-mono text-xs font-medium text-muted hover:bg-raised hover:text-white"
                >
                  {cat.nombre}
                </Link>
              ))}
            </nav>
          )}
        </header>
      )}

      {/* Barra con la cantidad a la izquierda y el filtro y el orden a la derecha */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-line pb-3 text-sm">
        <p className="text-muted tabular-nums">
          {lista.length} {lista.length === 1 ? 'producto' : 'productos'}
        </p>

        {base.length > 1 && (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {marcas.length > 1 && (
              <label className="flex items-center gap-2">
                <span className="text-muted">Marca</span>
                <select
                  value={marca ?? ''}
                  onChange={(e) => setMarca(e.target.value || null)}
                  className={selector}
                >
                  <option value="">Todas ({base.length})</option>
                  {marcas.map((m) => (
                    <option key={m.nombre} value={m.nombre}>
                      {m.nombre} ({m.cantidad})
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="flex items-center gap-2">
              <span className="text-muted">Ordenar por</span>
              <select value={orden} onChange={(e) => setOrden(e.target.value)} className={selector}>
                {Object.entries(ordenes).map(([clave, o]) => (
                  <option key={clave} value={clave}>
                    {o.nombre}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
      </div>

      {lista.length === 0 ? (
        <div className="py-8">
          <p className="text-lg font-semibold">
            {busqueda
              ? `No hay productos que coincidan con “${busqueda}”`
              : 'Todavía no hay productos en esta categoría'}
          </p>
          {busqueda && (
            <p className="mt-2 text-sm text-muted">
              Probá con la marca o el modelo, por ejemplo “Ryzen” o “Logitech”.
            </p>
          )}
          <Link to="/productos" className={`mt-5 ${boton}`}>
            Ver todos los productos
          </Link>
        </div>
      ) : (
        // Tarjetas con aire entre una y otra
        <ul className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {lista.map((p) => (
            <li key={p.id}>
              <ProductoCard producto={p} />
            </li>
          ))}
        </ul>
      )}

      {guia && <Preguntas preguntas={guia.preguntas} />}
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
