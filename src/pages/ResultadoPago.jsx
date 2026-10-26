import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import productos, { formatoPrecio } from '../data/catalogo'
import { confirmarPago, leerCompra } from '../data/pago'
import Vitrina from '../components/Vitrina'
import NumeroAnimado from '../components/NumeroAnimado'

// T-022/T-023: adonde vuelve el cliente desde Mercado Pago: /compra/aprobada, /compra/pendiente o /compra/rechazada.
// Mercado Pago agrega en la dirección el número de operación (payment_id), el estado (status),
// nuestro número de pedido (external_reference) y el medio de pago (payment_type).
// Ojo: esta página es solo un aviso para el cliente. Si el pago se cobró de verdad lo dice el webhook
// (api/webhook.js) o el panel de Mercado Pago, no esta dirección.

const botonPrimario =
  'pulsable inline-block rounded-[3px] bg-lime px-5 py-3 text-center font-mono text-sm font-bold text-bg hover:shadow-glow'
const botonSecundario =
  'pulsable inline-block rounded-[3px] border border-line-strong px-5 py-3 text-center font-mono text-sm font-medium text-white hover:border-line-hover hover:bg-raised'

const MEDIOS = {
  credit_card: 'Tarjeta de crédito',
  debit_card: 'Tarjeta de débito',
  prepaid_card: 'Tarjeta prepaga',
  account_money: 'Dinero en cuenta',
  ticket: 'Efectivo',
  bank_transfer: 'Transferencia',
  digital_currency: 'Mercado Crédito',
}

const PASOS = ['Pago aprobado', 'Preparando tu pedido', 'En camino', 'En tus manos']

// Lo que se compró, leído de lo que guardó el carrito antes de ir a Mercado Pago (data/pago.js)
function useCompra() {
  return useMemo(() => {
    const porId = new Map(productos.map((p) => [p.id, p]))
    const items = leerCompra()
      .filter((r) => porId.has(r.id))
      .map((r) => ({ producto: porId.get(r.id), cantidad: r.cantidad }))
    return { items, total: items.reduce((suma, i) => suma + i.producto.precio * i.cantidad, 0) }
  }, [])
}

function Palabras({ texto, desde = 250, resaltar = [] }) {
  return texto.split(' ').map((palabra, i) => (
    <span key={i}>
      <span
        className={`entra-palabra ${resaltar.includes(i) ? 'text-lime' : ''}`}
        style={{ '--espera': `${desde + i * 110}ms` }}
      >
        {palabra}
      </span>{' '}
    </span>
  ))
}

// El sello lima con el tilde que se dibuja, las ondas y un reflejo que lo cruza
function Sello() {
  return (
    <div className="relative mx-auto h-24 w-24 sm:h-28 sm:w-28">
      {/* Resplandor de fondo */}
      <div className="absolute -inset-16 rounded-full bg-lime opacity-[0.07] blur-3xl" aria-hidden="true" />
      {[350, 650, 950].map((espera) => (
        <span
          key={espera}
          className="sello-anillo absolute inset-0 rounded-full border-2 border-lime"
          style={{ '--espera': `${espera}ms` }}
          aria-hidden="true"
        />
      ))}
      <div className="sello relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-lime text-bg shadow-glow">
        <span
          className="sello-reflejo absolute inset-y-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/60 to-transparent"
          aria-hidden="true"
        />
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" className="relative h-1/2 w-1/2" aria-hidden="true">
          <path d="M4.5 12.5l5 5L19.5 7" pathLength="1" className="tilde" />
        </svg>
      </div>
    </div>
  )
}

// Cómo sigue el pedido: el primer paso ya está, el segundo late
function Seguimiento() {
  return (
    <ol className="entra-subiendo grid grid-cols-4 gap-2" style={{ '--espera': '1500ms' }} aria-label="Estado del pedido">
      {PASOS.map((paso, i) => {
        const hecho = i === 0
        const enCurso = i === 1
        return (
          <li key={paso} className="relative flex flex-col items-center text-center" aria-current={enCurso ? 'step' : undefined}>
            {/* Línea hacia el paso siguiente */}
            {i < PASOS.length - 1 && (
              <span className="absolute left-1/2 top-[7px] h-0.5 w-full bg-line-strong" aria-hidden="true">
                {hecho && <span className="linea-llena block h-full w-full bg-lime" style={{ '--espera': '1900ms' }} />}
              </span>
            )}
            <span
              className={`relative flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                hecho ? 'border-lime bg-lime' : enCurso ? 'late border-lime bg-bg' : 'border-line-strong bg-bg'
              }`}
            />
            <span className={`mt-2 text-[11px] leading-tight sm:text-xs ${hecho || enCurso ? 'text-white' : 'text-muted'}`}>
              {paso}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function Ticket({ items, total, operacion, pedido, medio }) {
  // El total arranca en cero y sube cuando el ticket ya está a la vista
  const [mostrado, setMostrado] = useState(0)
  useEffect(() => {
    const reloj = setTimeout(() => setMostrado(total), 1000)
    return () => clearTimeout(reloj)
  }, [total])

  const datos = [
    ['Operación', operacion],
    ['Pedido', pedido ? pedido.slice(0, 8).toUpperCase() : null],
    ['Medio de pago', MEDIOS[medio]],
  ].filter(([, valor]) => valor)

  return (
    <div className="entra-subiendo overflow-hidden rounded-[3px] border border-line bg-surface" style={{ '--espera': '800ms' }}>
      {items.length > 0 && (
        <ul className="divide-y divide-line px-5">
          {items.map(({ producto, cantidad }, i) => (
            <li key={producto.id} className="flex items-center gap-4 py-4">
              <Vitrina
                producto={producto}
                categoria={producto.categoria}
                trazo={1000 + i * 250}
                className="aspect-[4/3] w-24 shrink-0 sm:w-28"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted">{producto.marca}</p>
                <p className="font-medium leading-snug">{producto.modelo}</p>
                <p className="mt-1 font-mono text-sm text-muted">
                  {cantidad} × {formatoPrecio(producto.precio)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* El corte del ticket */}
      <div className="relative h-px border-t border-dashed border-line-strong" aria-hidden="true" />

      <div className="px-5 py-5">
        {total > 0 && (
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-muted">Pagaste</span>
            <span className="font-mono text-3xl font-bold text-lime tabular-nums">
              <NumeroAnimado valor={mostrado} formato={formatoPrecio} />
            </span>
          </div>
        )}
        {datos.length > 0 && (
          <dl className={`grid gap-1.5 font-mono text-sm ${total > 0 ? 'mt-4' : ''}`}>
            {datos.map(([etiqueta, valor]) => (
              <div key={etiqueta} className="flex justify-between gap-4">
                <dt className="text-muted">{etiqueta}</dt>
                <dd className="truncate text-white">{valor}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      <div className="ticket-corte h-2.5" aria-hidden="true" />
    </div>
  )
}

function Aprobada({ nombre, operacion, pedido, medio }) {
  const { items, total } = useCompra()

  // En el celular, una vibración corta junto con el tilde
  useEffect(() => {
    const reloj = setTimeout(() => navigator.vibrate?.([20, 60, 30]), 550)
    return () => clearTimeout(reloj)
  }, [])

  const titulo = nombre ? `¡Listo, ${nombre}! Es tuyo.` : '¡Listo! Es tuyo.'
  const palabras = titulo.split(' ')

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:py-16">
      <div className="text-center">
        <Sello />
        <p className="entra-subiendo mt-8 font-mono text-xs font-medium uppercase tracking-[0.2em] text-lime" style={{ '--espera': '300ms' }}>
          Pago aprobado
        </p>
        <h1 role="status" className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
          <Palabras texto={titulo} desde={400} resaltar={[palabras.length - 2, palabras.length - 1]} />
        </h1>
        <p className="entra-subiendo mx-auto mt-4 max-w-sm text-muted" style={{ '--espera': '700ms' }}>
          {items.length > 1
            ? `Tus ${items.reduce((s, i) => s + i.cantidad, 0)} productos ya están confirmados.`
            : 'Tu compra ya está confirmada.'}{' '}
          Te mandamos el detalle por mail, y Mercado Pago el comprobante de pago.
        </p>
      </div>

      <div className="mt-10">
        <Ticket items={items} total={total} operacion={operacion} pedido={pedido} medio={medio} />
      </div>

      <div className="mt-10">
        <Seguimiento />
      </div>

      <div className="entra-subiendo mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center" style={{ '--espera': '1800ms' }}>
        <Link to="/productos" className={botonPrimario}>
          Seguir comprando
        </Link>
        <Link to="/" className={botonSecundario}>
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}

// Pendiente y rechazada: más tranquilas, sin festejo
function Aviso({ icono, etiqueta, titulo, cuerpo, operacion, children }) {
  return (
    <div className="mx-auto max-w-md px-4 py-12 text-center sm:py-16">
      <div className="ficha-central relative mx-auto flex h-20 w-20 items-center justify-center rounded-full text-white">
        {icono}
      </div>
      <p className="entra-subiendo mt-8 font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted" style={{ '--espera': '250ms' }}>
        {etiqueta}
      </p>
      <h1 role="status" className="mt-3 text-3xl font-semibold leading-tight">
        <Palabras texto={titulo} desde={300} />
      </h1>
      <p className="entra-subiendo mt-4 text-muted" style={{ '--espera': '600ms' }}>
        {cuerpo}
      </p>
      {operacion && (
        <p className="entra-subiendo mt-3 font-mono text-sm text-muted" style={{ '--espera': '700ms' }}>
          Operación N.º <span className="text-white">{operacion}</span>
        </p>
      )}
      <div className="entra-subiendo mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center" style={{ '--espera': '850ms' }}>
        {children}
      </div>
    </div>
  )
}

const trazo = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }

export default function ResultadoPago({ nombre, onVaciarCarrito }) {
  const { estado } = useParams()
  const [parametros] = useSearchParams()
  const valor = (clave) => {
    const v = parametros.get(clave)
    return v && v !== 'null' ? v : null
  }
  const operacion = valor('payment_id')
  const aprobado = estado === 'aprobada' && parametros.get('status') === 'approved'
  // Se vacía una sola vez, aunque la página se vuelva a dibujar
  const vaciado = useRef(false)

  useEffect(() => {
    if (aprobado && !vaciado.current) {
      vaciado.current = true
      onVaciarCarrito()
    }
  }, [aprobado, onVaciarCarrito])

  // T-032: le pide al servidor que confirme el pago con Mercado Pago (una vez), así el pedido
  // aparece al día en Mis pedidos sin depender del aviso automático
  const pedidoId = valor('external_reference')
  const confirmado = useRef(false)
  useEffect(() => {
    if (confirmado.current || !pedidoId || !operacion) return
    confirmado.current = true
    confirmarPago(pedidoId, operacion)
  }, [pedidoId, operacion])

  if (estado === 'aprobada') {
    return <Aprobada nombre={nombre} operacion={operacion} pedido={valor('external_reference')} medio={valor('payment_type')} />
  }

  if (estado === 'pendiente') {
    return (
      <Aviso
        etiqueta="Pago pendiente"
        titulo="Ya casi está."
        cuerpo="Mercado Pago todavía lo está procesando (pasa con algunos medios, como el efectivo en un local). Te avisamos por correo apenas se acredite."
        operacion={operacion}
        icono={
          <svg viewBox="0 0 24 24" {...trazo} className="h-9 w-9" aria-hidden="true">
            <circle cx="12" cy="12" r="8.5" />
            <path d="M12 7.5V12l3 2" pathLength="1" className="tilde" />
          </svg>
        }
      >
        <Link to="/" className={botonPrimario}>
          Volver a la tienda
        </Link>
      </Aviso>
    )
  }

  if (estado === 'rechazada') {
    return (
      <Aviso
        etiqueta="Pago no completado"
        titulo="No se hizo ningún cobro."
        cuerpo="Mercado Pago no pudo completar el pago. Tu carrito sigue intacto: podés probar con otra tarjeta o con otro medio."
        operacion={operacion}
        icono={
          <svg viewBox="0 0 24 24" {...trazo} className="h-8 w-8" aria-hidden="true">
            <path d="M12 7v6" pathLength="1" className="tilde" />
            <path d="M12 16.5v.01" />
            <circle cx="12" cy="12" r="8.5" />
          </svg>
        }
      >
        <Link to="/carrito" className={botonPrimario}>
          Volver al carrito
        </Link>
        <Link to="/productos" className={botonSecundario}>
          Seguir mirando
        </Link>
      </Aviso>
    )
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold">Esta página no existe</h1>
      <Link to="/" className={`mt-6 ${botonPrimario}`}>
        Ir al inicio
      </Link>
    </div>
  )
}
