// T-021: los productos en oferta y cuánto se descuenta.
// Está aparte de reglas.js porque el catálogo necesita estos datos y reglas.js necesita el catálogo.

// Los seis productos en oferta, uno por categoría (salvo placas madre). Para cambiarlos,
// reemplazá los id por otros de la tabla productos de Supabase.
export const IDS_EN_OFERTA = ['cpu-002', 'gpu-003', 'ram-003', 'mon-004', 'tec-003', 'mou-004']

export const DESCUENTO_OFERTA = 0.25
export const PORCENTAJE_OFERTA = Math.round(DESCUENTO_OFERTA * 100)

// El precio de oferta es el de lista menos el 25 %. Como las demás cuentas del sitio
// (efectivo, cuotas, envío gratis, carrito) parten de "precio", todas usan el de oferta.
export function precioConOferta(precioLista) {
  return Math.round(precioLista * (1 - DESCUENTO_OFERTA))
}
