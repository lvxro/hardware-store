import { useNumeroAnimado } from './animaciones'

// Muestra un número que, al cambiar, recorre los valores intermedios.
// "formato" lo convierte en texto (por ejemplo, formatoPrecio).
export default function NumeroAnimado({ valor, formato = String }) {
  return formato(useNumeroAnimado(valor))
}
