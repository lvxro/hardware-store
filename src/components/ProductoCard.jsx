import { Link } from 'react-router-dom'
import Vitrina from './Vitrina'
import { formatoPrecio } from '../data/catalogo'
import { precioEfectivo } from '../data/reglas'

// Tarjeta de producto: dibujo o foto, nombre, descripción y los dos precios.
// Al pasar el cursor, el borde pasa a lima con resplandor, la tarjeta sube apenas
// y el dibujo se aclara y se acerca (esto último está en index.css, .vitrina).
// Las specs completas están en la ficha de cada producto.
export default function ProductoCard({ producto }) {
  return (
    <Link to={`/producto/${producto.id}`} className="group flex h-full flex-col rounded-[3px] border border-line bg-surface p-3 hover:-translate-y-1 hover:border-lime hover:shadow-glow">
      <Vitrina producto={producto} categoria={producto.categoria} className="aspect-[4/3]" />
      <h3 className="mt-3 font-semibold leading-snug group-hover:underline">{producto.nombre}</h3>
      <p className="mt-1 text-xs text-muted sm:text-sm">{producto.descripcion}</p>
      <div className="mt-auto pt-3 font-mono">
        <p className="text-lg font-bold">{formatoPrecio(producto.precio)}</p>
        <p className="text-xs font-medium text-lime sm:text-sm">
          {formatoPrecio(precioEfectivo(producto.precio))} en efectivo
        </p>
      </div>
    </Link>
  )
}
