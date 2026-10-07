import { Link } from 'react-router-dom'

// Nombre de la tienda escrito como una ruta de carpetas: aura/ware.
// Se usa en el encabezado y en el pie.
export default function Logo({ className = '' }) {
  return (
    <Link
      to="/"
      aria-label="Auraware"
      className={`group shrink-0 text-2xl font-semibold leading-none tracking-tight text-white ${className}`}
    >
      {/* La barra se inclina un poco más y se aclara al pasar el cursor */}
      aura
      <span className="inline-block font-normal text-muted transition-[rotate,color] duration-300 ease-out group-hover:rotate-12 group-hover:text-white">
        /
      </span>
      ware
    </Link>
  )
}
