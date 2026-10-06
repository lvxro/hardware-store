// Color del brillo de cada producto en la vitrina.
// El número es el tono (0 a 360) del color con el que se reconoce a cada marca.
// Si una marca no está en la lista, se le calcula un tono fijo a partir del nombre.
const TONOS = {
  AMD: 12,
  Intel: 205,
  NVIDIA: 82,
  Corsair: 48,
  'G.Skill': 350,
  Kingston: 0,
  Crucial: 215,
  ASUS: 338,
  MSI: 4,
  Gigabyte: 26,
  LG: 328,
  Samsung: 226,
  Alienware: 186,
  BenQ: 268,
  Acer: 96,
  Logitech: 194,
  Razer: 124,
  SteelSeries: 20,
  HyperX: 354,
}

function numeroDe(texto) {
  let n = 0
  for (const letra of texto) n = (n * 31 + letra.charCodeAt(0)) % 3600
  return n
}

// Devuelve dos tonos: el de la marca y una segunda luz corrida entre 40 y 90 grados,
// distinta para cada producto, así dos tarjetas de la misma marca no quedan idénticas.
export function auraDe(producto) {
  const h1 = TONOS[producto.marca] ?? numeroDe(producto.marca) % 360
  const h2 = (h1 + 40 + (numeroDe(producto.id) % 50)) % 360
  return { h1, h2 }
}
