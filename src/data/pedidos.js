// T-023: lee los pedidos del cliente de la tabla "pedidos" de Supabase (supabase/tabla-pedidos.sql).
// La seguridad no depende de este código: la regla de la tabla (RLS) hace que cada cliente reciba
// solo los suyos, aunque alguien cambie esta consulta desde el navegador.
import { supabase } from './supabase'

// Cómo se muestra cada estado del pedido
export const ESTADOS = {
  pendiente: 'Pendiente de pago',
  pagado: 'Pagado',
  rechazado: 'Pago rechazado',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

// Con estos códigos Supabase avisa que la tabla todavía no existe. Mientras no esté creada no hay
// pedidos guardados, así que se muestra el historial vacío y no un error.
const TABLA_INEXISTENTE = ['PGRST205', '42P01']

// Devuelve { pedidos } (del más nuevo al más viejo) o { error: true } si no se pudo leer
export async function leerPedidos() {
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .select('id, creado_en, estado, total, items')
      .order('creado_en', { ascending: false })
      .abortSignal(AbortSignal.timeout(8000))
    if (error) return TABLA_INEXISTENTE.includes(error.code) ? { pedidos: [] } : { error: true }
    return { pedidos: data }
  } catch {
    return { error: true }
  }
}
