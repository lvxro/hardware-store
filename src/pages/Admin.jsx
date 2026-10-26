import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../data/supabase'
import categorias from '../data/categorias'
import { formatearCampo } from '../data/campos'
import { precioDeProducto } from '../data/precios'
import { formatoPrecio } from '../data/catalogo'

// T-025: panel de administración. Cargar productos, editarlos y controlar el stock.
// La seguridad no está acá sino en Supabase (supabase/admin-stock.sql): aunque alguien abriera esta
// página, sin estar en la tabla administradores la base de datos no le deja cambiar nada.

const STOCK_BAJO = 3

const botonPrimario =
  'rounded-[3px] bg-lime px-4 py-2.5 font-mono text-sm font-bold text-bg hover:shadow-glow disabled:cursor-wait disabled:opacity-60'
const botonSecundario =
  'rounded-[3px] border border-line-strong px-4 py-2.5 font-mono text-sm font-medium text-white hover:border-line-hover hover:bg-raised'
const campoClase =
  'w-full rounded-[3px] border border-line-strong bg-bg px-3 py-2 text-sm text-white placeholder:text-muted hover:border-line-hover focus:border-lime focus:outline-none'

const nombreCategoria = (slug) => categorias.find((c) => c.slug === slug)?.nombre ?? slug

function Pantalla({ titulo, children }) {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold">{titulo}</h1>
      {children}
    </div>
  )
}

/* ---------- Stock de un producto: − / número / + y Guardar ---------- */

function ControlStock({ producto, onGuardado }) {
  const [valor, setValor] = useState(String(producto.stock ?? 0))
  const [estado, setEstado] = useState('') // '', 'guardando', 'listo', 'error'
  const numero = Number.parseInt(valor, 10)
  const valido = Number.isInteger(numero) && numero >= 0
  const cambio = valido && numero !== producto.stock

  const guardar = async () => {
    if (!cambio) return
    setEstado('guardando')
    const { data, error } = await supabase
      .from('productos')
      .update({ stock: numero })
      .eq('id', producto.id)
      .select()
      .maybeSingle()
    if (error || !data) {
      setEstado('error')
      return
    }
    onGuardado(data)
    setEstado('listo')
    setTimeout(() => setEstado(''), 1500)
  }

  const mover = (paso) => setValor(String(Math.max(0, (valido ? numero : 0) + paso)))

  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 items-center overflow-hidden rounded-[3px] border border-line-strong bg-bg">
        <button type="button" onClick={() => mover(-1)} className="h-full px-2.5 hover:bg-raised" aria-label={`Restar stock de ${producto.nombre}`}>
          −
        </button>
        <input
          type="text"
          inputMode="numeric"
          value={valor}
          onChange={(e) => setValor(e.target.value.replace(/\D/g, ''))}
          onKeyDown={(e) => e.key === 'Enter' && guardar()}
          aria-label={`Stock de ${producto.nombre}`}
          className="w-12 bg-transparent text-center font-mono text-sm font-medium text-white focus:outline-none"
        />
        <button type="button" onClick={() => mover(1)} className="h-full px-2.5 hover:bg-raised" aria-label={`Sumar stock de ${producto.nombre}`}>
          +
        </button>
      </div>
      {cambio && (
        <button type="button" onClick={guardar} disabled={estado === 'guardando'} className="rounded-[3px] bg-lime px-2.5 py-1.5 font-mono text-xs font-bold text-bg">
          {estado === 'guardando' ? '…' : 'Guardar'}
        </button>
      )}
      {estado === 'listo' && <span className="font-mono text-xs text-lime">Guardado</span>}
      {estado === 'error' && <span className="text-xs text-white">No se pudo guardar</span>}
    </div>
  )
}

function Etiqueta({ stock }) {
  if (stock == null) return null
  if (stock === 0)
    return <span className="rounded-[3px] border border-line-strong px-1.5 py-0.5 font-mono text-[11px] font-bold text-muted">SIN STOCK</span>
  if (stock <= STOCK_BAJO)
    return <span className="rounded-[3px] border border-lime px-1.5 py-0.5 font-mono text-[11px] font-bold text-lime">STOCK BAJO</span>
  return null
}

/* ---------- Formulario de alta y edición ---------- */

// El próximo id libre de la categoría: "cpu-016" después de "cpu-015"
function nuevoId(categoria, productos) {
  const deLaCategoria = productos.filter((p) => p.categoria === categoria)
  const prefijo = deLaCategoria[0]?.id.split('-')[0] ?? categoria.slice(0, 3)
  const mayor = Math.max(0, ...deLaCategoria.map((p) => Number.parseInt(p.id.split('-')[1], 10) || 0))
  return `${prefijo}-${String(mayor + 1).padStart(3, '0')}`
}

// Qué tipo de dato es cada especificación, mirando los productos que ya hay en la categoría
function tiposDe(categoria, productos) {
  const tipos = {}
  const cat = categorias.find((c) => c.slug === categoria)
  for (const campo of cat?.campos ?? []) {
    const ejemplo = productos.find((p) => p.categoria === categoria && p.specs?.[campo] != null)?.specs[campo]
    tipos[campo] = typeof ejemplo === 'number' ? 'numero' : typeof ejemplo === 'boolean' ? 'si-no' : 'texto'
  }
  return tipos
}

function Formulario({ producto, productos, onCerrar, onGuardado, onBorrado }) {
  const esNuevo = !producto
  const [categoria, setCategoria] = useState(producto?.categoria ?? categorias[0].slug)
  const [datos, setDatos] = useState(() => ({
    marca: producto?.marca ?? '',
    modelo: producto?.modelo ?? '',
    nombre: producto?.nombre ?? '',
    precio: producto ? String(producto.precio_usd_aprox) : '',
    stock: producto ? String(producto.stock ?? 0) : '10',
    descripcion: producto?.descripcion ?? '',
    imagen: producto?.imagen ?? '',
  }))
  const [specs, setSpecs] = useState(() =>
    Object.fromEntries(Object.entries(producto?.specs ?? {}).map(([k, v]) => [k, typeof v === 'boolean' ? v : String(v)])),
  )
  const [nombreTocado, setNombreTocado] = useState(!esNuevo)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [confirmarBorrar, setConfirmarBorrar] = useState(false)
  const primerCampo = useRef(null)

  const tipos = useMemo(() => tiposDe(categoria, productos), [categoria, productos])
  const id = producto?.id ?? nuevoId(categoria, productos)
  const usd = Number(datos.precio.replace(',', '.'))
  const pesos = usd > 0 ? precioDeProducto(id, usd) : null
  const nombre = nombreTocado ? datos.nombre : `${datos.marca} ${datos.modelo}`.trim()

  useEffect(() => {
    primerCampo.current?.focus()
    const escape = (e) => e.key === 'Escape' && onCerrar()
    document.addEventListener('keydown', escape)
    return () => document.removeEventListener('keydown', escape)
  }, [onCerrar])

  const cambiar = (clave) => (e) => setDatos((d) => ({ ...d, [clave]: e.target.value }))

  const guardar = async (e) => {
    e.preventDefault()
    setError('')
    const stock = Number.parseInt(datos.stock, 10)
    if (!datos.marca.trim() || !datos.modelo.trim()) return setError('Completá la marca y el modelo.')
    if (!(usd > 0)) return setError('El precio en dólares tiene que ser mayor a cero.')
    if (!Number.isInteger(stock) || stock < 0) return setError('El stock tiene que ser un número entero, 0 o más.')

    const specsLimpias = {}
    for (const [campo, tipo] of Object.entries(tipos)) {
      const v = specs[campo]
      if (tipo === 'si-no') specsLimpias[campo] = Boolean(v)
      else if (v === undefined || String(v).trim() === '') continue
      else if (tipo === 'numero') {
        const n = Number(String(v).replace(',', '.'))
        if (!Number.isFinite(n)) return setError(`"${formatearCampo(campo)}" tiene que ser un número.`)
        specsLimpias[campo] = n
      } else specsLimpias[campo] = String(v).trim()
    }

    const fila = {
      id,
      categoria,
      marca: datos.marca.trim(),
      modelo: datos.modelo.trim(),
      nombre: nombre || `${datos.marca} ${datos.modelo}`.trim(),
      precio_usd_aprox: usd,
      stock,
      descripcion: datos.descripcion.trim() || null,
      imagen: datos.imagen.trim() || null,
      specs: specsLimpias,
    }

    setGuardando(true)
    const consulta = esNuevo
      ? supabase.from('productos').insert(fila)
      : supabase.from('productos').update(fila).eq('id', id)
    const { data, error: errorDb } = await consulta.select().maybeSingle()
    setGuardando(false)
    if (errorDb || !data) {
      setError(
        errorDb?.code === '23505'
          ? 'Ya existe un producto con ese código. Probá de nuevo.'
          : 'No se pudo guardar. Revisá que tu cuenta sea administradora.',
      )
      return
    }
    onGuardado(data, esNuevo)
  }

  const borrar = async () => {
    setGuardando(true)
    const { data, error: errorDb } = await supabase.from('productos').delete().eq('id', id).select()
    setGuardando(false)
    if (errorDb || !data?.length) {
      setError('No se pudo borrar.')
      return
    }
    onBorrado(id)
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/60" onPointerDown={(e) => e.target === e.currentTarget && onCerrar()}>
      <form
        onSubmit={guardar}
        aria-labelledby="titulo-form"
        className="entra-deslizando flex h-full w-full max-w-lg flex-col overflow-y-auto border-l border-line bg-surface"
        style={{ animationDelay: '0ms' }}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line p-5">
          <div>
            <h2 id="titulo-form" className="text-xl font-semibold">
              {esNuevo ? 'Nuevo producto' : 'Editar producto'}
            </h2>
            <p className="mt-0.5 font-mono text-xs text-muted">{id}</p>
          </div>
          <button type="button" onClick={onCerrar} className="text-sm text-muted hover:text-white" aria-label="Cerrar">
            Cerrar
          </button>
        </div>

        <div className="grid gap-4 p-5">
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium">Categoría</span>
            <select
              ref={esNuevo ? primerCampo : undefined}
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              disabled={!esNuevo}
              className={`${campoClase} disabled:opacity-60`}
            >
              {categorias.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium">Marca</span>
              <input ref={esNuevo ? undefined : primerCampo} value={datos.marca} onChange={cambiar('marca')} className={campoClase} placeholder="AMD" />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium">Modelo</span>
              <input value={datos.modelo} onChange={cambiar('modelo')} className={campoClase} placeholder="Ryzen 5 7600X" />
            </label>
          </div>

          <label className="grid gap-1.5 text-sm">
            <span className="font-medium">Nombre en la tienda</span>
            <input
              value={nombre}
              onChange={(e) => {
                setNombreTocado(true)
                setDatos((d) => ({ ...d, nombre: e.target.value }))
              }}
              className={campoClase}
            />
            {!nombreTocado && <span className="text-xs text-muted">Se arma solo con la marca y el modelo.</span>}
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium">Precio (USD)</span>
              <input inputMode="decimal" value={datos.precio} onChange={cambiar('precio')} className={`${campoClase} font-mono`} placeholder="200" />
              {pesos && (
                <span className="font-mono text-xs text-lime">
                  {formatoPrecio(pesos.precio)}
                  {pesos.enOferta && <span className="text-muted"> (en oferta)</span>}
                </span>
              )}
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium">Stock (unidades)</span>
              <input inputMode="numeric" value={datos.stock} onChange={(e) => setDatos((d) => ({ ...d, stock: e.target.value.replace(/\D/g, '') }))} className={`${campoClase} font-mono`} />
            </label>
          </div>

          <label className="grid gap-1.5 text-sm">
            <span className="font-medium">Descripción</span>
            <textarea value={datos.descripcion} onChange={cambiar('descripcion')} rows={2} className={campoClase} placeholder="Una línea que cuente para qué sirve." />
          </label>

          <label className="grid gap-1.5 text-sm">
            <span className="font-medium">
              Imagen <span className="font-normal text-muted">(opcional)</span>
            </span>
            <input value={datos.imagen} onChange={cambiar('imagen')} className={campoClase} placeholder="https://… o /img/archivo.jpg" />
            <span className="text-xs text-muted">Sin imagen, la tienda muestra el dibujo de la categoría.</span>
          </label>

          <fieldset className="grid gap-3 border-t border-line pt-4">
            <legend className="pb-1 text-sm font-medium">Especificaciones de {nombreCategoria(categoria)}</legend>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(tipos).map(([campo, tipo]) =>
                tipo === 'si-no' ? (
                  <label key={campo} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={Boolean(specs[campo])}
                      onChange={(e) => setSpecs((s) => ({ ...s, [campo]: e.target.checked }))}
                      className="h-4 w-4 accent-[var(--lime)]"
                    />
                    {formatearCampo(campo)}
                  </label>
                ) : (
                  <label key={campo} className="grid gap-1.5 text-sm">
                    <span className="text-muted">{formatearCampo(campo)}</span>
                    <input
                      inputMode={tipo === 'numero' ? 'decimal' : undefined}
                      value={specs[campo] ?? ''}
                      onChange={(e) => setSpecs((s) => ({ ...s, [campo]: e.target.value }))}
                      className={`${campoClase} ${tipo === 'numero' ? 'font-mono' : ''}`}
                    />
                  </label>
                ),
              )}
            </div>
          </fieldset>

          {error && (
            <p role="alert" className="rounded-[3px] border border-line-strong bg-raised px-3 py-2 text-sm">
              {error}
            </p>
          )}
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-line p-5">
          <button type="submit" disabled={guardando} className={botonPrimario}>
            {guardando ? 'Guardando…' : esNuevo ? 'Agregar producto' : 'Guardar cambios'}
          </button>
          <button type="button" onClick={onCerrar} className={botonSecundario}>
            Cancelar
          </button>
          {!esNuevo &&
            (confirmarBorrar ? (
              <span className="ml-auto text-sm">
                ¿Borrarlo?{' '}
                <button type="button" onClick={borrar} className="ml-1 font-medium text-white underline underline-offset-4">
                  Sí, borrar
                </button>
                <button type="button" onClick={() => setConfirmarBorrar(false)} className="ml-3 text-muted hover:text-white">
                  No
                </button>
              </span>
            ) : (
              <button type="button" onClick={() => setConfirmarBorrar(true)} className="ml-auto text-sm text-muted underline-offset-4 hover:text-white hover:underline">
                Borrar producto
              </button>
            ))}
        </div>
      </form>
    </div>
  )
}

/* ---------- El panel ---------- */

function Panel() {
  const [productos, setProductos] = useState(null)
  const [error, setError] = useState('')
  const [texto, setTexto] = useState('')
  const [categoria, setCategoria] = useState('')
  const [soloAlertas, setSoloAlertas] = useState(false)
  const [editando, setEditando] = useState(null) // null, 'nuevo' o un producto
  const [aviso, setAviso] = useState('')

  useEffect(() => {
    supabase
      .from('productos')
      .select('*')
      .order('id')
      .then(({ data, error }) => (error ? setError('No se pudieron leer los productos.') : setProductos(data)))
  }, [])

  if (error) return <p className="mt-6 text-muted">{error}</p>
  if (!productos) return <p className="mt-6 text-muted" role="status">Cargando productos…</p>

  const sinColumnaStock = productos.length > 0 && !('stock' in productos[0])
  const agotados = productos.filter((p) => p.stock === 0).length
  const bajos = productos.filter((p) => p.stock > 0 && p.stock <= STOCK_BAJO).length

  const palabras = texto.toLowerCase().split(/\s+/).filter(Boolean)
  const lista = productos.filter(
    (p) =>
      (!categoria || p.categoria === categoria) &&
      (!soloAlertas || (p.stock != null && p.stock <= STOCK_BAJO)) &&
      palabras.every((w) => `${p.nombre} ${p.id}`.toLowerCase().includes(w)),
  )

  const reemplazar = (fila) => setProductos((ps) => ps.map((p) => (p.id === fila.id ? fila : p)))
  const avisar = (t) => {
    setAviso(t)
    setTimeout(() => setAviso(''), 3500)
  }

  return (
    <>
      {sinColumnaStock && (
        <p role="alert" className="mt-6 rounded-[3px] border border-lime bg-surface px-4 py-3 text-sm">
          Falta preparar la base de datos para el stock: corré <span className="font-mono">supabase/admin-stock.sql</span> en el SQL
          Editor de Supabase.
        </p>
      )}

      {/* Resumen: tocar una alerta filtra la lista */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          ['Productos', productos.length, () => setSoloAlertas(false)],
          ['Sin stock', agotados, () => setSoloAlertas(true)],
          ['Stock bajo', bajos, () => setSoloAlertas(true)],
        ].map(([etiqueta, numero, alTocar], i) => (
          <button
            key={etiqueta}
            type="button"
            onClick={alTocar}
            className={`rounded-[3px] border bg-surface p-4 text-left hover:border-line-hover ${
              i > 0 && numero > 0 ? 'border-lime' : 'border-line'
            }`}
          >
            <span className="block text-xs text-muted sm:text-sm">{etiqueta}</span>
            <span className={`mt-1 block font-mono text-2xl font-bold ${i > 0 && numero > 0 ? 'text-lime' : ''}`}>{numero}</span>
          </button>
        ))}
      </div>

      {/* Filtros y alta */}
      <div className="mt-6 flex flex-wrap items-center gap-3 border-b border-line pb-4">
        <input
          type="search"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Buscar por nombre o código"
          aria-label="Buscar productos"
          className={`${campoClase} min-w-0 flex-1 sm:max-w-xs`}
        />
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)} aria-label="Categoría" className={`${campoClase} w-auto`}>
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.nombre}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" checked={soloAlertas} onChange={(e) => setSoloAlertas(e.target.checked)} className="h-4 w-4 accent-[var(--lime)]" />
          Solo sin stock o bajo
        </label>
        <button type="button" onClick={() => setEditando('nuevo')} className={`${botonPrimario} sm:ml-auto`}>
          + Nuevo producto
        </button>
      </div>

      {aviso && (
        <p role="status" className="entra-deslizando mt-4 font-mono text-sm text-lime" style={{ animationDelay: '0ms' }}>
          {aviso}
        </p>
      )}

      <p className="mt-4 text-sm text-muted tabular-nums">
        {lista.length} de {productos.length}
      </p>

      <ul className="mt-2 divide-y divide-line border-y border-line">
        {lista.map((p) => (
          <li key={p.id} className="grid gap-3 py-3 sm:grid-cols-[minmax(0,1fr)_9rem_auto_auto] sm:items-center sm:gap-6">
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{p.nombre}</span>
                <Etiqueta stock={p.stock} />
              </p>
              <p className="mt-0.5 font-mono text-xs text-muted">
                {p.id} · {nombreCategoria(p.categoria)}
              </p>
            </div>
            <p className="font-mono text-sm">
              {formatoPrecio(precioDeProducto(p.id, Number(p.precio_usd_aprox)).precio)}
              <span className="block text-xs text-muted">USD {p.precio_usd_aprox}</span>
            </p>
            {'stock' in p ? <ControlStock key={p.stock} producto={p} onGuardado={reemplazar} /> : <span />}
            <button type="button" onClick={() => setEditando(p)} className={`${botonSecundario} py-1.5 text-xs`}>
              Editar
            </button>
          </li>
        ))}
        {lista.length === 0 && <li className="py-8 text-center text-muted">No hay productos con esos filtros.</li>}
      </ul>

      <p className="mt-4 text-xs text-muted">Los cambios se ven en la tienda al recargar la página.</p>

      {editando && (
        <Formulario
          producto={editando === 'nuevo' ? null : editando}
          productos={productos}
          onCerrar={() => setEditando(null)}
          onGuardado={(fila, esNuevo) => {
            setProductos((ps) => (esNuevo ? [...ps, fila].sort((a, b) => a.id.localeCompare(b.id)) : ps.map((p) => (p.id === fila.id ? fila : p))))
            setEditando(null)
            avisar(esNuevo ? `Agregado: ${fila.nombre}` : `Guardado: ${fila.nombre}`)
          }}
          onBorrado={(id) => {
            setProductos((ps) => ps.filter((p) => p.id !== id))
            setEditando(null)
            avisar('Producto borrado')
          }}
        />
      )}
    </>
  )
}

export default function Admin({ sesion }) {
  const { usuario, cargando, esAdmin, verificandoAdmin } = sesion

  if (cargando || verificandoAdmin) {
    return (
      <Pantalla titulo="Panel de administración">
        <p role="status" className="mt-3 text-muted">
          Verificando tu cuenta…
        </p>
      </Pantalla>
    )
  }

  if (!usuario) {
    return (
      <Pantalla titulo="Panel de administración">
        <p className="mt-3 text-muted">Iniciá sesión con una cuenta de administrador.</p>
        <Link to="/ingresar" className={`mt-6 inline-block ${botonPrimario}`}>
          Iniciar sesión
        </Link>
      </Pantalla>
    )
  }

  if (!esAdmin) {
    return (
      <Pantalla titulo="Esta cuenta no es administradora">
        <p className="mt-3 text-muted">
          Para entrar al panel, el correo <span className="text-white">{usuario.email}</span> tiene que estar en la tabla
          <span className="font-mono text-white"> administradores</span> de Supabase.
        </p>
        <Link to="/" className={`mt-6 inline-block ${botonSecundario}`}>
          Volver a la tienda
        </Link>
      </Pantalla>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-semibold">Panel de administración</h1>
      <p className="mt-1 text-muted">Productos y stock de la tienda.</p>
      <Panel />
    </div>
  )
}
