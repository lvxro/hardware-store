import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icono from './Icono'
import { formatoPrecio } from '../data/catalogo'

export default function ProductoCard({ producto }) {
  const [sinImagen, setSinImagen] = useState(!producto.imagen)

  return (
    <Link
      to={`/producto/${producto.id}`}
      className="group flex h-full flex-col rounded-md border border-linea bg-superficie hover:border-tinta"
    >
      <div className="plano flex aspect-[16/9] min-[480px]:aspect-[4/3] items-center justify-center rounded-t-md border-b border-linea">
        {sinImagen ? (
          <Icono categoria={producto.categoria} className="h-20 w-20 text-tenue" />
        ) : (
          <img
            src={producto.imagen}
            alt=""
            className="h-full w-full object-contain p-4"
            onError={() => setSinImagen(true)}
          />
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-sm text-tenue">{producto.marca}</p>
        <h3 className="mt-0.5 font-medium leading-snug group-hover:underline">
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

        <p className="mt-auto pt-4 text-xl font-semibold tabular-nums">
          {formatoPrecio(producto.precio)}
        </p>
      </div>
    </Link>
  )
}
