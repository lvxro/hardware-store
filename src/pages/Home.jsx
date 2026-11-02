import { Link } from 'react-router-dom'
import { useTitulo } from '../data/titulo'
import categorias from '../data/categorias'
import { productosDe, precioDesde, formatoPrecio, ofertas } from '../data/catalogo'
import { PORCENTAJE_OFERTA } from '../data/ofertas'
import Ilustracion from '../components/Ilustracion'
import ProductoCard from '../components/ProductoCard'
import { useAlVerse } from '../components/animaciones'

/* ---------- Portada: mosaico de productos alrededor de la barra del logo, y el título ---------- */

// Productos para las fichas del fondo. Cada fila arranca en una categoría distinta,
// así no quedan columnas con el mismo tipo de producto repetido.
const FILAS = [
  { cantidad: 9, arranca: 0 },
  { cantidad: 10, arranca: 3 },
  { cantidad: 9, arranca: 5 },
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

// Cuándo aparece cada ficha (las del centro primero) y cuándo le toca su destello
function tiempos(fila, columna, cuantas) {
  const distancia = Math.hypot(columna - (cuantas - 1) / 2, (fila - (FILAS.length - 1) / 2) * 1.2)
  return {
    '--espera': `${Math.round(200 + distancia * 90)}ms`,
    '--destello': `${((fila * 7 + columna * 11) % 18) + 2}s`,
  }
}

const TITULO = 'Componentes y periféricos para tu PC'.split(' ')

function Portada() {
  return (
    <section className="overflow-hidden pb-10">
      <div className="relative pt-6">
        {/* Las fichas son un atajo para quien usa mouse; con teclado y lector de pantalla
            se llega a los mismos productos desde las categorías de abajo */}
        <div className="mosaico flex flex-col gap-2.5 sm:gap-3" aria-hidden="true">
          {filasDelMosaico.map((fila, i) => (
            <div key={i} className="relative left-1/2 flex w-max -translate-x-1/2 gap-2.5 sm:gap-3">
              {fila.map((p, j) => (
                <Link
                  key={p.id}
                  to={`/producto/${p.id}`}
                  tabIndex={-1}
                  title={`${p.nombre}, ${formatoPrecio(p.precio)}`}
                  className="ficha h-12 w-12 p-1.5 sm:h-16 sm:w-16 sm:p-2"
                  style={tiempos(i, j, fila.length)}
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

        {/* En el centro, la barra del logo: el nombre completo ya está arriba a la izquierda */}
        <div className="ficha ficha-central absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center sm:h-24 sm:w-24">
          <svg viewBox="0 0 32 32" className="h-[66%] w-[66%]" aria-hidden="true">
            <defs>
              {/* De blanco arriba a gris abajo, para que la barra tenga algo de volumen */}
              <linearGradient id="barra" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="var(--text)" />
                <stop offset="1" stopColor="var(--muted)" />
              </linearGradient>
            </defs>
            <path
              d="M19.5 5h4L12.5 27h-4z"
              fill="url(#barra)"
              stroke="url(#barra)"
              strokeWidth="1.25"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 text-center">
        {/* El título entra palabra por palabra, después del mosaico */}
        <h1 className="mt-2 text-3xl font-medium tracking-tight sm:text-4xl">
          {TITULO.map((palabra, i) => (
            <span key={i}>
              <span className="entra-palabra" style={{ '--espera': `${650 + i * 70}ms` }}>
                {palabra}
              </span>{' '}
            </span>
          ))}
        </h1>
        <Link
          to="/productos"
          className="entra-subiendo group mt-6 inline-flex items-center gap-2 rounded-[3px] bg-lime px-5 py-2.5 font-mono text-sm font-bold text-bg hover:shadow-glow"
          style={{ '--espera': '1150ms' }}
        >
          Ver todos los productos
          {/* La flecha avanza un poco al pasar el cursor */}
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:translate-x-1"
            aria-hidden="true"
          >
            <path d="M2 8h11M9 4l4 4-4 4" />
          </svg>
        </Link>
      </div>
    </section>
  )
}

/* ---------- Las siete categorías, en una tira ---------- */

// En compu entran las siete en una fila; en celular se desliza de costado
function Categorias() {
  // Las fichas aparecen en cadena cuando la tira entra en pantalla
  const [tira, visto] = useAlVerse()
  return (
    <nav aria-label="Categorías" className="mx-auto max-w-7xl px-4 pb-12">
      <ul
        ref={tira}
        className={`en-cadena -mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 lg:mx-0 lg:grid lg:grid-cols-7 lg:overflow-visible lg:px-0 ${
          visto ? 'visto' : ''
        }`}
      >
        {categorias.map((cat, i) => (
          <li key={cat.slug} className="w-32 shrink-0 snap-start lg:w-auto" style={{ '--i': i }}>
            <Link
              to={`/categoria/${cat.slug}`}
              className="ficha ficha-categoria group flex h-full flex-col p-3 hover:border-lime hover:shadow-glow"
            >
              {/* El dibujo es el del primer producto de la categoría */}
              <Ilustracion producto={productosDe(cat.slug)[0]} categoria={cat.slug} className="dibujo-sin-rotulos h-14 w-full" />
              <span className="mt-2 text-sm font-medium text-white group-hover:underline">{cat.nombre}</span>
              <span className="font-mono text-[11px] text-muted">desde {formatoPrecio(precioDesde(cat.slug))}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/* ---------- Ofertas: cuatro de los productos con el 25 % menos (T-021); el resto, en /ofertas ---------- */

const OFERTAS_EN_HOME = 4

function Ofertas() {
  // Las tarjetas aparecen en cadena cuando la grilla entra en pantalla, igual que las categorías
  const [grilla, visto] = useAlVerse()
  return (
    <section aria-labelledby="ofertas" className="mx-auto max-w-7xl px-4 pb-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <div>
          <h2 id="ofertas" className="text-2xl font-semibold sm:text-3xl">
            Ofertas
          </h2>
          <p className="mt-1 text-sm text-muted">
            {PORCENTAJE_OFERTA} % menos que el precio de lista.
          </p>
        </div>
        <Link to="/ofertas" className="text-sm font-medium text-lime underline-offset-4 hover:underline">
          Ver las {ofertas.length} ofertas
        </Link>
      </div>
      <ul
        ref={grilla}
        className={`en-cadena mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 ${visto ? 'visto' : ''}`}
      >
        {ofertas.slice(0, OFERTAS_EN_HOME).map((p, i) => (
          <li key={p.id} style={{ '--i': i }}>
            <ProductoCard producto={p} compacta />
          </li>
        ))}
      </ul>
    </section>
  )
}

// T-010: home con navegación por categorías. T-021 le suma las ofertas.
// Más corto: portada, la tira de categorías y una fila de ofertas. El catálogo entero está a un clic.
export default function Home() {
  useTitulo()
  return (
    <>
      <Portada />
      <Categorias />
      <Ofertas />
    </>
  )
}
