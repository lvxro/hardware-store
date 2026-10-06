import { useState } from 'react'
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import categorias from '../data/categorias'
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
      className="order-3 flex w-full overflow-hidden rounded-full bg-white md:order-2 md:w-auto md:max-w-2xl md:flex-1"
    >
      <input
        type="search"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Buscá por marca o modelo"
        aria-label="Buscar productos"
        className="min-w-0 flex-1 bg-transparent py-2.5 pl-5 pr-2 text-[#16142a] placeholder:text-[#5f5c78] focus:outline-none"
      />
      <button
        type="submit"
        className="m-1 flex items-center gap-2 rounded-full bg-[#5b43f0] px-4 text-sm font-semibold text-white hover:bg-[#4a33dc]"
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

export default function Header() {
  const { pathname } = useLocation()
  const [parametros] = useSearchParams()
  // Lo que se está buscando ahora (vacío en cualquier otra página)
  const busqueda = pathname === '/productos' ? (parametros.get('q') ?? '') : ''

  return (
    <header className="sobre-noche bg-noche text-sobre-noche">
      {/* En celular: logo y botones arriba, buscador abajo. En compu: todo en una fila */}
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-3 px-4 py-3.5">
        <Logo className="order-1" />
        {/* La key vacía el buscador al salir de una búsqueda */}
        <Buscador key={busqueda} inicial={busqueda} />

        <div className="order-2 ml-auto flex items-center gap-2 md:order-3">
          <TemaToggle />
          <Link
            to="/carrito"
            aria-label="Carrito"
            title="Carrito"
            className="rounded-full border border-linea-noche p-2.5 hover:bg-noche-2"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
              <path d="M3 4h2l2.4 10.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 8H6.2" />
              <circle cx="9.5" cy="19" r="1.25" />
              <circle cx="17" cy="19" r="1.25" />
            </svg>
          </Link>
        </div>
      </div>

      <nav aria-label="Categorías" className="bg-noche-2">
        <ul className="mx-auto flex max-w-7xl gap-1 overflow-x-auto whitespace-nowrap px-2 text-sm">
          {categorias.map((cat) => (
            <li key={cat.slug}>
              <NavLink
                to={`/categoria/${cat.slug}`}
                className={({ isActive }) =>
                  `block border-b-2 px-3 py-3 ${
                    isActive
                      ? 'border-aura-luz font-semibold text-white'
                      : 'border-transparent text-tenue-noche hover:text-white'
                  }`
                }
              >
                {cat.nombre}
              </NavLink>
            </li>
          ))}
          <li className="ml-auto">
            <NavLink
              to="/productos"
              end
              className={({ isActive }) =>
                `block border-b-2 px-3 py-3 ${
                  isActive
                    ? 'border-aura-luz font-semibold text-white'
                    : 'border-transparent text-tenue-noche hover:text-white'
                }`
              }
            >
              Todos los productos
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  )
}
