import { useLayoutEffect, useRef, useState } from 'react'
import Ilustracion from './Ilustracion'
import { trazar } from './animaciones'

// El recuadro donde se muestra un producto.
// Si existe la foto (producto.imagen, en /public/img) se muestra sobre blanco.
// Si no, queda el dibujo de línea sobre gris liso.
// "trazo": el dibujo se traza línea por línea al aparecer; el número es la espera en milisegundos.
export default function Vitrina({ producto, categoria, className = '', trazo = null }) {
  // 'probando' = todavía no sabemos si la foto existe; mientras tanto se ve el dibujo
  const [foto, setFoto] = useState(producto.imagen ? 'probando' : 'no')
  const hayFoto = foto === 'si'
  const caja = useRef(null)

  // Antes de que se pinte, para que el dibujo no se vea entero un instante
  useLayoutEffect(() => {
    if (trazo !== null) trazar(caja.current?.querySelector('svg.dibujo'), trazo)
  }, [trazo])

  return (
    <div
      ref={caja}
      className={`vitrina flex items-center justify-center ${hayFoto ? 'vitrina-foto' : ''} ${className}`}
    >
      {!hayFoto && (
        <Ilustracion producto={producto} categoria={categoria} className="h-full w-full p-[4%]" />
      )}
      {foto !== 'no' && (
        <img
          src={producto.imagen}
          alt=""
          onLoad={() => setFoto('si')}
          onError={() => setFoto('no')}
          className={hayFoto ? 'h-full w-full object-contain p-3' : 'hidden'}
        />
      )}
    </div>
  )
}
