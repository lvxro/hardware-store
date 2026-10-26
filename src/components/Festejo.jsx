import { useEffect, useRef } from 'react'

// T-023: la lluvia de píxeles de la página de gracias.
// Un lienzo encima de todo (no se puede tocar) donde estallan cuadraditos y crucecitas lima y blancos,
// como chispas de un circuito. Sale desde "origen" (un elemento de la página, el sello del tilde).
// Con "reducir movimiento" activado no se dibuja nada.

const COLORES = ['#CBEB4C', '#CBEB4C', '#CBEB4C', '#FFFFFF', '#9B9BA6']
const GRAVEDAD = 0.22
const ROCE = 0.986

function estallido(x, y, cantidad, fuerza) {
  return Array.from({ length: cantidad }, () => {
    const angulo = Math.random() * Math.PI * 2
    const impulso = fuerza * (0.35 + Math.random() * 0.65)
    return {
      x,
      y,
      vx: Math.cos(angulo) * impulso,
      vy: Math.sin(angulo) * impulso - fuerza * 0.45, // más hacia arriba que hacia abajo
      giro: Math.random() * Math.PI,
      vgiro: (Math.random() - 0.5) * 0.3,
      tam: 3 + Math.random() * 5,
      forma: Math.random() < 0.18 ? 'cruz' : Math.random() < 0.5 ? 'cuadro' : 'barra',
      color: COLORES[Math.floor(Math.random() * COLORES.length)],
      vida: 0,
      duracion: 90 + Math.random() * 80, // en cuadros
      titila: Math.random() < 0.3,
    }
  })
}

export default function Festejo({ origen, activo = true }) {
  const lienzo = useRef(null)

  useEffect(() => {
    if (!activo) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const canvas = lienzo.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const medir = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    medir()
    window.addEventListener('resize', medir)

    const centro = () => {
      const r = origen?.current?.getBoundingClientRect()
      return r
        ? { x: r.left + r.width / 2, y: r.top + r.height / 2 }
        : { x: window.innerWidth / 2, y: window.innerHeight / 3 }
    }

    let particulas = []
    const ancho = window.innerWidth
    const pocos = ancho < 640 // en celular, menos partículas y menos fuerza
    const tandas = [
      setTimeout(() => {
        const { x, y } = centro()
        particulas.push(...estallido(x, y, pocos ? 90 : 160, pocos ? 11 : 15))
      }, 380),
      setTimeout(() => {
        const { x, y } = centro()
        particulas.push(...estallido(x, y, pocos ? 40 : 70, pocos ? 8 : 11))
      }, 900),
      // Dos chorros desde las esquinas de abajo, en diagonal hacia el centro
      setTimeout(() => {
        const alto = window.innerHeight
        for (const [x, dir] of [[0, 1], [window.innerWidth, -1]]) {
          const chorro = estallido(x, alto, pocos ? 30 : 55, 1)
          chorro.forEach((p) => {
            p.vx = dir * (4 + Math.random() * 7)
            p.vy = -(10 + Math.random() * 9)
          })
          particulas.push(...chorro)
        }
      }, 1250),
    ]

    let cuadro
    const dibujar = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particulas = particulas.filter((p) => p.vida < p.duracion)
      for (const p of particulas) {
        p.vida++
        p.vx *= ROCE
        p.vy = p.vy * ROCE + GRAVEDAD
        p.x += p.vx
        p.y += p.vy
        p.giro += p.vgiro

        const resto = 1 - p.vida / p.duracion
        let alfa = Math.min(1, resto * 2.5)
        if (p.titila && p.vida % 8 < 3) alfa *= 0.25
        ctx.globalAlpha = alfa
        ctx.fillStyle = p.color
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.giro)
        const t = p.tam
        if (p.forma === 'cuadro') {
          ctx.fillRect(-t / 2, -t / 2, t, t)
        } else if (p.forma === 'barra') {
          ctx.fillRect(-t, -t / 4, t * 2, t / 2)
        } else {
          ctx.fillRect(-t, -t / 6, t * 2, t / 3)
          ctx.fillRect(-t / 6, -t, t / 3, t * 2)
        }
        ctx.restore()
      }
      ctx.globalAlpha = 1
      cuadro = requestAnimationFrame(dibujar)
    }
    cuadro = requestAnimationFrame(dibujar)

    // Al terminar la última tanda se deja de dibujar
    const fin = setTimeout(() => {
      cancelAnimationFrame(cuadro)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }, 5200)

    return () => {
      tandas.forEach(clearTimeout)
      clearTimeout(fin)
      cancelAnimationFrame(cuadro)
      window.removeEventListener('resize', medir)
    }
  }, [origen, activo])

  return <canvas ref={lienzo} aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 h-full w-full" />
}
