import { Link } from 'react-router-dom'

// Página provisoria: el carrito de verdad se hace en el Sprint 2 (T-018)
export default function Carrito() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Carrito</h1>
      <div className="mt-6 rounded-lg border border-linea bg-superficie p-8 text-center">
        <p className="font-medium">Esta sección está en desarrollo</p>
        <p className="mt-2 text-sm text-tenue">
          Muy pronto vas a poder guardar productos y finalizar tu compra.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-md bg-pcb px-5 py-2.5 text-sm font-medium text-sobre-pcb hover:opacity-90"
        >
          Seguir comprando
        </Link>
      </div>
    </div>
  )
}
