import { formatoPrecio } from '../data/catalogo'
import { CUOTAS_SIN_INTERES, ENVIO_GRATIS_DESDE, PORCENTAJE_EFECTIVO } from '../data/reglas'

const trazo = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  className: 'h-6 w-6 shrink-0 text-aura-luz',
  'aria-hidden': true,
}

// Las tres condiciones de compra, calculadas con las reglas de data/reglas.js
const beneficios = [
  {
    titulo: `Envío gratis desde ${formatoPrecio(ENVIO_GRATIS_DESDE)}`,
    detalle: 'Por debajo de ese monto se calcula con tu código postal',
    icono: (
      <svg {...trazo}>
        <path d="M3 6h11v10H3zM14 9h4l3 4v3h-7z" />
        <circle cx="7" cy="17.5" r="1.75" />
        <circle cx="17.5" cy="17.5" r="1.75" />
      </svg>
    ),
  },
  {
    titulo: `${PORCENTAJE_EFECTIVO}% menos en efectivo`,
    detalle: 'También si pagás por transferencia',
    icono: (
      <svg {...trazo}>
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <circle cx="12" cy="12" r="2.5" />
        <path d="M6.5 9.5v.01M17.5 14.5v.01" />
      </svg>
    ),
  },
  {
    titulo: `Hasta ${CUOTAS_SIN_INTERES} cuotas sin interés`,
    detalle: 'Con Mercado Pago',
    icono: (
      <svg {...trazo}>
        <rect x="3" y="5.5" width="18" height="13" rx="2" />
        <path d="M3 10h18M7 14.5h4" />
      </svg>
    ),
  },
]

export default function Beneficios() {
  return (
    <ul className="mx-auto grid max-w-7xl gap-x-8 gap-y-4 px-4 py-5 sm:grid-cols-3">
      {beneficios.map((b) => (
        <li key={b.titulo} className="flex items-center gap-3">
          {b.icono}
          <div>
            <p className="font-semibold leading-tight">{b.titulo}</p>
            <p className="text-sm text-tenue-noche">{b.detalle}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
