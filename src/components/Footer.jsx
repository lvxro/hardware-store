import { Link } from 'react-router-dom'
import categorias, { grupos } from '../data/categorias'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-line-subtle">
      <div className="mx-auto grid max-w-7xl gap-x-12 gap-y-8 px-4 py-10 text-sm sm:grid-cols-[2fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-muted">
            Precios en pesos argentinos, calculados con el dólar oficial.
          </p>
        </div>

        {grupos.map((grupo) => (
          <nav key={grupo} aria-label={grupo}>
            <h2 className="font-semibold">{grupo}</h2>
            <ul className="mt-2 space-y-1.5">
              {categorias
                .filter((c) => c.grupo === grupo)
                .map((cat) => (
                  <li key={cat.slug}>
                    <Link to={`/categoria/${cat.slug}`} className="border-b-2 border-transparent text-muted hover:border-lime hover:text-white">
                      {cat.nombre}
                    </Link>
                  </li>
                ))}
            </ul>
          </nav>
        ))}
      </div>
    </footer>
  )
}
