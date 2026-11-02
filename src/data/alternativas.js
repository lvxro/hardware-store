import { productosDe } from './catalogo'
import { compatibleCon } from './compatibilidad'
import { PUNTAJE_CPU, PUNTAJE_GPU } from './rendimiento'

// Comparador del carrito: para un producto del carrito, una opción más barata y una más cara
// de la misma categoría, con cuánto cambia el precio y el rendimiento.
// Solo se proponen productos con stock, que no estén ya en el carrito y que sean compatibles
// con el resto (socket y memoria, ver compatibilidad.js).

const PUNTAJES = { procesadores: PUNTAJE_CPU, placas_de_video: PUNTAJE_GPU }

// Para que valga la pena cambiar: bajar tiene que ahorrar al menos un 10 % y subir, rendir al menos un 10 % más
const AHORRO_MINIMO = 0.9
const MEJORA_MINIMA = 1.1

// Sin puntaje de rendimiento, se muestra el dato que más pesa al elegir en cada categoría
const DATO_CLAVE = {
  memorias_ram: (p) => `${p.capacidad_gb} GB · ${p.velocidad_mhz} MHz`,
  placas_base: (p) => `${p.chipset} · ${p.formato}`,
  monitores: (p) => `${p.tamano_pulgadas}" · ${p.tasa_refresco_hz} Hz`,
  teclados: (p) => `${p.formato} · ${p.switches}`,
  mouses: (p) => `${p.dpi_max?.toLocaleString('es-AR')} DPI · ${p.peso_g} g`,
}

const masCaroPrimero = (a, b) => b.precio - a.precio
const masBaratoPrimero = (a, b) => a.precio - b.precio

/*
  Devuelve { bajar, subir } (cualquiera de los dos puede ser null). Cada uno es
  { producto, precio: diferencia en pesos, rendimiento: diferencia en % o null, dato: texto o null }.
*/
export function alternativas(producto, enCarrito) {
  const enElCarrito = new Set(enCarrito.map((p) => p.id))
  const resto = enCarrito.filter((p) => p.id !== producto.id)
  const puntajes = PUNTAJES[producto.categoria]
  const base = puntajes?.[producto.id]
  const conPuntaje = base !== undefined

  const candidatos = productosDe(producto.categoria).filter(
    (p) =>
      !enElCarrito.has(p.id) &&
      p.stock !== 0 &&
      compatibleCon(p, resto)?.ok !== false &&
      (!conPuntaje || puntajes[p.id] !== undefined),
  )
  const masBaratos = candidatos.filter((p) => p.precio < producto.precio)
  const masCaros = candidatos.filter((p) => p.precio > producto.precio)

  let bajar, subir
  if (conPuntaje) {
    const puntaje = (p) => puntajes[p.id]
    // Bajar: entre los que ahorran algo que valga la pena, el que menos rendimiento pierde
    const ahorran = masBaratos.filter((p) => p.precio <= producto.precio * AHORRO_MINIMO)
    bajar = (ahorran.length ? ahorran : masBaratos).sort((a, b) => puntaje(b) - puntaje(a) || masCaroPrimero(a, b))[0]
    // Subir: el más barato que rinde bastante más; si ninguno llega, el que más rinde de los más caros
    const mejoran = masCaros.filter((p) => puntaje(p) >= base * MEJORA_MINIMA).sort(masBaratoPrimero)
    subir = mejoran[0] ?? masCaros.filter((p) => puntaje(p) > base).sort((a, b) => puntaje(b) - puntaje(a))[0]
  } else {
    // Sin puntaje: el escalón de precio más cercano para cada lado
    bajar = masBaratos.sort(masCaroPrimero)[0]
    subir = masCaros.sort(masBaratoPrimero)[0]
  }

  const describir = (p) =>
    p && {
      producto: p,
      precio: p.precio - producto.precio,
      rendimiento: conPuntaje ? Math.round((puntajes[p.id] / base - 1) * 100) : null,
      dato: DATO_CLAVE[producto.categoria]?.(p) ?? null,
    }

  return { bajar: describir(bajar) ?? null, subir: describir(subir) ?? null }
}
