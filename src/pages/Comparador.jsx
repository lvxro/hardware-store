import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Vitrina from '../components/Vitrina'
import categorias from '../data/categorias'
import { formatoPrecio, productosDe } from '../data/catalogo'
import { formatearCampo, formatearValor } from '../data/campos'
import { precioEfectivo } from '../data/reglas'
import { PUNTAJE_CPU, PUNTAJE_GPU } from '../data/rendimiento'
import { useTitulo } from '../data/titulo'

// Comparador: se elige una categoría y dos productos del catálogo, y se ven sus especificaciones
// lado a lado. En cada fila se marca el mejor valor. La elección queda en la dirección
// (/comparador?cat=procesadores&a=cpu-001&b=cpu-002), así se puede compartir o enlazar desde otra página.

// En qué especificaciones es mejor un valor más alto ('mas') y en cuáles uno más bajo ('menos').
// Las que no están acá (socket, chipset, formato, panel...) se muestran pero no se comparan.
const MEJOR = {
  nucleos: 'mas',
  hilos: 'mas',
  frecuencia_boost_ghz: 'mas',
  cache_l3_mb: 'mas',
  tdp_w: 'menos',
  memoria_gb: 'mas',
  consumo_w: 'menos',
  capacidad_gb: 'mas',
  velocidad_mhz: 'mas',
  latencia: 'menos',
  tamano_pulgadas: 'mas',
  tasa_refresco_hz: 'mas',
  tiempo_respuesta_ms: 'menos',
  dpi_max: 'mas',
  peso_g: 'menos',
  botones: 'mas',
}

// Pasa un valor a número para poder compararlo ("CL30" -> 30). Si no es un número, devuelve NaN.
function aNumero(clave, valor) {
  if (typeof valor === 'number') return valor
  if (clave === 'latencia' && typeof valor === 'string') return parseFloat(valor.replace(/\D/g, ''))
  return NaN
}

const textoComun = (valor) => (valor === undefined || valor === null ? '—' : formatearValor(valor))

// Las filas de la tabla: el rendimiento (si hay puntaje), las especificaciones de la categoría y el precio
function armarFilas(categoria, a, b) {
  const filas = []
  const puntajes =
    categoria.slug === 'procesadores' ? PUNTAJE_CPU : categoria.slug === 'placas_de_video' ? PUNTAJE_GPU : null
  if (puntajes && puntajes[a.id] !== undefined && puntajes[b.id] !== undefined) {
    filas.push({
      clave: 'rendimiento',
      etiqueta: 'Rendimiento en juegos (1 a 10, aprox.)',
      a: puntajes[a.id],
      b: puntajes[b.id],
      mejor: 'mas',
      texto: (v) => String(v).replace('.', ','),
    })
  }
  for (const clave of categoria.campos) {
    filas.push({ clave, etiqueta: formatearCampo(clave), a: a[clave], b: b[clave], mejor: MEJOR[clave] ?? null, texto: textoComun })
  }
  filas.push({ clave: 'precio', etiqueta: 'Precio', a: a.precio, b: b.precio, mejor: 'menos', texto: formatoPrecio })

  return filas.map((fila) => {
    const na = aNumero(fila.clave, fila.a)
    const nb = aNumero(fila.clave, fila.b)
    let gana = null
    if (fila.mejor && Number.isFinite(na) && Number.isFinite(nb) && na !== nb) {
      gana = (fila.mejor === 'mas' ? na > nb : na < nb) ? 'a' : 'b'
    }
    return { ...fila, gana }
  })
}

// Una de las dos columnas de arriba: dibujo, selector, precio y botón de agregar
function Tarjeta({ producto, lista, lado, onElegir, onAgregar, agregado }) {
  const agotado = producto.stock === 0
  return (
    <div className={`rounded-[3px] border border-line border-t-2 bg-surface p-3 ${lado === 'a' ? 'border-t-lime' : 'border-t-white'}`}>
      <Vitrina producto={producto} categoria={producto.categoria} className={`aspect-[4/3] ${agotado ? 'opacity-40' : ''}`} />

      <select
        value={producto.id}
        onChange={(e) => onElegir(e.target.value)}
        aria-label={`Producto ${lado.toUpperCase()}`}
        className="mt-3 w-full rounded-[3px] border border-line-strong bg-bg px-3 py-2 text-sm text-white focus:border-lime"
      >
        {lista.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nombre}
          </option>
        ))}
      </select>

      <div className="mt-3 font-mono">
        {producto.enOferta && (
          <p className="text-sm text-muted line-through">
            <span className="sr-only">Precio anterior </span>
            {formatoPrecio(producto.precioAnterior)}
          </p>
        )}
        <p className={`text-lg font-bold ${agotado ? 'text-muted' : ''}`}>{formatoPrecio(producto.precio)}</p>
        {agotado ? (
          <p className="text-xs font-medium text-muted sm:text-sm">Sin stock por ahora</p>
        ) : (
          <p className="text-xs font-medium text-lime sm:text-sm">{formatoPrecio(precioEfectivo(producto.precio))} en efectivo</p>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={agotado}
          onClick={() => onAgregar(producto)}
          className="rounded-[3px] bg-lime px-4 py-2 font-mono text-sm font-bold text-bg hover:shadow-glow disabled:cursor-not-allowed disabled:bg-raised disabled:text-muted disabled:shadow-none"
        >
          {agotado ? 'Sin stock' : agregado ? 'Agregado ✓' : 'Agregar al carrito'}
        </button>
        <Link to={`/producto/${producto.id}`} className="text-sm text-muted underline hover:text-white">
          Ver ficha
        </Link>
      </div>
    </div>
  )
}

export default function Comparador({ onAgregarAlCarrito }) {
  useTitulo('Comparador')
  const [params, setParams] = useSearchParams()
  const [agregadoId, setAgregadoId] = useState(null)

  // La categoría y los dos productos salen de la dirección; si falta algo o no existe, se usan los primeros
  const slug = categorias.some((c) => c.slug === params.get('cat')) ? params.get('cat') : categorias[0].slug
  const categoria = categorias.find((c) => c.slug === slug)
  const lista = productosDe(slug)
  const a = lista.find((p) => p.id === params.get('a')) ?? lista[0]
  const b = lista.find((p) => p.id === params.get('b') && p.id !== a?.id) ?? lista.find((p) => p.id !== a?.id)

  const ir = (cambios) => setParams({ cat: slug, a: a.id, b: b.id, ...cambios }, { replace: true })

  const agregar = (producto) => {
    onAgregarAlCarrito?.(producto, 1)
    setAgregadoId(producto.id)
    setTimeout(() => setAgregadoId(null), 2000)
  }

  const filas = a && b ? armarFilas(categoria, a, b) : []
  const ganaA = filas.filter((f) => f.gana === 'a').length
  const ganaB = filas.filter((f) => f.gana === 'b').length
  const comparables = ganaA + ganaB
  const lider = ganaA >= ganaB ? a : b

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-semibold sm:text-4xl">Comparador</h1>
      <p className="mt-1 max-w-2xl text-muted">
        Elegí una categoría y dos productos para ver sus especificaciones lado a lado. En cada fila marcamos el mejor valor.
      </p>

      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Categoría">
        {categorias.map((c) => (
          <button
            key={c.slug}
            type="button"
            aria-pressed={c.slug === slug}
            onClick={() => setParams({ cat: c.slug }, { replace: true })}
            className={`rounded-[3px] border px-3 py-1.5 text-sm ${
              c.slug === slug
                ? 'border-lime bg-lime font-bold text-bg'
                : 'border-line-strong text-muted hover:border-line-hover hover:text-white'
            }`}
          >
            {c.nombre}
          </button>
        ))}
      </div>

      {!a || !b ? (
        <p className="mt-8 text-muted">Todavía no hay dos productos en esta categoría para comparar.</p>
      ) : (
        <>
          <div className="mt-6 grid gap-4 md:grid-cols-[1fr_2.5rem_1fr]">
            <Tarjeta producto={a} lista={lista.filter((p) => p.id !== b.id)} lado="a" onElegir={(id) => ir({ a: id })} onAgregar={agregar} agregado={agregadoId === a.id} />
            <div className="hidden items-center justify-center font-mono text-xs text-muted md:flex">VS</div>
            <Tarjeta producto={b} lista={lista.filter((p) => p.id !== a.id)} lado="b" onElegir={(id) => ir({ b: id })} onAgregar={agregar} agregado={agregadoId === b.id} />
          </div>

          <p className="mt-8 text-center text-lg" aria-live="polite">
            {comparables === 0 ? (
              'Estos dos productos no tienen datos comparables.'
            ) : ganaA === ganaB ? (
              <>Empate: cada uno gana en {ganaA} de {comparables} características.</>
            ) : (
              <>
                Va por delante: <b className="text-lime">{lider.nombre}</b> — gana en {Math.max(ganaA, ganaB)} de {comparables} características
              </>
            )}
          </p>

          <div className="mt-6 overflow-x-auto rounded-[3px] border border-line bg-surface">
            <table className="w-full min-w-[34rem] text-sm tabular-nums">
              <thead>
                <tr className="border-b border-line text-xs text-muted">
                  <th scope="col" className="px-4 py-3 text-left font-medium">Característica</th>
                  <th scope="col" className="px-4 py-3 text-left font-medium text-white">{a.nombre}</th>
                  <th scope="col" className="px-4 py-3 text-left font-medium text-white">{b.nombre}</th>
                </tr>
              </thead>
              <tbody>
                {filas.map((f) => (
                  <tr key={f.clave} className="border-b border-line last:border-b-0">
                    <th scope="row" className="px-4 py-3 text-left font-normal text-muted">{f.etiqueta}</th>
                    {['a', 'b'].map((lado) => {
                      const valor = f[lado]
                      const mejor = f.gana === lado
                      return (
                        <td key={lado} className={`px-4 py-3 ${mejor ? 'font-semibold text-lime' : ''}`}>
                          {valor === undefined || valor === null ? '—' : f.texto(valor)}
                          {mejor && (
                            <>
                              <span aria-hidden="true"> ✓</span>
                              <span className="sr-only"> (mejor valor)</span>
                            </>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted">
            Cuentan como mejor: más núcleos, memoria, frecuencia y rendimiento; y menos precio, consumo y latencia.
            {(slug === 'procesadores' || slug === 'placas_de_video') && ' El rendimiento es un puntaje aproximado, para orientar.'}
          </p>

          <h2 className="mt-12 text-xl font-semibold">Otros para comparar</h2>
          <p className="mb-3 text-sm text-muted">Tocá uno para ponerlo en lugar del producto de la derecha.</p>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {lista
              .filter((p) => p.id !== a.id && p.id !== b.id)
              .map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    ir({ b: p.id })
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="w-52 shrink-0 rounded-[3px] border border-line bg-surface p-3 text-left hover:border-lime hover:shadow-glow"
                >
                  <span className="block text-sm font-medium leading-snug">{p.nombre}</span>
                  <span className="mt-1 block text-sm text-muted">{formatoPrecio(p.precio)}</span>
                </button>
              ))}
          </div>
        </>
      )}
    </div>
  )
}
