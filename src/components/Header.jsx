import { Link, NavLink } from 'react-router-dom'
import categorias from '../data/categorias'

export default function Header() {
  return (
    <header className="border-b border-linea bg-superficie">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 pt-4 lg:flex-row lg:items-center lg:gap-10 lg:py-0">
        <Link to="/" className="shrink-0 text-lg font-semibold tracking-tight lg:py-4">
          Tienda PC
        </Link>

        <nav aria-label="Categorías" className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
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
