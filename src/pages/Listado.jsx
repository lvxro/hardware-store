import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import categorias from '../data/categorias'
import productos, { productosDe, formatoPrecio } from '../data/catalogo'
import { precioEfectivo } from '../data/reglas'
import { CAMPOS_BASE, formatearCampo, formatearValor } from '../data/campos'
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

const boton =
  'inline-block rounded-[3px] border border-tinta px-4 py-2 font-sans text-sm font-medium hover:bg-tinta hover:text-fondo'

const selector = 'rounded-[3px] border border-linea bg-fondo px-2.5 py-1.5 font-medium'

/* ---------- Portada de la categoría: título, bajada y dos productos en grande ---------- */

function Portada({ categoria }) {
  const lista = productosDe(categoria.slug)
  // Dos productos de marcas distintas, para que no se vean dos dibujos casi iguales
  const primero = lista[0]
  const segundo = lista.find((p) => p.marca !== primero.marca) ?? lista[1]
  const guia = guias[categoria.slug]

  return (
    <header className="mt-3 grid gap-x-10 gap-y-8 bg-plano px-5 pb-6 pt-8 sm:px-10 sm:pt-10 lg:grid-cols-[1fr_1.5fr] lg:items-center lg:pb-10">
      <div>
        <h1 className="text-3xl font-semibold sm:text-4xl">{categoria.nombre}</h1>
        {guia && <p className="mt-3 max-w-sm text-sm text-tenue sm:text-base">{guia.bajada}</p>}
      </div>
      <div className="grid grid-cols-2 gap-x-4">
        {[primero, segundo].filter(Boolean).map((p) => (
          <Link key={p.id} to={`/producto/${p.id}`} className="group block">
            <Vitrina producto={p} categoria={p.categoria} className="aspect-[4/3]" />
            <span className="mt-1 block text-center font-sans text-xs text-tenue group-hover:text-tinta group-hover:underline sm:text-sm">
              {p.nombre}
            </span>
          </Link>
        ))}
      </div>
    </header>
  )
}

/* ---------- Comparación: todas las specs de lo que se está viendo ---------- */

// Campos que agrega el catálogo y que no son specs del producto
const NO_SON_SPECS = [...CAMPOS_BASE, 'categoria', 'precio', 'specs']

function Comparacion({ categoria, lista }) {
  const campos = Object.keys(lista[0]).filter((campo) => !NO_SON_SPECS.includes(campo))
  const esNumero = (campo) => typeof lista[0][campo] === 'number'

  return (
    <section aria-labelledby="comparacion" className="mt-16">
      <h2 id="comparacion" className="text-2xl font-semibold">
        Comparar {categoria.nombre}
      </h2>
      <p className="mt-2 text-sm text-tenue">
        {lista.length} modelos con todas sus especificaciones. El precio en violeta es en efectivo o
        transferencia.
        <span className="lg:hidden"> Tocá un modelo para ver el detalle.</span>
      </p>

      {/* En pantallas anchas, una tabla */}
      <table className="mt-5 hidden w-full text-sm tabular-nums lg:table">
        <thead>
          <tr className="border-b border-tinta text-xs text-tenue">
            <th scope="col" className="py-2 pr-3 text-left font-medium">
              Modelo
            </th>
            {campos.map((campo) => (
              <th
                key={campo}
                scope="col"
                className={`px-3 py-2 font-medium ${esNumero(campo) ? 'text-right' : 'text-left'}`}
              >
                {formatearCampo(campo)}
              </th>
            ))}
            <th scope="col" className="px-3 py-2 text-right font-medium">
              Precio de lista
            </th>
            <th scope="col" className="py-2 pl-3 text-right font-medium">
              En efectivo
            </th>
          </tr>
        </thead>
        <tbody>
          {lista.map((p) => (
            <tr key={p.id} className="border-b border-linea align-baseline">
              <th scope="row" className="py-2.5 pr-3 text-left font-medium">
                <Link to={`/producto/${p.id}`} className="hover:underline">
                  {p.nombre}
                </Link>
              </th>
              {campos.map((campo) => (
                <td key={campo} className={`px-3 py-2.5 ${esNumero(campo) ? 'text-right' : ''}`}>
                  {formatearValor(p[campo])}
                </td>
              ))}
              <td className="whitespace-nowrap px-3 py-2.5 text-right">{formatoPrecio(p.precio)}</td>
              <td className="whitespace-nowrap py-2.5 pl-3 text-right font-semibold text-acento">
                {formatoPrecio(precioEfectivo(p.precio))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* En celular y tablet, un renglón por producto que se abre para ver las specs */}
      <div className="mt-5 border-b border-linea lg:hidden">
        {lista.map((p) => (
          <details key={p.id} className="group border-t border-linea">
            <summary className="flex cursor-pointer list-none items-baseline justify-between gap-3 py-3 [&::-webkit-details-marker]:hidden">
              <span className="min-w-0 text-sm font-medium group-open:font-semibold">{p.nombre}</span>
              <span className="shrink-0 font-mono text-sm font-semibold text-acento tabular-nums">
                {formatoPrecio(precioEfectivo(p.precio))}
              </span>
            </summary>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 pb-4 tabular-nums">
              {campos.map((campo) => (
                <div key={campo}>
                  <dt className="text-xs text-tenue">{formatearCampo(campo)}</dt>
                  <dd className="text-sm font-medium">{formatearValor(p[campo])}</dd>
                </div>
              ))}
              <div>
                <dt className="text-xs text-tenue">Precio de lista</dt>
                <dd className="text-sm font-medium">{formatoPrecio(p.precio)}</dd>
              </div>
              <div className="self-end">
                <Link to={`/producto/${p.id}`} className="font-sans text-sm font-medium underline hover:no-underline">
                  Ver producto
                </Link>
              </div>
            </dl>
          </details>
        ))}
      </div>
    </section>
  )
}

/* ---------- Preguntas frecuentes de la categoría ---------- */

function Preguntas({ preguntas }) {
  return (
    <section aria-labelledby="preguntas" className="mx-auto mt-16 max-w-3xl">
      <h2 id="preguntas" className="text-center text-2xl font-semibold">
        Preguntas frecuentes
      </h2>
      <div className="mt-6 border-b border-linea">
        {preguntas.map(([pregunta, respuesta]) => (
          <details key={pregunta} className="group border-t border-linea">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium [&::-webkit-details-marker]:hidden">
              {pregunta}
              <span
                aria-hidden="true"
                className="text-2xl font-normal leading-none text-tenue transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="max-w-2xl pb-5 text-sm text-tenue">{respuesta}</p>
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
        <p className="mt-2 text-tenue">Elegí una de la barra de arriba o volvé al inicio.</p>
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
      <nav aria-label="Ruta" className="font-sans text-sm text-tenue">
        <Link to="/" className="hover:text-tinta hover:underline">
          Inicio
        </Link>
        <span className="mx-2">/</span>
        <span className="text-tinta">{categoria ? categoria.nombre : 'Todos los productos'}</span>
      </nav>

      {categoria ? (
        <Portada categoria={categoria} />
      ) : (
        <header className="mt-3">
          <h1 className="text-2xl font-semibold sm:text-3xl">{titulo}</h1>
          {/* Con todo el catálogo a la vista, accesos a cada categoría */}
          {!busqueda && (
            <nav aria-label="Categorías" className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
              {categorias.map((cat) => (
                <Link key={cat.slug} to={`/categoria/${cat.slug}`} className="underline hover:no-underline">
                  {cat.nombre}
                </Link>
              ))}
            </nav>
          )}
        </header>
      )}

      {/* Barra con la cantidad a la izquierda y el filtro y el orden a la derecha */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-linea pb-3 text-sm">
        <p className="text-tenue tabular-nums">
          {lista.length} {lista.length === 1 ? 'producto' : 'productos'}
        </p>

        {base.length > 1 && (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {marcas.length > 1 && (
              <label className="flex items-center gap-2">
                <span className="text-tenue">Marca</span>
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
              <span className="text-tenue">Ordenar por</span>
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
          <p className="font-sans text-lg font-semibold">
            {busqueda
              ? `No hay productos que coincidan con “${busqueda}”`
              : 'Todavía no hay productos en esta categoría'}
          </p>
          {busqueda && (
            <p className="mt-2 text-sm text-tenue">
              Probá con la marca o el modelo, por ejemplo “Ryzen” o “Logitech”.
            </p>
          )}
          <Link to="/productos" className={`mt-5 ${boton}`}>
            Ver todos los productos
          </Link>
        </div>
      ) : (
        // Tarjetas amplias, con aire entre una y otra
        <ul className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {lista.map((p) => (
            <li key={p.id}>
              <ProductoCard producto={p} amplia />
            </li>
          ))}
        </ul>
      )}

      {categoria && lista.length > 1 && <Comparacion categoria={categoria} lista={lista} />}
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
