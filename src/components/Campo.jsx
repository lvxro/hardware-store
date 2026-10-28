// Campo de formulario con su etiqueta y, si hace falta, un texto de ayuda abajo.
// Lo usan las pantallas de cuenta: registro, inicio de sesión y recuperar contraseña.
const claseCampo =
  'mt-1.5 w-full rounded-[3px] border border-line-strong bg-bg px-3 py-2.5 text-white placeholder:text-muted focus:border-lime focus:shadow-glow focus:outline-none'

export default function Campo({ id, etiqueta, ayuda, ...resto }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {etiqueta}
      </label>
      <input id={id} name={id} className={claseCampo} {...resto} />
      {ayuda && <p className="mt-1 text-xs text-muted">{ayuda}</p>}
    </div>
  )
}
