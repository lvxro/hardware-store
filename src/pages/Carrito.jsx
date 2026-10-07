import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatoPrecio } from '../data/catalogo'
import { MAXIMO_POR_PRODUCTO } from '../data/carrito'
import {
  CUOTAS_SIN_INTERES,
  ENVIO_GRATIS_DESDE,
  PORCENTAJE_EFECTIVO,
  precioEfectivo,
} from '../data/reglas'
import Vitrina from '../components/Vitrina'

// T-018: la página del carrito. Los datos y las acciones llegan desde App (ver data/carrito.js).

const botonSecundario =
  'rounded-[3px] border border-line-strong px-4 py-2.5 text-center font-mono text-sm font-medium text-white hover:border-line-hover hover:bg-raised'
const botonDeTexto = 'text-sm text-muted underline-offset-4 hover:text-white hover:underline'

// Los botones − y + de cada renglón. En 1 no baja más (para sacarlo está "Quitar").
function Cantidad({ nombre, cantidad, onCambiar }) {
  const paso = 'h-full px-3.5 text-lg leading-none hover:bg-raised disabled:text-muted disabled:opacity-40 disabled:hover:bg-transparent'
  return (
    <div className="flex h-10 items-center overflow-hidden rounded-[3px] border border-line-strong bg-surface">
      <button
        type="button"
        onClick={() => onCambiar(cantidad - 1)}
        disabled={cantidad <= 1}
        className={paso}
        aria-label={`Restar una unidad de ${nombre}`}
      >
        −
      </button>
      <span className="w-8 text-center font-mono font-medium" aria-live="polite">
        {cantidad}
      </span>
      <button
        type="button"
        onClick={() => onCambiar(cantidad + 1)}
        disabled={cantidad >= MAXIMO_POR_PRODUCTO}
        className={paso}
        aria-label={`Sumar una unidad de ${nombre}`}
      >
        +
      </button>
    </div>
  )
}

function Renglon({ item, onCambiarCantidad, onQuitar }) {
  const { producto, cantidad, subtotal } = item
  const [saliendo, setSaliendo] = useState(false)
  const ficha = `/producto/${producto.id}`

  // Primero se pliega y recién después se quita de la lista
  const quitar = () => {
    setSaliendo(true)
    setTimeout(() => onQuitar(producto.id), 200)
  }

  return (
    <li
      className={`grid grid-cols-[5rem_minmax(0,1fr)] gap-x-4 gap-y-3 border-t border-line py-4 sm:grid-cols-[6.5rem_minmax(0,1fr)_auto_9rem] sm:items-center ${
        saliendo ? 'se-va' : ''
      }`}
    >
      {/* La imagen también lleva a la ficha, pero el enlace "de verdad" es el nombre */}
      <Link to={ficha} tabIndex={-1} aria-hidden="true">
        <Vitrina producto={producto} categoria={producto.categoria} className="aspect-[4/3] w-full" />
      </Link>

      <div className="min-w-0">
        <p className="text-xs text-muted">{producto.marca}</p>
        <h2 className="font-medium leading-snug">
          <Link to={ficha} className="hover:underline">
            {producto.modelo}
          </Link>
        </h2>
        <p className="mt-1 font-mono text-sm font-medium text-muted">{formatoPrecio(producto.precio)} c/u</p>
      </div>

      {/* En celular, la cantidad y el subtotal van en una fila aparte, debajo */}
      <div className="col-span-2 flex items-center justify-between gap-4 sm:contents">
        <Cantidad
          nombre={producto.modelo}
          cantidad={cantidad}
          onCambiar={(nueva) => onCambiarCantidad(producto.id, nueva)}
        />
        <div className="text-right">
          <p className="font-mono text-lg font-bold">{formatoPrecio(subtotal)}</p>
          <button type="button" onClick={quitar} className={botonDeTexto} aria-label={`Quitar ${producto.modelo} del carrito`}>
            Quitar
          </button>
        </div>
      </div>
    </li>
  )
}

// Cuánto falta para el envío gratis, con una barra que se va llenando
function Envio({ total }) {
  const falta = ENVIO_GRATIS_DESDE - total
  const avance = Math.min(100, Math.round((total / ENVIO_GRATIS_DESDE) * 100))
  return (
    <div className="border-t border-line py-4">
      <p className="text-sm font-medium tabular-nums">
        {falta <= 0 ? 'Esta compra tiene envío gratis' : `Te faltan ${formatoPrecio(falta)} para el envío gratis`}
      </p>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-raised" aria-hidden="true">
        <div
          className="h-full rounded-full bg-white transition-[width] duration-500 ease-out"
          style={{ width: `${avance}%` }}
        />
      </div>
    </div>
  )
}

function Resumen({ total, unidades, onVaciar }) {
  const [confirmando, setConfirmando] = useState(false)

  return (
    <aside aria-labelledby="resumen" className="rounded-[3px] border border-line bg-surface p-5 lg:sticky lg:top-6">
      <h2 id="resumen" className="text-lg font-semibold">
        Resumen
      </h2>
      <p className="text-sm text-muted">
        {unidades} {unidades === 1 ? 'unidad' : 'unidades'}
      </p>

      {/* Igual que en la ficha: el precio en efectivo en lima y el de lista en gris */}
      <dl className="mt-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 border-t border-line py-3">
          <dt>
            <span className="block font-medium">Total en efectivo</span>
            <span className="block text-sm text-muted">O por transferencia, {PORCENTAJE_EFECTIVO}% menos</span>
          </dt>
          <dd className="font-mono text-2xl font-bold text-lime" data-total-efectivo>
            {formatoPrecio(precioEfectivo(total))}
          </dd>
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 border-t border-line py-3">
          <dt>
            <span className="block font-medium">Total de lista</span>
            <span className="block text-sm text-muted tabular-nums">
              {CUOTAS_SIN_INTERES} cuotas sin interés de {formatoPrecio(Math.round(total / CUOTAS_SIN_INTERES))}
            </span>
          </dt>
          <dd className="font-mono text-lg font-medium text-muted" data-total-lista>
            {formatoPrecio(total)}
          </dd>
        </div>
      </dl>

      <Envio total={total} />

      <Link to="/productos" className={`block ${botonSecundario}`}>
        Seguir comprando
      </Link>

      {/* Vaciar pide confirmación acá mismo, porque no se puede deshacer */}
      <div className="mt-4 text-center">
        {confirmando ? (
          <p className="text-sm" role="alert">
            ¿Vaciar el carrito?{' '}
            <button type="button" onClick={onVaciar} className="ml-2 text-sm font-medium text-white underline underline-offset-4">
              Sí, vaciar
            </button>
            <button type="button" onClick={() => setConfirmando(false)} className={`ml-4 ${botonDeTexto}`}>
              Cancelar
            </button>
          </p>
        ) : (
          <button type="button" onClick={() => setConfirmando(true)} className={botonDeTexto}>
            Vaciar carrito
          </button>
        )}
      </div>
    </aside>
  )
}

function Vacio() {
  return (
    <div className="entra-subiendo mt-6 flex flex-col items-center rounded-[3px] border border-line bg-surface px-6 py-14 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-raised text-muted">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8" aria-hidden="true">
          <path d="M3 4h2l2.4 10.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 8H6.2" />
          <circle cx="9.5" cy="19" r="1.25" />
          <circle cx="17" cy="19" r="1.25" />
        </svg>
      </span>
      <p className="mt-5 text-xl font-semibold">Tu carrito está vacío</p>
      <p className="mt-2 max-w-sm text-muted">Los productos que agregues desde su ficha van a aparecer acá.</p>
      <Link
        to="/productos"
        className="mt-7 inline-block rounded-[3px] bg-lime px-6 py-3 font-mono font-bold text-bg hover:shadow-glow"
      >
        Ver todos los productos
      </Link>
    </div>
  )
}

export default function Carrito({ items, total, unidades, onCambiarCantidad, onQuitar, onVaciar }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-semibold sm:text-4xl">Carrito</h1>

      {items.length === 0 ? (
        <Vacio />
      ) : (
        <div className="mt-6 grid gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <ul className="border-b border-line">
            {items.map((item) => (
              <Renglon
                key={item.producto.id}
                item={item}
                onCambiarCantidad={onCambiarCantidad}
                onQuitar={onQuitar}
              />
            ))}
          </ul>
          <Resumen total={total} unidades={unidades} onVaciar={onVaciar} />
        </div>
      )}
    </div>
  )
}
