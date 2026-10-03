// Dibujos de línea de cada categoría. Se usan como imagen mientras no haya fotos.
const trazos = {
  procesadores: (
    <>
      <rect x="12" y="12" width="24" height="24" rx="1.5" />
      <rect x="18" y="18" width="12" height="12" />
      <path d="M17 12V7M24 12V7M31 12V7M17 41v-5M24 41v-5M31 41v-5M12 17H7M12 24H7M12 31H7M41 17h-5M41 24h-5M41 31h-5" />
    </>
  ),
  placas_base: (
    <>
      <rect x="7" y="7" width="34" height="34" rx="1.5" />
      <rect x="12" y="12" width="11" height="11" />
      <path d="M28 12v11M32 12v11M12 30h24M12 35h24" />
      <circle cx="35" cy="17" r="2.5" />
    </>
  ),
  memorias_ram: (
    <>
      <path d="M4 17h40v12H27v3h-4v-3H4z" />
      <rect x="8" y="20" width="5" height="6" />
      <rect x="16" y="20" width="5" height="6" />
      <rect x="27" y="20" width="5" height="6" />
      <rect x="35" y="20" width="5" height="6" />
    </>
  ),
  placas_de_video: (
    <>
      <rect x="4" y="14" width="40" height="18" rx="1.5" />
      <circle cx="16" cy="23" r="6" />
      <circle cx="32" cy="23" r="6" />
      <path d="M16 20v6M13 23h6M32 20v6M29 23h6M8 32v4h18v-4" />
    </>
  ),
  monitores: (
    <>
      <rect x="5" y="8" width="38" height="24" rx="1.5" />
      <path d="M24 32v6M16 40h16" />
    </>
  ),
  teclados: (
    <>
      <rect x="4" y="14" width="40" height="20" rx="1.5" />
      <path d="M9 19h2M14 19h2M19 19h2M24 19h2M29 19h2M34 19h2M39 19h0M9 24h2M14 24h2M19 24h2M24 24h2M29 24h2M34 24h4M15 29h18" />
    </>
  ),
  mouses: (
    <>
      <path d="M24 7c-7 0-11 5-11 12v10c0 7 4 12 11 12s11-5 11-12V19c0-7-4-12-11-12z" />
      <path d="M24 7v12M13 19h22" />
      <rect x="22.5" y="11" width="3" height="5" rx="1.5" />
    </>
  ),
}

export default function Icono({ categoria, className = '' }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {trazos[categoria]}
    </svg>
  )
}
