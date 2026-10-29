import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTitulo } from '../data/titulo'

// T-019: a esta página llega el cliente al tocar "Verificar correo electrónico" en el mail.
// Supabase confirma la cuenta, abre la sesión y vuelve acá. "sesion" llega desde App (ver data/sesion.js).

const ESPERA_SEGUNDOS = 5

const botonPrimario =
  'inline-block rounded-[3px] bg-lime px-4 py-2 font-mono text-sm font-bold text-bg hover:shadow-glow'
const botonSecundario =
  'inline-block rounded-[3px] border border-line-strong px-4 py-2 font-mono text-sm font-medium text-white hover:border-line-hover hover:bg-raised'

// Si el enlace falló (venció o ya se había usado), Supabase vuelve con el error en la dirección, después del #
function hayErrorEnElEnlace() {
  const parametros = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  return Boolean(parametros.get('error_code') || parametros.get('error'))
}

function Pantalla({ titulo, children }) {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold">{titulo}</h1>
      {children}
    </div>
  )
}

export default function CuentaConfirmada({ sesion }) {
  useTitulo('Cuenta confirmada')
  const navegar = useNavigate()
  const { usuario, nombre, cargando } = sesion
  // Se lee una sola vez, apenas se abre la página: el cliente de Supabase limpia la dirección al terminar
  const [conError] = useState(hayErrorEnElEnlace)
  const [segundos, setSegundos] = useState(ESPERA_SEGUNDOS)
  const confirmada = !cargando && Boolean(usuario)

  // Con la cuenta confirmada, cuenta hacia atrás y lleva a la tienda
  useEffect(() => {
    if (!confirmada) return
    const reloj = setInterval(() => setSegundos((s) => s - 1), 1000)
    return () => clearInterval(reloj)
  }, [confirmada])

  useEffect(() => {
    if (confirmada && segundos <= 0) navegar('/', { replace: true })
  }, [confirmada, segundos, navegar])

  if (cargando) {
    return (
      <Pantalla titulo="Confirmando tu cuenta…">
        <p role="status" className="mt-3 text-muted">
          Un momento, estamos verificando tu correo.
        </p>
      </Pantalla>
    )
  }

  if (usuario) {
    return (
      <Pantalla titulo="¡Cuenta confirmada!">
        <p role="status" className="mt-3 text-muted">
          Listo, <span className="text-white">{nombre}</span>. Tu correo quedó verificado y ya iniciaste
          sesión.
        </p>
        <p className="mt-2 text-sm text-muted tabular-nums">
          Te llevamos a la tienda en {Math.max(segundos, 0)} s.
        </p>
        <Link to="/" replace className={`mt-6 ${botonPrimario}`}>
          Ir a la tienda ahora
        </Link>
      </Pantalla>
    )
  }

  if (conError) {
    return (
      <Pantalla titulo="No pudimos confirmar tu correo">
        <p role="alert" className="mt-3 text-muted">
          El enlace venció o ya se usó. Si ya confirmaste tu correo, iniciá sesión. Si no, creá la cuenta de
          nuevo y te mandamos otro mail.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/ingresar" className={botonPrimario}>
            Iniciar sesión
          </Link>
          <Link to="/registro" className={botonSecundario}>
            Crear cuenta
          </Link>
        </div>
      </Pantalla>
    )
  }

  // Alguien abrió esta dirección sin venir del correo
  return (
    <Pantalla titulo="Iniciá sesión para continuar">
      <p className="mt-3 text-muted">Si ya confirmaste tu correo, ingresá con tu cuenta.</p>
      <Link to="/ingresar" className={`mt-6 ${botonPrimario}`}>
        Iniciar sesión
      </Link>
    </Pantalla>
  )
}
