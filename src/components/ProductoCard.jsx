import { Link } from 'react-router-dom'
import Vitrina from './Vitrina'
import { formatoPrecio } from '../data/catalogo'
import { precioEfectivo } from '../data/reglas'

function Precios({ producto, grande = false }) {
  return (
    <div className="mt-auto pt-3 tabular-nums">
      <p className={`font-semibold ${grande ? 'text-lg' : ''}`}>{formatoPrecio(producto.precio)}</p>
      <p className={`font-medium text-acento ${grande ? 'text-xs sm:text-sm' : 'text-xs'}`}>
        {formatoPrecio(precioEfectivo(producto.precio))} en efectivo
      </p>
    </div>
  )
}

/*
  Tarjeta de producto, sin borde propio. Tiene dos tamaños:
  - compacta (la del home): marca, modelo y dos specs; las líneas divisorias las pone la grilla.
  - amplia (la de las páginas de categoría): nombre y descripción, con más aire;
    las specs van aparte, en la comparación de más abajo.
*/
export default function ProductoCard({ producto, amplia = false }) {
  if (amplia) {
    return (
      <Link to={`/producto/${producto.id}`} className="group flex h-full flex-col">
        <Vitrina producto={producto} categoria={producto.categoria} className="aspect-[4/3]" />
        <h3 className="mt-3 font-semibold leading-snug group-hover:underline">{producto.nombre}</h3>
        <p className="mt-1 text-xs text-tenue sm:text-sm">{producto.descripcion}</p>
        <Precios producto={producto} grande />
      </Link>
    )
  }

  return (
    <Link to={`/producto/${producto.id}`} className="group flex h-full flex-col p-3">
      <Vitrina producto={producto} categoria={producto.categoria} className="aspect-[4/3]" />

      <p className="mt-3 text-xs text-tenue">{producto.marca}</p>
      <h3 className="text-sm font-medium leading-snug group-hover:underline">{producto.modelo}</h3>

      <dl className="mt-2 space-y-0.5 text-xs tabular-nums">
        {producto.specs.map(([etiqueta, valor]) => (
          <div key={etiqueta} className="flex gap-2">
            <dt className="w-[4.5rem] shrink-0 text-tenue">{etiqueta}</dt>
            <dd className="min-w-0">{valor}</dd>
          </div>
        ))}
      </dl>

      <Precios producto={producto} />
    </Link>
  )
}
