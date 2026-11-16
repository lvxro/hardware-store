import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTitulo } from '../data/titulo'

// Guía de uso (/guia): una guía corta para comprar y otra para administrar la tienda.
// Cada paso es { titulo, texto }. Para cambiar un texto, editalo acá; para agregar un paso, sumá otro { ... } a la lista.

const vinculo = 'text-lime underline'

const COMPRAR = [
  {
    titulo: 'Buscá lo que necesitás',
    texto: (
      <>
        Usá el buscador de arriba (por marca o modelo) o elegí una categoría del menú. Dentro de cada categoría podés ordenar por
        precio, filtrar por marca y poner un precio mínimo y máximo. Si buscás precios más bajos, mirá las{' '}
        <Link to="/ofertas" className={vinculo}>Ofertas</Link>.
      </>
    ),
  },
  {
    titulo: 'Mirá la ficha del producto',
    texto: 'Tocá un producto para ver sus especificaciones, el precio de lista, el precio en efectivo y las cuotas disponibles.',
  },
  {
    titulo: '¿Dudás entre dos? Compará',
    texto: (
      <>
        En el{' '}
        <Link to="/comparador" className={vinculo}>Comparador</Link>{' '}
        elegís una categoría y dos productos, y ves sus especificaciones lado a lado. En cada fila se marca el mejor valor.
      </>
    ),
  },
  {
    titulo: '¿Armás una PC? Usá Arma tu PC',
    texto: (
      <>
        En{' '}
        <Link to="/arma-tu-pc" className={vinculo}>Arma tu PC</Link>{' '}
        elegís procesador, placa madre, memoria RAM y placa de video. La tienda te avisa si algo no es compatible (por ejemplo, el
        socket o el tipo de memoria) y podés agregar todo al carrito de una vez.
      </>
    ),
  },
  {
    titulo: 'Guardá tus favoritos',
    texto: (
      <>
        Tocá el corazón de un producto para guardarlo. Los encontrás en{' '}
        <Link to="/favoritos" className={vinculo}>Favoritos</Link>, donde podés pasarlos al carrito.
      </>
    ),
  },
  {
    titulo: 'Creá tu cuenta',
    texto: (
      <>
        Para pagar necesitás una cuenta.{' '}
        <Link to="/registro" className={vinculo}>Creala acá</Link>{' '}
        y confirmá tu correo con el enlace que te llega. Si te olvidaste la contraseña, podés{' '}
        <Link to="/recuperar-contrasena" className={vinculo}>recuperarla</Link>.
      </>
    ),
  },
  {
    titulo: 'Revisá tu carrito',
    texto: (
      <>
        En el{' '}
        <Link to="/carrito" className={vinculo}>Carrito</Link>{' '}
        podés cambiar cantidades o quitar productos. Si algún producto se quedó sin stock, tenés que sacarlo antes de pagar.
      </>
    ),
  },
  {
    titulo: 'Pagá con Mercado Pago',
    texto:
      'Tocá "Pagar con Mercado Pago". Pagás en el sitio de Mercado Pago y, cuando termina, volvés a la tienda. Te mandamos el comprobante por correo.',
  },
  {
    titulo: 'Seguí tu pedido',
    texto: (
      <>
        En{' '}
        <Link to="/mis-pedidos" className={vinculo}>Mis pedidos</Link>{' '}
        ves todas tus compras y su estado: Pendiente, Aprobado, Rechazado, etc.
      </>
    ),
  },
]

const ADMINISTRAR = [
  {
    titulo: 'Entrá al panel',
    texto: (
      <>
        <Link to="/ingresar" className={vinculo}>Iniciá sesión</Link>{' '}
        con una cuenta administradora. En el menú de tu cuenta aparece el botón &quot;Panel de administración&quot;, o podés ir directo a{' '}
        <Link to="/admin" className={vinculo}>/admin</Link>. Si dice que tu cuenta no es administradora, hay que agregar tu correo a la
        tabla <span className="font-mono">administradores</span> de Supabase.
      </>
    ),
  },
  {
    titulo: 'Mirá el resumen de productos',
    texto:
      'En la pestaña Productos ves cuántos productos hay, cuántos están sin stock y cuántos tienen stock bajo (3 o menos). Tocá una de esas alertas para filtrar la lista, o usá el buscador por nombre o código.',
  },
  {
    titulo: 'Cambiá el stock',
    texto:
      'En cada producto usá los botones − y + (o escribí el número) y tocá Guardar. El cambio se guarda en la base de datos.',
  },
  {
    titulo: 'Cargá, editá o borrá productos',
    texto:
      'Con "Nuevo producto" abrís el formulario para cargar uno. Con "Editar" modificás uno existente. Para borrar, la tienda te pide confirmar antes, porque no se puede deshacer.',
  },
  {
    titulo: 'Controlá las ventas',
    texto:
      'En la pestaña Pedidos ves lo vendido, las ventas aprobadas, las de hoy y los pedidos pendientes de pago. Podés filtrar por estado y buscar por correo, número de pedido, operación o producto. Tocá un pedido para ver su detalle.',
  },
  {
    titulo: 'Tené en cuenta cuándo se ven los cambios',
    texto:
      'En tu navegador ves los cambios al recargar. Los demás visitantes pueden tardar unos minutos, porque la tienda guarda una copia del catálogo para cargar más rápido.',
  },
]

function Pasos({ lista }) {
  return (
    <ol className="mt-6 space-y-3">
      {lista.map((paso, i) => (
        <li key={paso.titulo} className="flex gap-4 rounded-[3px] border border-line bg-surface p-4">
          <span className="font-mono text-lg font-bold text-lime" aria-hidden="true">
            {String(i + 1).padStart(2, '0')}
          </span>
          <div>
            <h2 className="font-semibold">{paso.titulo}</h2>
            <p className="mt-1 text-sm text-muted sm:text-base">{paso.texto}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

export default function Guia() {
  useTitulo('Guía de uso')
  const [para, setPara] = useState('comprar')

  const pestana = (activa) =>
    `rounded-[3px] border px-3 py-1.5 text-sm ${
      activa ? 'border-lime bg-lime font-bold text-bg' : 'border-line-strong text-muted hover:border-line-hover hover:text-white'
    }`

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold sm:text-4xl">Guía de uso</h1>
      <p className="mt-1 text-muted">Lo básico para comprar y para administrar la tienda, en pocos pasos.</p>

      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Elegí una guía">
        <button type="button" aria-pressed={para === 'comprar'} onClick={() => setPara('comprar')} className={pestana(para === 'comprar')}>
          Para comprar
        </button>
        <button type="button" aria-pressed={para === 'administrar'} onClick={() => setPara('administrar')} className={pestana(para === 'administrar')}>
          Para administrar
        </button>
      </div>

      <Pasos lista={para === 'comprar' ? COMPRAR : ADMINISTRAR} />

      <p className="mt-8 text-sm text-muted">
        Más información en los{' '}
        <Link to="/terminos" className={vinculo}>Términos y condiciones</Link> y en la{' '}
        <Link to="/seguridad" className={vinculo}>Política de seguridad</Link>.
      </p>
    </div>
  )
}
