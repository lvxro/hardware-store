// Conexiones a Supabase para las funciones de Vercel (las carpetas con "_" no son direcciones públicas).
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_CLAVE } from '../../src/data/supabase.js'

const opciones = { auth: { persistSession: false, autoRefreshToken: false } }

// Con la clave pública: solo lee productos, igual que la web
export const supabasePublico = createClient(SUPABASE_URL, SUPABASE_CLAVE, opciones)

// Con la clave secreta: lee y escribe pedidos. Si la variable no está, no hay registro de pedidos
// ni comprobante por mail, pero el pago sigue funcionando.
export const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, opciones)
  : null
