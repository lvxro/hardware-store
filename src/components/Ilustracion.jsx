// Dibujo de cada producto, armado con sus propios datos del catálogo:
// el procesador lleva el modelo grabado y la forma de su socket, la placa de video
// tiene 2 o 3 coolers según el consumo, el teclado respeta su formato, etc.
// Se muestra dentro de <Vitrina> mientras no haya una foto en /public/img.
import Icono from './Icono'

const ACENTO = 'var(--acento)'
const CUERPO = 'var(--cuerpo)'

function Texto({ x, y, size, children, anchor = 'middle', color = 'currentColor', opacity, ancho = 114 }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize={size}
      fontWeight="700"
      fill={color}
      stroke="none"
      opacity={opacity}
      style={{ fontStretch: `${ancho}%` }}
    >
      {children}
    </text>
  )
}

/* ---------- Procesador ---------- */

const TAPAS = {
  // Tapa metálica vista desde arriba. AM5 tiene los recortes típicos en los cuatro lados
  AM5: 'M84 44H110v7h20v-7H156l10 10V80h-7v20h7V126l-10 10H130v-7h-20v7H84l-10-10V100h7V80h-7V54z',
  // Intel LGA: rectangular y con dos orejas a los costados
  LGA: 'M90 40H150a6 6 0 0 1 6 6V72h6v36h-6V134a6 6 0 0 1-6 6H90a6 6 0 0 1-6-6V108h-6V72h6V46a6 6 0 0 1 6-6z',
}

function Procesador({ p }) {
  const corte = p.modelo.lastIndexOf(' ')
  const linea = p.modelo.slice(0, corte) // "Ryzen 7", "Core"
  const numero = p.modelo.slice(corte + 1) // "7800X3D", "i7-14700K"
  const lga = p.socket.startsWith('LGA')

  return (
    <g transform="translate(120 90) scale(1.14) translate(-120 -90)">
      {lga ? (
        <>
          <rect x="72" y="26" width="96" height="128" rx="4" fill={CUERPO} />
          <path d={TAPAS.LGA} />
          <path d="M76 150h11l-11-11z" fill={ACENTO} stroke="none" />
        </>
      ) : (
        <>
          <rect x="62" y="32" width="116" height="116" rx="4" fill={CUERPO} />
          {p.socket === 'AM5' ? (
            <path d={TAPAS.AM5} />
          ) : (
            <rect x="74" y="44" width="92" height="92" rx="8" />
          )}
          <path d="M66 144h11l-11-11z" fill={ACENTO} stroke="none" />
        </>
      )}
      <Texto x="120" y="75" size="9" opacity="0.7">{p.marca}</Texto>
      <Texto x="120" y="93" size="14">{linea}</Texto>
      <Texto x="120" y="109" size={numero.length > 8 ? 10 : 11.5} color={ACENTO}>{numero}</Texto>
    </g>
  )
}

/* ---------- Placa de video ---------- */

function Cooler({ cx, cy, r }) {
  const aspas = Array.from({ length: 9 }, (_, i) => i * 40)
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <circle r={r} />
      {aspas.map((giro) => (
        <path
          key={giro}
          transform={`rotate(${giro})`}
          d={`M0 ${-r * 0.3}Q${r * 0.5} ${-r * 0.42} ${r * 0.34} ${-r * 0.9}`}
          strokeWidth="1.5"
          opacity="0.65"
        />
      ))}
      <circle r={r * 0.26} fill={ACENTO} stroke="none" />
    </g>
  )
}

function PlacaDeVideo({ p }) {
  const modelo = p.modelo.replace(/^(GeForce|Radeon)\s+/, '')
  // Las placas de más de 250 W vienen con tres coolers
  const coolers = p.consumo_w > 250 ? [58, 122, 186] : [78, 166]
  const radio = coolers.length === 3 ? 30 : 32

  return (
    <>
      <rect x="9" y="30" width="7" height="120" rx="2" />
      <rect x="22" y="38" width="200" height="94" rx="10" fill={CUERPO} />
      <path d="M22 59H222" opacity="0.5" />
      <Texto x="33" y="53" size="10" anchor="start" color={ACENTO}>{modelo}</Texto>
      <Texto x="211" y="53" size="9" anchor="end" opacity="0.75">{p.memoria_gb} GB</Texto>
      {coolers.map((cx) => (
        <Cooler key={cx} cx={cx} cy={96} r={radio} />
      ))}
      <path d="M46 132v9h28v-9M80 132v9h78v-9" />
    </>
  )
}

/* ---------- Memoria RAM ---------- */

const DISIPADOR = 'M24 72L40 58H200L216 72V118H24Z'

function MemoriaRam({ p }) {
  const rgb = /rgb/i.test(`${p.modelo} ${p.descripcion}`)
  const contactos = []
  for (let x = 31; x <= 209; x += 6) {
    if (x < 124 || x > 136) contactos.push(x)
  }

  return (
    <>
      {/* El kit trae dos módulos: el de atrás se asoma */}
      <g transform="translate(12 -18)" opacity="0.4">
        <path d={DISIPADOR} />
        {rgb && <rect x="42" y="49" width="156" height="8" rx="4" />}
      </g>

      <path d={DISIPADOR} fill={CUERPO} />
      {rgb && <rect x="42" y="49" width="156" height="8" rx="4" fill={ACENTO} stroke="none" />}
      <path d="M24 118v16h102v-6h8v6h82v-16" fill={CUERPO} />
      {contactos.map((x) => (
        <path key={x} d={`M${x} 123v7`} strokeWidth="1.5" opacity="0.6" />
      ))}
      <Texto x="40" y="101" size="21" anchor="start">{p.capacidad_gb} GB</Texto>
      <Texto x="202" y="90" size="11" anchor="end" color={ACENTO}>{p.tipo}</Texto>
      <Texto x="202" y="105" size="9.5" anchor="end" opacity="0.75">{p.velocidad_mhz} MHz</Texto>
    </>
  )
}

/* ---------- Placa madre ---------- */

const TAMANOS_PLACA = {
  'Micro-ATX': { ancho: 124, alto: 126 },
  ATX: { ancho: 124, alto: 156 },
  'E-ATX': { ancho: 150, alto: 156 },
}

function PlacaMadre({ p }) {
  const { ancho, alto } = TAMANOS_PLACA[p.formato] ?? TAMANOS_PLACA.ATX
  const x = 120 - ancho / 2
  const y = 90 - alto / 2
  const derecha = x + ancho

  return (
    <>
      <rect x={x} y={y} width={ancho} height={alto} rx="4" fill={CUERPO} />

      {/* Panel trasero, con las dos antenas si trae WiFi */}
      <rect x={x + 6} y={y + 8} width="16" height="46" rx="2" />
      {p.wifi && (
        <>
          <circle cx={x + 14} cy={y + 19} r="3" fill={ACENTO} stroke="none" />
          <circle cx={x + 14} cy={y + 30} r="3" fill={ACENTO} stroke="none" />
        </>
      )}

      {/* Disipador de las fases y zócalo del procesador */}
      <rect x={x + 28} y={y + 8} width="44" height="9" rx="2" opacity="0.6" />
      <rect x={x + 32} y={y + 24} width="38" height="38" rx="3" />
      <Texto x={x + 51} y={y + 46} size={p.socket.length > 4 ? 6.5 : 9} color={ACENTO}>{p.socket}</Texto>

      {/* Cuatro ranuras de memoria y el conector de 24 pines */}
      {[80, 86, 92, 98].map((dx) => (
        <path key={dx} d={`M${x + dx} ${y + 10}V${y + 72}`} strokeWidth="2.5" opacity="0.75" />
      ))}
      <rect x={derecha - 12} y={y + 26} width="6" height="28" rx="1" opacity="0.6" />

      {/* Ranuras PCIe, disipador del M.2 y del chipset */}
      <rect x={x + 26} y={y + 82} width="76" height="6" rx="2" stroke={ACENTO} />
      <rect x={x + 26} y={y + 95} width="50" height="9" rx="2" opacity="0.6" />
      <rect x={x + 26} y={y + 111} width="56" height="6" rx="2" />
      <rect x={derecha - 34} y={y + 90} width="27" height="24" rx="3" />
      <Texto x={derecha - 20.5} y={y + 105} size="6.5" opacity="0.85">{p.chipset}</Texto>

      {alto > 140 && (
        <>
          <rect x={x + 26} y={y + 130} width="30" height="5" rx="2" opacity="0.6" />
          <path d={`M${x + 66} ${y + alto - 9}h${ancho - 76}`} strokeDasharray="2 4" opacity="0.6" />
        </>
      )}
    </>
  )
}

/* ---------- Monitor ---------- */

const RESOLUCIONES = {
  '1920x1080': '1080p',
  '2560x1440': '1440p',
  '3440x1440': 'UWQHD',
}

function Monitor({ p }) {
  const ultrawide = p.resolucion.startsWith('3440')
  const curvo = /curvo/i.test(p.panel)
  const ancho = ultrawide ? 212 : 172
  const alto = ultrawide ? 92 : 102
  const x = 120 - ancho / 2
  const y = ultrawide ? 26 : 20
  const panza = curvo ? 8 : 0 // cuánto baja el centro en los monitores curvos

  const pantalla = (margen) => {
    const izq = x + margen
    const der = x + ancho - margen
    const arriba = y + margen
    const abajo = y + alto - margen
    return `M${izq} ${arriba}Q120 ${arriba + panza * 2} ${der} ${arriba}V${abajo}Q120 ${abajo + panza * 2} ${izq} ${abajo}Z`
  }
  const base = y + alto + panza

  return (
    <>
      <path d={`M112 ${base}v18h16v-18`} />
      <rect x="84" y={base + 18} width="72" height="6" rx="3" fill={CUERPO} />
      <path d={pantalla(0)} fill={CUERPO} />
      <path d={pantalla(5)} fill={ACENTO} stroke="none" opacity="0.14" />
      <Texto x="120" y={y + alto / 2 + panza + 4} size="24">{RESOLUCIONES[p.resolucion] ?? p.resolucion}</Texto>
      <Texto x="120" y={y + alto / 2 + panza + 22} size="11" color={ACENTO}>{p.tasa_refresco_hz} Hz</Texto>
      <Texto x={x + ancho - 12} y={y + 20 + panza / 2} size="9" anchor="end" opacity="0.7">{p.tamano_pulgadas}&quot;</Texto>
    </>
  )
}

/* ---------- Teclado ---------- */

const U = 9 // lo que ocupa una tecla común, con su separación

// Ancho de cada tecla en unidades. Un número negativo es un hueco.
const unas = (n) => Array(n).fill(1)
const FILAS = {
  funcion: [1, -1, ...unas(4), -0.5, ...unas(4), -0.5, ...unas(4)],
  numeros: [...unas(13), 2],
  qwerty: [1.5, ...unas(12), 1.5],
  asdf: [1.75, ...unas(11), 2.25],
  zxcv: [2.25, ...unas(10), 2.75],
  espacio: [1.25, 1.25, 1.25, 6.25, 1.25, 1.25, 1.25, 1.25],
}

// Teclas pintadas: Esc y W, A, S, D
const PINTADAS = { funcion: [0], qwerty: [2], asdf: [1, 2, 3] }

function Teclas({ anchos, x, y, pintadas = [] }) {
  const teclas = []
  let cursor = x
  let numero = 0
  for (const ancho of anchos) {
    if (ancho > 0) {
      const pintada = pintadas.includes(numero)
      teclas.push(
        <rect
          key={cursor}
          x={cursor}
          y={y}
          width={ancho * U - 1.6}
          height={U - 1.6}
          rx="1.5"
          fill={pintada ? ACENTO : 'none'}
          stroke={pintada ? 'none' : 'currentColor'}
        />,
      )
      numero += 1
    }
    cursor += Math.abs(ancho) * U
  }
  return teclas
}

function Teclado({ p }) {
  const chico = p.formato === '60%'
  const compacto = p.formato === '75%'
  const conNumerico = p.formato === 'Full size'
  const conFlechas = conNumerico || p.formato === 'TKL'

  const nombres = chico
    ? ['numeros', 'qwerty', 'asdf', 'zxcv', 'espacio']
    : ['funcion', 'numeros', 'qwerty', 'asdf', 'zxcv', 'espacio']

  let ancho = 15 * U
  if (compacto) ancho += U
  if (conFlechas) ancho += 4 + 3 * U
  if (conNumerico) ancho += 4 + 4 * U
  const alto = nombres.length * U + (chico ? 0 : 3)

  const x = 120 - (ancho - 1.6) / 2
  const y = 90 - (alto - 1.6) / 2
  const xFlechas = x + 15 * U + 4
  const xNumerico = xFlechas + 3 * U + 4
  // La fila de funciones va un poco separada del resto
  const yDe = (fila) => y + fila * U + (!chico && fila > 0 ? 3 : 0)

  // Bloque de flechas y bloque numérico, fila por fila (solo en los formatos que los traen)
  const flechas = [unas(3), unas(3), unas(3), [], [-1, 1, -1], unas(3)]
  const numerico = [[], unas(4), unas(4), unas(4), unas(4), [2, 1, 1]]

  return (
    <g strokeWidth="1.1">
      <rect x={x - 7} y={y - 7} width={ancho + 12.4} height={alto + 12.4} rx="6" fill={CUERPO} strokeWidth="2" />
      {nombres.map((nombre, fila) => (
        <g key={nombre}>
          <Teclas
            anchos={FILAS[nombre]}
            x={x}
            y={yDe(fila)}
            pintadas={chico && nombre === 'numeros' ? [0] : PINTADAS[nombre]}
          />
          {compacto && <Teclas anchos={[1]} x={x + 15 * U} y={yDe(fila)} />}
          {conFlechas && <Teclas anchos={flechas[fila]} x={xFlechas} y={yDe(fila)} />}
          {conNumerico && <Teclas anchos={numerico[fila]} x={xNumerico} y={yDe(fila)} />}
        </g>
      ))}
    </g>
  )
}

/* ---------- Mouse ---------- */

function Mouse({ p }) {
  const conCable = /cable/i.test(p.conexion)
  // Dos botones laterales de base; los mouses con muchos botones suman hasta cuatro
  const laterales = Math.min(4, Math.max(2, p.botones - 4))

  return (
    <>
      {conCable ? (
        <path d="M120 28C120 14 134 16 138 4" />
      ) : (
        <g stroke={ACENTO}>
          <path d="M152 30a12 12 0 0 1 9 9" />
          <path d="M156 19a23 23 0 0 1 17 17" />
        </g>
      )}
      <path
        d="M120 28C96 28 84 46 84 74V112C84 140 100 156 120 156C140 156 156 140 156 112V74C156 46 144 28 120 28Z"
        fill={CUERPO}
      />
      <path d="M120 28V80M84 82Q120 94 156 82" opacity="0.6" />
      <rect x="116" y="44" width="8" height="20" rx="4" fill={ACENTO} stroke="none" />
      {Array.from({ length: laterales }, (_, i) => (
        <path key={i} d={`M88 ${90 + i * 9}v5`} strokeWidth="3" opacity="0.75" />
      ))}
      <Texto x="120" y="128" size="14">{p.peso_g} g</Texto>
      <Texto x="120" y="141" size="8" opacity="0.7">{Math.round(p.dpi_max / 1000)}K DPI</Texto>
    </>
  )
}

const DIBUJOS = {
  procesadores: Procesador,
  placas_de_video: PlacaDeVideo,
  memorias_ram: MemoriaRam,
  placas_base: PlacaMadre,
  monitores: Monitor,
  teclados: Teclado,
  mouses: Mouse,
}

export default function Ilustracion({ producto, categoria, className = '' }) {
  const Dibujo = DIBUJOS[categoria]

  // Categoría nueva sin dibujo propio: se usa el ícono de línea
  if (!Dibujo) return <Icono categoria={categoria} className={className} />

  return (
    <svg
      viewBox="0 0 240 180"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <Dibujo p={producto} />
    </svg>
  )
}
