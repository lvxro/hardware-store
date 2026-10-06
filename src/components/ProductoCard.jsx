import { Link } from 'react-router-dom'
import Vitrina from './Vitrina'
import { formatoPrecio } from '../data/catalogo'
import { precioEfectivo } from '../data/reglas'

export default function ProductoCard({ producto }) {
  return (
    <Link
      to={`/producto/${producto.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-linea bg-superficie hover:border-aura"
    >
      <Vitrina
        producto={producto}
        categoria={producto.categoria}
        className="aspect-[16/10] min-[480px]:aspect-[4/3]"
      />

      <div className="flex flex-1 flex-col p-4">
        <p className="text-sm text-tenue">{producto.marca}</p>
        <h3 className="mt-0.5 text-[1.0625rem] font-semibold leading-snug group-hover:text-aura">
          {producto.modelo}
        </h3>

        <dl className="mt-3 space-y-1 text-sm">
          {producto.specs.map(([etiqueta, valor]) => (
            <div key={etiqueta} className="flex gap-2">
              <dt className="w-[4.75rem] shrink-0 text-tenue">{etiqueta}</dt>
              <dd className="min-w-0">{valor}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-auto pt-4">
          <p className="text-2xl font-bold tabular-nums">{formatoPrecio(producto.precio)}</p>
          <p className="mt-0.5 text-sm font-medium text-pcb tabular-nums">
            {formatoPrecio(precioEfectivo(producto.precio))} en efectivo
          </p>
        </div>
      </div>
    </Link>
  )
}
