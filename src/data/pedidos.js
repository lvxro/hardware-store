// T-031: cómo se muestran los pedidos (lo usan Mis pedidos y el panel de administración)

export const ESTADOS = {
  aprobado: { texto: 'Aprobado', clase: 'border-lime text-lime' },
  pendiente: { texto: 'Pendiente', clase: 'border-white text-white' },
  rechazado: { texto: 'Rechazado', clase: 'border-line-strong text-muted' },
  cancelado: { texto: 'Cancelado', clase: 'border-line-strong text-muted' },
  reintegrado: { texto: 'Reintegrado', clase: 'border-line-strong text-muted' },
  contracargo: { texto: 'Contracargo', clase: 'border-line-strong text-muted' },
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
