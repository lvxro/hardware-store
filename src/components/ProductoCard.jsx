import { Link } from 'react-router-dom'
import Vitrina from './Vitrina'
import BotonFavorito from './BotonFavorito'
import { formatoPrecio } from '../data/catalogo'
import { precioEfectivo } from '../data/reglas'
import { PORCENTAJE_OFERTA } from '../data/ofertas'

// Tarjeta de producto: dibujo o foto, nombre, descripción y los dos precios.
// En oferta (T-021): una etiqueta sobre el dibujo y, en los precios, primero el de lista tachado
// y abajo el precio con el 25 % menos.
// T-025: sin stock, el dibujo se apaga y lleva su etiqueta; con pocas unidades, un aviso en lima.
// T-027: el corazón de favoritos va arriba a la derecha. Queda fuera del enlace (un botón no puede
// ir dentro de un enlace), encima, en la misma esquina.
// Al pasar el cursor, el borde pasa a lima con resplandor, la tarjeta sube apenas
// y el dibujo se aclara (esto último está en index.css, .vitrina).
export default function ProductoCard({ producto }) {
  const agotado = producto.stock === 0
  const ultimas = producto.stock != null && producto.stock > 0 && producto.stock <= 3

  return (
    <div className="relative h-full">
      <Link
        to={`/producto/${producto.id}`}
        className="group flex h-full flex-col rounded-[3px] border border-line bg-surface p-3 hover:-translate-y-0.5 hover:border-lime hover:shadow-glow"
      >
        <div className="relative">
          <Vitrina producto={producto} categoria={producto.categoria} className={`aspect-[4/3] ${agotado ? 'opacity-40' : ''}`} />
          <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
            {producto.enOferta && (
              <span className="rounded-[3px] border border-lime bg-bg px-1.5 py-0.5 font-mono text-[11px] font-bold leading-4 text-lime">
                {PORCENTAJE_OFERTA} % OFF
              </span>
            )}
            {agotado && (
              <span className="rounded-[3px] border border-line-strong bg-bg px-1.5 py-0.5 font-mono text-[11px] font-bold leading-4 text-muted">
                SIN STOCK
              </span>
            )}
          </div>
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
          <p className={`text-lg font-bold ${agotado ? 'text-muted' : ''}`}>
            {producto.enOferta && <span className="sr-only">Precio de oferta </span>}
            {formatoPrecio(producto.precio)}
          </p>
          {agotado ? (
            <p className="text-xs font-medium text-muted sm:text-sm">Sin stock por ahora</p>
          ) : (
            <p className="text-xs font-medium text-lime sm:text-sm">
              {formatoPrecio(precioEfectivo(producto.precio))} en efectivo
            </p>
          )}
          {ultimas && (
            <p className="mt-1 text-[11px] font-medium text-white sm:text-xs">
              {producto.stock === 1 ? 'Última unidad' : `Últimas ${producto.stock} unidades`}
            </p>
          )}
        </div>
      </Link>
      <div className="absolute right-5 top-5">
        <BotonFavorito producto={producto} chico />
      </div>
    </div>
  )
}
