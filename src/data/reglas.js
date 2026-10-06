// Reglas comerciales de ejemplo: ajustalas a tu tienda.
// Están en un solo archivo para que la ficha, las tarjetas y el home muestren lo mismo.
import { DOLAR } from './catalogo'

export const DESCUENTO_EFECTIVO = 0.1
export const ENVIO_GRATIS_DESDE_USD = 500

// coeficiente 1 = sin interés (mismo total que el precio de lista).
// Mayor a 1 = con interés. Nunca menor a 1: las cuotas no pueden salir más baratas que la lista.
export const CUOTAS = [
  { cantidad: 3, coeficiente: 1 },
  { cantidad: 6, coeficiente: 1 },
  { cantidad: 12, coeficiente: 1.2 },
]

// Mismo cálculo que el catálogo: dólares por el dólar oficial, redondeado a miles
export function aPesos(usd) {
  return Math.round((usd * DOLAR) / 1000) * 1000
}

export function precioEfectivo(precioLista) {
  return Math.round(precioLista * (1 - DESCUENTO_EFECTIVO))
}

export const ENVIO_GRATIS_DESDE = aPesos(ENVIO_GRATIS_DESDE_USD)

// La mayor cantidad de cuotas que no suma interés (hoy, 6)
export const CUOTAS_SIN_INTERES = Math.max(
  ...CUOTAS.filter((c) => c.coeficiente === 1).map((c) => c.cantidad),
)

export const PORCENTAJE_EFECTIVO = Math.round(DESCUENTO_EFECTIVO * 100)
