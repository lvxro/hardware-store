import { Link } from 'react-router-dom'
import categorias, { grupos } from '../data/categorias'
import productos, { productosDe, precioDesde, formatoPrecio } from '../data/catalogo'
import { CUOTAS_SIN_INTERES, precioEfectivo } from '../data/reglas'
import ProductoCard from '../components/ProductoCard'
import Vitrina from '../components/Vitrina'

const categoria = (slug) => categorias.find((c) => c.slug === slug)
const unicos = (slug, campo) => [...new Set(productosDe(slug).map((p) => p[campo]))]
const enumerar = new Intl.ListFormat('es', { type: 'conjunction' }) // "AM5, AM4 y LGA1700"
const alternar = new Intl.ListFormat('es', { type: 'disjunction' }) // "DDR5 o DDR4"

/* ---------- Armado por pasos ---------- */

const consumos = productosDe('placas_de_video').map((p) => p.consumo_w)

// El orden importa: cada elección condiciona la siguiente
const PASOS = [
  {
    slug: 'procesadores',
    nombre: 'Procesador',
    nota: `Define el socket: ${enumerar.format(unicos('procesadores', 'socket'))}.`,
  },
  {
    slug: 'placas_base',
    nombre: 'Placa madre',
    nota: 'Con el mismo socket que el procesador.',
  },
  {
    slug: 'memorias_ram',
    nombre: 'Memoria RAM',
    nota: `${alternar.format(unicos('memorias_ram', 'tipo'))}, según la placa madre.`,
  },
  {
    slug: 'placas_de_video',
    nombre: 'Placa de video',
    nota: `De ${Math.min(...consumos)} a ${Math.max(...consumos)} W de consumo.`,
  },
]

function Pasos() {
  return (
    <section aria-labelledby="pasos" className="pt-8">
      <h1 id="pasos" className="text-2xl font-semibold sm:text-3xl">
        Armá tu PC en cuatro pasos
      </h1>
      <ol className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-[3px] border border-linea bg-linea lg:grid-cols-4">
        {PASOS.map((paso, i) => (
          <li key={paso.slug} className="bg-fondo">
            <Link to={`/categoria/${paso.slug}`} className="group block h-full p-4 hover:bg-plano">
              <p className="text-xs text-tenue tabular-nums">Paso {i + 1}</p>
              <p className="mt-1 font-sans text-lg font-semibold group-hover:underline">{paso.nombre}</p>
              <p className="mt-1 text-sm text-tenue">{paso.nota}</p>
              <p className="mt-3 text-sm tabular-nums">
                {productosDe(paso.slug).length} modelos desde {formatoPrecio(precioDesde(paso.slug))}
              </p>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}

/* ---------- Categorías: lista de texto con la cantidad de productos ---------- */

function Categorias() {
  const fila = 'flex items-baseline justify-between gap-4 border-t border-linea py-2 hover:underline'
  return (
    <nav aria-labelledby="categorias">
      <h2 id="categorias" className="text-lg font-semibold">
        Categorías
      </h2>
      {grupos.map((grupo) => (
        <div key={grupo} className="mt-4">
          <h3 className="pb-1.5 text-sm text-tenue">{grupo}</h3>
          <ul>
            {categorias
              .filter((c) => c.grupo === grupo)
              .map((cat) => (
                <li key={cat.slug}>
                  <Link to={`/categoria/${cat.slug}`} className={fila}>
                    <span className="font-medium">{cat.nombre}</span>
                    <span className="text-sm text-tenue tabular-nums">{productosDe(cat.slug).length}</span>
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      ))}
      <Link to="/productos" className={`mt-4 ${fila} border-b`}>
        <span className="font-medium">Todos los productos</span>
        <span className="text-sm text-tenue tabular-nums">{productos.length}</span>
      </Link>
    </nav>
  )
}

/* ---------- Producto destacado, en grande ---------- */

// La placa de video más cara del catálogo
const destacado =
  [...productosDe('placas_de_video')].sort((a, b) => b.precio - a.precio)[0] ?? productos[0]

function Destacado() {
  const p = destacado
  const filas = [
    ...p.specs,
    ['Precio de lista', formatoPrecio(p.precio)],
    [`${CUOTAS_SIN_INTERES} cuotas sin interés de`, formatoPrecio(Math.round(p.precio / CUOTAS_SIN_INTERES))],
  ]

  return (
    <section aria-labelledby="destacado">
      <h2 id="destacado" className="text-lg font-semibold">
        Producto destacado
      </h2>
      <div className="mt-4 grid gap-x-8 gap-y-5 md:grid-cols-[1.3fr_1fr]">
        <Link to={`/producto/${p.id}`} aria-hidden="true" tabIndex={-1}>
          <Vitrina producto={p} categoria={p.categoria} className="aspect-[4/3] w-full" />
        </Link>

        <div>
          <p className="text-sm text-tenue">{p.marca}</p>
          <h3 className="text-2xl font-semibold">{p.modelo}</h3>
          <p className="mt-2 text-tenue">{p.descripcion}</p>

          <dl className="mt-5 text-sm tabular-nums">
            {filas.map(([etiqueta, valor]) => (
              <div key={etiqueta} className="flex justify-between gap-4 border-t border-linea py-2">
                <dt className="text-tenue">{etiqueta}</dt>
                <dd className="text-right font-medium">{valor}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-4 border-y border-linea py-2 text-pcb">
              <dt>En efectivo o transferencia</dt>
              <dd className="text-right text-base font-semibold">
                {formatoPrecio(precioEfectivo(p.precio))}
              </dd>
            </div>
          </dl>

          <Link
            to={`/producto/${p.id}`}
            className="mt-5 inline-block rounded-[3px] border border-tinta px-4 py-2 font-sans text-sm font-medium hover:bg-tinta hover:text-fondo"
          >
            Ver producto
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ---------- Encabezado común de las secciones por categoría ---------- */

function Titulo({ slug }) {
  const cat = categoria(slug)
  return (
    <div className="flex items-baseline justify-between gap-4">
      <h2 id={`fila-${slug}`} className="text-lg font-semibold">
        {cat.nombre}{' '}
        <span className="text-sm font-normal text-tenue tabular-nums">{productosDe(slug).length}</span>
      </h2>
      <Link to={`/categoria/${slug}`} className="shrink-0 font-sans text-sm font-medium underline hover:no-underline">
        Ver todo
      </Link>
    </div>
  )
}

/* ---------- Tabla comparativa de procesadores ---------- */

const numero = 'px-3 py-2.5 text-right'

function TablaProcesadores() {
  const lista = productosDe('procesadores').slice(0, 8)
  return (
    <section aria-labelledby="fila-procesadores" className="mt-14">
      <Titulo slug="procesadores" />
      <table className="mt-3 w-full text-sm tabular-nums">
        <thead>
          <tr className="border-b border-tinta text-xs text-tenue">
            <th scope="col" className="py-2 pr-3 text-left font-medium">Modelo</th>
            <th scope="col" className={`${numero} font-medium`}>Núcleos</th>
            <th scope="col" className={`${numero} hidden font-medium md:table-cell`}>Hilos</th>
            <th scope="col" className={`${numero} hidden font-medium md:table-cell`}>Frecuencia máx.</th>
            <th scope="col" className="px-3 py-2 text-left font-medium">Socket</th>
            <th scope="col" className={`${numero} hidden font-medium md:table-cell`}>TDP</th>
            <th scope="col" className={`${numero} hidden font-medium md:table-cell`}>Caché L3</th>
            <th scope="col" className={`${numero} hidden font-medium sm:table-cell`}>Precio de lista</th>
            <th scope="col" className="py-2 pl-3 text-right font-medium">En efectivo</th>
          </tr>
        </thead>
        <tbody>
          {lista.map((p) => (
            <tr key={p.id} className="border-b border-linea">
              <th scope="row" className="py-2.5 pr-3 text-left font-medium">
                <Link to={`/producto/${p.id}`} className="hover:underline">
                  {p.nombre}
                </Link>
              </th>
              <td className={numero}>{p.nucleos}</td>
              <td className={`${numero} hidden md:table-cell`}>{p.hilos}</td>
              <td className={`${numero} hidden md:table-cell`}>
                {p.frecuencia_boost_ghz.toLocaleString('es-AR', { minimumFractionDigits: 1 })} GHz
              </td>
              <td className="px-3 py-2.5">{p.socket}</td>
              <td className={`${numero} hidden md:table-cell`}>{p.tdp_w} W</td>
              <td className={`${numero} hidden md:table-cell`}>{p.cache_l3_mb} MB</td>
              <td className={`${numero} hidden sm:table-cell`}>{formatoPrecio(p.precio)}</td>
              <td className="py-2.5 pl-3 text-right font-semibold text-pcb">
                {formatoPrecio(precioEfectivo(p.precio))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

/* ---------- Fila de tarjetas compactas, separadas por líneas ---------- */

function FilaDeTarjetas({ slug }) {
  return (
    <section aria-labelledby={`fila-${slug}`} className="mt-14">
      <Titulo slug={slug} />
      <ul className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-[3px] border border-linea bg-linea sm:grid-cols-3 lg:grid-cols-6">
        {productosDe(slug)
          .slice(0, 6)
          .map((p) => (
            <li key={p.id} className="bg-fondo">
              <ProductoCard producto={p} />
            </li>
          ))}
      </ul>
    </section>
  )
}

/* ---------- Dos categorías lado a lado, como listas de renglones ---------- */

function Lista({ slug }) {
  return (
    <section aria-labelledby={`fila-${slug}`} className="min-w-0">
      <Titulo slug={slug} />
      <ul className="mt-3 border-b border-linea">
        {productosDe(slug)
          .slice(0, 6)
          .map((p) => (
            <li key={p.id}>
              <Link
                to={`/producto/${p.id}`}
                className="group flex items-baseline justify-between gap-4 border-t border-linea py-2.5"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium group-hover:underline">{p.nombre}</span>
                  <span className="block truncate text-xs text-tenue tabular-nums">
                    {p.specs.map(([, valor]) => valor).join(', ')}
                  </span>
                </span>
                <span className="shrink-0 text-right tabular-nums">
                  <span className="block text-sm font-semibold">{formatoPrecio(p.precio)}</span>
                  <span className="block text-xs font-medium text-pcb">
                    {formatoPrecio(precioEfectivo(p.precio))} en efectivo
                  </span>
                </span>
              </Link>
            </li>
          ))}
      </ul>
    </section>
  )
}

function DosListas({ slugs }) {
  return (
    <div className="mt-14 grid gap-x-12 gap-y-14 md:grid-cols-2">
      {slugs.map((slug) => (
        <Lista key={slug} slug={slug} />
      ))}
    </div>
  )
}

// T-010: home con navegación por categorías
export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4">
      <Pasos />

      <div className="mt-12 grid gap-x-12 gap-y-12 lg:grid-cols-[15rem_1fr]">
        <Categorias />
        <Destacado />
      </div>

      <TablaProcesadores />
      <FilaDeTarjetas slug="placas_de_video" />
      <DosListas slugs={['placas_base', 'memorias_ram']} />
      <FilaDeTarjetas slug="monitores" />
      <DosListas slugs={['teclados', 'mouses']} />
    </div>
  )
}
