import { Link, NavLink } from 'react-router-dom'
import categorias from '../data/categorias'
import TemaToggle from './TemaToggle'

export default function Header() {
  return (
    <header className="border-b border-linea bg-superficie">
      {/* En celular: nombre y botón arriba, categorías abajo. En compu: todo en una fila */}
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-10 px-4">
        <Link to="/" className="order-1 shrink-0 py-4 text-lg font-semibold tracking-tight">
          Auraware
        </Link>

        <div className="order-2 ml-auto lg:order-3">
          <TemaToggle />
        </div>

        <nav aria-label="Categorías" className="order-3 w-full overflow-x-auto lg:order-2 lg:w-auto">
          <ul className="flex gap-6 whitespace-nowrap text-sm">
            {categorias.map((cat) => (
              <li key={cat.slug}>
                <NavLink
                  to={`/categoria/${cat.slug}`}
                  className={({ isActive }) =>
                    `block border-b-2 pb-3 lg:py-5 ${
                      isActive
                        ? 'border-pcb font-medium text-pcb'
                        : 'border-transparent text-tenue hover:text-tinta'
                    }`
                  }
                >
                  {cat.nombre}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
