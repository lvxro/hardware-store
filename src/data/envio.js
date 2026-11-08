// T-048: cuánto cuesta el envío según el código postal.
// Está aparte, sin importar nada del navegador, porque lo usan la ficha, el carrito y también el
// servidor que arma el pago (api/checkout.js): así el costo que cobra Mercado Pago es el mismo que
// ve el cliente. Los precios son de ejemplo: ajustalos a la tarifa real del correo.
import { ENVIO_GRATIS_DESDE } from './reglas.js'

// Zonas por rango de código postal (los 4 números de siempre, sin la letra de provincia).
// Desde 1000, el primer código que existe.
export const ZONAS = [
  { desde: 1000, hasta: 1499, nombre: 'Ciudad de Buenos Aires', costo: 5500 },
  { desde: 1500, hasta: 1999, nombre: 'Gran Buenos Aires y La Plata', costo: 7500 },
  { desde: 2000, hasta: 2999, nombre: 'Santa Fe y Entre Ríos', costo: 9500 },
  { desde: 3000, hasta: 3999, nombre: 'Litoral y Noreste', costo: 11500 },
  { desde: 4000, hasta: 4999, nombre: 'Noroeste', costo: 12500 },
  { desde: 5000, hasta: 5999, nombre: 'Córdoba y Cuyo', costo: 11000 },
  { desde: 6000, hasta: 7999, nombre: 'Interior de Buenos Aires y La Pampa', costo: 9500 },
  { desde: 8000, hasta: 9999, nombre: 'Patagonia', costo: 15000 },
]

export const CP_VALIDO = /^\d{4}$/

// La zona de un código postal, o null si no es un código válido
export function zonaDe(cp) {
  const texto = String(cp ?? '').trim()
  if (!CP_VALIDO.test(texto)) return null
  const numero = Number(texto)
  return ZONAS.find((z) => numero >= z.desde && numero <= z.hasta) ?? null
}

// Lo que se cobra de envío por una compra. "subtotal" es el total de lista de los productos.
// Devuelve null si el código postal no es válido.
export function costoEnvio(cp, subtotal) {
  const zona = zonaDe(cp)
  if (!zona) return null
  const gratis = subtotal >= ENVIO_GRATIS_DESDE
  return { zona: zona.nombre, costo: gratis ? 0 : zona.costo, gratis, tarifa: zona.costo }
}

// El código postal que el cliente escribió la última vez, para no pedírselo en cada pantalla
const CLAVE_CP = 'codigo-postal'

export function leerCodigoPostal() {
  try {
    const cp = localStorage.getItem(CLAVE_CP) ?? ''
    return CP_VALIDO.test(cp) ? cp : ''
  } catch {
    return ''
  }
}

export function guardarCodigoPostal(cp) {
  try {
    if (CP_VALIDO.test(cp)) localStorage.setItem(CLAVE_CP, cp)
  } catch {
    // Sin almacenamiento, se pide de nuevo en la próxima pantalla
  }
}
