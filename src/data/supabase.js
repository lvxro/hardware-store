// Conexión a Supabase, la base de datos donde están los productos y las cuentas de usuario.
// Esta clave es la "publishable": está pensada para ir en el navegador, no es un secreto.
// Con ella solo se puede leer la tabla productos (ver supabase/tabla-productos.sql);
// las cuentas las maneja Supabase Auth (T-019, ver data/sesion.js).
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://jsgnjdtqktfxgfwuixfv.supabase.co'
const SUPABASE_CLAVE = 'sb_publishable_ERypV6QKT8oNZZcxm-2FXQ_80ZWexRE'

export const supabase = createClient(SUPABASE_URL, SUPABASE_CLAVE, {
  // La sesión se guarda en el navegador y se renueva sola, así el cliente no tiene que
  // volver a ingresar cada vez que recarga la página
  auth: { persistSession: true, autoRefreshToken: true },
})
