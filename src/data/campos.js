// Cómo se muestran los campos de productos.json: "tasa_refresco_hz" pasa a "Tasa refresco (Hz)".
// Lo usan la ficha de producto y la tabla comparativa de cada categoría.

// Campos comunes a todos los productos, que no son especificaciones
export const CAMPOS_BASE = [
  'id',
  'marca',
  'modelo',
  'nombre',
  'precio_usd_aprox',
  'imagen',
  'descripcion',
]

const PALABRAS = {
  nucleos: 'núcleos',
  tdp: 'TDP',
  cache: 'caché',
  l3: 'L3',
  tamano: 'tamaño',
  resolucion: 'resolución',
  configuracion: 'configuración',
  conexion: 'conexión',
  iluminacion: 'iluminación',
  dpi: 'DPI',
  max: 'máx.',
  wifi: 'WiFi',
}

const UNIDADES = {
  w: 'W',
  ghz: 'GHz',
  mhz: 'MHz',
  hz: 'Hz',
  mb: 'MB',
  gb: 'GB',
  ms: 'ms',
  g: 'g',
}

export function formatearCampo(clave) {
  const partes = clave.split('_')
  let unidad = ''

  if (partes.length > 1 && UNIDADES[partes[partes.length - 1]]) {
    unidad = ` (${UNIDADES[partes.pop()]})`
  }

  const texto = partes.map((parte) => PALABRAS[parte] ?? parte).join(' ')
  return texto.charAt(0).toUpperCase() + texto.slice(1) + unidad
}

export function formatearValor(valor) {
  if (typeof valor === 'boolean') return valor ? 'Sí' : 'No'
  return String(valor)
}
