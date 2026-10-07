import { Link } from 'react-router-dom'
import categorias from '../data/categorias'
import productos, { productosDe, formatoPrecio } from '../data/catalogo'
import { precioEfectivo } from '../data/reglas'
import ProductoCard from '../components/ProductoCard'
import Ilustracion from '../components/Ilustracion'

const categoria = (slug) => categorias.find((c) => c.slug === slug)

/* ---------- Portada: mosaico de productos, título y accesos a las categorías ---------- */

// El producto del centro del mosaico: la placa de video más cara del catálogo
const destacado =
  [...productosDe('placas_de_video')].sort((a, b) => b.precio - a.precio)[0] ?? productos[0]

// Productos para las fichas del fondo. Cada fila arranca en una categoría distinta,
// así no quedan columnas con el mismo tipo de producto repetido.
const FILAS = [
  { cantidad: 8, arranca: 0 },
  { cantidad: 9, arranca: 3 },
  { cantidad: 9, arranca: 5 },
  { cantidad: 8, arranca: 1 },
]
const usados = {} // cuántos productos de cada categoría ya se pusieron
const filasDelMosaico = FILAS.map(({ cantidad, arranca }) => {
  const fila = []
  for (let i = 0; fila.length < cantidad && i < cantidad * 3; i++) {
    const cat = categorias[(arranca + i) % categorias.length]
    const p = productosDe(cat.slug).filter((otro) => otro.id !== destacado.id)[usados[cat.slug] ?? 0]
    if (p) {
      fila.push(p)
      usados[cat.slug] = (usados[cat.slug] ?? 0) + 1
    }
  }
  return fila
})

function Portada() {
  return (
    <section className="overflow-hidden border-b border-linea pb-12">
      <div className="relative pt-8">
        {/* Las fichas son un atajo para quien usa mouse; con teclado y lector de pantalla
            se llega a los mismos productos desde las secciones de abajo */}
        <div className="mosaico flex flex-col gap-3 sm:gap-4" aria-hidden="true">
          {filasDelMosaico.map((fila, i) => (
            <div key={i} className="relative left-1/2 flex w-max -translate-x-1/2 gap-3 sm:gap-4">
              {fila.map((p) => (
                <Link
                  key={p.id}
                  to={`/producto/${p.id}`}
                  tabIndex={-1}
                  title={`${p.nombre}, ${formatoPrecio(p.precio)}`}
                  className="ficha h-16 w-16 p-2 sm:h-20 sm:w-20 sm:p-2.5"
                >
                  <Ilustracion
                    producto={p}
                    categoria={p.categoria}
                    className="dibujo-sin-rotulos h-full w-full"
                  />
                </Link>
              ))}
            </div>
          ))}
        </div>

        <Link
          to={`/producto/${destacado.id}`}
          aria-label={`${destacado.nombre}, producto destacado`}
          title={`${destacado.nombre}, ${formatoPrecio(destacado.precio)}`}
          className="ficha ficha-central absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 p-3 sm:h-32 sm:w-32 sm:p-4"
        >
          <Ilustracion
            producto={destacado}
            categoria={destacado.categoria}
            className="dibujo-sin-rotulos h-full w-full"
          />
        </Link>
      </div>

      <div className="mx-auto max-w-7xl px-4 text-center">
        <h1 className="text-3xl font-medium tracking-tight sm:text-5xl">
          Componentes y periféricos para tu PC
        </h1>
        <p className="mt-4 text-sm text-tenue">
          {productos.length} productos en {categorias.length} categorías, con precios en pesos
          argentinos.
        </p>

        <nav aria-label="Categorías" className="mt-8 flex flex-wrap justify-center gap-2 text-sm">
          {categorias.map((cat) => (
            <Link
              key={cat.slug}
              to={`/categoria/${cat.slug}`}
              className="rounded-md border border-linea px-3 py-1.5 hover:border-tenue hover:bg-plano"
            >
              {cat.nombre}{' '}
              <span className="text-xs text-tenue tabular-nums">{productosDe(cat.slug).length}</span>
            </Link>
          ))}
          <Link
            to="/productos"
            className="rounded-md bg-tinta px-3 py-1.5 font-medium text-fondo hover:opacity-85"
          >
            Ver todos los productos
          </Link>
        </nav>
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
              <td className="py-2.5 pl-3 text-right font-semibold text-acento">
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
                  <span className="block text-xs font-medium text-acento">
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
    <>
      <Portada />

      <div className="mx-auto max-w-7xl px-4">
        <TablaProcesadores />
        <FilaDeTarjetas slug="placas_de_video" />
        <DosListas slugs={['placas_base', 'memorias_ram']} />
        <FilaDeTarjetas slug="monitores" />
        <DosListas slugs={['teclados', 'mouses']} />
      </div>
    </>
  )
}
