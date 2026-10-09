// Conexión a Supabase, la base de datos donde están los productos.
// Esta clave es la "publishable": está pensada para ir en el navegador, no es un secreto.
// Con ella solo se puede leer la tabla productos (ver supabase/tabla-productos.sql).
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://jsgnjdtqktfxgfwuixfv.supabase.co'
const SUPABASE_CLAVE = 'sb_publishable_ERypV6QKT8oNZZcxm-2FXQ_80ZWexRE'

export const supabase = createClient(SUPABASE_URL, SUPABASE_CLAVE, {
  // La tienda no tiene usuarios ni inicio de sesión
  auth: { persistSession: false, autoRefreshToken: false },
})
