// T-019: la sesión del cliente (registro, inicio y cierre de sesión).
// Las cuentas las maneja Supabase Auth: la contraseña nunca se guarda en nuestro código ni en
// nuestras tablas, Supabase la guarda cifrada. Esto vive en App (una sola copia para todo el sitio),
// igual que el carrito.
import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export const CLAVE_MINIMA = 8

// Supabase devuelve los errores en inglés: acá se pasan a mensajes que entiende el cliente
function traducir(error) {
  switch (error.code) {
    case 'invalid_credentials':
      return 'El correo o la contraseña no son correctos.'
    case 'email_not_confirmed':
      return 'Todavía no confirmaste tu correo. Revisá tu bandeja de entrada.'
    case 'user_already_exists':
    case 'email_exists':
      return 'Ya hay una cuenta con ese correo. Probá iniciar sesión.'
    case 'weak_password':
      return `La contraseña es muy débil. Usá al menos ${CLAVE_MINIMA} caracteres.`
    case 'email_address_invalid':
    case 'validation_failed':
      return 'Ese correo no es válido.'
    case 'signup_disabled':
      return 'El registro está desactivado por ahora.'
    case 'over_request_rate_limit':
    case 'over_email_send_rate_limit':
      return 'Hiciste demasiados intentos. Esperá unos minutos y volvé a probar.'
    default:
      break
  }
  if (error.name === 'AuthRetryableFetchError') {
    return 'No pudimos conectarnos. Revisá tu conexión y volvé a probar.'
  }
  return 'Algo salió mal. Volvé a probar en un rato.'
}

export function useSesion() {
  const [usuario, setUsuario] = useState(null)
  // Mientras se lee la sesión guardada no se sabe si hay alguien adentro
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    let vivo = true

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (vivo) setUsuario(data.session?.user ?? null)
      })
      .catch(() => {
        // Sin conexión: se muestra el sitio como si no hubiera sesión
      })
      .finally(() => {
        if (vivo) setCargando(false)
      })

    // Se entera de los cambios: ingreso, cierre, o sesión abierta o cerrada en otra pestaña
    const { data } = supabase.auth.onAuthStateChange((_evento, sesion) => {
      setUsuario(sesion?.user ?? null)
    })

    return () => {
      vivo = false
      data.subscription.unsubscribe()
    }
  }, [])

  // Cada función devuelve { error } con el mensaje ya traducido, o { ok: true }
  const registrar = async ({ nombre, correo, clave }) => {
    const { data, error } = await supabase.auth.signUp({
      email: correo,
      password: clave,
      options: {
        data: { nombre },
        // Adonde vuelve el cliente al tocar el enlace del correo de confirmación
        emailRedirectTo: window.location.origin,
      },
    })
    if (error) return { error: traducir(error) }
    // Con la confirmación por correo activada, un correo ya registrado no da error (para no
    // revelar qué correos tienen cuenta): devuelve un usuario sin identidades
    if (data.user && data.user.identities?.length === 0) {
      return { error: traducir({ code: 'user_already_exists' }) }
    }
    // Sin sesión todavía: falta confirmar el correo
    return { ok: true, confirmar: !data.session }
  }

  const ingresar = async ({ correo, clave }) => {
    const { error } = await supabase.auth.signInWithPassword({ email: correo, password: clave })
    return error ? { error: traducir(error) } : { ok: true }
  }

  const salir = async () => {
    // scope local: cierra solo este navegador, no los demás dispositivos del cliente
    await supabase.auth.signOut({ scope: 'local' })
  }

  const nombre = usuario?.user_metadata?.nombre?.trim() || usuario?.email?.split('@')[0] || ''

  return { usuario, nombre, cargando, registrar, ingresar, salir }
}
