// Cómo se pasa un producto de dólares a pesos. Está aparte porque lo usan la tienda (catalogo.js,
// reglas.js) y también el servidor que arma el pago (api/checkout.js): así el precio que cobra
// Mercado Pago es siempre el mismo que ve el cliente. Este archivo no puede importar nada del navegador.
import { IDS_EN_OFERTA, precioConOferta } from './ofertas.js'

// Dólar oficial de referencia (Banco Nación). Cambiar este número cuando se actualice.
export const DOLAR = 1540

// Dólares por el dólar oficial, redondeado a miles
export function aPesos(usd) {
  return Math.round((usd * DOLAR) / 1000) * 1000
}

// Precio final de un producto: el de lista o, si está en oferta, el de oferta (T-021)
export function precioDeProducto(id, precioUsd) {
  const precioLista = aPesos(precioUsd)
  const enOferta = IDS_EN_OFERTA.includes(id)
  return {
    precio: enOferta ? precioConOferta(precioLista) : precioLista,
    precioAnterior: enOferta ? precioLista : null,
    enOferta,
  }
}
