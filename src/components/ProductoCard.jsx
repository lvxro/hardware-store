import { Link } from 'react-router-dom'
import Vitrina from './Vitrina'
import { formatoPrecio } from '../data/catalogo'
import { precioEfectivo } from '../data/reglas'

// Tarjeta compacta, sin borde propio: las líneas divisorias las pone la grilla que la contiene
export default function ProductoCard({ producto }) {
  return (
    <Link to={`/producto/${producto.id}`} className="group flex h-full flex-col p-3">
      <Vitrina producto={producto} categoria={producto.categoria} className="aspect-[4/3]" />

      <p className="mt-3 text-xs text-tenue">{producto.marca}</p>
      <h3 className="text-sm font-medium leading-snug group-hover:underline">{producto.modelo}</h3>

      <dl className="mt-2 space-y-0.5 text-xs tabular-nums">
        {producto.specs.map(([etiqueta, valor]) => (
          <div key={etiqueta} className="flex gap-2">
            <dt className="w-16 shrink-0 text-tenue">{etiqueta}</dt>
            <dd className="min-w-0">{valor}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-auto pt-3 tabular-nums">
        <p className="font-semibold">{formatoPrecio(producto.precio)}</p>
        <p className="text-xs font-medium text-pcb">
          {formatoPrecio(precioEfectivo(producto.precio))} en efectivo
        </p>
      </div>
    </Link>
  )
}
