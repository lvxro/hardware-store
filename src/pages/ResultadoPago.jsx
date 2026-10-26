import { useEffect, useRef } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'

// T-022: adonde vuelve el cliente desde Mercado Pago: /compra/aprobada, /compra/pendiente o /compra/rechazada.
// Mercado Pago agrega en la dirección el número de operación (payment_id) y el estado (status).
// Ojo: esta página es solo un aviso para el cliente. Si el pago se cobró de verdad lo dice el webhook
// (api/webhook.js) o el panel de Mercado Pago, no esta dirección.

const botonPrimario =
  'inline-block rounded-[3px] bg-lime px-4 py-2 font-mono text-sm font-bold text-bg hover:shadow-glow'
const botonSecundario =
  'inline-block rounded-[3px] border border-line-strong px-4 py-2 font-mono text-sm font-medium text-white hover:border-line-hover hover:bg-raised'

const TEXTOS = {
  aprobada: {
    titulo: '¡Gracias por tu compra!',
    cuerpo: 'Mercado Pago aprobó el pago. Te va a llegar el comprobante por correo.',
  },
  pendiente: {
    titulo: 'Tu pago está pendiente',
    cuerpo:
      'Mercado Pago todavía lo está procesando (pasa con algunos medios de pago, como el efectivo en un local). Te avisamos por correo cuando se acredite.',
  },
  rechazada: {
    titulo: 'El pago no se pudo completar',
    cuerpo: 'No se hizo ningún cobro. Tu carrito sigue intacto: podés probar con otro medio de pago.',
  },
}

export default function ResultadoPago({ onVaciarCarrito }) {
  const { estado } = useParams()
  const [parametros] = useSearchParams()
  const texto = TEXTOS[estado]
  const operacion = parametros.get('payment_id')
  const aprobado = estado === 'aprobada' && parametros.get('status') === 'approved'
  // Se vacía una sola vez, aunque la página se vuelva a dibujar
  const vaciado = useRef(false)

  useEffect(() => {
    if (aprobado && !vaciado.current) {
      vaciado.current = true
      onVaciarCarrito()
    }
  }, [aprobado, onVaciarCarrito])

  if (!texto) {
    return (
      <div className="mx-auto max-w-md px-4 py-12">
        <h1 className="text-2xl font-semibold">Esta página no existe</h1>
        <Link to="/" className={`mt-6 ${botonPrimario}`}>
          Ir al inicio
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold">{texto.titulo}</h1>
      <p role="status" className="mt-3 text-muted">
        {texto.cuerpo}
      </p>
      {operacion && operacion !== 'null' && (
        <p className="mt-2 font-mono text-sm text-muted">
          Operación N.º <span className="text-white">{operacion}</span>
        </p>
      )}
      <div className="mt-6 flex flex-wrap gap-3">
        {estado === 'rechazada' ? (
          <>
            <Link to="/carrito" className={botonPrimario}>
              Volver al carrito
            </Link>
            <Link to="/productos" className={botonSecundario}>
              Seguir mirando
            </Link>
          </>
        ) : (
          <Link to="/" className={botonPrimario}>
            Volver a la tienda
          </Link>
        )}
      </div>
    </div>
  )
}
