import { useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import categorias from '../data/categorias'
import { formatoPrecio } from '../data/catalogo'
import { CUOTAS_SIN_INTERES, ENVIO_GRATIS_DESDE, PORCENTAJE_EFECTIVO } from '../data/reglas'
import Logo from './Logo'

// Botón de ícono (buscador y carrito vacío). Abierto o presionado pasa a lima.
const claseIcono =
  'rounded-[3px] border border-line-strong bg-surface p-2 text-white hover:border-line-hover hover:bg-raised active:border-lime active:text-lime active:shadow-glow'
const claseIconoActivo = 'rounded-[3px] border border-lime bg-surface p-2 text-lime shadow-glow'

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
        abierto ? 'max-md:absolute max-md:inset-x-4 max-md:top-1/2 max-md:z-10 max-md:-translate-y-1/2 max-md:bg-surface' : ''
      }`}
    >
      <div
        aria-hidden={!abierto}
        className={`overflow-hidden rounded-[3px] transition-[width,opacity] duration-200 ease-out motion-reduce:transition-none ${
          abierto
            ? 'w-full border border-line-strong bg-bg opacity-100 focus-within:border-lime md:max-w-xl'
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
          className="w-full min-w-0 bg-transparent px-3 py-[7px] text-sm text-white placeholder:text-muted focus:outline-none sm:text-base"
        />
      </div>
      <button
        type="button"
        onClick={alTocarIcono}
        aria-label={abierto ? 'Buscar' : 'Abrir el buscador'}
        aria-expanded={abierto}
        title="Buscar"
        className={`shrink-0 ${abierto ? claseIconoActivo : claseIcono}`}
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
    <div className="border-b border-line-subtle bg-bg">
      <p className="mx-auto max-w-7xl px-4 py-1.5 text-center text-xs text-muted tabular-nums">
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

// Ítem de navegación: gris; con el cursor encima o en la página actual, blanco con subrayado lima.
// NavLink marca la página actual con aria-current="page".
const claseNav =
  'block border-b-2 border-transparent px-3 py-2.5 text-muted hover:border-lime hover:text-white aria-[current=page]:border-lime aria-[current=page]:text-white'

/*
  Botón del carrito. "cantidad" es cuántos productos hay en el carrito:
  en 0 es un botón de ícono común; con 1 o más se llena de lima y muestra el número.
*/
function BotonCarrito({ cantidad }) {
  const lleno = cantidad > 0
  return (
    <Link
      to="/carrito"
      aria-label={lleno ? `Carrito, ${cantidad} ${cantidad === 1 ? 'producto' : 'productos'}` : 'Carrito'}
      title="Carrito"
      className={`relative shrink-0 ${
        lleno
          ? 'rounded-[3px] border border-lime bg-lime p-2 text-bg shadow-glow hover:shadow-[var(--lime-glow),var(--lime-glow)]'
          : claseIcono
      }`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <path d="M3 4h2l2.4 10.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 8H6.2" />
        <circle cx="9.5" cy="19" r="1.25" />
        <circle cx="17" cy="19" r="1.25" />
      </svg>
      {lleno && (
        <span className="absolute -right-2 -top-2 min-w-5 rounded-full border border-lime bg-bg px-1 text-center font-mono text-[11px] font-bold leading-[18px] text-lime">
          {cantidad}
        </span>
      )}
    </Link>
  )
}

/*
  "enCarrito" es la cantidad de productos del carrito. Hoy nadie la pasa, porque el carrito
  todavía no existe (T-018): cuando se haga, App se la pasa a Header y el botón cambia solo.
*/
export default function Header({ enCarrito = 0 }) {
  const { pathname } = useLocation()
  const [parametros] = useSearchParams()
  // Lo que se está buscando ahora (vacío en cualquier otra página)
  const busqueda = pathname === '/productos' ? (parametros.get('q') ?? '') : ''

  return (
    <header className="border-b border-line-subtle bg-surface">
      <Condiciones />

      {/* Logo a la izquierda; a la derecha, los íconos del buscador y del carrito */}
      <div className="relative mx-auto flex max-w-7xl items-center gap-2 px-4 py-3">
        <Logo className="mr-4" />
        {/* La key vacía el buscador al salir de una búsqueda */}
        <Buscador key={busqueda} inicial={busqueda} />

        <BotonCarrito cantidad={enCarrito} />
      </div>

      <nav aria-label="Categorías" className="border-t border-line-subtle">
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
