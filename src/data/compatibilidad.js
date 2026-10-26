// T-029: ¿son compatibles mis componentes?
// Reglas que se pueden afirmar con los datos del catálogo (socket, tipo de memoria, consumo):
//  - Procesador y placa madre: el mismo socket.
//  - Memoria y placa madre: el mismo tipo (DDR4 o DDR5). Sin placa, contra lo que acepta el procesador.
//  - Procesadores sin video integrado (Ryzen de AM4 que no terminan en G) necesitan placa de video.
//  - Fuente: una potencia estimada a partir del procesador y la placa de video.
// Lo que no se puede saber con estos datos (gabinete, disipador, BIOS) se avisa como recomendación.

// Qué memoria acepta cada socket (las placas LGA1700 vienen en DDR4 o DDR5: manda la placa)
const MEMORIA_POR_SOCKET = {
  AM5: ['DDR5'],
  AM4: ['DDR4'],
  LGA1700: ['DDR4', 'DDR5'],
  LGA1851: ['DDR5'],
}

const CPU = 'procesadores'
const PLACA = 'placas_base'
const RAM = 'memorias_ram'
const GPU = 'placas_de_video'

export const CATEGORIAS_CON_REGLAS = [CPU, PLACA, RAM]

const nombreCorto = (p) => `${p.marca} ${p.modelo}`

// Ryzen de AM4 sin "G" al final (5600X, 5800X3D, 5900X...): no tienen video integrado
const sinVideoIntegrado = (cpu) => cpu.socket === 'AM4' && !/G$/i.test(cpu.modelo.trim())

// Fuente estimada: procesador + placa de video + 100 W del resto, con 30 % de margen, redondeado a 50 W
export function fuenteRecomendada(cpu, gpu) {
  const consumo = (cpu?.tdp_w ?? 0) + (gpu?.consumo_w ?? 0) + 100
  return { consumo, recomendada: Math.ceil((consumo * 1.3) / 50) * 50 }
}

// Separa la lista por categoría, sin repetir productos
function porCategoria(productos) {
  const grupos = {}
  for (const p of productos) {
    grupos[p.categoria] ??= []
    if (!grupos[p.categoria].some((x) => x.id === p.id)) grupos[p.categoria].push(p)
  }
  return grupos
}

/*
  Revisa un conjunto de productos (el carrito). Devuelve una lista de chequeos:
  { estado: 'ok' | 'error' | 'aviso' | 'info', titulo, detalle, enlace? }
*/
export function revisar(productos) {
  const g = porCategoria(productos)
  const cpus = g[CPU] ?? []
  const placas = g[PLACA] ?? []
  const rams = g[RAM] ?? []
  const gpus = g[GPU] ?? []
  const chequeos = []

  if (cpus.length > 1)
    chequeos.push({ estado: 'aviso', titulo: `Hay ${cpus.length} procesadores distintos`, detalle: 'Una PC lleva uno solo.' })
  if (placas.length > 1)
    chequeos.push({ estado: 'aviso', titulo: `Hay ${placas.length} placas madre distintas`, detalle: 'Una PC lleva una sola.' })

  // Procesador ↔ placa
  for (const cpu of cpus)
    for (const placa of placas) {
      const ok = cpu.socket === placa.socket
      chequeos.push({
        estado: ok ? 'ok' : 'error',
        titulo: ok ? 'Procesador y placa madre' : 'El procesador no entra en la placa madre',
        detalle: ok
          ? `${nombreCorto(cpu)} y ${nombreCorto(placa)} usan el mismo socket (${cpu.socket}).`
          : `${nombreCorto(cpu)} es ${cpu.socket} y ${nombreCorto(placa)} es ${placa.socket}.`,
      })
    }

  // Memoria ↔ placa (o ↔ procesador si no hay placa)
  const tiposRam = [...new Set(rams.map((r) => r.tipo))]
  if (tiposRam.length > 1)
    chequeos.push({ estado: 'error', titulo: 'Memorias de distinto tipo', detalle: `Mezclaste ${tiposRam.join(' y ')}: una placa acepta un solo tipo.` })
  for (const ram of rams) {
    if (placas.length) {
      for (const placa of placas) {
        const ok = ram.tipo === placa.memoria
        chequeos.push({
          estado: ok ? 'ok' : 'error',
          titulo: ok ? 'Memoria y placa madre' : 'La memoria no va en la placa madre',
          detalle: ok
            ? `${nombreCorto(ram)} es ${ram.tipo}, lo que pide ${nombreCorto(placa)}.`
            : `${nombreCorto(ram)} es ${ram.tipo} y ${nombreCorto(placa)} usa ${placa.memoria}.`,
        })
      }
    } else {
      for (const cpu of cpus) {
        const acepta = MEMORIA_POR_SOCKET[cpu.socket]
        if (!acepta) continue
        const ok = acepta.includes(ram.tipo)
        chequeos.push({
          estado: ok ? 'ok' : 'error',
          titulo: ok ? 'Memoria y procesador' : 'La memoria no sirve para este procesador',
          detalle: ok
            ? `${nombreCorto(cpu)} (${cpu.socket}) trabaja con ${ram.tipo}${acepta.length > 1 ? ', si la placa madre es DDR5' : ''}.`
            : `${nombreCorto(cpu)} (${cpu.socket}) usa ${acepta.join(' o ')} y ${nombreCorto(ram)} es ${ram.tipo}.`,
        })
      }
    }
  }

  // Video integrado
  for (const cpu of cpus)
    if (sinVideoIntegrado(cpu) && gpus.length === 0)
      chequeos.push({
        estado: 'aviso',
        titulo: 'Falta placa de video',
        detalle: `${nombreCorto(cpu)} no tiene video integrado: sin placa de video la PC no da imagen.`,
        enlace: { a: '/categoria/placas_de_video', texto: 'Ver placas de video' },
      })

  // Lo que falta para armar el combo
  if (cpus.length === 1 && placas.length === 0)
    chequeos.push({
      estado: 'info',
      titulo: 'Te falta la placa madre',
      detalle: `Para ${nombreCorto(cpus[0])} tiene que ser ${cpus[0].socket}.`,
      enlace: { a: '/categoria/placas_base?compatibles=1', texto: `Ver placas ${cpus[0].socket}` },
    })
  if (placas.length === 1 && cpus.length === 0)
    chequeos.push({
      estado: 'info',
      titulo: 'Te falta el procesador',
      detalle: `Para ${nombreCorto(placas[0])} tiene que ser ${placas[0].socket}.`,
      enlace: { a: '/categoria/procesadores?compatibles=1', texto: `Ver procesadores ${placas[0].socket}` },
    })
  if ((placas.length === 1 || cpus.length === 1) && rams.length === 0) {
    const tipo = placas[0]?.memoria ?? MEMORIA_POR_SOCKET[cpus[0].socket]?.join(' o ')
    if (tipo)
      chequeos.push({
        estado: 'info',
        titulo: 'Te falta la memoria',
        detalle: placas[0] ? `Tiene que ser ${tipo}.` : `Tiene que ser ${tipo}, según la placa madre que elijas.`,
        enlace: { a: '/categoria/memorias_ram?compatibles=1', texto: `Ver memorias ${tipo}` },
      })
  }

  // Placa E-ATX: no entra en cualquier gabinete
  for (const placa of placas)
    if (placa.formato === 'E-ATX')
      chequeos.push({ estado: 'aviso', titulo: 'Placa E-ATX', detalle: `${nombreCorto(placa)} necesita un gabinete con lugar para E-ATX.` })

  // Fuente
  if (cpus.length || gpus.length) {
    const { consumo, recomendada } = fuenteRecomendada(cpus[0], gpus[0])
    chequeos.push({
      estado: 'info',
      titulo: `Fuente de al menos ${recomendada} W`,
      detalle: gpus.length
        ? `El equipo consumiría unos ${consumo} W. Es una estimación: confirmá con lo que pide el fabricante de la placa de video.`
        : `El equipo consumiría unos ${consumo} W (sin contar placa de video). Es una estimación.`,
    })
  }

  return chequeos
}

/*
  ¿Este producto es compatible con lo que ya hay en el carrito?
  Devuelve { ok, motivo } si alguna regla aplica, o null si no hay nada que comparar.
*/
export function compatibleCon(producto, enCarrito) {
  const g = porCategoria(enCarrito.filter((p) => p.id !== producto.id))
  const cpu = g[CPU]?.[0]
  const placa = g[PLACA]?.[0]
  const ram = g[RAM]?.[0]

  if (producto.categoria === CPU) {
    if (placa)
      return producto.socket === placa.socket
        ? { ok: true, motivo: `Entra en tu ${nombreCorto(placa)}` }
        : { ok: false, motivo: `Tu placa es ${placa.socket}, este es ${producto.socket}` }
    if (ram) {
      const acepta = MEMORIA_POR_SOCKET[producto.socket]
      if (acepta)
        return acepta.includes(ram.tipo)
          ? { ok: true, motivo: `Funciona con tu memoria ${ram.tipo}` }
          : { ok: false, motivo: `Usa ${acepta.join('/')} y tu memoria es ${ram.tipo}` }
    }
  }

  if (producto.categoria === PLACA) {
    if (cpu && producto.socket !== cpu.socket) return { ok: false, motivo: `Tu procesador es ${cpu.socket}, esta es ${producto.socket}` }
    if (ram && producto.memoria !== ram.tipo) return { ok: false, motivo: `Usa ${producto.memoria} y tu memoria es ${ram.tipo}` }
    if (cpu || ram) return { ok: true, motivo: cpu ? `Va con tu ${nombreCorto(cpu)}` : `Usa ${ram.tipo}, como tu memoria` }
  }

  if (producto.categoria === RAM) {
    if (placa)
      return producto.tipo === placa.memoria
        ? { ok: true, motivo: `Va en tu ${nombreCorto(placa)}` }
        : { ok: false, motivo: `Tu placa usa ${placa.memoria}, esta es ${producto.tipo}` }
    if (cpu) {
      const acepta = MEMORIA_POR_SOCKET[cpu.socket]
      if (acepta)
        return acepta.includes(producto.tipo)
          ? { ok: true, motivo: `Sirve para tu ${nombreCorto(cpu)}` }
          : { ok: false, motivo: `Tu procesador usa ${acepta.join('/')}` }
    }
  }

  return null
}
