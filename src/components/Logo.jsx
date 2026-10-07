import { Link } from 'react-router-dom'

// Nombre de la tienda escrito como una ruta de carpetas: aura/ware.
// Se usa en el encabezado y en el pie.
export default function Logo({ className = '' }) {
  return (
    <Link
      to="/"
      aria-label="Auraware"
      className={`shrink-0 text-2xl font-semibold leading-none tracking-tight text-white ${className}`}
    >
      aura<span className="font-normal text-muted">/</span>ware
    </Link>
  )
}
