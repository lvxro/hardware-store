import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Campo from '../components/Campo'

// Recuperar contraseña (T-028 del tablero): el cliente escribe su correo y Supabase le manda un enlace
// para elegir una contraseña nueva (ver pages/NuevaContrasena.jsx). "sesion" llega desde App.

const botonPrimario =
  'inline-block rounded-[3px] bg-lime px-4 py-2 font-mono text-sm font-bold text-bg hover:shadow-glow'
const botonSecundario =
  'inline-block rounded-[3px] border border-line-strong px-4 py-2 font-mono text-sm font-medium text-white hover:border-line-hover hover:bg-raised'

export default function RecuperarContrasena({ sesion }) {
  const { state } = useLocation()
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  // El correo al que se pidió el enlace; con valor, se muestra el aviso de "revisá tu correo"
  const [enviadoA, setEnviadoA] = useState('')

  const enviar = async (e) => {
    e.preventDefault()
    const correo = String(new FormData(e.currentTarget).get('correo')).trim()

    setError('')
    setEnviando(true)
    const resultado = await sesion.pedirRecuperacion({ correo })
    setEnviando(false)

    if (resultado.error) setError(resultado.error)
    else setEnviadoA(correo)
  }

  if (enviadoA) {
    return (
      <div className="mx-auto max-w-md px-4 py-12">
        <h1 className="text-2xl font-semibold">Revisá tu correo</h1>
        {/* No se dice si el correo tiene cuenta o no: así nadie puede averiguar qué correos están registrados */}
        <p role="status" className="mt-3 text-muted">
          Si hay una cuenta con <span className="text-white">{enviadoA}</span>, te mandamos un enlace para
          elegir una contraseña nueva. Vence en 15 minutos. Si no lo ves, fijate en la carpeta de spam.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/ingresar" state={state} className={botonPrimario}>
            Volver a iniciar sesión
          </Link>
          <button type="button" onClick={() => setEnviadoA('')} className={botonSecundario}>
            Usar otro correo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold">Recuperar contraseña</h1>
      <p className="mt-2 text-muted">
        Escribí el correo de tu cuenta y te mandamos un enlace para elegir una contraseña nueva.
      </p>

      <form onSubmit={enviar} className="mt-6 space-y-4">
        <Campo id="correo" etiqueta="Correo electrónico" type="email" autoComplete="email" required />

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
          {enviando ? 'Un momento…' : 'Mandar enlace'}
        </button>
      </form>
    </div>
  )
}
