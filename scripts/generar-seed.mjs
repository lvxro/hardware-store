// Arma supabase/seed.sql a partir de src/data/productos.json.
// Uso: node scripts/generar-seed.mjs
// Después se pega seed.sql en el SQL Editor de Supabase. Se puede correr más de una vez:
// los productos que ya están en la tabla no se tocan.
import { readFileSync, writeFileSync } from 'node:fs'

const raiz = new URL('..', import.meta.url)
const datos = JSON.parse(readFileSync(new URL('src/data/productos.json', raiz), 'utf8'))

// Los mismos campos que CAMPOS_BASE en src/data/campos.js: todo lo demás va a "specs"
const COMUNES = ['id', 'marca', 'modelo', 'nombre', 'precio_usd_aprox', 'imagen', 'descripcion']

// En SQL los textos van entre comillas simples, y una comilla simple adentro se escribe doble
const texto = (valor) => `'${String(valor).replaceAll("'", "''")}'`

let sql = '-- Generado por scripts/generar-seed.mjs a partir de src/data/productos.json. No editar a mano.\n'

for (const [categoria, lista] of Object.entries(datos)) {
  const filas = lista.map((p) => {
    const specs = Object.fromEntries(Object.entries(p).filter(([clave]) => !COMUNES.includes(clave)))
    const valores = [
      texto(p.id),
      texto(categoria),
      texto(p.marca),
      texto(p.modelo),
      texto(p.nombre),
      p.precio_usd_aprox,
      texto(p.imagen),
      texto(p.descripcion),
      texto(JSON.stringify(specs)),
    ]
    return `  (${valores.join(', ')})`
  })

  sql += `
-- ${categoria} (${lista.length})
insert into public.productos (id, categoria, marca, modelo, nombre, precio_usd_aprox, imagen, descripcion, specs) values
${filas.join(',\n')}
on conflict (id) do nothing;
`
}

writeFileSync(new URL('supabase/seed.sql', raiz), sql)
console.log(`supabase/seed.sql listo: ${Object.values(datos).flat().length} productos`)
