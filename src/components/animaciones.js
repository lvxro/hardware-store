// Animaciones que no se pueden hacer solo con CSS.
// Las dos respetan "reducir movimiento" del sistema: en ese caso no hacen nada.
import { useEffect, useRef, useState } from 'react'

const sinMovimiento = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/*
  Al agregar un producto: un punto lima sale del botón, vuela hasta el ícono del carrito
  del encabezado y el ícono da un pequeño rebote con resplandor.
  Es solo la animación: no guarda nada en ningún lado.
*/
export function volarAlCarrito(desde) {
  const carrito = document.querySelector('[data-carrito]')
  if (!desde || !carrito || sinMovimiento() || !carrito.animate) return

  const a = desde.getBoundingClientRect()
  const b = carrito.getBoundingClientRect()
  const inicio = { x: a.left + a.width / 2, y: a.top + a.height / 2 }
  const fin = { x: b.left + b.width / 2, y: b.top + b.height / 2 }

  const punto = document.createElement('span')
  punto.setAttribute('aria-hidden', 'true')
  punto.style.cssText = `position:fixed;left:0;top:0;z-index:50;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:9999px;background:var(--lime);box-shadow:var(--lime-glow);pointer-events:none;`
  document.body.appendChild(punto)

  // Sube un poco antes de ir al carrito, así el recorrido hace una curva
  const curva = { x: inicio.x + (fin.x - inicio.x) * 0.35, y: Math.min(inicio.y, fin.y) - 60 }
  const vuelo = punto.animate(
    [
      { transform: `translate(${inicio.x}px, ${inicio.y}px) scale(0.4)`, opacity: 0 },
      { transform: `translate(${inicio.x}px, ${inicio.y}px) scale(1.4)`, opacity: 1, offset: 0.12 },
      { transform: `translate(${curva.x}px, ${curva.y}px) scale(1.1)`, opacity: 1, offset: 0.5 },
      { transform: `translate(${fin.x}px, ${fin.y}px) scale(0.5)`, opacity: 0.9 },
    ],
    { duration: 750, easing: 'cubic-bezier(0.5, 0, 0.2, 1)' },
  )

  vuelo.onfinish = () => {
    punto.remove()
    carrito.animate(
      [
        { transform: 'scale(1)', boxShadow: '0 0 0 0 var(--lime-ring)', borderColor: 'var(--lime)' },
        { transform: 'scale(1.18)', boxShadow: '0 0 0 6px var(--lime-ring)', borderColor: 'var(--lime)', offset: 0.35 },
        { transform: 'scale(1)', boxShadow: '0 0 0 12px transparent' },
      ],
      { duration: 550, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    )
  }
}

/*
  Para que algo aparezca recién cuando entra en pantalla.
  Devuelve una ref para el elemento y si ya se vio.
*/
export function useAlVerse() {
  const ref = useRef(null)
  const [visto, setVisto] = useState(false)

  useEffect(() => {
    const elemento = ref.current
    if (!elemento || !('IntersectionObserver' in window)) {
      setVisto(true)
      return
    }
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisto(true)
          observador.disconnect()
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    observador.observe(elemento)
    return () => observador.disconnect()
  }, [])

  return [ref, visto]
}
