import { useEffect, useRef, useState } from 'react'
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
        className={`overflow-hidden rounded-[3px] transition-[width,opacity,box-shadow] duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
          abierto
            ? 'w-full border border-line-strong bg-bg opacity-100 focus-within:border-lime focus-within:shadow-glow md:max-w-xl'
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
          className={`w-full min-w-0 bg-transparent px-3 py-[7px] text-sm text-white placeholder:text-muted focus:outline-none sm:text-base ${
            abierto ? 'entra-deslizando' : ''
          }`}
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
        {/* La lupa gira un cuarto de vuelta al abrir y vuelve al cerrar */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          className={`h-5 w-5 transition-transform duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
            abierto ? 'rotate-90' : ''
          }`}
          aria-hidden="true"
        >
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

// Ítem de navegación: gris; con el cursor encima o en la página actual, blanco con subrayado lima
// (el subrayado crece de izquierda a derecha, ver .subrayado en index.css).
// NavLink marca la página actual con aria-current="page".
const claseNav =
  'subrayado block border-b-2 border-transparent px-3 py-2.5 text-muted hover:text-white aria-[current=page]:text-white'

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
      data-carrito
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
        // La key hace que el número dé un saltito cada vez que cambia
        <span key={cantidad} className="salta absolute -right-2 -top-2 min-w-5 rounded-full border border-lime bg-bg px-1 text-center font-mono text-[11px] font-bold leading-[18px] text-lime">
          {cantidad}
        </span>
      )}
    </Link>
  )
}

/*
  Botón de la cuenta (T-019). Sin sesión, lleva a iniciar sesión. Con sesión, se llena de lima con la
  inicial del nombre y abre un menú chico con el nombre, "Mis pedidos" (T-023) y "Cerrar sesión".
*/
function BotonCuenta({ sesion }) {
  const { usuario, nombre, cargando, salir } = sesion
  const [abierto, setAbierto] = useState(false)
  const caja = useRef(null)

  // El menú se cierra al tocar afuera o con Escape
  useEffect(() => {
    if (!abierto) return
    const afuera = (e) => {
      if (!caja.current?.contains(e.target)) setAbierto(false)
    }
    const escape = (e) => e.key === 'Escape' && setAbierto(false)
    document.addEventListener('pointerdown', afuera)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', afuera)
      document.removeEventListener('keydown', escape)
    }
  }, [abierto])

  // Mientras se lee la sesión guardada, un lugar vacío evita que los íconos salten de lugar
  if (cargando) return <span className="h-9 w-9 shrink-0" aria-hidden="true" />

  if (!usuario) {
    return (
      <Link to="/ingresar" aria-label="Iniciar sesión" title="Iniciar sesión" className={`shrink-0 ${claseIcono}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
          <circle cx="12" cy="8.5" r="3.5" />
          <path d="M5 20c.6-3.6 3.3-5.5 7-5.5s6.4 1.9 7 5.5" />
        </svg>
      </Link>
    )
  }

  return (
    <div ref={caja} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setAbierto((a) => !a)}
        aria-label={`Cuenta de ${nombre}`}
        aria-expanded={abierto}
        aria-haspopup="menu"
        title={nombre}
        className="flex h-9 w-9 items-center justify-center rounded-[3px] border border-lime bg-surface font-mono text-sm font-bold uppercase text-lime shadow-glow hover:bg-raised"
      >
        {nombre.charAt(0)}
      </button>
      {abierto && (
        <div role="menu" className="absolute right-0 top-full z-20 mt-2 w-56 rounded-[3px] border border-line-strong bg-surface p-3 shadow-glow-lg">
          <p className="truncate text-sm font-medium">{nombre}</p>
          <p className="truncate text-xs text-muted">{usuario.email}</p>
          <Link
            to="/pedidos"
            role="menuitem"
            onClick={() => setAbierto(false)}
            className="mt-3 block w-full rounded-[3px] border border-line-strong px-3 py-2 text-center font-mono text-sm font-medium hover:border-line-hover hover:bg-raised"
          >
            Mis pedidos
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setAbierto(false)
              salir()
            }}
            className="mt-2 w-full rounded-[3px] border border-line-strong px-3 py-2 text-center font-mono text-sm font-medium hover:border-line-hover hover:bg-raised"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}

// "enCarrito" es cuántas unidades hay en el carrito y "sesion" es la sesión del cliente.
// Se las pasa App, que es donde viven las dos.
export default function Header({ enCarrito = 0, sesion }) {
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

        <BotonCuenta sesion={sesion} />
        <BotonCarrito cantidad={enCarrito} />
      </div>

      <nav aria-label="Categorías" className="border-t border-line-subtle">
        <ul className="mx-auto flex max-w-7xl overflow-x-auto whitespace-nowrap px-1 text-sm">
          <li>
            <NavLink to="/ofertas" className={claseNav}>
              Ofertas
            </NavLink>
          </li>
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
