import { Link } from 'react-router-dom'
import categorias, { grupos } from '../data/categorias'
import productos, { productosDe, precioDesde, formatoPrecio } from '../data/catalogo'
import { CUOTAS_SIN_INTERES } from '../data/reglas'
import ProductoCard from '../components/ProductoCard'
import Vitrina from '../components/Vitrina'
import Beneficios from '../components/Beneficios'
import Icono from '../components/Icono'

// El producto del hero: la placa de video más cara del catálogo
const destacado =
  [...productosDe('placas_de_video')].sort((a, b) => b.precio - a.precio)[0] ?? productos[0]

function Hero() {
  return (
    <section className="sobre-noche overflow-hidden bg-noche text-sobre-noche">
      <div className="mx-auto grid max-w-7xl items-center gap-x-12 gap-y-6 px-4 pb-10 pt-12 lg:grid-cols-[1fr_1.05fr] lg:pb-14 lg:pt-16">
        <div>
          <h1 className="titular text-[clamp(2.5rem,6.2vw,4.75rem)]">
            Armá la PC que tenés en la cabeza.
          </h1>
          <p className="mt-6 max-w-md text-lg text-tenue-noche">
            {productos.length} productos entre componentes y periféricos, con precios en pesos y
            hasta {CUOTAS_SIN_INTERES} cuotas sin interés.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/productos"
              className="rounded-lg bg-white px-6 py-3.5 font-semibold text-[#16142a] hover:bg-aura-luz"
            >
              Ver todos los productos
            </Link>
            <Link
              to="/categoria/procesadores"
              className="rounded-lg border border-linea-noche px-6 py-3.5 font-semibold hover:bg-noche-2"
            >
              Empezar por el procesador
            </Link>
          </div>
        </div>

        <Link to={`/producto/${destacado.id}`} className="group block">
          <Vitrina
            producto={destacado}
            categoria={destacado.categoria}
            libre
            respira
            className="aspect-[4/3] w-full"
          />
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <div>
              <p className="subtitular text-xl group-hover:underline sm:text-2xl">{destacado.nombre}</p>
              <p className="mt-1 text-tenue-noche">{destacado.descripcion}</p>
            </div>
            <p className="text-2xl font-bold tabular-nums">{formatoPrecio(destacado.precio)}</p>
          </div>
        </Link>
      </div>

      <div className="border-t border-linea-noche">
        <Beneficios />
      </div>
    </section>
  )
}

// T-010: home con navegación por categorías
export default function Home() {
  return (
    <>
      <Hero />

      <div className="mx-auto max-w-7xl px-4">
        <div className="mt-12 grid gap-x-8 gap-y-10 lg:grid-cols-[4fr_3fr]">
          {grupos.map((grupo) => {
            const delGrupo = categorias.filter((c) => c.grupo === grupo)
            return (
              <section key={grupo} aria-labelledby={`grupo-${grupo}`}>
                <h2 id={`grupo-${grupo}`} className="subtitular mb-4 text-2xl">
                  {grupo}
                </h2>
                <ul
                  className={`grid grid-cols-2 gap-3 ${
                    delGrupo.length > 3 ? 'sm:grid-cols-4' : 'sm:grid-cols-3'
                  }`}
                >
                  {delGrupo.map((cat) => (
                    <li key={cat.slug}>
                      <Link
                        to={`/categoria/${cat.slug}`}
                        className="group flex h-full flex-col rounded-xl border border-linea bg-superficie p-4 hover:border-aura"
                      >
                        <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-aura-claro text-aura">
                          <Icono categoria={cat.slug} className="h-8 w-8" />
                        </span>
                        <span className="mt-4 font-semibold leading-tight group-hover:text-aura">
                          {cat.nombre}
                        </span>
                        <span className="mt-1 text-sm text-tenue tabular-nums">
                          desde {formatoPrecio(precioDesde(cat.slug))}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>

        {categorias.map((cat) => {
          const lista = productosDe(cat.slug)
          return (
            <section key={cat.slug} className="mt-16" aria-labelledby={`fila-${cat.slug}`}>
              <div className="mb-5 flex items-baseline justify-between gap-4">
                <h2 id={`fila-${cat.slug}`} className="subtitular text-2xl">
                  {cat.nombre}
                </h2>
                <Link
                  to={`/categoria/${cat.slug}`}
                  className="shrink-0 font-semibold text-aura hover:underline"
                >
                  Ver los {lista.length}
                </Link>
              </div>
              <div className="-mx-4 flex snap-x scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
                {lista.slice(0, 4).map((p) => (
                  <div key={p.id} className="w-64 shrink-0 snap-start md:w-auto">
                    <ProductoCard producto={p} />
                  </div>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </>
  )
}
