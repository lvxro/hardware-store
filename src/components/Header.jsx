import { useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import categorias from '../data/categorias'
import { formatoPrecio } from '../data/catalogo'
import { CUOTAS_SIN_INTERES, ENVIO_GRATIS_DESDE, PORCENTAJE_EFECTIVO } from '../data/reglas'
import Logo from './Logo'

const claseIcono = 'rounded-[3px] border border-linea p-2 text-tenue hover:border-tinta hover:text-tinta'

/*
  El buscador es un ícono, igual que el del carrito. Al tocarlo, el campo se despliega
  desde el ícono hacia el centro del encabezado (en celular ocupa toda la fila).
*/
function Buscador({ inicial }) {
  const navegar = useNavigate()
  const [texto, setTexto] = useState(inicial)
  // Si ya hay una búsqueda hecha, arranca desplegado mostrando lo que se buscó
  const [abierto, setAbierto] = useState(inicial !== '')
  const campo = useRef(null)

  const buscar = (e) => {
    e.preventDefault()
    const limpio = texto.trim()
    navegar(limpio ? `/productos?q=${encodeURIComponent(limpio)}` : '/productos')
  }

  // El ícono abre el campo; con texto escrito, busca; con el campo vacío, lo vuelve a cerrar
  const alTocarIcono = (e) => {
    if (!abierto) {
      setAbierto(true)
      setTimeout(() => campo.current?.focus(), 0)
    } else if (texto.trim()) {
      buscar(e)
    } else {
      setAbierto(false)
    }
  }

  // Se cierra solo si quedó vacío y el foco salió del buscador
  const alSalir = (e) => {
    if (!texto.trim() && !e.currentTarget.contains(e.relatedTarget)) setAbierto(false)
  }

  const alTeclear = (e) => {
    if (e.key === 'Escape') {
      setAbierto(false)
      e.currentTarget.blur()
    }
  }

  return (
    <form
      role="search"
      onSubmit={buscar}
      onBlur={alSalir}
      className={`flex min-w-0 flex-1 items-center justify-end gap-2 ${
        abierto ? 'max-md:absolute max-md:inset-x-4 max-md:top-1/2 max-md:z-10 max-md:-translate-y-1/2 max-md:bg-fondo' : ''
      }`}
    >
      <div
        aria-hidden={!abierto}
        className={`overflow-hidden rounded-[3px] transition-[width,opacity] duration-200 ease-out motion-reduce:transition-none ${
          abierto
            ? 'w-full border border-linea opacity-100 focus-within:border-tinta md:max-w-xl'
            : 'w-0 opacity-0'
        }`}
      >
        <input
          ref={campo}
          type="search"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={alTeclear}
          tabIndex={abierto ? 0 : -1}
          placeholder="Buscá por marca o modelo"
          aria-label="Buscar productos"
          className="w-full min-w-0 bg-transparent px-3 py-[7px] text-sm text-tinta placeholder:text-tenue focus:outline-none sm:text-base"
        />
      </div>
      <button
        type="button"
        onClick={alTocarIcono}
        aria-label={abierto ? 'Buscar' : 'Abrir el buscador'}
        aria-expanded={abierto}
        title="Buscar"
        className={`shrink-0 ${claseIcono} ${abierto ? 'border-tinta text-tinta' : ''}`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" className="h-5 w-5" aria-hidden="true">
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4.5 4.5" />
        </svg>
      </button>
    </form>
  )
}

// Las condiciones de compra, en una línea. Los números salen de data/reglas.js
function Condiciones() {
  const envio = `Envío gratis desde ${formatoPrecio(ENVIO_GRATIS_DESDE)}`
  return (
    <div className="bg-plano">
      <p className="mx-auto max-w-7xl px-4 py-1.5 font-sans text-xs text-tenue tabular-nums">
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

      {/* Logo a la izquierda; a la derecha, los íconos del buscador y del carrito */}
      <div className="relative mx-auto flex max-w-7xl items-center gap-2 px-4 py-3">
        <Logo className="mr-4" />
        {/* La key vacía el buscador al salir de una búsqueda */}
        <Buscador key={busqueda} inicial={busqueda} />

        <Link to="/carrito" aria-label="Carrito" title="Carrito" className={`shrink-0 ${claseIcono}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
            <path d="M3 4h2l2.4 10.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 8H6.2" />
            <circle cx="9.5" cy="19" r="1.25" />
            <circle cx="17" cy="19" r="1.25" />
          </svg>
        </Link>
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
