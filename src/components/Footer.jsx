import { Link } from 'react-router-dom'
import categorias, { grupos } from '../data/categorias'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="sobre-noche mt-20 bg-noche text-sobre-noche">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-tenue-noche">
            Componentes y periféricos para armar, mejorar o completar tu PC.
          </p>
        </div>

        {grupos.map((grupo) => (
          <nav key={grupo} aria-label={grupo}>
            <h2 className="font-semibold">{grupo}</h2>
            <ul className="mt-3 space-y-2 text-tenue-noche">
              {categorias
                .filter((c) => c.grupo === grupo)
                .map((cat) => (
                  <li key={cat.slug}>
                    <Link to={`/categoria/${cat.slug}`} className="hover:text-white hover:underline">
                      {cat.nombre}
                    </Link>
                  </li>
                ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-linea-noche">
        <p className="mx-auto max-w-7xl px-4 py-5 text-sm text-tenue-noche">
          Precios en pesos argentinos, calculados con el dólar oficial.
        </p>
      </div>
    </footer>
  )
}
