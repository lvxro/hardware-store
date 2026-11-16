import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Vitrina from '../components/Vitrina'
import categorias from '../data/categorias'
import { IconoEstado } from '../components/Compatibilidad'
import { formatoPrecio, productosDe } from '../data/catalogo'
import { diferenciasDeCompra } from '../data/compatibilidad'
import { formatearCampo, formatearValor } from '../data/campos'
import { precioEfectivo } from '../data/reglas'
import { PUNTAJE_CPU, PUNTAJE_GPU } from '../data/rendimiento'
import { useTitulo } from '../data/titulo'

// Comparador: se elige una categoría y dos productos del catálogo, y se ven sus especificaciones
// lado a lado. En cada fila se marca el mejor valor. La elección queda en la dirección
// (/comparador?cat=procesadores&a=cpu-001&b=cpu-002), así se puede compartir o enlazar desde otra página.

// En qué especificaciones es mejor un valor más alto ('mas') y en cuáles uno más bajo ('menos').
// Las que no están acá (socket, chipset, formato, panel...) se muestran pero no se comparan.
// Tampoco las que dependen del gusto: tamaño de pantalla, peso y botones del mouse.
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
  tasa_refresco_hz: 'mas',
  tiempo_respuesta_ms: 'menos',
  dpi_max: 'mas',
}

// Cuántos puntos vale ganar cada fila en el veredicto. Las que no están valen 1.
// El precio por punto ya mezcla precio y rendimiento: se marca el mejor pero no suma, para no contarlos dos veces.
const PESO = { rendimiento: 3, precio: 2, precio_por_punto: 0 }

// Primero los que tienen stock y, entre ellos, los de precio más parecido a "base"
const porParecido = (base) => (x, y) =>
  (x.stock === 0) - (y.stock === 0) || Math.abs(x.precio - base.precio) - Math.abs(y.precio - base.precio)

// Pasa un valor a número para poder compararlo ("CL30" -> 30). Si no es un número, devuelve NaN.
function aNumero(clave, valor) {
  if (typeof valor === 'number') return valor
  if (clave === 'latencia' && typeof valor === 'string') return parseFloat(valor.replace(/\D/g, ''))
  return NaN
}

const textoComun = (valor) => (valor === undefined || valor === null ? '—' : formatearValor(valor))

// Las filas de la tabla: el rendimiento (si hay puntaje), las especificaciones de la categoría y el precio
// (y, con puntaje, cuánto se paga por cada punto de rendimiento)
function armarFilas(categoria, a, b) {
  const filas = []
  const puntajes =
    categoria.slug === 'procesadores' ? PUNTAJE_CPU : categoria.slug === 'placas_de_video' ? PUNTAJE_GPU : null
  const conPuntaje = puntajes && puntajes[a.id] !== undefined && puntajes[b.id] !== undefined
  if (conPuntaje) {
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
  if (conPuntaje) {
    filas.push({
      clave: 'precio_por_punto',
      etiqueta: 'Precio por punto de rendimiento',
      a: Math.round(a.precio / puntajes[a.id]),
      b: Math.round(b.precio / puntajes[b.id]),
      mejor: 'menos',
      texto: formatoPrecio,
    })
  }

  return filas.map((fila) => {
    const na = aNumero(fila.clave, fila.a)
    const nb = aNumero(fila.clave, fila.b)
    const comparable = fila.mejor && Number.isFinite(na) && Number.isFinite(nb)
    let gana = null
    if (comparable && na !== nb) {
      gana = (fila.mejor === 'mas' ? na > nb : na < nb) ? 'a' : 'b'
    }
    // Largo de la barra de cada lado: el mejor valor llena la barra y el otro queda en proporción.
    // Cuando gana el más bajo se invierte: si uno cuesta el doble, su barra queda por la mitad.
    const tope = Math.max(na, nb)
    const piso = Math.min(na, nb)
    let barra = null
    if (comparable && fila.mejor === 'mas' && tope > 0) barra = { a: (na / tope) * 100, b: (nb / tope) * 100 }
    if (comparable && fila.mejor === 'menos' && piso > 0) barra = { a: (piso / na) * 100, b: (piso / nb) * 100 }
    const igual = String(fila.a ?? '') === String(fila.b ?? '')
    return { ...fila, gana, barra, igual, peso: PESO[fila.clave] ?? 1 }
  })
}

// La frase principal del veredicto, si hay puntaje de rendimiento: cuánto más rinde uno y cuánto cuesta de diferencia
function rindeYCuesta(filas, a, b) {
  const rinde = filas.find((f) => f.clave === 'rendimiento')
  if (!rinde || rinde.a === rinde.b) return null
  const [rapido, lento, mas, menos] = rinde.a > rinde.b ? [a, b, rinde.a, rinde.b] : [b, a, rinde.b, rinde.a]
  const porcentaje = Math.round((mas / menos - 1) * 100)
  const diferencia = rapido.precio - lento.precio
  const precio =
    diferencia === 0
      ? 'cuesta lo mismo'
      : diferencia > 0
        ? `cuesta ${formatoPrecio(diferencia)} más`
        : `encima cuesta ${formatoPrecio(-diferencia)} menos`
  return { producto: rapido, texto: ` rinde ${porcentaje} % más y ${precio}.` }
}

// Un valor de la tabla: el dato, la marca de mejor valor y la barra que muestra cuánto es frente al otro
function Valor({ fila, lado }) {
  const valor = fila[lado]
  const mejor = fila.gana === lado
  return (
    <>
      <span className={mejor ? 'font-semibold text-lime' : ''}>
        {valor === undefined || valor === null ? '—' : fila.texto(valor)}
        {mejor && (
          <>
            <span aria-hidden="true"> ✓</span>
            <span className="sr-only"> (mejor valor)</span>
          </>
        )}
      </span>
      {fila.barra && (
        <span aria-hidden="true" className="mt-1.5 block h-[3px] w-full max-w-40 bg-line-subtle">
          <span
            className={`block h-full motion-safe:transition-[width] motion-safe:duration-300 ${mejor ? 'bg-lime' : 'bg-line-hover'}`}
            style={{ width: `${fila.barra[lado]}%` }}
          />
        </span>
      )}
    </>
  )
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
  const [soloDiferencias, setSoloDiferencias] = useState(false)

  // La categoría y los dos productos salen de la dirección; si falta algo o no existe, se usan los primeros
  const slug = categorias.some((c) => c.slug === params.get('cat')) ? params.get('cat') : categorias[0].slug
  const categoria = categorias.find((c) => c.slug === slug)
  const lista = productosDe(slug)
  const a = lista.find((p) => p.id === params.get('a')) ?? lista[0]
  // Sin segundo producto (por ejemplo, al llegar desde la ficha), el de precio más parecido
  const otros = a ? lista.filter((p) => p.id !== a.id).sort(porParecido(a)) : []
  const b = otros.find((p) => p.id === params.get('b')) ?? otros[0]

  const ir = (cambios) => setParams({ cat: slug, a: a.id, b: b.id, ...cambios }, { replace: true })

  const agregar = (producto) => {
    onAgregarAlCarrito?.(producto, 1)
    setAgregadoId(producto.id)
    setTimeout(() => setAgregadoId(null), 2000)
  }

  const filas = a && b ? armarFilas(categoria, a, b) : []
  // Veredicto con pesos: ganar en rendimiento o en precio vale más que ganar en una especificación suelta
  const puntosDe = (lado) => filas.reduce((suma, f) => suma + (f.gana === lado ? f.peso : 0), 0)
  const puntosA = puntosDe('a')
  const puntosB = puntosDe('b')
  const enJuego = puntosA + puntosB
  const lider = puntosA >= puntosB ? a : b
  const frase = a && b ? rindeYCuesta(filas, a, b) : null
  const avisos = a && b ? diferenciasDeCompra(a, b) : []
  const iguales = filas.filter((f) => f.igual).length
  const visibles = soloDiferencias ? filas.filter((f) => !f.igual) : filas
  const intercambiar = () => ir({ a: b.id, b: a.id })

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
          <div className="mt-6 grid gap-3 md:grid-cols-[1fr_3rem_1fr] md:gap-4">
            <Tarjeta producto={a} lista={lista.filter((p) => p.id !== b.id)} lado="a" onElegir={(id) => ir({ a: id })} onAgregar={agregar} agregado={agregadoId === a.id} />
            {/* Intercambiar: entre las dos tarjetas; en celular queda como una fila angosta */}
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={intercambiar}
                aria-label="Intercambiar los dos productos"
                title="Intercambiar"
                className="flex items-center gap-2 rounded-[3px] border border-line-strong px-3 py-1.5 text-sm text-muted hover:border-line-hover hover:text-white md:h-10 md:w-10 md:justify-center md:p-0"
              >
                <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4 rotate-90 md:rotate-0" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M4 7h12m0 0-3-3m3 3-3 3M16 13H4m0 0 3-3m-3 3 3 3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="md:sr-only">Intercambiar</span>
              </button>
            </div>
            <Tarjeta producto={b} lista={lista.filter((p) => p.id !== a.id)} lado="b" onElegir={(id) => ir({ b: id })} onAgregar={agregar} agregado={agregadoId === b.id} />
          </div>

          <div className="mt-8 text-center" aria-live="polite">
            <p className="text-lg">
              {frase ? (
                <>
                  <b className="text-lime">{frase.producto.nombre}</b>
                  {frase.texto}
                </>
              ) : enJuego === 0 ? (
                'Estos dos productos no tienen datos comparables.'
              ) : puntosA === puntosB ? (
                'Empate entre los dos.'
              ) : (
                <>
                  <b className="text-lime">{lider.nombre}</b> sale ganando.
                </>
              )}
            </p>
            {enJuego > 0 && (
              <p className="mt-1 text-sm text-muted tabular-nums">
                {puntosA === puntosB
                  ? `Cada uno suma ${puntosA} de ${enJuego} puntos.`
                  : `${lider.modelo} suma ${Math.max(puntosA, puntosB)} de ${enJuego} puntos.`}{' '}
                {filas.some((f) => f.clave === 'rendimiento')
                  ? 'El rendimiento vale 3, el precio 2 y el resto 1 cada uno.'
                  : 'El precio vale 2 y el resto 1 cada uno.'}
              </p>
            )}
          </div>

          {/* Lo que cambia lo que hay que comprar junto con cada uno (otra placa, otra memoria, más fuente) */}
          {avisos.length > 0 && (
            <section aria-labelledby="antes-de-elegir" className="mx-auto mt-6 max-w-2xl rounded-[3px] border border-line bg-surface px-5 py-4">
              <h2 id="antes-de-elegir" className="text-sm font-semibold">
                Antes de elegir
              </h2>
              <ul className="mt-1 divide-y divide-line">
                {avisos.map((c) => (
                  <li key={c.titulo} className="flex gap-3 py-3">
                    <span className="mt-0.5">
                      <IconoEstado estado={c.estado} />
                    </span>
                    <div className="min-w-0 text-sm">
                      <p className="font-medium">{c.titulo}</p>
                      <p className="mt-0.5 text-muted">{c.detalle}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {iguales > 0 && (
            <label className="mt-6 inline-flex cursor-pointer items-center gap-2 text-sm text-muted hover:text-white">
              <input
                type="checkbox"
                checked={soloDiferencias}
                onChange={(e) => setSoloDiferencias(e.target.checked)}
                className="h-4 w-4 accent-lime"
              />
              Mostrar solo lo que cambia ({iguales} {iguales === 1 ? 'dato igual' : 'datos iguales'})
            </label>
          )}

          {/* Celular: cada característica es un renglón con los dos valores abajo, sin desplazarse de costado.
              El borde de arriba de cada columna repite el color de su tarjeta (lima = izquierda, blanco = derecha). */}
          <div className="relative mt-3 rounded-[3px] border border-line bg-surface text-sm tabular-nums sm:hidden">
            <div className="grid grid-cols-2 gap-3 border-b border-line px-4 py-3 text-xs font-medium">
              <p className="border-t-2 border-lime pt-2">{a.nombre}</p>
              <p className="border-t-2 border-white pt-2">{b.nombre}</p>
            </div>
            <dl>
              {visibles.map((f) => (
                <div key={f.clave} className="border-b border-line-subtle px-4 py-3 last:border-b-0">
                  <dt className="text-xs text-muted">{f.etiqueta}</dt>
                  <dd className="mt-1 grid grid-cols-2 gap-3">
                    <span className="min-w-0 break-words">
                      <Valor fila={f} lado="a" />
                    </span>
                    <span className="min-w-0 break-words">
                      <Valor fila={f} lado="b" />
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Computadora y tablet: tabla. "relative": los textos sr-only (position: absolute) quedan dentro de
              la caja con scroll; sin esto se escapaban y la página se desbordaba (T-055). */}
          <div className="relative mt-3 hidden overflow-x-auto rounded-[3px] border border-line bg-surface sm:block">
            <table className="w-full min-w-[34rem] table-fixed text-sm tabular-nums">
              <thead>
                <tr className="border-b border-line text-xs text-muted">
                  <th scope="col" className="w-[30%] px-4 py-3 text-left font-medium">Característica</th>
                  <th scope="col" className="px-4 py-3 text-left font-medium text-white">
                    <span className="block border-t-2 border-lime pt-2">{a.nombre}</span>
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-medium text-white">
                    <span className="block border-t-2 border-white pt-2">{b.nombre}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((f) => (
                  <tr key={f.clave} className="border-b border-line last:border-b-0">
                    <th scope="row" className="px-4 py-3 text-left font-normal text-muted">{f.etiqueta}</th>
                    {['a', 'b'].map((lado) => (
                      <td key={lado} className="px-4 py-3 align-top">
                        <Valor fila={f} lado={lado} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted">
            Cuentan como mejor: más núcleos, memoria, frecuencia y rendimiento; y menos precio, consumo y latencia.
            Tamaño, peso y botones dependen del gusto: se muestran pero no suman.
            {(slug === 'procesadores' || slug === 'placas_de_video') && ' El rendimiento es un puntaje aproximado, para orientar.'}
          </p>

          <h2 className="mt-12 text-xl font-semibold">Otros para comparar</h2>
          <p className="mb-3 text-sm text-muted">
            Primero los de precio más parecido a {a.modelo}. Tocá uno para ponerlo en lugar del segundo producto.
          </p>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {otros
              .filter((p) => p.id !== b.id)
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
                  <span className="mt-1 block text-sm text-muted">
                    {formatoPrecio(p.precio)}
                    {p.stock === 0 && ' · Sin stock'}
                  </span>
                </button>
              ))}
          </div>
        </>
      )}
    </div>
  )
}
