import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import productos from "../data/productos.json";
import { formatoPrecio, productosDe } from "../data/catalogo";
import {
  CUOTAS,
  ENVIO_GRATIS_DESDE,
  PORCENTAJE_EFECTIVO,
  aPesos,
  precioEfectivo as calcularEfectivo,
} from "../data/reglas";
import { CAMPOS_BASE, formatearCampo, formatearValor } from "../data/campos";
import Vitrina from "../components/Vitrina";

const NOMBRES_CATEGORIA = {
  procesadores: "Procesadores",
  placas_de_video: "Placas de video",
  memorias_ram: "Memorias RAM",
  placas_base: "Placas madre",
  monitores: "Monitores",
  teclados: "Teclados",
  mouses: "Mouses",
};

function formatearPesos(numero) {
  return formatoPrecio(Math.round(numero));
}

function buscarProducto(id) {
  for (const [categoria, lista] of Object.entries(productos)) {
    const producto = lista.find((item) => item.id === id);
    if (producto) return { producto, categoria };
  }
  return null;
}

function IconoCamion() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5 shrink-0"
      aria-hidden="true"
    >
      <path d="M3 6a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v2h3.2a1 1 0 0 1 .8.4l2.4 3.2a1 1 0 0 1 .2.6V16a1 1 0 0 1-1 1h-.6a2.5 2.5 0 0 1-4.8 0H9.4a2.5 2.5 0 0 1-4.8 0H4a1 1 0 0 1-1-1V6Zm12 4v3h4.5L18 10h-3ZM7 16a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm10 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" />
    </svg>
  );
}

function FichaContenido({ id, onAgregarAlCarrito }) {
  const [cantidad, setCantidad] = useState(1);
  const [codigoPostal, setCodigoPostal] = useState("");
  const [mensajeEnvio, setMensajeEnvio] = useState("");
  const [agregado, setAgregado] = useState(false);

  const resultado = buscarProducto(id);

  if (!resultado) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <h1 className="text-2xl font-semibold">Producto no encontrado</h1>
        <p className="mt-2 text-tenue">
          Revisá que el enlace esté bien escrito o buscalo desde el inicio.
        </p>
        <Link
          to="/"
          className="mt-5 inline-block rounded-[3px] border border-tinta px-4 py-2 font-sans text-sm font-medium hover:bg-tinta hover:text-fondo"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  const { producto, categoria } = resultado;
  const nombreCategoria = NOMBRES_CATEGORIA[categoria] ?? categoria;

  const precioLista = aPesos(producto.precio_usd_aprox);
  const precioEfectivo = calcularEfectivo(precioLista);

  const especificaciones = Object.entries(producto).filter(
    ([clave]) => !CAMPOS_BASE.includes(clave)
  );

  // Para la tabla comparativa: este producto primero y después otros cinco de la categoría
  const deLaCategoria = productosDe(categoria);
  const este = deLaCategoria.find((otro) => otro.id === producto.id);
  const comparados = [
    este,
    ...deLaCategoria.filter((otro) => otro.id !== producto.id).slice(0, 5),
  ];

  const agregar = () => {
    onAgregarAlCarrito?.(producto, cantidad);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2000);
  };

  const calcularEnvio = () => {
    if (!/^\d{4}$/.test(codigoPostal)) {
      setMensajeEnvio("Ingresá un código postal de 4 dígitos.");
      return;
    }
    setMensajeEnvio(
      `El costo de envío al CP ${codigoPostal} se calcula al finalizar la compra.`
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <nav className="font-sans text-sm text-tenue" aria-label="Ruta">
        <Link to="/" className="hover:text-tinta hover:underline">
          Inicio
        </Link>
        <span className="mx-2">/</span>
        <Link
          to={`/categoria/${categoria}`}
          className="hover:text-tinta hover:underline"
        >
          {nombreCategoria}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-tinta">{producto.modelo}</span>
      </nav>

      <div className="mt-5 grid gap-x-12 gap-y-6 lg:grid-cols-[1.15fr_1fr]">
        <div className="min-w-0">
          {/* En compu la imagen queda fija mientras se recorre la columna de compra */}
          <div className="lg:sticky lg:top-6">
            <Vitrina
              producto={producto}
              categoria={categoria}
              className="aspect-[4/3] w-full"
            />
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-sm text-tenue">{producto.marca}</p>
          <h1 className="text-2xl font-semibold sm:text-3xl">
            {producto.modelo}
          </h1>
          <p className="mt-2 text-tenue">{producto.descripcion}</p>

          {/* Precios: renglones separados por líneas, sin recuadro */}
          <dl className="mt-5 tabular-nums">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 border-t border-linea py-3">
              <dt>
                <span className="block font-medium">Precio efectivo</span>
                <span className="block text-sm text-tenue">
                  Por pago en efectivo o transferencia, {PORCENTAJE_EFECTIVO}%
                  menos
                </span>
              </dt>
              <dd className="text-3xl font-semibold text-pcb">
                {formatearPesos(precioEfectivo)}
              </dd>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 border-t border-linea py-3">
              <dt>
                <span className="block font-medium">Precio de lista</span>
                <span className="block text-sm text-tenue">
                  Todas las tarjetas de crédito bancarias
                </span>
              </dt>
              <dd className="text-xl font-semibold">
                {formatearPesos(precioLista)}
              </dd>
            </div>
          </dl>

          <table className="w-full border-t border-linea text-sm tabular-nums">
            <caption className="pb-2 pt-3 text-left font-sans font-medium">
              Cuotas con Mercado Pago
            </caption>
            <thead>
              <tr className="border-b border-linea text-xs text-tenue">
                <th scope="col" className="py-1.5 pr-3 text-left font-medium">
                  Plan
                </th>
                <th scope="col" className="px-3 py-1.5 text-right font-medium">
                  Cada cuota
                </th>
                <th scope="col" className="py-1.5 pl-3 text-right font-medium">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {CUOTAS.map(({ cantidad: cuotas, coeficiente }) => {
                const total = precioLista * coeficiente;
                return (
                  <tr key={cuotas} className="border-b border-linea">
                    <th scope="row" className="py-2 pr-3 text-left font-normal">
                      {cuotas} cuotas{" "}
                      {coeficiente === 1 ? "sin interés" : "fijas"}
                    </th>
                    <td className="whitespace-nowrap px-3 py-2 text-right font-medium">
                      {formatearPesos(total / cuotas)}
                    </td>
                    <td className="whitespace-nowrap py-2 pl-3 text-right text-tenue">
                      {formatearPesos(total)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="mt-5 flex items-stretch gap-3">
            <div className="flex items-center rounded-[3px] border border-linea">
              <button
                type="button"
                onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                className="h-full px-4 text-xl leading-none hover:bg-plano"
                aria-label="Restar una unidad"
              >
                −
              </button>
              <span className="w-8 text-center font-medium tabular-nums">
                {cantidad}
              </span>
              <button
                type="button"
                onClick={() => setCantidad((c) => Math.min(10, c + 1))}
                className="h-full px-4 text-xl leading-none hover:bg-plano"
                aria-label="Sumar una unidad"
              >
                +
              </button>
            </div>

            {/* El botón de comprar es uno de los tres lugares donde va el verde */}
            <button
              type="button"
              onClick={agregar}
              className="flex-1 rounded-[3px] bg-pcb px-6 py-3 font-semibold text-sobre-pcb hover:opacity-90"
            >
              {agregado ? "Agregado ✓" : "Agregar al carrito"}
            </button>
          </div>

          <div className="mt-6 border-t border-linea pt-4">
            <p className="flex items-center gap-2 text-sm font-medium text-pcb tabular-nums">
              <IconoCamion />
              Envío gratis superando los {formatearPesos(ENVIO_GRATIS_DESDE)}
            </p>

            <div className="mt-3 flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={codigoPostal}
                onChange={(e) =>
                  setCodigoPostal(e.target.value.replace(/\D/g, ""))
                }
                placeholder="Tu código postal"
                aria-label="Código postal"
                className="min-w-0 flex-1 rounded-[3px] border border-linea bg-transparent px-3 py-2 text-sm text-tinta tabular-nums placeholder:text-tenue focus:border-tinta focus:outline-none"
              />
              <button
                type="button"
                onClick={calcularEnvio}
                className="rounded-[3px] border border-tinta px-4 py-2 text-sm font-medium hover:bg-tinta hover:text-fondo"
              >
                Calcular
              </button>
            </div>
            <a
              href="https://www.correoargentino.com.ar/formularios/cpa"
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-sm text-tenue underline hover:text-tinta"
            >
              No sé mi código
            </a>
            {mensajeEnvio && (
              <p className="mt-2 text-sm font-medium" role="status">
                {mensajeEnvio}
              </p>
            )}
          </div>
        </div>
      </div>

      <section className="mt-14" aria-labelledby="especificaciones">
        <h2 id="especificaciones" className="text-lg font-semibold">
          Especificaciones
        </h2>
        <dl className="mt-3 grid gap-x-12 border-b border-linea text-sm tabular-nums sm:grid-cols-2">
          {[["marca", producto.marca], ...especificaciones].map(
            ([clave, valor]) => (
              <div
                key={clave}
                className="flex justify-between gap-4 border-t border-linea py-2.5"
              >
                <dt className="text-tenue">{formatearCampo(clave)}</dt>
                <dd className="text-right font-medium">
                  {formatearValor(valor)}
                </dd>
              </div>
            )
          )}
        </dl>
      </section>

      {este && comparados.length > 1 && (
        <section className="mt-14" aria-labelledby="comparacion">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="comparacion" className="text-lg font-semibold">
              Otras opciones en {nombreCategoria}
            </h2>
            <Link
              to={`/categoria/${categoria}`}
              className="shrink-0 font-sans text-sm font-medium underline hover:no-underline"
            >
              Ver todo
            </Link>
          </div>
          <table className="mt-3 w-full text-sm tabular-nums">
            <thead>
              <tr className="border-b border-tinta text-xs text-tenue">
                <th scope="col" className="py-2 pl-3 pr-3 text-left font-medium">
                  Modelo
                </th>
                {este.specs.map(([etiqueta], i) => (
                  <th
                    key={etiqueta}
                    scope="col"
                    className={`px-3 py-2 text-left font-medium ${
                      i === 0 ? "hidden sm:table-cell" : "hidden md:table-cell"
                    }`}
                  >
                    {etiqueta}
                  </th>
                ))}
                <th
                  scope="col"
                  className="hidden px-3 py-2 text-right font-medium sm:table-cell"
                >
                  Precio de lista
                </th>
                <th scope="col" className="py-2 pl-3 pr-3 text-right font-medium">
                  En efectivo
                </th>
              </tr>
            </thead>
            <tbody>
              {comparados.map((otro) => {
                const actual = otro.id === producto.id;
                return (
                  <tr
                    key={otro.id}
                    className={`border-b border-linea ${actual ? "bg-plano" : ""}`}
                  >
                    <th
                      scope="row"
                      className="py-2.5 pl-3 pr-3 text-left font-medium"
                    >
                      {actual ? (
                        <>
                          {otro.nombre}{" "}
                          <span className="font-normal text-tenue">
                            (este producto)
                          </span>
                        </>
                      ) : (
                        <Link
                          to={`/producto/${otro.id}`}
                          className="hover:underline"
                        >
                          {otro.nombre}
                        </Link>
                      )}
                    </th>
                    {otro.specs.map(([etiqueta, valor], i) => (
                      <td
                        key={etiqueta}
                        className={`px-3 py-2.5 ${
                          i === 0 ? "hidden sm:table-cell" : "hidden md:table-cell"
                        }`}
                      >
                        {valor}
                      </td>
                    ))}
                    <td className="hidden px-3 py-2.5 text-right sm:table-cell">
                      {formatoPrecio(otro.precio)}
                    </td>
                    <td className="py-2.5 pl-3 pr-3 text-right font-semibold text-pcb">
                      {formatoPrecio(calcularEfectivo(otro.precio))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}

export default function FichaDeProducto({ onAgregarAlCarrito }) {
  const { id } = useParams();
  // key={id} reinicia cantidad, código postal e imagen al cambiar de producto
  return <FichaContenido key={id} id={id} onAgregarAlCarrito={onAgregarAlCarrito} />;
}
