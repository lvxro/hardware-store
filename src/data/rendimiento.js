// Arma tu PC: ¿el procesador y la placa de video se llevan bien en rendimiento?
// Un "cuello de botella" es cuando una pieza es mucho más lenta que la otra y no deja que la más
// rápida muestre todo lo que puede. El catálogo no trae benchmarks, así que acá hay un puntaje
// APROXIMADO de 1 a 10 por producto, cargado a mano según pruebas de juegos en 1080p y 1440p.
// Sirve para orientar, no para medir. Para actualizarlo, cambiá el número de cada id (los ids son
// los de la tabla productos: cpu-001, gpu-002...). Un producto sin puntaje no se evalúa.

export const PUNTAJE_CPU = {
  'cpu-001': 9.5, // Ryzen 7 7800X3D
  'cpu-002': 7, // Ryzen 5 7600X
  'cpu-003': 9.5, // Ryzen 9 7950X3D
  'cpu-004': 8.5, // Core i7-14700K
  'cpu-005': 7.5, // Core i5-13600K
  'cpu-006': 8, // Ryzen 9 7900X
  'cpu-007': 7.5, // Ryzen 7 7700X
  'cpu-008': 8, // Ryzen 7 5800X3D
  'cpu-009': 9, // Core i9-14900K
  'cpu-010': 7.8, // Core i5-14600K
  'cpu-011': 5.5, // Ryzen 5 5600X
  'cpu-012': 6.5, // Ryzen 9 5900X
  'cpu-013': 6.8, // Ryzen 5 7600
  'cpu-014': 8.8, // Core i9-13900K
  'cpu-015': 8.2, // Core i7-13700K
}

export const PUNTAJE_GPU = {
  'gpu-001': 10, // RTX 4090
  'gpu-002': 6.8, // RTX 4070 Super
  'gpu-003': 4.7, // RTX 4060 Ti
  'gpu-004': 8.7, // RX 7900 XTX
  'gpu-005': 6.5, // RX 7800 XT
  'gpu-006': 8.5, // RTX 4080 Super
  'gpu-007': 7.6, // RTX 4070 Ti Super
  'gpu-008': 4, // RTX 4060
  'gpu-009': 5.5, // RX 7700 XT
  'gpu-010': 3.8, // RX 7600
  'gpu-011': 6, // RTX 4070
  'gpu-012': 7, // RTX 4070 Ti
  'gpu-013': 3.6, // RTX 3060
  'gpu-014': 7.8, // RX 7900 XT
  'gpu-015': 6.9, // RX 7900 GRE
}

// Si la placa de video rinde más de 1,3 veces lo que rinde el procesador, el procesador la frena
const LIMITE_CPU_FRENA = 1.3
// Si rinde menos de la mitad, el procesador sobra: la que manda es la placa de video
const LIMITE_GPU_MANDA = 0.5
// Desde este puntaje de placa de video, 16 GB de RAM se quedan cortos
const GPU_GAMA_ALTA = 7

const nombreCorto = (p) => `${p.marca} ${p.modelo}`

/*
  Devuelve { estado: 'ok' | 'aviso' | 'info', titulo, detalle } o null si falta alguna de las dos piezas.
  Usa los mismos estados que los chequeos de compatibilidad.js.
*/
export function cuelloDeBotella(cpu, gpu) {
  if (!cpu || !gpu) return null
  const c = PUNTAJE_CPU[cpu.id]
  const g = PUNTAJE_GPU[gpu.id]
  if (c === undefined || g === undefined)
    return {
      estado: 'info',
      titulo: 'Sin datos de rendimiento',
      detalle: 'Todavía no tenemos el puntaje de alguna de estas dos piezas, así que no podemos evaluar el cuello de botella.',
    }

  const razon = g / c
  if (razon > LIMITE_CPU_FRENA)
    return {
      estado: 'aviso',
      titulo: 'Cuello de botella: el procesador frena la placa de video',
      detalle: `${nombreCorto(gpu)} puede dar bastante más de lo que ${nombreCorto(cpu)} alcanza a pedirle. En juegos vas a perder rendimiento. Probá con un procesador más potente o una placa de video más modesta.`,
    }
  if (razon < LIMITE_GPU_MANDA)
    return {
      estado: 'info',
      titulo: 'La placa de video es la que marca el límite',
      detalle: `${nombreCorto(cpu)} le sobra a ${nombreCorto(gpu)}. No es un problema, pero para jugar rendiría más con una placa de video mejor.`,
    }
  return {
    estado: 'ok',
    titulo: 'Sin cuello de botella',
    detalle: `${nombreCorto(cpu)} y ${nombreCorto(gpu)} rinden parejo.`,
  }
}

// Con una placa de video de gama alta, 16 GB de RAM o menos quedan justos
export function memoriaJusta(gpu, ram) {
  if (!gpu || !ram) return null
  const g = PUNTAJE_GPU[gpu.id]
  if (g === undefined || g < GPU_GAMA_ALTA || ram.capacidad_gb >= 32) return null
  return {
    estado: 'aviso',
    titulo: 'Memoria justa para esta placa de video',
    detalle: `Con ${nombreCorto(gpu)} conviene tener 32 GB de RAM o más. ${nombreCorto(ram)} es de ${ram.capacidad_gb} GB.`,
  }
}
