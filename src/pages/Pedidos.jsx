import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { formatoPrecio } from '../data/catalogo'
import { ESTADOS, leerPedidos } from '../data/pedidos'

// T-023: historial de pedidos del cliente (/pedidos). Hace falta tener la sesión iniciada.
// "sesion" llega desde App (ver data/sesion.js).

const botonPrimario =
  'inline-block rounded-[3px] bg-lime px-4 py-2 font-mono text-sm font-bold text-bg hover:shadow-glow'
const botonSecundario =
  'inline-block rounded-[3px] border border-line-strong px-4 py-2 font-mono text-sm font-medium text-white hover:border-line-hover hover:bg-raised'

// Los estados que ya se cobraron van con el borde lima; el resto, neutro
const ESTADOS_COBRADOS = ['pagado', 'enviado', 'entregado']

function fecha(iso) {
  return new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function Pedido({ pedido }) {
  const items = Array.isArray(pedido.items) ? pedido.items : []
  const cobrado = ESTADOS_COBRADOS.includes(pedido.estado)
  return (
    <article className="border border-line bg-surface">
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 border-b border-line px-4 py-3">
        <div>
          <h2 className="font-mono text-sm font-bold">Pedido N.º {pedido.id.slice(0, 8).toUpperCase()}</h2>
          <p className="text-sm text-muted">{fecha(pedido.creado_en)}</p>
        </div>
        <span
          className={`rounded-[3px] border px-2 py-0.5 font-mono text-xs font-medium ${
            cobrado ? 'border-lime text-lime' : 'border-line-strong text-muted'
          }`}
        >
          {ESTADOS[pedido.estado] ?? pedido.estado}
        </span>
      </header>

      <ul className="divide-y divide-line px-4">
        {items.map((item, i) => (
          <li key={`${item.id}-${i}`} className="flex items-baseline justify-between gap-4 py-3 text-sm">
            <span className="min-w-0">
              <Link to={`/producto/${item.id}`} className="hover:underline">
                {item.nombre}
              </Link>
              <span className="ml-2 font-mono text-muted">× {item.cantidad}</span>
            </span>
            <span className="shrink-0 font-mono tabular-nums text-muted">
              {formatoPrecio(item.precio * item.cantidad)}
            </span>
          </li>
        ))}
      </ul>

      <footer className="flex items-baseline justify-between gap-4 border-t border-line px-4 py-3">
        <span className="font-medium">Total</span>
        <span className="font-mono text-lg font-bold tabular-nums">{formatoPrecio(pedido.total)}</span>
      </footer>
    </article>
  )
}

function ListaPedidos() {
  const [resultado, setResultado] = useState(null) // null mientras se lee
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    let vivo = true
    leerPedidos().then((r) => {
      if (vivo) setResultado(r)
    })
    return () => {
      vivo = false
    }
  }, [intento])

  const reintentar = () => {
    setResultado(null)
    setIntento((n) => n + 1)
  }

  if (!resultado) {
    return (
      <p role="status" className="mt-6 text-muted">
        Buscando tus pedidos…
      </p>
    )
  }

  if (resultado.error) {
    return (
      <div className="mt-6">
        <p role="alert" className="text-muted">
          No pudimos cargar tus pedidos. Revisá tu conexión y volvé a probar.
        </p>
        <button type="button" onClick={reintentar} className={`mt-4 ${botonSecundario}`}>
          Reintentar
        </button>
      </div>
    )
  }

  if (resultado.pedidos.length === 0) {
    return (
      <div className="mt-6">
        <p className="text-lg font-semibold">Todavía no hiciste compras</p>
        <p className="mt-2 text-sm text-muted">Cuando compres algo, vas a ver acá el detalle de cada pedido.</p>
        <Link to="/productos" className={`mt-5 ${botonPrimario}`}>
          Ver productos
        </Link>
      </div>
    )
  }

  return (
    <ul className="mt-6 space-y-6">
      {resultado.pedidos.map((pedido) => (
        <li key={pedido.id}>
          <Pedido pedido={pedido} />
        </li>
      ))}
    </ul>
  )
}

export default function Pedidos({ sesion }) {
  // Mientras se lee la sesión guardada no se sabe si hay alguien adentro
  if (sesion.cargando) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p role="status" className="text-muted">
          Un momento…
        </p>
      </div>
    )
  }

  // Sin sesión se pasa por el inicio de sesión y, al entrar, se vuelve acá
  if (!sesion.usuario) return <Navigate to="/ingresar" state={{ desde: '/pedidos' }} replace />

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <nav aria-label="Ruta" className="text-sm text-muted">
        <Link to="/" className="subrayado border-b-2 border-transparent hover:text-white">
          Inicio
        </Link>
        <span className="mx-2">/</span>
        <span className="text-white">Mis pedidos</span>
      </nav>
      <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">Mis pedidos</h1>
      <p className="mt-1 text-sm text-muted">Tus compras anteriores, de la más reciente a la más antigua.</p>
      <ListaPedidos />
    </div>
  )
}
