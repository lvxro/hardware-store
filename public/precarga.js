// T-028 / T-030: arranca a pedir el catálogo mientras baja el resto del sitio, y lo deja en
// window.__catalogo para src/data/catalogo.js.
// Si hay una copia guardada de hace menos de 10 minutos, se usa esa al instante (la página se dibuja
// sin esperar a Supabase) y se pide la nueva igual, para la próxima visita.
// El precio y el stock que valen son los del servidor: api/checkout.js los vuelve a leer al pagar.
// Está en un archivo aparte (y no dentro de index.html) para que la política de seguridad (CSP)
// no tenga que permitir código suelto en la página.
;(function () {
  var URL_CATALOGO =
    'https://jsgnjdtqktfxgfwuixfv.supabase.co/rest/v1/productos?select=*&order=id.asc&apikey=sb_publishable_ERypV6QKT8oNZZcxm-2FXQ_80ZWexRE'
  var CLAVE = 'catalogo-cache'
  var VIGENCIA_MS = 10 * 60 * 1000

  var fresco = fetch(URL_CATALOGO).then(function (r) {
    if (!r.ok) throw new Error('Supabase respondió ' + r.status)
    return r.json()
  })
  fresco
    .then(function (filas) {
      try {
        localStorage.setItem(CLAVE, JSON.stringify({ guardado: Date.now(), filas: filas }))
      } catch {
        // sin almacenamiento, no hay copia
      }
    })
    .catch(function () {})

  var copia = null
  try {
    var guardada = JSON.parse(localStorage.getItem(CLAVE) || 'null')
    if (guardada && Array.isArray(guardada.filas) && Date.now() - guardada.guardado < VIGENCIA_MS) copia = guardada.filas
  } catch {
    copia = null
  }

  window.__catalogo = copia ? Promise.resolve(copia) : fresco

  // Las fuentes de Google se piden sin frenar el primer dibujo (ver index.html)
  var fuentes = document.querySelector('link[data-fuentes]')
  if (fuentes) {
    if (fuentes.sheet) fuentes.media = 'all'
    else
      fuentes.addEventListener('load', function () {
        fuentes.media = 'all'
      })
  }
})()
