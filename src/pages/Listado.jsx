import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import categorias from '../data/categorias'
import productos, { productosDe } from '../data/catalogo'
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

const boton =
  'inline-block rounded-[3px] border border-tinta px-4 py-2 text-sm font-medium hover:bg-tinta hover:text-fondo'

/*
  Renglón del filtro lateral (marca o categoría), con su cantidad.
  En celular es un botón dentro de una fila que se desliza;
  en compu, un renglón de lista separado por líneas.
*/
function claseRenglon(activo) {
  const forma =
    'flex shrink-0 items-baseline gap-2 whitespace-nowrap rounded-[3px] border px-3 py-1.5 text-sm ' +
    'lg:w-full lg:justify-between lg:rounded-none lg:border-x-0 lg:border-b-0 lg:border-linea lg:bg-transparent lg:px-0 lg:py-2 lg:text-base'
  return activo
    ? `${forma} border-tinta bg-tinta font-medium text-fondo lg:font-semibold lg:text-tinta`
    : `${forma} border-linea text-tenue hover:text-tinta hover:underline`
}

const claseFila =
  '-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:block lg:overflow-visible lg:border-b lg:border-linea lg:p-0'

function Cantidad({ children }) {
  return <span className="text-xs tabular-nums opacity-70 lg:text-sm">{children}</span>
}

function ListadoContenido({ slug, busqueda }) {
  const [orden, setOrden] = useState('relevancia')
  const [marca, setMarca] = useState(null)
  const categoria = categorias.find((c) => c.slug === slug)

  if (slug && !categoria) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <h1 className="text-2xl font-semibold">No encontramos esa categoría</h1>
        <p className="mt-2 text-tenue">Elegí una de la barra de arriba o volvé al inicio.</p>
        <Link to="/" className={`mt-5 ${boton}`}>
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

  // Con todo el catálogo a la vista hay demasiadas marcas: ahí el lateral lleva a las categorías
  const porCategoria = !categoria && !busqueda
  const conLateral = porCategoria || marcas.length > 1

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <nav aria-label="Ruta" className="text-sm text-tenue">
        <Link to="/" className="hover:text-tinta hover:underline">
          Inicio
        </Link>
        <span className="mx-2">/</span>
        <span className="text-tinta">{categoria ? categoria.nombre : 'Todos los productos'}</span>
      </nav>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-3 border-b border-linea pb-4">
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">{titulo}</h1>
          <p className="mt-1 text-sm text-tenue tabular-nums">
            {lista.length} {lista.length === 1 ? 'producto' : 'productos'}
          </p>
        </div>

        {base.length > 1 && (
          <label className="flex items-center gap-2 text-sm">
            <span className="text-tenue">Ordenar por</span>
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              className="rounded-[3px] border border-linea bg-fondo px-2.5 py-1.5 font-medium"
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

      <div className={`mt-5 grid gap-x-12 gap-y-5 ${conLateral ? 'lg:grid-cols-[15rem_1fr]' : ''}`}>
        {porCategoria && (
          <nav aria-labelledby="lateral" className="min-w-0">
            <h2 id="lateral" className="hidden pb-1.5 text-sm text-tenue lg:block">
              Categorías
            </h2>
            <div className={claseFila}>
              {categorias.map((cat) => (
                <Link key={cat.slug} to={`/categoria/${cat.slug}`} className={claseRenglon(false)}>
                  {cat.nombre} <Cantidad>{productosDe(cat.slug).length}</Cantidad>
                </Link>
              ))}
            </div>
          </nav>
        )}

        {!porCategoria && marcas.length > 1 && (
          <div role="group" aria-labelledby="lateral" className="min-w-0">
            <h2 id="lateral" className="hidden pb-1.5 text-sm text-tenue lg:block">
              Marca
            </h2>
            <div className={claseFila}>
              <button
                type="button"
                aria-pressed={!marca}
                onClick={() => setMarca(null)}
                className={claseRenglon(!marca)}
              >
                Todas <Cantidad>{base.length}</Cantidad>
              </button>
              {marcas.map((m) => (
                <button
                  key={m.nombre}
                  type="button"
                  aria-pressed={marca === m.nombre}
                  onClick={() => setMarca(m.nombre)}
                  className={claseRenglon(marca === m.nombre)}
                >
                  {m.nombre} <Cantidad>{m.cantidad}</Cantidad>
                </button>
              ))}
            </div>
          </div>
        )}

        {lista.length === 0 ? (
          <div className="min-w-0 py-6">
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
            <Link to="/productos" className={`mt-5 ${boton}`}>
              Ver todos los productos
            </Link>
          </div>
        ) : (
          // Tarjetas compactas separadas por líneas: cada celda aporta su borde derecho e inferior
          <ul
            className={`grid min-w-0 grid-cols-2 self-start border-l border-t border-linea sm:grid-cols-3 md:grid-cols-4 ${
              conLateral ? 'xl:grid-cols-5' : 'lg:grid-cols-5 xl:grid-cols-6'
            }`}
          >
            {lista.map((p) => (
              <li key={p.id} className="border-b border-r border-linea">
                <ProductoCard producto={p} />
              </li>
            ))}
          </ul>
        )}
      </div>
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
