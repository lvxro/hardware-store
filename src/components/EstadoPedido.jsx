import { ESTADOS } from '../data/pedidos'

// T-031: la etiqueta del estado de un pedido (aprobado, pendiente, rechazado...)
export default function EstadoPedido({ estado }) {
  const e = ESTADOS[estado] ?? { texto: estado, clase: 'border-line-strong text-muted' }
  return <span className={`rounded-[3px] border px-1.5 py-0.5 font-mono text-[11px] font-bold uppercase ${e.clase}`}>{e.texto}</span>
}
