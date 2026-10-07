// Textos de cada página de categoría: la bajada de la portada y las preguntas frecuentes.
// Son textos de ayuda para elegir, no datos de productos: se pueden editar libremente.
// "slug" tiene que coincidir con el de categorias.js.
const guias = {
  procesadores: {
    bajada: 'El punto de partida del armado: define el socket y la placa madre que vas a poder usar.',
    preguntas: [
      [
        '¿Qué socket tengo que elegir?',
        'El socket del procesador tiene que ser el mismo que el de la placa madre. En el catálogo hay AM5 y AM4 para AMD, y LGA1700 para Intel.',
      ],
      [
        '¿Cuántos núcleos necesito?',
        'Para jugar alcanzan 6 u 8 núcleos. Si además editás video, transmitís o renderizás, conviene ir a 12 o más.',
      ],
      [
        '¿Qué significa X3D en los Ryzen?',
        'Son los modelos con caché 3D V-Cache: tienen más caché L3 y rinden más en juegos. Se nota en la columna Caché L3 de la comparación.',
      ],
    ],
  },
  placas_base: {
    bajada: 'La base del equipo. Elegila por el socket del procesador y por el tipo de memoria.',
    preguntas: [
      [
        '¿Cómo sé si es compatible con mi procesador?',
        'Tiene que tener el mismo socket: AM5 o AM4 para los Ryzen, LGA1700 para los Intel Core.',
      ],
      [
        '¿ATX, Micro-ATX o E-ATX?',
        'Es el tamaño de la placa. ATX es el estándar; Micro-ATX es más chica, para gabinetes compactos; E-ATX es más ancha y necesita un gabinete que la soporte.',
      ],
      [
        '¿Todas traen WiFi?',
        'No. La columna WiFi de la comparación lo indica modelo por modelo.',
      ],
    ],
  },
  memorias_ram: {
    bajada: 'Kits de dos módulos en DDR4 y DDR5, según la placa madre que tengas.',
    preguntas: [
      [
        '¿DDR4 o DDR5?',
        'Depende de la placa madre, porque no son intercambiables. Las placas AM5 usan DDR5 y las AM4, DDR4. En LGA1700 depende del modelo de placa.',
      ],
      [
        '¿Cuánta memoria necesito?',
        'Para jugar, 16 GB es el piso y 32 GB da margen. Para edición de video o muchas tareas a la vez, 64 GB.',
      ],
      [
        '¿Qué es la latencia (CL)?',
        'Es lo que tarda la memoria en responder. A igual velocidad, un CL más bajo es mejor.',
      ],
    ],
  },
  placas_de_video: {
    bajada: 'De 1080p a 4K. Antes de elegir, mirá la memoria y el consumo.',
    preguntas: [
      [
        '¿Cuánta memoria de video necesito?',
        'Para 1080p alcanzan 8 GB. Para 1440p conviene 12 GB o más, y para 4K, 16 GB o más.',
      ],
      [
        '¿Qué fuente necesito?',
        'La columna Consumo muestra lo que gasta la placa sola. La fuente tiene que cubrir eso más el resto del equipo, con margen.',
      ],
      [
        '¿Por qué algunas tienen tres coolers?',
        'Las placas de mayor consumo generan más calor y necesitan un disipador más grande. En los dibujos, las de más de 250 W aparecen con tres.',
      ],
    ],
  },
  monitores: {
    bajada: 'Elegí por tamaño, resolución y tasa de refresco, en ese orden.',
    preguntas: [
      [
        '¿Qué resolución me conviene?',
        'Como referencia: 1080p en 24 pulgadas, 1440p en 27 y ultrawide (3440x1440) en 34. Más resolución le exige más a la placa de video.',
      ],
      [
        '¿Cuántos Hz necesito?',
        'Con 144 o 165 Hz la imagen ya se ve mucho más fluida que a 60. Los de 240 y 360 Hz están pensados para juego competitivo.',
      ],
      [
        '¿IPS, VA u OLED?',
        'IPS tiene buenos colores y ángulos de visión. VA da más contraste. OLED tiene negros perfectos y la respuesta más rápida.',
      ],
    ],
  },
  teclados: {
    bajada: 'En formato completo, TKL, 75% y 60%, con distintos tipos de switch.',
    preguntas: [
      [
        '¿Qué formato elijo?',
        'Full size trae teclado numérico. TKL lo saca y deja más lugar para el mouse. 75% y 60% son más compactos todavía: el 60% no tiene flechas ni fila de funciones.',
      ],
      [
        '¿Qué son los switches?',
        'Son el mecanismo de cada tecla. Los lineales (Red) son suaves, los táctiles tienen un tope que se siente y los clicky (Blue, Green) además hacen ruido al pulsar.',
      ],
      [
        '¿Inalámbrico o con cable?',
        'Con cable no dependés de la batería. Los inalámbricos del catálogo se conectan por receptor USB o por Bluetooth.',
      ],
    ],
  },
  mouses: {
    bajada: 'Con cable o inalámbricos, desde los más livianos hasta los de muchos botones.',
    preguntas: [
      [
        '¿Importa el peso?',
        'Para juegos de disparos se buscan mouses livianos, de 60 a 70 g. Uno más pesado puede resultar más estable para uso general.',
      ],
      [
        '¿Cuántos DPI necesito?',
        'Menos de los que figuran: casi nadie juega con más de 3200 DPI. El máximo sirve para comparar sensores, no como objetivo.',
      ],
      [
        '¿Con cable o inalámbrico?',
        'Con cable son más baratos y no hay que cargarlos. Los inalámbricos con receptor USB responden igual de rápido para jugar.',
      ],
    ],
  },
}

export default guias
