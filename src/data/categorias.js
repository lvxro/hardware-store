// Categorías de la tienda.
// "slug" tiene que ser igual a la clave de esa categoría en productos.json (el archivo de Gabriel).
// "specs" elige los dos datos que se muestran en la tarjeta de cada producto.
const categorias = [
  {
    slug: 'procesadores',
    nombre: 'Procesadores',
    grupo: 'Componentes',
    specs: (p) => [
      ['Núcleos', `${p.nucleos} núcleos, ${p.hilos} hilos`],
      ['Socket', p.socket],
    ],
  },
  {
    slug: 'placas_base',
    nombre: 'Placas madre',
    grupo: 'Componentes',
    specs: (p) => [
      ['Socket', `${p.socket}, chipset ${p.chipset}`],
      ['Formato', `${p.formato}, ${p.memoria}`],
    ],
  },
  {
    slug: 'memorias_ram',
    nombre: 'Memorias RAM',
    grupo: 'Componentes',
    specs: (p) => [
      ['Capacidad', `${p.capacidad_gb} GB (${p.configuracion})`],
      ['Velocidad', `${p.tipo} ${p.velocidad_mhz} MHz`],
    ],
  },
  {
    slug: 'placas_de_video',
    nombre: 'Placas de video',
    grupo: 'Componentes',
    specs: (p) => [
      ['Memoria', `${p.memoria_gb} GB ${p.tipo_memoria}`],
      ['Consumo', `${p.consumo_w} W`],
    ],
  },
  {
    slug: 'monitores',
    nombre: 'Monitores',
    grupo: 'Periféricos',
    specs: (p) => [
      ['Pantalla', `${p.tamano_pulgadas}", ${p.resolucion}`],
      ['Refresco', `${p.tasa_refresco_hz} Hz, ${p.panel}`],
    ],
  },
  {
    slug: 'teclados',
    nombre: 'Teclados',
    grupo: 'Periféricos',
    specs: (p) => [
      ['Formato', p.formato],
      ['Switches', p.switches],
    ],
  },
  {
    slug: 'mouses',
    nombre: 'Mouses',
    grupo: 'Periféricos',
    specs: (p) => [
      ['Peso', `${p.peso_g} g`],
      ['Conexión', p.conexion],
    ],
  },
]

export const grupos = ['Componentes', 'Periféricos']

export default categorias
