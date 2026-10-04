import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import productos from "../data/productos.json";
import { DOLAR, formatoPrecio } from "../data/catalogo";

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

// Reglas comerciales de ejemplo: ajustalas a tu tienda.
const DESCUENTO_EFECTIVO = 0.1;
const ENVIO_GRATIS_DESDE_USD = 500;
const CUOTAS = [
  { cantidad: 3, coeficiente: 0.79 },
  { cantidad: 6, coeficiente: 0.85 },
  { cantidad: 12, coeficiente: 1 },
];

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

// Mismo cálculo que el catálogo: dólares por el dólar oficial, redondeado a miles
function aPesos(usd) {
  return Math.round((usd * DOLAR) / 1000) * 1000;
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
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M3 6a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v2h3.2a1 1 0 0 1 .8.4l2.4 3.2a1 1 0 0 1 .2.6V16a1 1 0 0 1-1 1h-.6a2.5 2.5 0 0 1-4.8 0H9.4a2.5 2.5 0 0 1-4.8 0H4a1 1 0 0 1-1-1V6Zm12 4v3h4.5L18 10h-3ZM7 16a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm10 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" />
    </svg>
  );
}

function FichaContenido({ id, onAgregarAlCarrito }) {
  const [imagenFallida, setImagenFallida] = useState(false);
  const [cantidad, setCantidad] = useState(1);
  const [codigoPostal, setCodigoPostal] = useState("");
  const [mensajeEnvio, setMensajeEnvio] = useState("");
  const [agregado, setAgregado] = useState(false);

  const resultado = buscarProducto(id);

  if (!resultado) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Producto no encontrado
        </h1>
        <Link
          to="/"
          className="mt-4 inline-block text-blue-600 hover:underline"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  const { producto, categoria } = resultado;
  const nombreCategoria = NOMBRES_CATEGORIA[categoria] ?? categoria;
  const sinImagen = !producto.imagen || imagenFallida;

  const precioLista = aPesos(producto.precio_usd_aprox);
  const precioEfectivo = precioLista * (1 - DESCUENTO_EFECTIVO);

  const especificaciones = Object.entries(producto).filter(
    ([clave]) => !CAMPOS_BASE.includes(clave)
  );

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
    <div className="mx-auto max-w-6xl px-4 py-6">
      <nav className="text-xs text-gray-500" aria-label="Migas de pan">
        <Link to="/" className="hover:underline">
          Inicio
        </Link>
        <span className="mx-1">&gt;</span>
        <Link to={`/categoria/${categoria}`} className="hover:underline">
          {nombreCategoria}
        </Link>
        <span className="mx-1">&gt;</span>
      </nav>

      <h1 className="mt-2 text-lg font-bold text-gray-900 md:text-xl">
        {producto.nombre}
      </h1>

      <div className="mt-6 grid gap-8 md:grid-cols-5">
        <div className="md:col-span-3">
          <div className="mx-auto aspect-square w-full max-w-lg overflow-hidden bg-white">
            {sinImagen ? (
              <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-500">
                Sin imagen
              </div>
            ) : (
              <img
                src={producto.imagen}
                alt={producto.nombre}
                onError={() => setImagenFallida(true)}
                className="h-full w-full object-contain"
              />
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="border-b border-gray-200 pb-3">
            <p className="text-sm font-semibold text-gray-800">
              Precio efectivo:{" "}
              <span className="text-lg font-bold text-fuchsia-700">
                {formatearPesos(precioEfectivo)}
              </span>
            </p>
            <p className="text-xs text-gray-500">
              Por pago en efectivo o transferencia
            </p>
          </div>

          <div className="border-b border-gray-200 py-3">
            <p className="text-sm font-semibold text-gray-800">
              Precio de lista:{" "}
              <span className="text-lg font-bold text-fuchsia-700">
                {formatearPesos(precioLista)}
              </span>
            </p>
            <p className="text-xs text-gray-500">
              Todas las tarjetas de crédito bancarias
            </p>
          </div>

          <div className="py-3">
            <span className="inline-block rounded border border-sky-200 bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-700">
              Mercado Pago
            </span>
            <ul className="mt-3 text-sm text-gray-700">
              {CUOTAS.map(({ cantidad: cuotas, coeficiente }) => {
                const total = precioLista * coeficiente;
                return (
                  <li
                    key={cuotas}
                    className="flex flex-wrap items-baseline gap-1 border-b border-gray-100 py-2"
                  >
                    <span>{cuotas} cuotas fijas de:</span>
                    <strong>{formatearPesos(total / cuotas)}</strong>
                    <span className="text-xs text-gray-400">
                      - {formatearPesos(total)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-2 flex items-center gap-3">
            <div className="flex items-center rounded border border-gray-300">
              <button
                type="button"
                onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                className="px-3 py-2 text-lg leading-none hover:bg-gray-100"
                aria-label="Restar una unidad"
              >
                −
              </button>
              <span className="w-8 text-center text-sm">{cantidad}</span>
              <button
                type="button"
                onClick={() => setCantidad((c) => Math.min(10, c + 1))}
                className="px-3 py-2 text-lg leading-none hover:bg-gray-100"
                aria-label="Sumar una unidad"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={agregar}
              className="flex-1 rounded-full bg-black px-6 py-3 text-sm font-bold tracking-wide text-white hover:bg-gray-800"
            >
              {agregado ? "AGREGADO ✓" : "AGREGAR AL CARRITO"}
            </button>
          </div>

          <p className="mt-5 flex items-center gap-2 text-xs font-semibold text-gray-800">
            <IconoCamion />
            Envío gratis superando los {formatearPesos(aPesos(ENVIO_GRATIS_DESDE_USD))}
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
              className="min-w-0 flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
            />
            <button
              type="button"
              onClick={calcularEnvio}
              className="rounded border border-black px-5 py-2 text-sm font-bold tracking-wide hover:bg-gray-100"
            >
              CALCULAR
            </button>
          </div>
          <a
            href="https://www.correoargentino.com.ar/formularios/cpa"
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-xs text-gray-500 hover:underline"
          >
            No sé mi código
          </a>
          {mensajeEnvio && (
            <p className="mt-2 text-xs text-gray-700">{mensajeEnvio}</p>
          )}
        </div>
      </div>

      <section className="mt-10">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">
          Descripción
        </h2>
        <p className="text-gray-700">{producto.descripcion}</p>
        <ul className="mt-4 space-y-1 text-gray-700">
          <li>- Marca: {producto.marca}</li>
          {especificaciones.map(([clave, valor]) => (
            <li key={clave}>
              - {formatearCampo(clave)}: {formatearValor(valor)}
            </li>
          ))}
        </ul>
      </section>

      <Link
        to={`/categoria/${categoria}`}
        className="mt-8 inline-block text-sm text-blue-600 hover:underline"
      >
        ← Volver a {nombreCategoria}
      </Link>
    </div>
  );
}

export default function FichaDeProducto({ onAgregarAlCarrito }) {
  const { id } = useParams();
  // key={id} reinicia cantidad, código postal e imagen al cambiar de producto
  return <FichaContenido key={id} id={id} onAgregarAlCarrito={onAgregarAlCarrito} />;
}