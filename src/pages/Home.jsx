import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import categorias from '../data/categorias'
import { productosDe, precioDesde, formatoPrecio } from '../data/catalogo'
import Ilustracion from '../components/Ilustracion'
import { sinMovimiento, trazar, useAlVerse } from '../components/animaciones'

/* ---------- Portada: mosaico de productos alrededor de la barra del logo, y el título ---------- */

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
  const mosaico = useRef(null)

  // Con mouse, el mosaico acompaña apenas al cursor: da sensación de profundidad.
  // Solo se actualizan dos variables de CSS, una vez por cuadro.
  const alMover = (e) => {
    if (e.pointerType !== 'mouse' || sinMovimiento()) return
    const caja = e.currentTarget.getBoundingClientRect()
    const px = ((e.clientX - caja.left) / caja.width) * 2 - 1
    const py = ((e.clientY - caja.top) / caja.height) * 2 - 1
    requestAnimationFrame(() => {
      mosaico.current?.style.setProperty('--px', px.toFixed(3))
      mosaico.current?.style.setProperty('--py', py.toFixed(3))
    })
  }
  const alSalir = () => {
    mosaico.current?.style.setProperty('--px', 0)
    mosaico.current?.style.setProperty('--py', 0)
  }

  return (
    <section className="overflow-hidden pb-12" onPointerMove={alMover} onPointerLeave={alSalir}>
      <div className="relative pt-8">
        {/* Las fichas son un atajo para quien usa mouse; con teclado y lector de pantalla
            se llega a los mismos productos desde las categorías de abajo */}
        <div ref={mosaico} className="mosaico flex flex-col gap-3 sm:gap-4" aria-hidden="true">
          {filasDelMosaico.map((fila, i) => (
            <div key={i} className="relative left-1/2 flex w-max -translate-x-1/2 gap-3 sm:gap-4">
              {fila.map((p, j) => (
                <Link
                  key={p.id}
                  to={`/producto/${p.id}`}
                  tabIndex={-1}
                  title={`${p.nombre}, ${formatoPrecio(p.precio)}`}
                  className="ficha h-16 w-16 p-2 sm:h-20 sm:w-20 sm:p-2.5"
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
        <div className="ficha ficha-central absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center sm:h-32 sm:w-32">
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
        <h1 className="text-3xl font-medium tracking-tight sm:text-5xl">
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
          className="entra-subiendo group mt-8 inline-flex items-center gap-2 rounded-[3px] bg-lime px-5 py-2.5 font-mono text-sm font-bold text-bg hover:shadow-glow"
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

/* ---------- Las siete categorías, en fichas grandes ---------- */

// Cuánto ocupa cada ficha en la grilla de 4 columnas (2 en celular).
// La forma acompaña al dibujo: las memorias y los teclados son anchos; la placa de video va en grande.
const FORMAS = {
  placas_de_video: 'col-span-2 row-span-2',
  memorias_ram: 'col-span-2',
  teclados: 'col-span-2',
}

function Categorias() {
  // Las fichas aparecen en cadena cuando la grilla entra en pantalla
  const [grilla, visto] = useAlVerse()

  // Cuando aparecen, el dibujo de cada ficha se traza, una después de la otra
  useEffect(() => {
    if (!visto) return
    grilla.current?.querySelectorAll('svg.dibujo').forEach((svg, i) => trazar(svg, 150 + i * 70))
  }, [visto, grilla])

  return (
    <nav aria-label="Categorías" className="mx-auto max-w-7xl px-4">
      <ul
        ref={grilla}
        className={`en-cadena grid grid-flow-row-dense auto-rows-[11rem] grid-cols-2 gap-3 sm:auto-rows-[13rem] sm:gap-4 lg:grid-cols-4 ${
          visto ? 'visto' : ''
        }`}
      >
        {categorias.map((cat, i) => {
          const lista = productosDe(cat.slug)
          return (
            <li key={cat.slug} className={FORMAS[cat.slug] ?? ''} style={{ '--i': i }}>
              <Link
                to={`/categoria/${cat.slug}`}
                className="ficha ficha-categoria group flex h-full flex-col p-4 hover:border-lime hover:shadow-glow sm:p-5"
              >
                {/* El dibujo es el del primer producto de la categoría */}
                <Ilustracion
                  producto={lista[0]}
                  categoria={cat.slug}
                  className="min-h-0 w-full flex-1"
                />
                <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 text-white">
                  <span className="text-base font-medium group-hover:underline sm:text-lg">{cat.nombre}</span>
                  <span className="font-mono text-xs font-medium text-muted sm:text-sm">
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
