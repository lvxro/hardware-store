import { Link } from 'react-router-dom'
import { useTitulo } from '../data/titulo'

// Páginas "Términos y condiciones" (/terminos) y "Política de seguridad" (/seguridad).
// Los textos se basan en cómo funciona hoy la tienda (pagos con Mercado Pago, cuentas con Supabase, etc.)
// y en la Ley 24.240 de Defensa del Consumidor. Conviene que los revise un abogado antes de darlos por definitivos.

// COMPLETÁ ESTOS DATOS. Lo que dejes vacío no se muestra en la página.
// El correo es el más importante: es por donde el cliente ejerce el arrepentimiento, la garantía o un reclamo.
const NEGOCIO = {
  razonSocial: 'Aura Ware S.R.L.',
  cuit: '30-00000000-0',
  domicilio: 'Calle Falsa 123, Mendoza, Argentina',
  email: 'contacto@ejemplo.com',
}
}

const ACTUALIZADO = '16 de noviembre de 2026'

function Seccion({ titulo, children }) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold">{titulo}</h2>
      <div className="mt-2 space-y-3 text-muted">{children}</div>
    </section>
  )
}

function Lista({ items }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

function Contacto({ para }) {
  return NEGOCIO.email ? (
    <p>
      {para} escribinos a{' '}
      <a href={`mailto:${NEGOCIO.email}`} className="text-lime underline">
        {NEGOCIO.email}
      </a>
      .
    </p>
  ) : (
    <p>{para} escribinos por los canales de contacto de la tienda.</p>
  )
}

function Titular() {
  const datos = [
    ['Titular', NEGOCIO.razonSocial],
    ['CUIT', NEGOCIO.cuit],
    ['Domicilio', NEGOCIO.domicilio],
    ['Correo', NEGOCIO.email],
  ].filter(([, valor]) => valor)
  if (datos.length === 0) return null
  return (
    <dl className="mt-4 grid max-w-md grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-[3px] border border-line bg-surface p-4 text-sm">
      {datos.map(([etiqueta, valor]) => (
        <div key={etiqueta} className="contents">
          <dt className="text-muted">{etiqueta}</dt>
          <dd>{valor}</dd>
        </div>
      ))}
    </dl>
  )
}

function Terminos() {
  return (
    <>
      <Seccion titulo="1. Quiénes somos">
        <p>
          aura/ware es una tienda online de componentes y periféricos para PC: procesadores, placas madre, memorias RAM,
          placas de video, monitores, teclados y mouses. Estos términos rigen el uso del sitio y las compras que hagas en él.
        </p>
      </Seccion>

      <Seccion titulo="2. Tu cuenta">
        <p>Podés recorrer el catálogo sin cuenta, pero para comprar y ver tus pedidos necesitás crear una y confirmar tu correo.</p>
        <Lista
          items={[
            'Los datos que cargues tienen que ser verdaderos y estar actualizados.',
            'Sos responsable de mantener tu contraseña en secreto y de lo que se haga con tu cuenta.',
            'Si sospechás que alguien entró a tu cuenta, cambiá la contraseña y avisanos.',
          ]}
        />
      </Seccion>

      <Seccion titulo="3. Precios y disponibilidad">
        <Lista
          items={[
            'Los precios están en pesos argentinos y se calculan con el dólar oficial, por lo que pueden cambiar.',
            'El precio y el stock que valen son los que se confirman al momento de pagar.',
            'Las imágenes del sitio son ilustrativas; las características de cada producto figuran en su ficha.',
            'Si un producto se agota mientras comprás, te lo vamos a informar antes de cobrarte.',
          ]}
        />
      </Seccion>

      <Seccion titulo="4. Pagos">
        <p>
          El pago se hace a través de Mercado Pago, que es quien procesa los datos de tu tarjeta o medio de pago. En
          aura/ware no vemos ni guardamos esos datos.
        </p>
        <p>
          Los descuentos por pago en efectivo o transferencia y las cuotas sin interés (hoy, hasta 6 con Mercado Pago) se muestran en
          cada producto y en el carrito. Si alguna opción de cuotas tiene interés, se informa antes de que confirmes el pago.
        </p>
        <p>
          Cuando el pago se aprueba, te enviamos un comprobante por correo y el pedido queda registrado en{' '}
          <Link to="/mis-pedidos" className="text-lime underline">Mis pedidos</Link>.
        </p>
      </Seccion>

      <Seccion titulo="5. Envíos">
        <p>
          El envío es gratis a partir del monto mínimo que figura en la parte superior del sitio. Los costos y plazos de entrega,
          cuando corresponden, se informan antes de confirmar la compra.
        </p>
        <p>Revisá el producto al recibirlo. Si llegó dañado o no es el que pediste, avisanos cuanto antes.</p>
      </Seccion>

      <Seccion titulo="6. Arrepentimiento (devolución de la compra)">
        <p>
          Como la compra es a distancia, tenés derecho a arrepentirte dentro de los 10 días corridos desde que recibís el producto
          (artículo 34 de la Ley 24.240), sin necesidad de dar una razón. Te devolvemos lo que pagaste por el mismo medio de pago.
        </p>
        <Contacto para="Para pedirlo," />
        <p>Te recomendamos conservar el embalaje original del producto.</p>
      </Seccion>

      <Seccion titulo="7. Garantía">
        <p>
          Los productos nuevos tienen garantía legal de 6 meses desde la entrega (artículo 11 de la Ley 24.240), o la garantía del
          fabricante si es mayor.
        </p>
        <Contacto para="Para hacer un reclamo de garantía, indicá tu número de pedido y qué falla tiene el producto:" />
      </Seccion>

      <Seccion titulo="8. Tus datos">
        <p>
          Cómo cuidamos tu información y qué datos guardamos está explicado en la{' '}
          <Link to="/seguridad" className="text-lime underline">Política de seguridad</Link>.
        </p>
      </Seccion>

      <Seccion titulo="9. Contenido y marcas">
        <p>
          El diseño, los textos y el nombre aura/ware son de la tienda. Las marcas y los nombres de productos de terceros
          (AMD, Intel, NVIDIA, etc.) pertenecen a sus dueños y se usan solo para identificar los productos.
        </p>
      </Seccion>

      <Seccion titulo="10. Cambios en estos términos">
        <p>
          Podemos actualizar estos términos. Siempre se muestra arriba la fecha de la última actualización, y lo que rige para cada
          compra es la versión vigente al momento de hacerla.
        </p>
      </Seccion>

      <Seccion titulo="11. Ley aplicable">
        <p>
          Estos términos se rigen por las leyes de la República Argentina, en especial la Ley 24.240 de Defensa del Consumidor.
          Eso no limita ningún derecho que la ley te reconozca como consumidor.
        </p>
      </Seccion>
    </>
  )
}

function Seguridad() {
  return (
    <>
      <Seccion titulo="1. Conexión segura">
        <Lista
          items={[
            'El sitio funciona siempre con HTTPS: lo que enviás viaja cifrado.',
            'No se puede abrir dentro de otra página (para evitar engaños que imitan a la tienda).',
            'El navegador solo carga contenido de orígenes permitidos por la tienda, lo que ayuda a evitar código ajeno.',
          ]}
        />
      </Seccion>

      <Seccion titulo="2. Pagos">
        <p>
          Pagás en el sitio de Mercado Pago. Los datos de tu tarjeta los ingresás ahí y no pasan por aura/ware ni los guardamos.
        </p>
        <p>
          Antes de cobrar, el servidor vuelve a verificar el precio y el stock de cada producto, y al volver de Mercado Pago
          confirmamos con ellos el estado del pago. Así el pedido queda al día aunque el aviso tarde.
        </p>
      </Seccion>

      <Seccion titulo="3. Tu cuenta">
        <Lista
          items={[
            'La cuenta se maneja con un servicio de autenticación (Supabase Auth). Tu contraseña no la vemos y se guarda cifrada de forma irreversible.',
            'Para activar la cuenta confirmás tu correo con un enlace.',
            'Si olvidás la contraseña, te mandamos un enlace al correo para crear una nueva. El enlace vence y sirve una sola vez.',
            'La sesión queda abierta en tu navegador para que no tengas que ingresar cada vez. Si usás una computadora compartida, cerrá sesión al terminar.',
          ]}
        />
      </Seccion>

      <Seccion titulo="4. Qué datos guardamos">
        <Lista
          items={[
            'De tu cuenta: nombre y correo electrónico.',
            'De tus compras: los productos, los montos y el estado de cada pedido. Te mandamos un comprobante por correo.',
            'En tu navegador: el carrito, tus favoritos y una copia temporal del catálogo para que el sitio cargue más rápido. Esto queda en tu dispositivo y lo podés borrar desde el navegador.',
          ]}
        />
        <p>Mercado Pago recibe los datos necesarios para procesar tu pago, según sus propias políticas.</p>
      </Seccion>

      <Seccion titulo="5. Para qué usamos tus datos">
        <p>Los usamos para procesar tus pedidos, enviarte el comprobante, darte acceso a Mis pedidos y responder tus consultas.</p>
        <p>
          No vendemos tus datos. Solo los compartimos con los servicios que hacen falta para operar la tienda (por ejemplo, el
          procesador de pagos, el alojamiento del sitio, la base de datos y el envío de correos).
        </p>
      </Seccion>

      <Seccion titulo="6. Tus derechos">
        <p>
          Según la Ley 25.326 de Protección de los Datos Personales, podés pedir acceder a tus datos, corregirlos o que los
          eliminemos.
        </p>
        <Contacto para="Para hacerlo," />
        <p>
          La Agencia de Acceso a la Información Pública es el órgano de control de esa ley y atiende denuncias y reclamos de las
          personas titulares de los datos.
        </p>
      </Seccion>

      <Seccion titulo="7. Qué podés hacer vos">
        <Lista
          items={[
            'Usá una contraseña única, que no uses en otros sitios.',
            'No te vamos a pedir tu contraseña ni los datos de tu tarjeta por correo o mensaje. Si te llega algo así, no lo respondas.',
            'Antes de pagar, fijate que estés en Mercado Pago y que la dirección empiece con https://.',
          ]}
        />
      </Seccion>

      <Seccion titulo="8. Si encontrás un problema de seguridad">
        <Contacto para="Si ves algo raro en el sitio o creés haber encontrado una falla," />
        <p>Lo revisamos lo antes posible.</p>
      </Seccion>

      <Seccion titulo="9. Cambios">
        <p>Podemos actualizar esta política. Siempre se muestra arriba la fecha de la última actualización.</p>
      </Seccion>
    </>
  )
}

export default function Legal({ tipo }) {
  const esTerminos = tipo === 'terminos'
  useTitulo(esTerminos ? 'Términos y condiciones' : 'Política de seguridad')

  const pestana = (activa) =>
    `rounded-[3px] border px-3 py-1.5 text-sm ${
      activa ? 'border-lime bg-lime font-bold text-bg' : 'border-line-strong text-muted hover:border-line-hover hover:text-white'
    }`

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex flex-wrap gap-2">
        <Link to="/terminos" className={pestana(esTerminos)} aria-current={esTerminos ? 'page' : undefined}>
          Términos y condiciones
        </Link>
        <Link to="/seguridad" className={pestana(!esTerminos)} aria-current={!esTerminos ? 'page' : undefined}>
          Política de seguridad
        </Link>
      </div>

      <h1 className="text-3xl font-semibold sm:text-4xl">{esTerminos ? 'Términos y condiciones' : 'Política de seguridad'}</h1>
      <p className="mt-1 text-sm text-muted">Última actualización: {ACTUALIZADO}</p>
      {esTerminos && <Titular />}

      {esTerminos ? <Terminos /> : <Seguridad />}
    </div>
  )
}
