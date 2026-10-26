import { useEffect } from 'react'
import { Route, Routes, useLocation, Link } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Listado from './pages/Listado'
import Producto from './pages/Producto'
import Carrito from './pages/Carrito'
import Acceso from './pages/Acceso'
import CuentaConfirmada from './pages/CuentaConfirmada'
import ResultadoPago from './pages/ResultadoPago'
import Pedidos from './pages/Pedidos'
import { useCarrito } from './data/carrito'
import { useSesion } from './data/sesion'

function NoEncontrada() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-2xl font-semibold">Esta página no existe</h1>
      <p className="mt-2 text-muted">Revisá que el enlace esté bien escrito o volvé al inicio.</p>
      <Link
        to="/"
        className="mt-5 inline-block rounded-[3px] bg-lime px-4 py-2 font-mono text-sm font-bold text-bg hover:shadow-glow"
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
  // El carrito vive acá para que el encabezado, la ficha y la página del carrito vean lo mismo
  const carrito = useCarrito()
  // La sesión del cliente (T-019) también vive acá, por la misma razón
  const sesion = useSesion()
  const { pathname } = useLocation()

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollArriba />
      <Header enCarrito={carrito.unidades} sesion={sesion} />
      <main className="flex-1">
        {/* La key hace que, al cambiar de página, el contenido nuevo entre con un fundido corto */}
        <div key={pathname} className="entra-pagina">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<Listado />} />
          <Route path="/categoria/:slug" element={<Listado />} />
          <Route path="/ofertas" element={<Listado soloOfertas />} />
          <Route
            path="/producto/:id"
            element={<Producto onAgregarAlCarrito={carrito.agregar} cantidadEnCarrito={carrito.cantidadDe} />}
          />
          <Route
            path="/carrito"
            element={
              <Carrito
                items={carrito.items}
                total={carrito.total}
                unidades={carrito.unidades}
                correo={sesion.usuario?.email}
                onCambiarCantidad={carrito.cambiarCantidad}
                onQuitar={carrito.quitar}
                onVaciar={carrito.vaciar}
              />
            }
          />
          <Route path="/ingresar" element={<Acceso modo="ingreso" sesion={sesion} />} />
          <Route path="/registro" element={<Acceso modo="registro" sesion={sesion} />} />
          <Route path="/cuenta-confirmada" element={<CuentaConfirmada sesion={sesion} />} />
          <Route path="/pedidos" element={<Pedidos sesion={sesion} />} />
          <Route path="/compra/:estado"element={<ResultadoPago onVaciarCarrito={carrito.vaciar} />} />
          <Route path="*" element={<NoEncontrada />} />
        </Routes>
        </div>
      </main>
      <Footer />
    </div>
  )
}
