import { useState } from 'react'
import Ilustracion from './Ilustracion'
import { auraDe } from '../data/auras'

// El recuadro donde se muestra un producto.
// Si existe la foto (producto.imagen, en /public/img) se muestra sobre blanco.
// Si no, queda el dibujo sobre fondo oscuro con el brillo del color de la marca.
export default function Vitrina({ producto, categoria, className = '', libre = false, respira = false }) {
  // 'probando' = todavía no sabemos si la foto existe; mientras tanto se ve el dibujo
  const [foto, setFoto] = useState(producto.imagen ? 'probando' : 'no')
  const { h1, h2 } = auraDe(producto)
  const hayFoto = foto === 'si'

  const clases = [
    'vitrina flex items-center justify-center',
    hayFoto ? 'vitrina-foto' : '',
    libre ? 'vitrina-libre' : '',
    respira ? 'vitrina-respira' : '',
    className,
  ].join(' ')

  return (
    <div className={clases} style={{ '--h1': h1, '--h2': h2 }}>
      {!hayFoto && (
        <Ilustracion producto={producto} categoria={categoria} className="h-full w-full p-[7%]" />
      )}
      {foto !== 'no' && (
        <img
          src={producto.imagen}
          alt=""
          onLoad={() => setFoto('si')}
          onError={() => setFoto('no')}
          className={hayFoto ? 'h-full w-full object-contain p-4' : 'hidden'}
        />
      )}
    </div>
  )
}
