import { useState } from 'react'
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import categorias from '../data/categorias'
import { formatoPrecio } from '../data/catalogo'
import { CUOTAS_SIN_INTERES, ENVIO_GRATIS_DESDE, PORCENTAJE_EFECTIVO } from '../data/reglas'
import Logo from './Logo'
import TemaToggle from './TemaToggle'

function Buscador({ inicial }) {
  const navegar = useNavigate()
  const [texto, setTexto] = useState(inicial)

  const buscar = (e) => {
    e.preventDefault()
    const limpio = texto.trim()
    navegar(limpio ? `/productos?q=${encodeURIComponent(limpio)}` : '/productos')
  }

  return (
    <form
      role="search"
      onSubmit={buscar}
      className="order-3 flex w-full rounded-[3px] border border-linea focus-within:border-tinta md:order-2 md:w-auto md:max-w-xl md:flex-1"
    >
      <input
        type="search"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Buscá por marca o modelo"
        aria-label="Buscar productos"
        className="min-w-0 flex-1 bg-transparent py-2 pl-3 pr-2 text-tinta placeholder:text-tenue focus:outline-none"
      />
      <button
        type="submit"
        className="m-1 flex items-center gap-2 rounded-[2px] bg-tinta px-3 text-sm font-medium text-fondo hover:opacity-85"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4.5 4.5" />
        </svg>
        Buscar
      </button>
    </form>
  )
}

// Las condiciones de compra, en una línea. Los números salen de data/reglas.js
function Condiciones() {
  const envio = `Envío gratis desde ${formatoPrecio(ENVIO_GRATIS_DESDE)}`
  return (
    <div className="bg-plano">
      <p className="mx-auto max-w-7xl px-4 py-1.5 text-xs text-tenue tabular-nums">
        <span className="sm:hidden">
          {envio} y {PORCENTAJE_EFECTIVO}% menos en efectivo.
        </span>
        <span className="hidden sm:inline">
          {envio}, {PORCENTAJE_EFECTIVO}% menos en efectivo o transferencia y hasta{' '}
          {CUOTAS_SIN_INTERES} cuotas sin interés con Mercado Pago.
        </span>
      </p>
    </div>
  )
}

const claseNav = ({ isActive }) =>
  `block border-b-2 px-3 py-2.5 ${
    isActive
      ? 'border-tinta font-medium text-tinta'
      : 'border-transparent text-tenue hover:text-tinta'
  }`

export default function Header() {
  const { pathname } = useLocation()
  const [parametros] = useSearchParams()
  // Lo que se está buscando ahora (vacío en cualquier otra página)
  const busqueda = pathname === '/productos' ? (parametros.get('q') ?? '') : ''

  return (
    <header>
      <Condiciones />

      {/* En celular: logo y botones arriba, buscador abajo. En compu: todo en una fila */}
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-3 px-4 py-3">
        <Logo className="order-1" />
        {/* La key vacía el buscador al salir de una búsqueda */}
        <Buscador key={busqueda} inicial={busqueda} />

        <div className="order-2 ml-auto flex items-center gap-2 md:order-3">
          <TemaToggle />
          <Link
            to="/carrito"
            aria-label="Carrito"
            title="Carrito"
            className="rounded-[3px] border border-linea p-2 text-tenue hover:border-tinta hover:text-tinta"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
              <path d="M3 4h2l2.4 10.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 8H6.2" />
              <circle cx="9.5" cy="19" r="1.25" />
              <circle cx="17" cy="19" r="1.25" />
            </svg>
          </Link>
        </div>
      </div>

      <nav aria-label="Categorías" className="border-y border-linea">
        <ul className="mx-auto flex max-w-7xl overflow-x-auto whitespace-nowrap px-1 text-sm">
          {categorias.map((cat) => (
            <li key={cat.slug}>
              <NavLink to={`/categoria/${cat.slug}`} className={claseNav}>
                {cat.nombre}
              </NavLink>
            </li>
          ))}
          <li className="ml-auto">
            <NavLink to="/productos" end className={claseNav}>
              Todos los productos
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  )
}
