// T-031: cómo se muestran los pedidos (lo usan Mis pedidos y el panel de administración)

export const ESTADOS = {
  aprobado: { texto: 'Aprobado', clase: 'border-lime text-lime' },
  pendiente: { texto: 'Pendiente', clase: 'border-white text-white' },
  rechazado: { texto: 'Rechazado', clase: 'border-line-strong text-muted' },
  cancelado: { texto: 'Cancelado', clase: 'border-line-strong text-muted' },
  reintegrado: { texto: 'Reintegrado', clase: 'border-line-strong text-muted' },
  contracargo: { texto: 'Contracargo', clase: 'border-line-strong text-muted' },
}

// T-047: cómo va el envío de un pedido con el pago aprobado (supabase/estado-envio.sql).
// Va aparte del estado del pago: ese lo escribe Mercado Pago y el envío lo cambia un administrador.
export const ENVIOS = {
  preparando: 'Preparando',
  en_camino: 'En camino',
  entregado: 'Entregado',
}

// Los pasos que ve el cliente, en orden. Un pedido recién aprobado, sin envío cargado, está en el primero.
export const PASOS_ENVIO = [
  ['aprobado', 'Pago aprobado'],
  ['preparando', 'Preparando'],
  ['en_camino', 'En camino'],
  ['entregado', 'Entregado'],
]

export function pasoDeEnvio(envio) {
  const paso = PASOS_ENVIO.findIndex(([clave]) => clave === (envio ?? 'aprobado'))
  return Math.max(paso, 0)
}

export const MEDIOS = {
  credit_card: 'Tarjeta de crédito',
  debit_card: 'Tarjeta de débito',
  prepaid_card: 'Tarjeta prepaga',
  account_money: 'Dinero en cuenta',
  ticket: 'Efectivo',
  bank_transfer: 'Transferencia',
  digital_currency: 'Mercado Crédito',
}

export function fecha(iso) {
  return new Intl.DateTimeFormat('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

// T-048: el envío no tiene columna propia: es lo que sobra del total una vez sumados los productos.
// 0 si el envío fue gratis (o si el pedido es anterior al cobro del envío).
export function envioDe(pedido) {
  const productos = pedido.items.reduce((suma, i) => suma + i.precio * i.cantidad, 0)
  return Math.max(0, Math.round(Number(pedido.total) - productos))
}
