import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatoPrecio, productosDe } from '../data/catalogo'
import { compatibleCon, revisar } from '../data/compatibilidad'
import { cuelloDeBotella, memoriaJusta } from '../data/rendimiento'
import { precioEfectivo } from '../data/reglas'
import { useTitulo } from '../data/titulo'

// Arma tu PC: se elige un procesador, una placa madre, memoria y placa de video del catálogo.
// Lo que no es compatible con lo ya elegido se apaga y dice por qué (reglas en data/compatibilidad.js),
// y al juntar procesador y placa de video se avisa si hay cuello de botella (data/rendimiento.js).
// Al final, todo se pasa al carrito de una vez.

const PASOS = [
  { slug: 'procesadores', nombre: 'Procesador' },
  { slug: 'placas_base', nombre: 'Placa madre' },
  { slug: 'memorias_ram', nombre: 'Memoria RAM' },
  { slug: 'placas_de_video', nombre: 'Placa de video' },
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

export default function ArmaTuPC({ onAgregarAlCarrito }) {
  useTitulo('Arma tu PC')
  const [elegidos, setElegidos] = useState({}) // { slug: producto }
  const [abierto, setAbierto] = useState(PASOS[0].slug)
  const [aviso, setAviso] = useState('')

  // Los productos de cada paso, del más barato al más caro
  const opciones = useMemo(
    () => Object.fromEntries(PASOS.map((p) => [p.slug, [...productosDe(p.slug)].sort((a, b) => a.precio - b.precio)])),
    [],
  )

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

  const elegir = (slug, producto) => {
    const nuevos = { ...elegidos, [slug]: producto }
    setElegidos(nuevos)
    setAviso('')
    // Pasa solo al próximo paso que todavía no tiene elección
    setAbierto(PASOS.find((p) => !nuevos[p.slug])?.slug ?? null)
  }

  const quitar = (slug) => {
    setElegidos((actual) => {
      const resto = { ...actual }
      delete resto[slug]
      return resto
    })
    setAviso('')
  }

  const empezarDeNuevo = () => {
    setElegidos({})
    setAbierto(PASOS[0].slug)
    setAviso('')
  }

  // Los que se quedaron sin stock no se agregan
  const sumables = lista.filter((p) => p.stock !== 0)
  const agregarTodo = () => {
    sumables.forEach((p) => onAgregarAlCarrito(p, 1))
    setAviso(`${sumables.length === 1 ? 'Se agregó 1 producto' : `Se agregaron ${sumables.length} productos`} al carrito.`)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-semibold sm:text-4xl">Arma tu PC</h1>
      <p className="mt-1 max-w-2xl text-muted">
        Elegí una pieza de cada paso. Lo que no es compatible con lo que ya elegiste se apaga y te decimos por qué, y si el
        procesador y la placa de video no se llevan bien en rendimiento, te avisamos.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
        <div className="space-y-3">
          {PASOS.map((paso, i) => {
            const elegido = elegidos[paso.slug]
            const estaAbierto = abierto === paso.slug
            const otros = lista.filter((p) => p.categoria !== paso.slug)
            return (
              <section
                key={paso.slug}
                aria-labelledby={`paso-${paso.slug}`}
                className={`rounded-[3px] border bg-surface ${elegido ? 'border-line-strong' : 'border-line'}`}
              >
                <div className="flex items-center gap-3 p-3 sm:p-4">
                  <span
                    aria-hidden="true"
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[3px] border font-mono text-sm font-bold ${
                      elegido ? 'border-lime bg-lime text-bg' : 'border-line-strong text-muted'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 id={`paso-${paso.slug}`} className="font-semibold">
                      {paso.nombre}
                    </h2>
                    <p className="truncate text-sm text-muted">
                      {elegido ? `${elegido.nombre} · ${formatoPrecio(elegido.precio)}` : 'Sin elegir'}
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
                  <ul id={`lista-${paso.slug}`} className="border-t border-line-subtle">
                    {opciones[paso.slug].map((p) => {
                      const compat = compatibleCon(p, otros)
                      const sinStock = p.stock === 0
                      const apagado = compat?.ok === false || sinStock
                      const marcado = elegido?.id === p.id
                      return (
                        <li key={p.id} className="border-t border-line-subtle first:border-t-0">
                          <label
                            className={`flex items-center gap-3 px-3 py-3 sm:px-4 ${
                              apagado ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-raised'
                            } ${marcado ? 'bg-raised' : ''}`}
                          >
                            <input
                              type="radio"
                              name={paso.slug}
                              checked={marcado}
                              disabled={apagado}
                              onChange={() => elegir(paso.slug, p)}
                              className="h-4 w-4 shrink-0 accent-lime"
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block font-medium">{p.nombre}</span>
                              <span className="block text-xs text-muted sm:text-sm">
                                {p.specs.map(([, valor]) => valor).join(' · ')}
                              </span>
                              {sinStock && <span className="block text-xs font-medium text-muted sm:text-sm">Sin stock por ahora</span>}
                              {!sinStock && compat && (
                                <span className={`block text-xs sm:text-sm ${compat.ok ? 'text-lime' : 'text-white'}`}>
                                  {compat.motivo}
                                </span>
                              )}
                            </span>
                            <span className="shrink-0 text-right font-mono">
                              {p.enOferta && <span className="block text-xs text-muted line-through">{formatoPrecio(p.precioAnterior)}</span>}
                              <span className="block font-bold">{formatoPrecio(p.precio)}</span>
                            </span>
                          </label>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </section>
            )
          })}
        </div>

        <aside aria-labelledby="resumen" className="rounded-[3px] border border-line bg-surface p-5 lg:sticky lg:top-4">
          <h2 id="resumen" className="text-lg font-semibold">
            Tu configuración
          </h2>

          {lista.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Todavía no elegiste nada. Empezá por el procesador.</p>
          ) : (
            <ul className="mt-3 space-y-1 text-sm">
              {lista.map((p) => (
                <li key={p.id} className="flex justify-between gap-3">
                  <span className="min-w-0 truncate">{p.nombre}</span>
                  <span className="shrink-0 font-mono text-muted">{formatoPrecio(p.precio)}</span>
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
              <h3 className="text-sm font-semibold">Rendimiento</h3>
              <ul className="mt-2">
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
              <button type="button" onClick={empezarDeNuevo} className="text-sm text-muted underline-offset-4 hover:text-white hover:underline">
                Empezar de nuevo
              </button>
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
    </div>
  )
}
