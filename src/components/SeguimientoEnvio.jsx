import { PASOS_ENVIO, fecha, pasoDeEnvio } from '../data/pedidos'

// T-047: los cuatro pasos de un pedido con el pago aprobado (pago aprobado, preparando, en camino,
// entregado). Lo que ya pasó va en lima y el paso actual va en negrita. "envio" es lo que cargó el
// administrador (vacío si todavía no empezó) y "actualizado" cuándo lo cambió.
export default function SeguimientoEnvio({ envio, actualizado }) {
  const actual = pasoDeEnvio(envio)
  return (
    <div className="border-t border-line px-5 py-4">
      <ol className="grid grid-cols-4 gap-2" aria-label="Seguimiento del envío">
        {PASOS_ENVIO.map(([clave, nombre], i) => (
          <li key={clave} aria-current={i === actual ? 'step' : undefined}>
            <span className={`block h-1 rounded-full ${i <= actual ? 'bg-lime' : 'bg-line-strong'}`} />
            <span
              className={`mt-2 block font-mono text-[11px] leading-tight sm:text-xs ${
                i === actual ? 'font-bold text-lime' : i < actual ? 'text-white' : 'text-muted'
              }`}
            >
              {nombre}
            </span>
          </li>
        ))}
      </ol>
      {actualizado && <p className="mt-2 text-xs text-muted">Actualizado el {fecha(actualizado)}</p>}
    </div>
  )
}
