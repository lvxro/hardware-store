import { useState } from 'react'
import Ilustracion from './Ilustracion'

// El recuadro donde se muestra un producto.
// Si existe la foto (producto.imagen, en /public/img) se muestra sobre blanco.
// Si no, queda el dibujo de línea sobre gris liso.
export default function Vitrina({ producto, categoria, className = '' }) {
  // 'probando' = todavía no sabemos si la foto existe; mientras tanto se ve el dibujo
  const [foto, setFoto] = useState(producto.imagen ? 'probando' : 'no')
  const hayFoto = foto === 'si'

  return (
    <div
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
