// Categorías de la tienda.
// "slug" tiene que ser igual a la columna "categoria" de la tabla productos de Supabase
// (y a la clave de esa categoría en productos.json, el archivo de Gabriel).
// "campos" son las especificaciones de la categoría, en el orden en que se ven en la ficha.
// "specs" elige los dos datos que se muestran en la tarjeta de cada producto.
const categorias = [
  {
    slug: 'procesadores',
    nombre: 'Procesadores',
    grupo: 'Componentes',
    campos: ['nucleos', 'hilos', 'frecuencia_boost_ghz', 'socket', 'tdp_w', 'cache_l3_mb'],
    specs: (p) => [
      ['Núcleos', `${p.nucleos} núcleos, ${p.hilos} hilos`],
      ['Socket', p.socket],
    ],
  },
  {
    slug: 'placas_base',
    nombre: 'Placas madre',
    grupo: 'Componentes',
    campos: ['socket', 'chipset', 'formato', 'memoria', 'wifi'],
    specs: (p) => [
      ['Socket', `${p.socket}, chipset ${p.chipset}`],
      ['Formato', `${p.formato}, ${p.memoria}`],
    ],
  },
  {
    slug: 'memorias_ram',
    nombre: 'Memorias RAM',
    grupo: 'Componentes',
    campos: ['tipo', 'capacidad_gb', 'configuracion', 'velocidad_mhz', 'latencia'],
    specs: (p) => [
      ['Capacidad', `${p.capacidad_gb} GB (${p.configuracion})`],
      ['Velocidad', `${p.tipo} ${p.velocidad_mhz} MHz`],
    ],
  },
  {
    slug: 'placas_de_video',
    nombre: 'Placas de video',
    grupo: 'Componentes',
    campos: ['memoria_gb', 'tipo_memoria', 'nucleos', 'consumo_w'],
    specs: (p) => [
      ['Memoria', `${p.memoria_gb} GB ${p.tipo_memoria}`],
      ['Consumo', `${p.consumo_w} W`],
    ],
  },
  {
    slug: 'monitores',
    nombre: 'Monitores',
    grupo: 'Periféricos',
    campos: ['tamano_pulgadas', 'resolucion', 'tasa_refresco_hz', 'panel', 'tiempo_respuesta_ms'],
    specs: (p) => [
      ['Pantalla', `${p.tamano_pulgadas}", ${p.resolucion}`],
      ['Refresco', `${p.tasa_refresco_hz} Hz, ${p.panel}`],
    ],
  },
  {
    slug: 'teclados',
    nombre: 'Teclados',
    grupo: 'Periféricos',
    campos: ['formato', 'switches', 'conexion', 'iluminacion'],
    specs: (p) => [
      ['Formato', p.formato],
      ['Switches', p.switches],
    ],
  },
  {
    slug: 'mouses',
    nombre: 'Mouses',
    grupo: 'Periféricos',
    campos: ['dpi_max', 'peso_g', 'conexion', 'botones'],
    specs: (p) => [
      ['Peso', `${p.peso_g} g`],
      ['Conexión', p.conexion],
    ],
  },
]

export const grupos = ['Componentes', 'Periféricos']

export default categorias
