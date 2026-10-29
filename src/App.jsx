import { Suspense, lazy, useEffect } from 'react'
import { Route, Routes, useLocation, Link } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Listado from './pages/Listado'
import { useCarrito } from './data/carrito'
import { useSesion } from './data/sesion'
import { useTitulo } from './data/titulo'
import { FavoritosContext, useFavoritos } from './data/favoritos'

// T-028: el inicio y los listados vienen en el archivo principal; el resto de las páginas se baja
// recién cuando hace falta, así la primera carga pesa menos (sobre todo en el celular).
const cargarProducto = () => import('./pages/Producto')
const cargarCarrito = () => import('./pages/Carrito')
const Producto = lazy(cargarProducto)
const Carrito = lazy(cargarCarrito)
const Favoritos = lazy(() => import('./pages/Favoritos'))
const Acceso = lazy(() => import('./pages/Acceso'))
const CuentaConfirmada = lazy(() => import('./pages/CuentaConfirmada'))
const RecuperarContrasena = lazy(() => import('./pages/RecuperarContrasena'))
const NuevaContrasena = lazy(() => import('./pages/NuevaContrasena'))
const ResultadoPago = lazy(() => import('./pages/ResultadoPago'))
const Admin = lazy(() => import('./pages/Admin'))
const MisPedidos = lazy(() => import('./pages/MisPedidos'))

// Con la página ya dibujada y el navegador libre, se adelanta la ficha y el carrito,
// que son a donde más se va después. Así, al tocar un producto, ya está.
function useAdelantarPaginas() {
  useEffect(() => {
    const adelantar = () => {
      cargarProducto()
      cargarCarrito()
    }
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(adelantar, { timeout: 4000 })
      return () => cancelIdleCallback(id)
    }
    const id = setTimeout(adelantar, 2500)
    return () => clearTimeout(id)
  }, [])
}

// Mientras baja una página, un espacio vacío del alto de la pantalla (sin "Cargando…" que parpadee)
const Esperando = () => <div className="min-h-[60vh]" aria-busy="true" />

function NoEncontrada() {
  useTitulo('Página no encontrada')
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
  // Los favoritos (T-027) también, y llegan a cada tarjeta por contexto
  const favoritos = useFavoritos()
  const { pathname } = useLocation()
  useAdelantarPaginas()
  // T-029: los productos del carrito, para revisar compatibilidad en listados y fichas
  const enCarrito = carrito.items.map((i) => i.producto)

  return (
    <FavoritosContext.Provider value={favoritos}>
    <div className="flex min-h-screen flex-col">
      <ScrollArriba />
      <Header enCarrito={carrito.unidades} enFavoritos={favoritos.cantidad} sesion={sesion} />
      <main className="flex-1">
        {/* La key hace que, al cambiar de página, el contenido nuevo entre con un fundido corto */}
        <div key={pathname} className="entra-pagina">
        <Suspense fallback={<Esperando />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<Listado enCarrito={enCarrito} />} />
          <Route path="/categoria/:slug" element={<Listado enCarrito={enCarrito} />} />
          <Route path="/ofertas" element={<Listado soloOfertas enCarrito={enCarrito} />} />
          <Route
            path="/producto/:id"
            element={<Producto onAgregarAlCarrito={carrito.agregar} cantidadEnCarrito={carrito.cantidadDe} enCarrito={enCarrito} />}
          />
          <Route
            path="/carrito"
            element={
              <Carrito
                items={carrito.items}
                total={carrito.total}
                unidades={carrito.unidades}
                correo={sesion.usuario?.email}
                hayAgotados={carrito.hayAgotados}
                onCambiarCantidad={carrito.cambiarCantidad}
                onQuitar={carrito.quitar}
                onVaciar={carrito.vaciar}
              />
            }
          />
          <Route path="/ingresar" element={<Acceso modo="ingreso" sesion={sesion} />} />
          <Route path="/registro" element={<Acceso modo="registro" sesion={sesion} />} />
          <Route path="/cuenta-confirmada" element={<CuentaConfirmada sesion={sesion} />} />
          <Route path="/recuperar-contrasena" element={<RecuperarContrasena sesion={sesion} />} />
          <Route path="/nueva-contrasena" element={<NuevaContrasena sesion={sesion} />} />
          <Route path="/compra/:estado" element={<ResultadoPago nombre={sesion.nombre} onVaciarCarrito={carrito.vaciar} />} />
          <Route
            path="/favoritos"
            element={<Favoritos onAgregarAlCarrito={carrito.agregar} cantidadEnCarrito={carrito.cantidadDe} />}
          />
          <Route path="/admin" element={<Admin sesion={sesion} />} />
          <Route path="/mis-pedidos" element={<MisPedidos sesion={sesion} />} />
          <Route path="*" element={<NoEncontrada />} />
        </Routes>
        </Suspense>
        </div>
      </main>
      <Footer />
    </div>
    </FavoritosContext.Provider>
  )
}
