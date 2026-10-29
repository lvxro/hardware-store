import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import categorias from '../data/categorias'
import productos, { formatoPrecio, productosDe } from '../data/catalogo'
import guias from '../data/guias'
import { PORCENTAJE_OFERTA } from '../data/ofertas'
import ProductoCard from '../components/ProductoCard'
import { compatibleCon } from '../data/compatibilidad'
import Vitrina from '../components/Vitrina'
import { useTitulo } from '../data/titulo'

// T-021: "Ofertas" reemplaza a "Destacados". Pone primero los productos en oferta y deja los demás
// en su orden de siempre (el orden de sort es estable).
const ordenes = {
  ofertas: { nombre: 'Ofertas', fn: (a, b) => Number(b.enOferta) - Number(a.enOferta) },
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

/* ---------- T-026: filtro de precio mínimo y máximo ---------- */

// Los campos guardan solo los dígitos; se muestran con puntos de miles mientras se escribe
const aNumero = (texto) => (texto === '' ? null : Number(texto))
const conPuntos = (texto) => (texto === '' ? '' : Number(texto).toLocaleString('es-AR'))

function CampoPrecio({ etiqueta, valor, onCambiar, sugerido }) {
  return (
    <label className="flex items-center rounded-[3px] border border-line-strong bg-surface focus-within:border-lime hover:border-line-hover">
      <span className="sr-only">{etiqueta}</span>
      <span aria-hidden="true" className="pl-2.5 font-mono text-muted">
        $
      </span>
      <input
        type="text"
        inputMode="numeric"
        value={conPuntos(valor)}
        onChange={(e) => onCambiar(e.target.value.replace(/\D/g, '').slice(0, 9))}
        placeholder={sugerido}
        className="w-24 bg-transparent px-1.5 py-1.5 font-mono font-medium text-white placeholder:text-muted/60 focus:outline-none sm:w-28"
      />
    </label>
  )
}

function FiltroPrecio({ desde, hasta, onDesde, onHasta, minimo, maximo }) {
  const invertido = desde !== '' && hasta !== '' && Number(desde) > Number(hasta)
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-muted">Precio</span>
      <CampoPrecio etiqueta="Precio desde" valor={desde} onCambiar={onDesde} sugerido={minimo.toLocaleString('es-AR')} />
      <span aria-hidden="true" className="text-muted">
        –
      </span>
      <CampoPrecio etiqueta="Precio hasta" valor={hasta} onCambiar={onHasta} sugerido={maximo.toLocaleString('es-AR')} />
      {(desde !== '' || hasta !== '') && (
        <button
          type="button"
          onClick={() => {
            onDesde('')
            onHasta('')
          }}
          className="text-muted underline-offset-4 hover:text-white hover:underline"
        >
          Limpiar
        </button>
      )}
      {invertido && (
        <span role="alert" className="w-full text-xs text-lime">
          El precio “desde” es mayor que el “hasta”: los damos vuelta.
        </span>
      )}
    </div>
  )
}

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
                className="text-2xl font-normal leading-none text-muted transition-[rotate,color] duration-300 ease-out group-open:rotate-45 group-open:text-lime"
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

function ListadoContenido({ slug, busqueda, soloOfertas, enCarrito, compatiblesInicial }) {
  const [orden, setOrden] = useState('ofertas')
  const [marca, setMarca] = useState(null)
  // T-026: rango de precio, en pesos (precio de lista). Vacío = sin límite
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  // T-029: ver solo lo que va con el carrito (se abre activado desde los enlaces del carrito)
  const [soloCompatibles, setSoloCompatibles] = useState(compatiblesInicial)
  const categoria = categorias.find((c) => c.slug === slug)
  useTitulo(
    slug && !categoria
      ? 'Categoría no encontrada'
      : soloOfertas
        ? 'Ofertas'
        : categoria
          ? categoria.nombre
          : busqueda
            ? `Resultados para "${busqueda}"`
            : 'Todos los productos',
  )

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
  if (soloOfertas) base = base.filter((p) => p.enOferta)
  if (busqueda) base = buscar(base, busqueda)

  // Marcas presentes en lo que se está viendo, con cuántos productos tiene cada una
  const marcas = [...new Set(base.map((p) => p.marca))]
    .map((nombre) => ({ nombre, cantidad: base.filter((p) => p.marca === nombre).length }))
    .sort((a, b) => b.cantidad - a.cantidad || a.nombre.localeCompare(b.nombre))

  let lista = marca ? base.filter((p) => p.marca === marca) : base

  // T-026: precio mínimo y máximo. Si los cargaron al revés, se dan vuelta.
  const precios = base.map((p) => p.precio)
  const minimo = precios.length ? Math.min(...precios) : 0
  const maximo = precios.length ? Math.max(...precios) : 0
  let [piso, techo] = [aNumero(desde), aNumero(hasta)]
  if (piso != null && techo != null && piso > techo) [piso, techo] = [techo, piso]
  const filtraPrecio = piso != null || techo != null
  if (filtraPrecio) lista = lista.filter((p) => (piso == null || p.precio >= piso) && (techo == null || p.precio <= techo))

  // T-029: compatibilidad de cada producto con el carrito (null = no hay con qué comparar)
  const compat = new Map(base.map((p) => [p.id, compatibleCon(p, enCarrito)]))
  const hayCompat = base.some((p) => compat.get(p.id))
  const filtraCompat = soloCompatibles && hayCompat
  if (filtraCompat) lista = lista.filter((p) => compat.get(p.id)?.ok !== false)
  if (ordenes[orden].fn) lista = [...lista].sort(ordenes[orden].fn)

  const guia = categoria ? guias[categoria.slug] : null

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <nav aria-label="Ruta" className="text-sm text-muted">
        <Link to="/" className="subrayado border-b-2 border-transparent hover:text-white">
          Inicio
        </Link>
        <span className="mx-2">/</span>
        <span className="text-white">
          {soloOfertas ? 'Ofertas' : categoria ? categoria.nombre : 'Todos los productos'}
        </span>
      </nav>

      {soloOfertas ? (
        <header className="mt-3">
          <h1 className="text-2xl font-semibold sm:text-3xl">Ofertas</h1>
          <p className="mt-2 text-sm text-muted sm:text-base">
            {base.length} productos con {PORCENTAJE_OFERTA} % menos que su precio de lista.
          </p>
        </header>
      ) : categoria ? (
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
            {hayCompat && (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={soloCompatibles}
                  onChange={(e) => setSoloCompatibles(e.target.checked)}
                  className="h-4 w-4 accent-[var(--lime)]"
                />
                <span className={soloCompatibles ? 'text-lime' : 'text-muted'}>Solo compatibles con tu carrito</span>
              </label>
            )}
            <FiltroPrecio desde={desde} hasta={hasta} onDesde={setDesde} onHasta={setHasta} minimo={minimo} maximo={maximo} />
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

      {lista.length === 0 && filtraPrecio && base.length > 0 ? (
        // T-026: nada en ese rango
        <div className="py-8">
          <p className="text-lg font-semibold">
            No hay productos{' '}
            {piso != null && techo != null
              ? `entre ${formatoPrecio(piso)} y ${formatoPrecio(techo)}`
              : piso != null
                ? `desde ${formatoPrecio(piso)}`
                : `hasta ${formatoPrecio(techo)}`}
            {marca ? ` de ${marca}` : ''}
          </p>
          <p className="mt-2 text-sm text-muted">
            Acá los precios van de {formatoPrecio(minimo)} a {formatoPrecio(maximo)}.
          </p>
          <button
            type="button"
            onClick={() => {
              setDesde('')
              setHasta('')
            }}
            className={`mt-5 ${boton}`}
          >
            Quitar el filtro de precio
          </button>
        </div>
      ) : lista.length === 0 ? (
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
              <ProductoCard producto={p} compat={compat.get(p.id)} />
            </li>
          ))}
        </ul>
      )}

      {guia && <Preguntas preguntas={guia.preguntas} />}
    </div>
  )
}

// T-011: listado de productos. Sirve para /productos (todos, o una búsqueda con ?q=) y /categoria/:slug
// Con "soloOfertas" (ruta /ofertas, T-021) muestra solo los productos en oferta
export default function Listado({ soloOfertas = false, enCarrito = [] }) {
  const { slug } = useParams()
  const [parametros] = useSearchParams()
  const busqueda = slug || soloOfertas ? '' : (parametros.get('q') ?? '').trim()
  // La key reinicia el orden y la marca elegida al cambiar de categoría o de búsqueda
  return (
    <ListadoContenido
      key={`${slug}|${busqueda}|${soloOfertas}`}
      slug={slug}
      busqueda={busqueda}
      soloOfertas={soloOfertas}
      enCarrito={enCarrito}
      compatiblesInicial={parametros.get('compatibles') === '1'}
    />
  )
}
