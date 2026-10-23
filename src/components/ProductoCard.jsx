import { Link } from 'react-router-dom'
import Vitrina from './Vitrina'
import { formatoPrecio } from '../data/catalogo'
import { precioEfectivo } from '../data/reglas'
import { PORCENTAJE_OFERTA } from '../data/ofertas'

// Tarjeta de producto: dibujo o foto, nombre, descripción y los dos precios.
// En oferta (T-021): una etiqueta sobre el dibujo y, en los precios, primero el de lista tachado
// y abajo el precio con el 25 % menos.
// Al pasar el cursor, el borde pasa a lima con resplandor, la tarjeta sube apenas
// y el dibujo se aclara (esto último está en index.css, .vitrina).
// Las specs completas están en la ficha de cada producto.
export default function ProductoCard({ producto }) {
  return (
    <Link to={`/producto/${producto.id}`} className="group flex h-full flex-col rounded-[3px] border border-line bg-surface p-3 hover:-translate-y-0.5 hover:border-lime hover:shadow-glow">
      <div className="relative">
        <Vitrina producto={producto} categoria={producto.categoria} className="aspect-[4/3]" />
        {producto.enOferta && (
          <span className="absolute left-2 top-2 rounded-[3px] border border-lime bg-bg px-1.5 py-0.5 font-mono text-[11px] font-bold leading-4 text-lime">
            {PORCENTAJE_OFERTA} % OFF
          </span>
        )}
      </div>
      <h3 className="mt-3 font-semibold leading-snug group-hover:underline">{producto.nombre}</h3>
      <p className="mt-1 text-xs text-muted sm:text-sm">{producto.descripcion}</p>
      <div className="mt-auto pt-3 font-mono">
        {producto.enOferta && (
          <p className="text-sm text-muted line-through">
            <span className="sr-only">Precio anterior </span>
            {formatoPrecio(producto.precioAnterior)}
          </p>
        )}
        <p className="text-lg font-bold">
          {producto.enOferta && <span className="sr-only">Precio de oferta </span>}
          {formatoPrecio(producto.precio)}
        </p>
        <p className="text-xs font-medium text-lime sm:text-sm">
          {formatoPrecio(precioEfectivo(producto.precio))} en efectivo
        </p>
      </div>
    </Link>
  )
}
