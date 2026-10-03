import { useEffect } from 'react'
import { Route, Routes, useLocation, Link } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import Listado from './pages/Listado'

// Lugar reservado para la ficha de Gabriel (T-012).
// Cuando tenga Producto.jsx, se reemplaza por: import Producto from './pages/Producto'
function ProductoPendiente() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Ficha de producto</h1>
      <p className="mt-2 text-tenue">Esta página está en desarrollo (T-012).</p>
    </div>
  )
}

function NoEncontrada() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Esta página no existe</h1>
      <Link to="/" className="mt-4 inline-block font-medium text-pcb hover:underline">
        Ir al inicio
      </Link>
    </div>
  )
}

// Al cambiar de página, vuelve al principio
function ScrollArriba() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollArriba />
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<Listado />} />
          <Route path="/categoria/:slug" element={<Listado />} />
          <Route path="/producto/:id" element={<ProductoPendiente />} />
          <Route path="*" element={<NoEncontrada />} />
        </Routes>
      </main>
      <footer className="mt-16 border-t border-linea bg-superficie">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 px-4 py-6 text-sm text-tenue">
          <span>Tienda PC</span>
          <span>Precios de referencia en dólares estadounidenses.</span>
        </div>
      </footer>
    </div>
  )
}
