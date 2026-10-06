import { useEffect } from 'react'
import { Route, Routes, useLocation, Link } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Listado from './pages/Listado'
import Producto from './pages/Producto'
import Carrito from './pages/Carrito'

function NoEncontrada() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-2xl font-semibold">Esta página no existe</h1>
      <p className="mt-2 text-tenue">Revisá que el enlace esté bien escrito o volvé al inicio.</p>
      <Link
        to="/"
        className="mt-5 inline-block rounded-[3px] border border-tinta px-4 py-2 text-sm font-medium hover:bg-tinta hover:text-fondo"
      >
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
          <Route path="/producto/:id" element={<Producto />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="*" element={<NoEncontrada />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
