import { useState } from 'react'
import { Link } from 'react-router-dom'
import Campo from '../components/Campo'
import { CLAVE_MINIMA, enlaceConError } from '../data/sesion'

// Recuperar contraseña (T-028 del tablero): a esta página llega el cliente al tocar el botón del mail.
// Supabase abre una sesión temporal con ese enlace, y con ella el cliente elige su contraseña nueva.
// "sesion" llega desde App (ver data/sesion.js).

const botonPrimario =
  'inline-block rounded-[3px] bg-lime px-4 py-2 font-mono text-sm font-bold text-bg hover:shadow-glow'

function Pantalla({ titulo, children }) {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold">{titulo}</h1>
      {children}
    </div>
  )
}

export default function NuevaContrasena({ sesion }) {
  const { usuario, cargando } = sesion
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [listo, setListo] = useState(false)

  const guardar = async (e) => {
    e.preventDefault()
    const datos = new FormData(e.currentTarget)
    const clave = String(datos.get('clave'))

    if (clave.length < CLAVE_MINIMA) {
      setError(`La contraseña tiene que tener al menos ${CLAVE_MINIMA} caracteres.`)
      return
    }
    if (clave !== String(datos.get('repetir'))) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setError('')
    setGuardando(true)
    const resultado = await sesion.cambiarClave({ clave })
    setGuardando(false)

    if (resultado.error) setError(resultado.error)
    else setListo(true)
  }

  if (cargando) {
    return (
      <Pantalla titulo="Verificando el enlace…">
        <p role="status" className="mt-3 text-muted">
          Un momento, estamos revisando tu enlace.
        </p>
      </Pantalla>
    )
  }

  if (listo) {
    return (
      <Pantalla titulo="¡Contraseña cambiada!">
        <p role="status" className="mt-3 text-muted">
          Listo, tu contraseña nueva ya está activa. Si tenías la sesión abierta en otro dispositivo, se
          cerró.
        </p>
        <Link to="/" replace className={`mt-6 ${botonPrimario}`}>
          Ir a la tienda
        </Link>
      </Pantalla>
    )
  }

  // Sin sesión no hay a quién cambiarle la contraseña: el enlace venció, ya se usó o la dirección no vino del mail
  if (!usuario) {
    return (
      <Pantalla titulo={enlaceConError ? 'El enlace venció' : 'Pedí un enlace para continuar'}>
        <p role={enlaceConError ? 'alert' : undefined} className="mt-3 text-muted">
          {enlaceConError
            ? 'El enlace venció o ya se usó. Pedí uno nuevo y te lo mandamos de nuevo.'
            : 'Para elegir una contraseña nueva, pedí el enlace con tu correo y tocá el botón del mail.'}
        </p>
        <Link to="/recuperar-contrasena" className={`mt-6 ${botonPrimario}`}>
          Pedir un enlace nuevo
        </Link>
      </Pantalla>
    )
  }

  return (
    <Pantalla titulo="Elegí una contraseña nueva">
      <p className="mt-2 text-muted">
        Estás cambiando la contraseña de <span className="text-white">{usuario.email}</span>.
      </p>

      <form onSubmit={guardar} className="mt-6 space-y-4">
        <Campo
          id="clave"
          etiqueta="Contraseña nueva"
          type="password"
          autoComplete="new-password"
          required
          minLength={CLAVE_MINIMA}
          ayuda={`Al menos ${CLAVE_MINIMA} caracteres.`}
        />
        <Campo id="repetir" etiqueta="Repetí la contraseña" type="password" autoComplete="new-password" required />

        {error && (
          <p role="alert" className="rounded-[3px] border border-line-strong bg-surface px-3 py-2 text-sm">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={guardando}
          className="w-full rounded-[3px] bg-lime px-4 py-2.5 font-mono text-sm font-bold text-bg hover:shadow-glow disabled:opacity-60 disabled:hover:shadow-none"
        >
          {guardando ? 'Un momento…' : 'Guardar contraseña'}
        </button>
      </form>
    </Pantalla>
  )
}
