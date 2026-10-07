import { Link } from 'react-router-dom'

// Página provisoria: el carrito de verdad se hace en el Sprint 2 (T-018)
export default function Carrito() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-semibold sm:text-4xl">Carrito</h1>
      <div className="mt-6 flex flex-col items-center rounded-2xl border border-line bg-surface px-6 py-14 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-raised text-muted">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8" aria-hidden="true">
            <path d="M3 4h2l2.4 10.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 8H6.2" />
            <circle cx="9.5" cy="19" r="1.25" />
            <circle cx="17" cy="19" r="1.25" />
          </svg>
        </span>
        <p className="mt-5 text-xl font-semibold">Esta sección está en desarrollo</p>
        <p className="mt-2 max-w-sm text-muted">
          Muy pronto vas a poder guardar productos y finalizar tu compra.
        </p>
        <Link
          to="/"
          className="mt-7 inline-block rounded-lg bg-lime px-6 py-3 font-mono font-bold text-bg hover:shadow-glow"
        >
          Seguir comprando
        </Link>
      </div>
    </div>
  )
}
