import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../data/supabase'
import { formatoPrecio } from '../data/catalogo'
import { MEDIOS, fecha } from '../data/pedidos'
import EstadoPedido from '../components/EstadoPedido'
import { useTitulo } from '../data/titulo'

// T-031: el historial de compras del cliente. Supabase solo le devuelve los pedidos hechos con el
// correo de su cuenta (supabase/pedidos-historial.sql). Los que se empezaron y nunca llegaron a
// Mercado Pago (sin número de operación) no se muestran.

function Pedido({ pedido }) {
  const unidades = pedido.items.reduce((s, i) => s + i.cantidad, 0)
  return (
    <li className="rounded-[3px] border border-line bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <p className="flex flex-wrap items-center gap-2">
            <span className="font-mono font-bold">Pedido {pedido.id.slice(0, 8).toUpperCase()}</span>
            <EstadoPedido estado={pedido.estado} />
          </p>
          <p className="mt-0.5 text-sm text-muted">{fecha(pedido.creado)}</p>
        </div>
        <p className="text-right font-mono">
          <span className="block text-xl font-bold">{formatoPrecio(pedido.total)}</span>
          <span className="block text-xs text-muted">
            {unidades} {unidades === 1 ? 'unidad' : 'unidades'}
          </span>
        </p>
      </div>
      <ul className="divide-y divide-line px-5">
        {pedido.items.map((i) => (
          <li key={i.id} className="flex items-baseline justify-between gap-4 py-3 text-sm">
            <span className="min-w-0">
              <Link to={`/producto/${i.id}`} className="font-medium hover:underline">
                {i.nombre}
              </Link>
              <span className="ml-2 font-mono text-muted">
                {i.cantidad} × {formatoPrecio(i.precio)}
              </span>
            </span>
            <span className="shrink-0 font-mono">{formatoPrecio(i.precio * i.cantidad)}</span>
          </li>
        ))}
      </ul>
      {(pedido.pago_id || pedido.medio) && (
        <p className="border-t border-line px-5 py-3 font-mono text-xs text-muted">
          {[
            MEDIOS[pedido.medio],
            pedido.cuotas > 1 ? `${pedido.cuotas} cuotas` : null,
            pedido.pago_id ? `Operación ${pedido.pago_id}` : null,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
      )}
    </li>
  )
}

function Lista() {
  const [pedidos, setPedidos] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    supabase
      .from('pedidos')
      .select('id, creado, estado, items, total, pago_id, medio, cuotas')
      .not('pago_id', 'is', null)
      .order('creado', { ascending: false })
      .then(({ data, error }) => (error ? setError(true) : setPedidos(data)))
  }, [])

  if (error) return <p className="mt-6 text-muted">No pudimos traer tus pedidos. Probá de nuevo en un rato.</p>
  if (!pedidos) return <p role="status" className="mt-6 text-muted">Buscando tus pedidos…</p>

  if (pedidos.length === 0) {
    return (
      <div className="mt-6 flex flex-col items-center rounded-[3px] border border-line bg-surface px-6 py-14 text-center">
        <p className="text-xl font-semibold">Todavía no compraste nada</p>
        <p className="mt-2 max-w-sm text-muted">Cuando hagas tu primera compra, la vas a ver acá con su estado.</p>
        <Link to="/productos" className="mt-7 inline-block rounded-[3px] bg-lime px-6 py-3 font-mono font-bold text-bg hover:shadow-glow">
          Ver productos
        </Link>
      </div>
    )
  }

  const aprobados = pedidos.filter((p) => p.estado === 'aprobado')
  return (
    <>
      <p className="mt-1 text-muted tabular-nums">
        {pedidos.length} {pedidos.length === 1 ? 'pedido' : 'pedidos'}
        {aprobados.length > 0 && ` · ${formatoPrecio(aprobados.reduce((s, p) => s + Number(p.total), 0))} en compras aprobadas`}
      </p>
      <ul className="mt-6 grid gap-4">
        {pedidos.map((p) => (
          <Pedido key={p.id} pedido={p} />
        ))}
      </ul>
    </>
  )
}

export default function MisPedidos({ sesion }) {
  useTitulo('Mis pedidos')
  const { usuario, cargando } = sesion

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-semibold sm:text-4xl">Mis pedidos</h1>
      {cargando ? (
        <p role="status" className="mt-6 text-muted">
          Un momento…
        </p>
      ) : !usuario ? (
        <div className="mt-6">
          <p className="text-muted">Iniciá sesión para ver tus compras.</p>
          <Link
            to="/ingresar"
            state={{ desde: '/mis-pedidos' }}
            className="mt-5 inline-block rounded-[3px] bg-lime px-4 py-2.5 font-mono text-sm font-bold text-bg hover:shadow-glow"
          >
            Iniciar sesión
          </Link>
        </div>
      ) : (
        <Lista key={usuario.id} />
      )}
    </div>
  )
}
