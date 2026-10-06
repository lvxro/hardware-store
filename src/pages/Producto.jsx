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
import Vitrina from "../components/Vitrina";
import ProductoCard from "../components/ProductoCard";

const CAMPOS_BASE = [
  "id",
  "marca",
  "modelo",
  "nombre",
  "precio_usd_aprox",
  "imagen",
  "descripcion",
];

const NOMBRES_CATEGORIA = {
  procesadores: "Procesadores",
  placas_de_video: "Placas de video",
  memorias_ram: "Memorias RAM",
  placas_base: "Placas madre",
  monitores: "Monitores",
  teclados: "Teclados",
  mouses: "Mouses",
};

const PALABRAS = {
  nucleos: "núcleos",
  tdp: "TDP",
  cache: "caché",
  l3: "L3",
  tamano: "tamaño",
  resolucion: "resolución",
  configuracion: "configuración",
  conexion: "conexión",
  iluminacion: "iluminación",
  dpi: "DPI",
  max: "máx.",
  wifi: "WiFi",
};

const UNIDADES = {
  w: "W",
  ghz: "GHz",
  mhz: "MHz",
  hz: "Hz",
  mb: "MB",
  gb: "GB",
  ms: "ms",
  g: "g",
};

function formatearCampo(clave) {
  const partes = clave.split("_");
  let unidad = "";

  if (partes.length > 1 && UNIDADES[partes[partes.length - 1]]) {
    unidad = ` (${UNIDADES[partes.pop()]})`;
  }

  const texto = partes.map((parte) => PALABRAS[parte] ?? parte).join(" ");
  return texto.charAt(0).toUpperCase() + texto.slice(1) + unidad;
}

function formatearValor(valor) {
  if (typeof valor === "boolean") return valor ? "Sí" : "No";
  return String(valor);
}

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
      <div className="mx-auto max-w-7xl px-4 py-16">
        <h1 className="subtitular text-3xl">Producto no encontrado</h1>
        <p className="mt-3 text-tenue">
          Revisá que el enlace esté bien escrito o buscalo desde el inicio.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-lg bg-aura px-5 py-3 font-semibold text-sobre-aura hover:opacity-90"
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

  const parecidos = productosDe(categoria)
    .filter((otro) => otro.id !== producto.id)
    .slice(0, 4);

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
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="text-sm text-tenue" aria-label="Ruta">
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

      <div className="mt-6 grid gap-x-12 gap-y-8 lg:grid-cols-[1.15fr_1fr]">
        <div className="min-w-0">
          {/* En compu la imagen queda fija mientras se recorre la columna de compra */}
          <div className="lg:sticky lg:top-6">
            <Vitrina
              producto={producto}
              categoria={categoria}
              className="aspect-[4/3] w-full rounded-2xl"
            />
          </div>
        </div>

        <div className="min-w-0">
          <p className="font-medium text-tenue">{producto.marca}</p>
          <h1 className="subtitular mt-1 text-3xl sm:text-4xl">
            {producto.modelo}
          </h1>
          <p className="mt-4 text-lg text-tenue">{producto.descripcion}</p>

          <div className="mt-6 rounded-xl border border-linea bg-superficie">
            <div className="p-5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <p className="text-4xl font-bold tabular-nums">
                  {formatearPesos(precioEfectivo)}
                </p>
                <span className="rounded-full bg-pcb-claro px-3 py-1 text-sm font-semibold text-pcb">
                  {PORCENTAJE_EFECTIVO}% menos
                </span>
              </div>
              <p className="mt-1 text-sm text-tenue">
                Precio efectivo, por pago en efectivo o transferencia
              </p>
            </div>

            <div className="border-t border-linea p-5">
              <p className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-xl font-bold tabular-nums">
                  {formatearPesos(precioLista)}
                </span>
                <span className="text-sm text-tenue">
                  Precio de lista, todas las tarjetas de crédito bancarias
                </span>
              </p>

              <p className="mt-5 text-sm font-semibold">Cuotas con Mercado Pago</p>
              <ul className="mt-2 text-sm">
                {CUOTAS.map(({ cantidad: cuotas, coeficiente }) => {
                  const total = precioLista * coeficiente;
                  const sinInteres = coeficiente === 1;
                  return (
                    <li
                      key={cuotas}
                      className="flex flex-wrap items-baseline justify-between gap-x-3 border-t border-linea py-2.5"
                    >
                      <span>
                        {cuotas} cuotas {sinInteres ? "sin interés" : "fijas"} de{" "}
                        <strong className="tabular-nums">
                          {formatearPesos(total / cuotas)}
                        </strong>
                      </span>
                      <span
                        className={`shrink-0 tabular-nums ${
                          sinInteres ? "font-medium text-pcb" : "text-tenue"
                        }`}
                      >
                        Total {formatearPesos(total)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="mt-5 flex items-stretch gap-3">
            <div className="flex items-center rounded-lg border border-linea bg-superficie">
              <button
                type="button"
                onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                className="h-full rounded-l-lg px-4 text-xl leading-none hover:bg-fondo"
                aria-label="Restar una unidad"
              >
                −
              </button>
              <span className="w-8 text-center font-semibold tabular-nums">
                {cantidad}
              </span>
              <button
                type="button"
                onClick={() => setCantidad((c) => Math.min(10, c + 1))}
                className="h-full rounded-r-lg px-4 text-xl leading-none hover:bg-fondo"
                aria-label="Sumar una unidad"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={agregar}
              className="flex-1 rounded-lg bg-aura px-6 py-4 text-lg font-semibold text-sobre-aura hover:opacity-90"
            >
              {agregado ? "Agregado ✓" : "Agregar al carrito"}
            </button>
          </div>

          <div className="mt-5 rounded-xl border border-linea bg-superficie p-5">
            <p className="flex items-center gap-2 font-semibold text-pcb">
              <IconoCamion />
              Envío gratis superando los {formatearPesos(ENVIO_GRATIS_DESDE)}
            </p>

            <div className="mt-4 flex gap-2">
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
                className="min-w-0 flex-1 rounded-lg border border-linea bg-fondo px-3 py-2.5 text-tinta placeholder:text-tenue focus:border-aura focus:outline-none"
              />
              <button
                type="button"
                onClick={calcularEnvio}
                className="rounded-lg border border-tinta px-5 py-2.5 font-semibold hover:bg-fondo"
              >
                Calcular
              </button>
            </div>
            <a
              href="https://www.correoargentino.com.ar/formularios/cpa"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-sm text-tenue underline hover:text-tinta"
            >
              No sé mi código
            </a>
            {mensajeEnvio && (
              <p className="mt-3 text-sm font-medium" role="status">
                {mensajeEnvio}
              </p>
            )}
          </div>
        </div>
      </div>

      <section className="mt-14" aria-labelledby="especificaciones">
        <h2 id="especificaciones" className="subtitular text-2xl">
          Especificaciones
        </h2>
        <dl className="mt-5 grid gap-x-12 sm:grid-cols-2">
          {[["marca", producto.marca], ...especificaciones].map(
            ([clave, valor]) => (
              <div
                key={clave}
                className="flex justify-between gap-4 border-t border-linea py-3"
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

      {parecidos.length > 0 && (
        <section className="mt-14" aria-labelledby="parecidos">
          <div className="mb-5 flex items-baseline justify-between gap-4">
            <h2 id="parecidos" className="subtitular text-2xl">
              Más {nombreCategoria.toLowerCase()}
            </h2>
            <Link
              to={`/categoria/${categoria}`}
              className="shrink-0 font-semibold text-aura hover:underline"
            >
              Ver todo
            </Link>
          </div>
          <div className="-mx-4 flex snap-x scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
            {parecidos.map((otro) => (
              <div key={otro.id} className="w-64 shrink-0 snap-start md:w-auto">
                <ProductoCard producto={otro} />
              </div>
            ))}
          </div>
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
