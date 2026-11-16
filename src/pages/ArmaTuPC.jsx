import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { formatoPrecio, productosDe } from '../data/catalogo'
import { compatibleCon, revisar } from '../data/compatibilidad'
import { cuelloDeBotella, memoriaJusta, PUNTAJE_CPU, PUNTAJE_GPU } from '../data/rendimiento'
import { precioEfectivo } from '../data/reglas'
import { useTitulo } from '../data/titulo'

// Arma tu PC: se elige un procesador, una placa madre, memoria y placa de video del catálogo.
// Lo que no es compatible con lo ya elegido se apaga y dice por qué (reglas en data/compatibilidad.js),
// y al juntar procesador y placa de video se avisa si hay cuello de botella (data/rendimiento.js).
// La elección queda en la dirección (/arma-tu-pc?cpu=cpu-001&placa=mb-003...), así se puede
// compartir o volver a ella. Al final, todo se pasa al carrito de una vez.

const PASOS = [
  { slug: 'procesadores', nombre: 'Procesador', param: 'cpu' },
  { slug: 'placas_base', nombre: 'Placa madre', param: 'placa' },
  { slug: 'memorias_ram', nombre: 'Memoria RAM', param: 'ram' },
  { slug: 'placas_de_video', nombre: 'Placa de video', param: 'gpu' },
]

const ETIQUETA = { ok: 'Bien', error: 'Error', aviso: 'Atención', info: 'Dato' }
const COLOR_ETIQUETA = {
  ok: 'border-lime text-lime',
  error: 'border-white bg-white text-bg',
  aviso: 'border-white text-white',
  info: 'border-line-strong text-muted',
}

// Un renglón del resumen: etiqueta de estado, título y detalle
function Chequeo({ estado, titulo, detalle }) {
  return (
    <li className="border-t border-line-subtle py-3 first:border-t-0 first:pt-0">
      <p className="flex items-start gap-2 text-sm font-medium">
        <span className={`mt-0.5 shrink-0 rounded-[3px] border px-1.5 font-mono text-[11px] font-bold leading-4 ${COLOR_ETIQUETA[estado]}`}>
          {ETIQUETA[estado]}
        </span>
        <span>{titulo}</span>
      </p>
      <p className="mt-1 text-xs text-muted sm:text-sm">{detalle}</p>
    </li>
  )
}

// La balanza: el puntaje de juegos del procesador y de la placa de video en la misma escala de 1 a 10.
// Si una barra es mucho más larga que la otra, la más corta es la que frena.
function Balanza({ cpu, gpu }) {
  const c = PUNTAJE_CPU[cpu.id]
  const g = PUNTAJE_GPU[gpu.id]
  if (c === undefined || g === undefined) return null
  const filas = [
    ['Procesador', c],
    ['Placa de video', g],
  ]
  return (
    <div className="mb-3 space-y-2" role="img" aria-label={`Rendimiento en juegos: procesador ${c} y placa de video ${g}, de 10`}>
      {filas.map(([nombre, puntaje]) => (
        <div key={nombre}>
          <p className="flex justify-between text-xs text-muted">
            <span>{nombre}</span>
            <span className="font-mono text-white">{String(puntaje).replace('.', ',')}</span>
          </p>
          <span aria-hidden="true" className="mt-1 block h-[3px] w-full bg-line-subtle">
            <span className="block h-full bg-lime motion-safe:transition-[width] motion-safe:duration-300" style={{ width: `${puntaje * 10}%` }} />
          </span>
        </div>
      ))}
    </div>
  )
}

// Una opción de un paso: el producto, por qué sirve o no, el precio y, si ya hay uno elegido, "Comparar"
function Opcion({ paso, producto: p, compat, elegido, onElegir }) {
  const sinStock = p.stock === 0
  const apagado = compat?.ok === false || sinStock
  const marcado = elegido?.id === p.id
  const comparar = elegido && !marcado && !apagado
  return (
    <li className={`flex items-stretch border-t border-line-subtle first:border-t-0 ${marcado ? 'bg-raised' : ''}`}>
      <label
        className={`flex min-w-0 flex-1 items-center gap-3 px-3 py-3 sm:px-4 ${
          apagado ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-raised'
        }`}
      >
        <input
          type="radio"
          name={paso.slug}
          checked={marcado}
          disabled={apagado}
          onChange={() => onElegir(paso, p)}
          className="h-4 w-4 shrink-0 accent-lime"
        />
        <span className="min-w-0 flex-1">
          <span className="block font-medium">{p.nombre}</span>
          <span className="block text-xs text-muted sm:text-sm">{p.specs.map(([, valor]) => valor).join(', ')}</span>
          {sinStock && <span className="block text-xs font-medium text-muted sm:text-sm">Sin stock por ahora</span>}
          {!sinStock && compat && (
            <span className={`block text-xs sm:text-sm ${compat.ok ? 'text-lime' : 'text-white'}`}>{compat.motivo}</span>
          )}
        </span>
        <span className="shrink-0 text-right font-mono">
          {p.enOferta && <span className="block text-xs text-muted line-through">{formatoPrecio(p.precioAnterior)}</span>}
          <span className="block font-bold">{formatoPrecio(p.precio)}</span>
          {comparar && (
            <span className={`block text-xs ${p.precio > elegido.precio ? 'text-muted' : 'text-lime'}`}>
              {p.precio > elegido.precio ? '+' : '−'}
              {formatoPrecio(Math.abs(p.precio - elegido.precio))}
            </span>
          )}
        </span>
      </label>
      {comparar && (
        <Link
          to={`/comparador?cat=${paso.slug}&a=${elegido.id}&b=${p.id}`}
          aria-label={`Comparar ${p.nombre} con ${elegido.nombre}`}
          className="flex shrink-0 items-center border-l border-line-subtle px-3 text-xs text-muted hover:bg-raised hover:text-white sm:text-sm"
        >
          Comparar
        </Link>
      )}
    </li>
  )
}

export default function ArmaTuPC({ onAgregarAlCarrito }) {
  useTitulo('Arma tu PC')
  const [params, setParams] = useSearchParams()
  const [aviso, setAviso] = useState('')
  const [copiado, setCopiado] = useState(false)

  // Los productos de cada paso, del más barato al más caro
  const opciones = useMemo(
    () => Object.fromEntries(PASOS.map((p) => [p.slug, [...productosDe(p.slug)].sort((a, b) => a.precio - b.precio)])),
    [],
  )

  // Lo elegido sale de la dirección; un id que no existe se ignora
  const elegidos = Object.fromEntries(
    PASOS.map((p) => [p.slug, opciones[p.slug].find((x) => x.id === params.get(p.param))]).filter(([, x]) => x),
  )
  const [abierto, setAbierto] = useState(() => PASOS.find((p) => !elegidos[p.slug])?.slug ?? null)

  const lista = PASOS.map((p) => elegidos[p.slug]).filter(Boolean)
  const total = lista.reduce((suma, p) => suma + p.precio, 0)

  // Compatibilidad: se muestran los problemas y la fuente; lo que "falta" ya se ve en los pasos
  const chequeos = revisar(lista).filter((c) => c.estado !== 'ok' && !c.titulo.startsWith('Te falta'))
  const orden = { error: 0, aviso: 1, info: 2 }
  chequeos.sort((a, b) => orden[a.estado] - orden[b.estado])

  const rendimiento = [
    cuelloDeBotella(elegidos.procesadores, elegidos.placas_de_video),
    memoriaJusta(elegidos.placas_de_video, elegidos.memorias_ram),
  ].filter(Boolean)

  // Escribe la elección en la dirección, en el orden de los pasos
  const guardar = (nuevos) => {
    const p = {}
    for (const paso of PASOS) if (nuevos[paso.slug]) p[paso.param] = nuevos[paso.slug].id
    setParams(p, { replace: true })
    setAviso('')
    setCopiado(false)
  }

  const elegir = (paso, producto) => {
    const nuevos = { ...elegidos, [paso.slug]: producto }
    guardar(nuevos)
    // Pasa solo al próximo paso que todavía no tiene elección
    setAbierto(PASOS.find((p) => !nuevos[p.slug])?.slug ?? null)
  }

  const quitar = (slug) => {
    const resto = { ...elegidos }
    delete resto[slug]
    guardar(resto)
  }

  const empezarDeNuevo = () => {
    guardar({})
    setAbierto(PASOS[0].slug)
  }

  // Los que se quedaron sin stock no se agregan
  const sumables = lista.filter((p) => p.stock !== 0)
  const agregarTodo = () => {
    sumables.forEach((p) => onAgregarAlCarrito(p, 1))
    setAviso(`${sumables.length === 1 ? 'Se agregó 1 producto' : `Se agregaron ${sumables.length} productos`} al carrito.`)
  }

  const copiarEnlace = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    } catch {
      setCopiado(false)
    }
  }

  const verResumen = () => document.getElementById('resumen')?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <div className={`mx-auto max-w-7xl px-4 py-8 ${lista.length > 0 ? 'pb-28 lg:pb-8' : ''}`}>
      <h1 className="text-3xl font-semibold sm:text-4xl">Arma tu PC</h1>
      <p className="mt-1 max-w-2xl text-muted">
        Elegí una pieza de cada paso. Lo que no es compatible con lo que ya elegiste queda aparte y te decimos por qué, y si el
        procesador y la placa de video no se llevan bien en rendimiento, te avisamos.
      </p>

      {/* min-w-0 en las dos columnas: sin eso, un nombre largo que no se corta (truncate) ensancha la grilla
          y la página se desborda en celular */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
        <div className="min-w-0 space-y-3">
          {PASOS.map((paso, i) => {
            const elegido = elegidos[paso.slug]
            const estaAbierto = abierto === paso.slug
            const otros = lista.filter((p) => p.categoria !== paso.slug)
            // Primero lo que se puede elegir; lo incompatible o sin stock queda en un grupo aparte, al final
            const filas = opciones[paso.slug].map((p) => ({ p, compat: compatibleCon(p, otros) }))
            const disponibles = filas.filter(({ p, compat }) => compat?.ok !== false && p.stock !== 0)
            const apagadas = filas.filter(({ p, compat }) => compat?.ok === false || p.stock === 0)
            return (
              <section
                key={paso.slug}
                aria-labelledby={`paso-${paso.slug}`}
                className={`rounded-[3px] border bg-surface ${estaAbierto ? 'border-line-hover' : elegido ? 'border-line-strong' : 'border-line'}`}
              >
                <div className="flex items-center gap-3 p-3 sm:p-4">
                  <span
                    aria-hidden="true"
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[3px] border font-mono text-sm font-bold ${
                      elegido ? 'border-lime bg-lime text-bg' : 'border-line-strong text-muted'
                    }`}
                  >
                    {elegido ? '✓' : i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 id={`paso-${paso.slug}`} className="font-semibold">
                      {paso.nombre}
                    </h2>
                    <p className="truncate text-sm text-muted">
                      {elegido ? (
                        <>
                          {elegido.nombre}, <span className="font-mono">{formatoPrecio(elegido.precio)}</span>
                        </>
                      ) : (
                        `${disponibles.length} ${disponibles.length === 1 ? 'opción' : 'opciones'} para elegir`
                      )}
                    </p>
                  </div>
                  {elegido && (
                    <button
                      type="button"
                      onClick={() => quitar(paso.slug)}
                      className="shrink-0 text-sm text-muted underline-offset-4 hover:text-white hover:underline"
                    >
                      Quitar
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setAbierto(estaAbierto ? null : paso.slug)}
                    aria-expanded={estaAbierto}
                    aria-controls={`lista-${paso.slug}`}
                    className="shrink-0 rounded-[3px] border border-line-strong px-3 py-1.5 font-mono text-sm font-medium hover:border-line-hover hover:bg-raised"
                  >
                    {estaAbierto ? 'Cerrar' : elegido ? 'Cambiar' : 'Elegir'}
                  </button>
                </div>

                {estaAbierto && (
                  <div id={`lista-${paso.slug}`} className="border-t border-line-subtle">
                    <ul>
                      {disponibles.map(({ p, compat }) => (
                        <Opcion key={p.id} paso={paso} producto={p} compat={compat} elegido={elegido} onElegir={elegir} />
                      ))}
                    </ul>
                    {apagadas.length > 0 && (
                      <details className="border-t border-line-subtle">
                        <summary className="cursor-pointer px-3 py-3 text-sm text-muted hover:text-white sm:px-4">
                          {apagadas.length === 1 ? '1 opción no se puede elegir' : `${apagadas.length} opciones no se pueden elegir`}{' '}
                          (no son compatibles o no hay stock)
                        </summary>
                        <ul className="border-t border-line-subtle">
                          {apagadas.map(({ p, compat }) => (
                            <Opcion key={p.id} paso={paso} producto={p} compat={compat} elegido={elegido} onElegir={elegir} />
                          ))}
                        </ul>
                      </details>
                    )}
                  </div>
                )}
              </section>
            )
          })}
        </div>

        <aside id="resumen" aria-labelledby="titulo-resumen" className="min-w-0 scroll-mt-4 rounded-[3px] border border-line bg-surface p-5 lg:sticky lg:top-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="titulo-resumen" className="text-lg font-semibold">
              Tu configuración
            </h2>
            <span className="font-mono text-sm text-muted">
              {lista.length} de {PASOS.length}
            </span>
          </div>
          {/* Un tramo por paso: se llena en lima cuando ese paso tiene pieza */}
          <div className="mt-2 grid grid-cols-4 gap-1" aria-hidden="true">
            {PASOS.map((p) => (
              <span key={p.slug} className={`h-[3px] ${elegidos[p.slug] ? 'bg-lime' : 'bg-line-strong'}`} />
            ))}
          </div>

          {lista.length === 0 ? (
            <p className="mt-4 text-sm text-muted">Todavía no elegiste nada. Empezá por el procesador.</p>
          ) : (
            <ul className="mt-4 space-y-2 text-sm">
              {PASOS.filter((p) => elegidos[p.slug]).map((p) => (
                <li key={p.slug} className="flex justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block text-xs text-muted">{p.nombre}</span>
                    <span className="block truncate">{elegidos[p.slug].nombre}</span>
                  </span>
                  <span className="shrink-0 self-end font-mono text-muted">{formatoPrecio(elegidos[p.slug].precio)}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 border-t border-line-subtle pt-4 font-mono">
            <p className="flex items-baseline justify-between">
              <span className="text-sm text-muted">Total</span>
              <span className="text-xl font-bold">{formatoPrecio(total)}</span>
            </p>
            {lista.length > 0 && (
              <p className="text-right text-xs font-medium text-lime sm:text-sm">{formatoPrecio(precioEfectivo(total))} en efectivo</p>
            )}
          </div>

          {rendimiento.length > 0 && (
            <div className="mt-5">
              <h3 className="mb-2 text-sm font-semibold">Rendimiento en juegos</h3>
              <Balanza cpu={elegidos.procesadores} gpu={elegidos.placas_de_video} />
              <ul>
                {rendimiento.map((c) => (
                  <Chequeo key={c.titulo} {...c} />
                ))}
              </ul>
              <p className="mt-1 text-xs text-muted">Es una estimación orientativa, no reemplaza una prueba real.</p>
            </div>
          )}
          {!elegidos.procesadores || !elegidos.placas_de_video ? (
            <p className="mt-5 text-xs text-muted">Elegí un procesador y una placa de video para ver si hay cuello de botella.</p>
          ) : null}

          {chequeos.length > 0 && (
            <div className="mt-5">
              <h3 className="text-sm font-semibold">Compatibilidad</h3>
              <ul className="mt-2">
                {chequeos.map((c) => (
                  <Chequeo key={c.titulo + c.detalle} {...c} />
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={agregarTodo}
              disabled={sumables.length === 0}
              className="rounded-[3px] bg-lime px-4 py-2.5 font-mono text-sm font-bold text-bg hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-none"
            >
              {sumables.length === 0 ? 'Agregar al carrito' : `Agregar ${sumables.length} al carrito`}
            </button>
            {lista.length > 0 && (
              <div className="flex justify-between gap-3 text-sm">
                <button type="button" onClick={copiarEnlace} className="text-muted underline-offset-4 hover:text-white hover:underline">
                  {copiado ? 'Enlace copiado ✓' : 'Copiar enlace'}
                </button>
                <button type="button" onClick={empezarDeNuevo} className="text-muted underline-offset-4 hover:text-white hover:underline">
                  Empezar de nuevo
                </button>
              </div>
            )}
          </div>

          {aviso && (
            <p role="status" className="entra-deslizando mt-4 text-sm" style={{ animationDelay: '0ms' }}>
              {aviso}{' '}
              <Link to="/carrito" className="font-medium text-lime underline-offset-4 hover:underline">
                Ver el carrito
              </Link>
            </p>
          )}
        </aside>
      </div>

      {/* Celular y tablet: el total queda siempre a la vista mientras se eligen las piezas */}
      {lista.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface px-4 py-3 lg:hidden">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <p className="min-w-0 font-mono">
              <span className="block text-xs text-muted">
                {lista.length} de {PASOS.length} piezas
              </span>
              <span className="block font-bold">{formatoPrecio(total)}</span>
            </p>
            <button
              type="button"
              onClick={verResumen}
              className="shrink-0 rounded-[3px] bg-lime px-4 py-2 font-mono text-sm font-bold text-bg hover:shadow-glow"
            >
              Ver resumen
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
