import { Link } from 'react-router-dom'
import Vitrina from './Vitrina'
import { formatoPrecio } from '../data/catalogo'
import { precioEfectivo } from '../data/reglas'

// Tarjeta de producto, sin borde propio: dibujo o foto, nombre, descripción y los dos precios.
// Las specs completas están en la ficha de cada producto.
export default function ProductoCard({ producto }) {
  return (
    <Link to={`/producto/${producto.id}`} className="group flex h-full flex-col">
      <Vitrina producto={producto} categoria={producto.categoria} className="aspect-[4/3]" />
      <h3 className="mt-3 font-semibold leading-snug group-hover:underline">{producto.nombre}</h3>
      <p className="mt-1 text-xs text-tenue sm:text-sm">{producto.descripcion}</p>
      <div className="mt-auto pt-3 tabular-nums">
        <p className="text-lg font-semibold">{formatoPrecio(producto.precio)}</p>
        <p className="text-xs font-medium text-acento sm:text-sm">
          {formatoPrecio(precioEfectivo(producto.precio))} en efectivo
        </p>
      </div>
    </Link>
  )
}
