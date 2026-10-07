import { useAparecer } from './animaciones'

/*
  Envuelve algo que tiene que aparecer recién cuando entra en pantalla.
  "como" es la etiqueta a usar (div, li, section, footer...).
  Con "traza", los dibujos de adentro además se trazan línea por línea.
*/
export default function Aparece({ como: Etiqueta = 'div', traza = false, className = '', children, ...resto }) {
  const ref = useAparecer()
  return (
    <Etiqueta ref={ref} className={`aparece ${className}`} data-traza={traza ? '' : undefined} {...resto}>
      {children}
    </Etiqueta>
  )
}
