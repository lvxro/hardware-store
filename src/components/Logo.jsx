import { Link } from 'react-router-dom'

// Nombre de la tienda con el anillo de colores. Se usa en el encabezado y en el pie.
export default function Logo({ className = '' }) {
  return (
    <Link to="/" className={`flex shrink-0 items-center gap-2.5 ${className}`}>
      <span className="anillo h-6 w-6 rounded-full" aria-hidden="true" />
      <span className="titular text-xl">Auraware</span>
    </Link>
  )
}
