import { useEffect, useState } from 'react'

// Botón de sol y luna para cambiar entre modo claro y oscuro.
// El modo elegido se guarda en el navegador; la primera vez sigue el del sistema.
// index.html aplica el modo antes de que cargue React, así no hay parpadeo.

function temaInicial() {
  return document.documentElement.classList.contains('dark') ? 'oscuro' : 'claro'
}

function Sol() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  )
}

function Luna() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z" />
    </svg>
  )
}

export default function TemaToggle() {
  const [tema, setTema] = useState(temaInicial)
  const oscuro = tema === 'oscuro'

  useEffect(() => {
    document.documentElement.classList.toggle('dark', oscuro)
    try {
      localStorage.setItem('tema', tema)
    } catch {
      // Si el navegador no deja guardar, el modo dura hasta recargar
    }
  }, [tema, oscuro])

  const texto = oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'

  return (
    <button
      type="button"
      onClick={() => setTema(oscuro ? 'claro' : 'oscuro')}
      aria-label={texto}
      title={texto}
      className="rounded-[3px] border border-linea p-2 text-tenue hover:border-tinta hover:text-tinta"
    >
      {oscuro ? <Sol /> : <Luna />}
    </button>
  )
}
