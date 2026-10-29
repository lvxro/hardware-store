import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import Campo from '../components/Campo'
import { CLAVE_MINIMA } from '../data/sesion'

// T-019: las páginas de registro (/registro) e inicio de sesión (/ingresar).
// Son la misma pantalla con campos distintos, así que comparten componente.
// "sesion" llega desde App (ver data/sesion.js).

export default function Acceso({ modo, sesion }) {
  const esRegistro = modo === 'registro'
  const navegar = useNavigate()
  const { state } = useLocation()
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  // Con la confirmación por correo activada, tras registrarse hay que ir a mirar el mail
  const [pendiente, setPendiente] = useState('')

  // Si ya hay sesión (o recién se abrió una), no hace falta estar acá
  if (sesion.usuario && !pendiente) return <Navigate to={state?.desde ?? '/'} replace />

  const enviar = async (e) => {
    e.preventDefault()
    const datos = new FormData(e.currentTarget)
    const correo = String(datos.get('correo')).trim()
    const clave = String(datos.get('clave'))

    if (esRegistro) {
      if (clave.length < CLAVE_MINIMA) {
        setError(`La contraseña tiene que tener al menos ${CLAVE_MINIMA} caracteres.`)
        return
      }
      if (clave !== String(datos.get('repetir'))) {
        setError('Las contraseñas no coinciden.')
        return
      }
    }

    setError('')
    setEnviando(true)
    const resultado = esRegistro
      ? await sesion.registrar({ nombre: String(datos.get('nombre')).trim(), correo, clave })
      : await sesion.ingresar({ correo, clave })
    setEnviando(false)

    if (resultado.error) {
      setError(resultado.error)
    } else if (resultado.confirmar) {
      setPendiente(correo)
    } else {
      navegar(state?.desde ?? '/', { replace: true })
    }
  }

  if (pendiente) {
    return (
      <div className="mx-auto max-w-md px-4 py-12">
        <h1 className="text-2xl font-semibold">Revisá tu correo</h1>
        <p className="mt-3 text-muted">
          Te mandamos un enlace a <span className="text-white">{pendiente}</span> para confirmar tu
          cuenta. Cuando lo toques, ya vas a poder iniciar sesión. Si no lo ves, fijate en la carpeta
          de spam.
        </p>
        <Link
          to="/ingresar"
          className="mt-6 inline-block rounded-[3px] bg-lime px-4 py-2 font-mono text-sm font-bold text-bg hover:shadow-glow"
        >
          Ir a iniciar sesión
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold">{esRegistro ? 'Crear cuenta' : 'Iniciar sesión'}</h1>
      <p className="mt-2 text-muted">
        {esRegistro
          ? 'Con una cuenta vas a poder comprar y ver tus pedidos.'
          : 'Ingresá con tu correo y tu contraseña.'}
      </p>

      <form onSubmit={enviar} className="mt-6 space-y-4">
        {esRegistro && (
          <Campo id="nombre" etiqueta="Nombre" type="text" autoComplete="name" required maxLength={60} />
        )}
        <Campo id="correo" etiqueta="Correo electrónico" type="email" autoComplete="email" required />
        <Campo
          id="clave"
          etiqueta="Contraseña"
          type="password"
          autoComplete={esRegistro ? 'new-password' : 'current-password'}
          required
          minLength={esRegistro ? CLAVE_MINIMA : undefined}
          ayuda={esRegistro ? `Al menos ${CLAVE_MINIMA} caracteres.` : undefined}
        />
        {/* Recuperar contraseña (T-028 del tablero) */}
        {!esRegistro && (
          <p className="-mt-2 text-right text-sm">
            <Link
              to="/recuperar-contrasena"
              state={state}
              className="text-muted underline underline-offset-4 hover:text-lime"
            >
              ¿Te olvidaste la contraseña?
            </Link>
          </p>
        )}
        {esRegistro && (
          <Campo id="repetir" etiqueta="Repetí la contraseña" type="password" autoComplete="new-password" required />
        )}

        {error && (
          <p role="alert" className="rounded-[3px] border border-line-strong bg-surface px-3 py-2 text-sm">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="w-full rounded-[3px] bg-lime px-4 py-2.5 font-mono text-sm font-bold text-bg hover:shadow-glow disabled:opacity-60 disabled:hover:shadow-none"
        >
          {enviando ? 'Un momento…' : esRegistro ? 'Crear cuenta' : 'Iniciar sesión'}
        </button>
      </form>

      <p className="mt-6 text-sm text-muted">
        {esRegistro ? '¿Ya tenés cuenta? ' : '¿Todavía no tenés cuenta? '}
        <Link
          to={esRegistro ? '/ingresar' : '/registro'}
          state={state}
          className="text-white underline underline-offset-4 hover:text-lime"
        >
          {esRegistro ? 'Iniciá sesión' : 'Creá una'}
        </Link>
      </p>
    </div>
  )
}
