import { Link } from 'react-router-dom'
import categorias from '../data/categorias'
import { productosDe, precioDesde, formatoPrecio } from '../data/catalogo'
import Ilustracion from '../components/Ilustracion'

/* ---------- Portada: mosaico de productos alrededor de la marca, y el título ---------- */

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
    const p = productosDe(cat.slug)[usados[cat.slug] ?? 0]
    if (p) {
      fila.push(p)
      usados[cat.slug] = (usados[cat.slug] ?? 0) + 1
    }
  }
  return fila
})

function Portada() {
  return (
    <section className="overflow-hidden pb-12">
      <div className="relative pt-8">
        {/* Las fichas son un atajo para quien usa mouse; con teclado y lector de pantalla
            se llega a los mismos productos desde las categorías de abajo */}
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

        {/* En el centro, la marca */}
        <div className="ficha ficha-central absolute left-1/2 top-1/2 flex h-24 w-52 -translate-x-1/2 -translate-y-1/2 items-center justify-center font-sans text-3xl font-semibold tracking-tight sm:h-32 sm:w-72 sm:text-[2.75rem]">
          <span aria-hidden="true">
            aura<span className="font-normal text-tenue">/</span>ware
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 text-center">
        <h1 className="text-3xl font-medium tracking-tight sm:text-5xl">
          Componentes y periféricos para tu PC
        </h1>
        <Link
          to="/productos"
          className="mt-8 inline-block rounded-md bg-tinta px-4 py-2 font-sans text-sm font-medium text-fondo hover:opacity-85"
        >
          Ver todos los productos
        </Link>
      </div>
    </section>
  )
}

/* ---------- Las siete categorías, en fichas grandes ---------- */

// Cuánto ocupa cada ficha en la grilla de 4 columnas (2 en celular).
// La forma acompaña al dibujo: las memorias y los teclados son anchos; la placa de video va en grande.
const FORMAS = {
  placas_de_video: 'col-span-2 row-span-2',
  memorias_ram: 'col-span-2',
  teclados: 'col-span-2',
}

function Categorias() {
  return (
    <nav aria-label="Categorías" className="mx-auto max-w-7xl px-4">
      <ul className="grid grid-flow-row-dense auto-rows-[11rem] grid-cols-2 gap-3 sm:auto-rows-[13rem] sm:gap-4 lg:grid-cols-4">
        {categorias.map((cat) => {
          const lista = productosDe(cat.slug)
          return (
            <li key={cat.slug} className={FORMAS[cat.slug] ?? ''}>
              <Link
                to={`/categoria/${cat.slug}`}
                className="ficha ficha-categoria group flex h-full flex-col p-4 sm:p-5"
              >
                {/* El dibujo es el del primer producto de la categoría */}
                <Ilustracion
                  producto={lista[0]}
                  categoria={cat.slug}
                  className="min-h-0 w-full flex-1"
                />
                <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 text-tinta">
                  <span className="text-base font-medium group-hover:underline sm:text-lg">{cat.nombre}</span>
                  <span className="font-mono text-xs text-tenue tabular-nums sm:text-sm">
                    desde {formatoPrecio(precioDesde(cat.slug))}
                  </span>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

// T-010: home con navegación por categorías
export default function Home() {
  return (
    <>
      <Portada />
      <Categorias />
    </>
  )
}
