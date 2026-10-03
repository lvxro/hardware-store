import { Link } from 'react-router-dom'
import categorias, { grupos } from '../data/categorias'
import productos, { productosDe, precioDesde, formatoPrecio } from '../data/catalogo'
import ProductoCard from '../components/ProductoCard'
import Icono from '../components/Icono'

// T-010: home con navegación por categorías
export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Componentes y periféricos para tu PC
      </h1>
      <p className="mt-3 max-w-xl text-tenue">
        {productos.length} productos en {categorias.length} categorías. Precios de
        referencia en dólares.
      </p>

      <div className="mt-10 grid gap-8 md:grid-cols-[3fr_2fr]">
        {grupos.map((grupo) => (
          <section key={grupo} aria-labelledby={`grupo-${grupo}`}>
            <h2 id={`grupo-${grupo}`} className="mb-3 text-sm font-medium text-tenue">
              {grupo}
            </h2>
            <ul className="divide-y divide-linea rounded-md border border-linea bg-superficie">
              {categorias
                .filter((c) => c.grupo === grupo)
                .map((cat) => (
                  <li key={cat.slug}>
                    <Link
                      to={`/categoria/${cat.slug}`}
                      className="flex items-center gap-4 px-4 py-3 hover:bg-fondo"
                    >
                      <Icono categoria={cat.slug} className="h-8 w-8 shrink-0 text-tenue" />
                      <span className="flex-1 font-medium">{cat.nombre}</span>
                      <span className="text-sm text-tenue tabular-nums">
                        desde {formatoPrecio(precioDesde(cat.slug))}
                      </span>
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>

      {categorias.map((cat) => {
        const lista = productosDe(cat.slug)
        return (
          <section key={cat.slug} className="mt-14" aria-labelledby={`fila-${cat.slug}`}>
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <h2 id={`fila-${cat.slug}`} className="text-xl font-semibold">
                {cat.nombre}
              </h2>
              <Link
                to={`/categoria/${cat.slug}`}
                className="text-sm font-medium text-pcb hover:underline"
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
  )
}
