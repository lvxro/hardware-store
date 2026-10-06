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
    <div className="mx-auto max-w-7xl px-4 py-16">
      <h1 className="subtitular text-3xl">Esta página no existe</h1>
      <p className="mt-3 text-tenue">Revisá que el enlace esté bien escrito o volvé al inicio.</p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-lg bg-aura px-5 py-3 font-semibold text-sobre-aura hover:opacity-90"
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
