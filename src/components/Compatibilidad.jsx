import { Link } from 'react-router-dom'

// T-029: cómo se muestra la compatibilidad (las reglas están en data/compatibilidad.js)

const ICONOS = {
  ok: <path d="M4.5 12.5l5 5L19.5 7" />,
  error: <path d="M6 6l12 12M18 6L6 18" />,
  aviso: (
    <>
      <path d="M12 7v6" />
      <path d="M12 17v.01" />
    </>
  ),
  info: (
    <>
      <path d="M12 11v6" />
      <path d="M12 7v.01" />
    </>
  ),
}

const COLORES = {
  ok: 'border-lime bg-lime text-bg',
  error: 'border-white bg-white text-bg',
  aviso: 'border-white text-white',
  info: 'border-line-strong text-muted',
}

function Icono({ estado, chico = false }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full border ${COLORES[estado]} ${chico ? 'h-4 w-4' : 'h-5 w-5'}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={chico ? 'h-2.5 w-2.5' : 'h-3 w-3'}>
        {ICONOS[estado]}
      </svg>
    </span>
  )
}

const TEXTO_ESTADO = { ok: 'Compatible', error: 'No compatible', aviso: 'Atención', info: 'Dato' }

// El panel del carrito: un renglón por chequeo, primero los problemas
export function PanelCompatibilidad({ chequeos }) {
  if (!chequeos.length) return null
  const orden = { error: 0, aviso: 1, ok: 2, info: 3 }
  const lista = [...chequeos].sort((a, b) => orden[a.estado] - orden[b.estado])
  const errores = chequeos.filter((c) => c.estado === 'error').length

  return (
    <section aria-labelledby="compat" className="mt-8 rounded-[3px] border border-line bg-surface p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="compat" className="text-lg font-semibold">
          Compatibilidad
        </h2>
        <p className={`font-mono text-sm ${errores ? 'text-white' : 'text-lime'}`}>
          {errores ? `${errores} ${errores === 1 ? 'problema' : 'problemas'}` : 'Todo compatible'}
        </p>
      </div>
      <ul className="mt-3 divide-y divide-line">
        {lista.map((c, i) => (
          <li key={i} className="flex gap-3 py-3">
            <span className="mt-0.5">
              <Icono estado={c.estado} />
            </span>
            <div className="min-w-0 text-sm">
              <p className="font-medium">
                <span className="sr-only">{TEXTO_ESTADO[c.estado]}: </span>
                {c.titulo}
              </p>
              <p className="mt-0.5 text-muted">{c.detalle}</p>
              {c.enlace && (
                <Link to={c.enlace.a} className="mt-1 inline-block font-medium text-lime underline-offset-4 hover:underline">
                  {c.enlace.texto} →
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted">
        Revisamos socket, tipo de memoria, video integrado y consumo. El gabinete y el disipador, chequealos aparte.
      </p>
    </section>
  )
}

// Una línea para la tarjeta o la ficha: "Compatible con tu carrito" o el motivo por el que no
export function MarcaCompatibilidad({ resultado, grande = false }) {
  if (!resultado) return null
  return (
    <p className={`flex items-start gap-1.5 ${grande ? 'text-sm' : 'text-[11px] sm:text-xs'} ${resultado.ok ? 'text-lime' : 'text-white'}`}>
      <span className="mt-px">
        <Icono estado={resultado.ok ? 'ok' : 'error'} chico />
      </span>
      <span>
        <span className="sr-only">{resultado.ok ? 'Compatible con tu carrito: ' : 'No compatible con tu carrito: '}</span>
        {resultado.motivo}
      </span>
    </p>
  )
}
