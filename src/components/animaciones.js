// Animaciones que no se pueden hacer solo con CSS.
// Todas respetan "reducir movimiento" del sistema: en ese caso no hacen nada.
import { useEffect, useRef, useState } from 'react'

export const sinMovimiento = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

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

/*
  Traza un dibujo línea por línea. Mide cada línea y le deja el largo en "--largo";
  la animación en sí está en index.css (.dibujo[data-trazado]).
  "espera" son los milisegundos antes de empezar.
*/
const LINEAS = 'path, rect, circle, ellipse, line, polyline, polygon'

export function trazar(svg, espera = 0) {
  if (!svg || svg.dataset.trazado || sinMovimiento()) return

  let n = 0
  const tocadas = []
  svg.querySelectorAll(LINEAS).forEach((forma) => {
    // Las marcas llenas sin contorno no se trazan: aparecen con un fundido
    if (getComputedStyle(forma).stroke === 'none') {
      forma.dataset.relleno = ''
      tocadas.push(forma)
      return
    }
    let largo
    try {
      largo = forma.getTotalLength()
    } catch {
      return
    }
    if (!largo) return
    // Según el navegador, el largo del trazo se cuenta en unidades del dibujo o en píxeles
    // de pantalla. Se toma el mayor de los dos para que la línea siempre termine completa.
    const m = forma.getScreenCTM?.()
    const escala = m ? Math.hypot(m.a, m.b) : 1
    forma.style.setProperty('--largo', Math.ceil(largo * Math.max(1, escala) * 1.05))
    forma.style.setProperty('--n', n++)
    forma.dataset.linea = ''
    tocadas.push(forma)
  })

  svg.style.setProperty('--espera-trazo', `${espera}ms`)
  svg.dataset.trazado = 'si'

  // Al terminar se quita todo, así el dibujo queda igual que si nunca se hubiera animado
  setTimeout(() => {
    svg.dataset.trazado = 'listo'
    tocadas.forEach((forma) => {
      delete forma.dataset.linea
      delete forma.dataset.relleno
      forma.style.removeProperty('--largo')
      forma.style.removeProperty('--n')
    })
  }, espera + 1100 + n * 14 + 200)
}

/*
  Aparecer al entrar en pantalla. Hay un solo observador para todo el sitio.
  Al elemento se le pone "data-visto" (el resto lo hace .aparece en index.css).
  Si entran varios a la vez, se escalonan con "--orden".
  Con "data-traza", además se trazan los dibujos que tenga adentro.
*/
let observador = null

function mostrar(elemento, orden = 0) {
  elemento.style.setProperty('--orden', orden)
  elemento.dataset.visto = ''
  if (elemento.dataset.traza !== undefined) {
    elemento.querySelectorAll('svg.dibujo').forEach((svg) => trazar(svg, orden * 55 + 120))
  }
}

function alCruzar(entradas) {
  let orden = 0
  for (const entrada of entradas) {
    if (!entrada.isIntersecting) continue
    observador.unobserve(entrada.target)
    mostrar(entrada.target, Math.min(orden++, 8))
  }
}

export function useAparecer() {
  const ref = useRef(null)

  useEffect(() => {
    const elemento = ref.current
    if (!elemento || elemento.dataset.visto !== undefined) return
    if (!('IntersectionObserver' in window) || sinMovimiento()) {
      mostrar(elemento)
      return
    }
    observador ??= new IntersectionObserver(alCruzar, { threshold: 0.08 })
    observador.observe(elemento)
    return () => observador.unobserve(elemento)
  }, [])

  return ref
}

/*
  Un número que, cuando cambia, pasa por los valores intermedios en vez de saltar.
  Devuelve el valor a mostrar en cada momento.
*/
export function useNumeroAnimado(valor, duracion = 450) {
  const [mostrado, setMostrado] = useState(valor)
  const actual = useRef(valor)

  useEffect(() => {
    const desde = actual.current
    if (desde === valor) return
    const inmediato = sinMovimiento()
    const inicio = performance.now()
    let cuadro = requestAnimationFrame(function paso(ahora) {
      const avance = inmediato ? 1 : Math.min(1, (ahora - inicio) / duracion)
      const suave = 1 - Math.pow(1 - avance, 3) // arranca rápido y frena al llegar
      actual.current = Math.round(desde + (valor - desde) * suave)
      setMostrado(actual.current)
      if (avance < 1) cuadro = requestAnimationFrame(paso)
    })
    return () => cancelAnimationFrame(cuadro)
  }, [valor, duracion])

  return mostrado
}

/*
  Pliega un elemento (alto y opacidad a cero) y avisa cuando terminó.
  Se usa al quitar un renglón del carrito, para que los de abajo suban sin salto.
*/
export function plegar(elemento, alTerminar) {
  if (!elemento || sinMovimiento() || !elemento.animate) {
    alTerminar()
    return
  }
  const estilo = getComputedStyle(elemento)
  const animacion = elemento.animate(
    [
      {
        height: `${elemento.offsetHeight}px`,
        paddingTop: estilo.paddingTop,
        paddingBottom: estilo.paddingBottom,
        opacity: 1,
        transform: 'translateX(0)',
      },
      { opacity: 0, transform: 'translateX(-16px)', offset: 0.45 },
      { height: '0px', paddingTop: '0px', paddingBottom: '0px', opacity: 0, transform: 'translateX(-16px)' },
    ],
    { duration: 380, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' },
  )
  elemento.style.overflow = 'hidden'
  animacion.onfinish = alTerminar
}
