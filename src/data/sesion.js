// T-019: la sesión del cliente (registro, inicio y cierre de sesión).
// Las cuentas las maneja Supabase Auth: la contraseña nunca se guarda en nuestro código ni en
// nuestras tablas, Supabase la guarda cifrada. Esto vive en App (una sola copia para todo el sitio),
// igual que el carrito.
import { useEffect, useState } from 'react'
// T-028: la biblioteca de Supabase (la parte más pesada del sitio) se baja aparte, después del
// primer dibujo. Mientras tanto, el encabezado muestra el lugar de la cuenta vacío.
const conSupabase = () => import('./supabase').then((m) => m.supabase)

export const CLAVE_MINIMA = 8

// Recuperar contraseña (T-028 del tablero): si el enlace del correo venció o ya se usó, Supabase vuelve
// a la tienda con el error en la dirección. Se lee apenas carga el sitio, antes de que el cliente de
// Supabase limpie la dirección.
function leerErrorDelEnlace() {
  if (typeof window === 'undefined') return false
  const parametros = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  const consulta = new URLSearchParams(window.location.search)
  return Boolean(
    parametros.get('error_code') || parametros.get('error') || consulta.get('error_code') || consulta.get('error'),
  )
}
export const enlaceConError = leerErrorDelEnlace()

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
    case 'same_password':
      return 'La contraseña nueva tiene que ser distinta de la actual.'
    case 'reauthentication_needed':
    case 'reauthentication_not_valid':
      return 'Por seguridad, iniciá sesión de nuevo antes de cambiar la contraseña.'
    case 'session_not_found':
    case 'session_expired':
    case 'bad_jwt':
      return 'El enlace venció. Pedí uno nuevo para cambiar tu contraseña.'
    case 'over_request_rate_limit':
    case 'over_email_send_rate_limit':
      return 'Hiciste demasiados intentos. Esperá unos minutos y volvé a probar.'
    default:
      break
  }
  // Supabase no pudo mandar el mail de recuperación (por ejemplo, el correo SMTP está mal configurado)
  if (/recovery email/i.test(error.message ?? '')) {
    return 'No pudimos mandarte el mail para cambiar la contraseña. Probá de nuevo en unos minutos.'
  }
  // Supabase no pudo mandar el mail de confirmación (por ejemplo, el correo SMTP está mal configurado)
  if (error.code === 'unexpected_failure' || /confirmation email/i.test(error.message ?? '')) {
    return 'No pudimos mandarte el mail de confirmación. Probá de nuevo en unos minutos.'
  }
  // Sin respuesta del servidor (status 0 es que no hubo conexión)
  if (error.name === 'AuthRetryableFetchError' && error.status >= 500) {
    return 'El servidor no respondió. Probá de nuevo en unos minutos.'
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
  // T-025: si la cuenta figura en la tabla administradores de Supabase (función es_admin)
  const [adminDe, setAdminDe] = useState(null) // { id del usuario, es o no }

  useEffect(() => {
    let vivo = true
    let suscripcion = null

    conSupabase()
      .then(async (supabase) => {
        if (!vivo) return
        // Se entera de los cambios: ingreso, cierre, o sesión abierta o cerrada en otra pestaña
        suscripcion = supabase.auth.onAuthStateChange((_evento, sesion) => {
          setUsuario(sesion?.user ?? null)
        }).data.subscription
        const { data } = await supabase.auth.getSession()
        if (vivo) setUsuario(data.session?.user ?? null)
      })
      .catch(() => {
        // Sin conexión: se muestra el sitio como si no hubiera sesión
      })
      .finally(() => {
        if (vivo) setCargando(false)
      })

    return () => {
      vivo = false
      suscripcion?.unsubscribe()
    }
  }, [])

  // T-025: se pregunta una vez por cada cuenta que inicia sesión. Si la función no existe todavía, no es admin.
  useEffect(() => {
    if (!usuario) return
    let vivo = true
    conSupabase()
      .then((supabase) => supabase.rpc('es_admin'))
      .then(({ data }) => vivo && setAdminDe({ id: usuario.id, es: data === true }))
      .catch(() => vivo && setAdminDe({ id: usuario.id, es: false }))
    return () => {
      vivo = false
    }
  }, [usuario])

  const esAdmin = Boolean(usuario) && adminDe?.id === usuario.id && adminDe.es
  // Mientras no se sabe si es admin (recién inició sesión), el panel espera
  const verificandoAdmin = Boolean(usuario) && adminDe?.id !== usuario.id

  // Cada función devuelve { error } con el mensaje ya traducido, o { ok: true }
  const registrar = async ({ nombre, correo, clave }) => {
    const supabase = await conSupabase()
    const { data, error } = await supabase.auth.signUp({
      email: correo,
      password: clave,
      options: {
        data: { nombre },
        // Adonde vuelve el cliente al tocar el enlace del correo de confirmación (ver pages/CuentaConfirmada.jsx)
        emailRedirectTo: `${window.location.origin}/cuenta-confirmada`,
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
    const supabase = await conSupabase()
    const { error } = await supabase.auth.signInWithPassword({ email: correo, password: clave })
    return error ? { error: traducir(error) } : { ok: true }
  }

  // Recuperar contraseña (T-028 del tablero): Supabase manda un mail con un enlace que vuelve a
  // /nueva-contrasena con una sesión temporal abierta. No dice si el correo tiene cuenta o no.
  const pedirRecuperacion = async ({ correo }) => {
    const supabase = await conSupabase()
    const { error } = await supabase.auth.resetPasswordForEmail(correo, {
      redirectTo: `${window.location.origin}/nueva-contrasena`,
    })
    return error ? { error: traducir(error) } : { ok: true }
  }

  // Guarda la contraseña nueva de la cuenta que tiene la sesión abierta
  const cambiarClave = async ({ clave }) => {
    const supabase = await conSupabase()
    const { error } = await supabase.auth.updateUser({ password: clave })
    if (error) return { error: traducir(error) }
    // Por seguridad, se cierran las sesiones de los demás dispositivos (esta sigue abierta)
    try {
      await supabase.auth.signOut({ scope: 'others' })
    } catch {
      // Si falla, la contraseña igual ya cambió
    }
    return { ok: true }
  }

  const salir = async () => {
    // scope local: cierra solo este navegador, no los demás dispositivos del cliente
    const supabase = await conSupabase()
    await supabase.auth.signOut({ scope: 'local' })
  }

  const nombre = usuario?.user_metadata?.nombre?.trim() || usuario?.email?.split('@')[0] || ''

  return {
    usuario,
    nombre,
    cargando,
    esAdmin,
    verificandoAdmin,
    registrar,
    ingresar,
    pedirRecuperacion,
    cambiarClave,
    salir,
  }
}
