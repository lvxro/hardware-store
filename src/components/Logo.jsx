import { Link } from 'react-router-dom'

// Nombre de la tienda con el isotipo: un chip visto de arriba, con la esquina
// cortada que marca el pin 1. Se usa en el encabezado y en el pie.
export default function Logo({ className = '' }) {
  return (
    <Link to="/" className={`flex shrink-0 items-center gap-2 ${className}`}>
      <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M1 1h18v18H6l-5-5V1Zm6 6v6h6V7H7Z" />
      </svg>
      <span className="text-xl font-semibold tracking-tight">Auraware</span>
    </Link>
  )
}
