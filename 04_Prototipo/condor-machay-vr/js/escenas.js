/*
 * Datos del recorrido: Sendero a la cascada Cóndor Machay (Rumipamba, Rumiñahui).
 *
 * u = posición horizontal dentro de la imagen 360° (0 = borde izquierdo, 0.5 = centro, 1 = borde derecho).
 * e = elevación en grados (negativo = hacia abajo).
 * Para cambiar una imagen por una foto real del sitio basta con reemplazar el archivo
 * en assets/panoramas/ y ajustar los valores "u" de los puntos de interés.
 *
 * IMPORTANTE: Las imágenes actuales son REFERENCIALES (CC0, Poly Haven), no del sitio real.
 * Los datos marcados en la documentación como "por verificar" deben contrastarse en campo.
 */
window.ESCENAS = [
  {
    id: 'inicio',
    titulo: 'Inicio del sendero',
    kichwa: 'Ñan kallari',
    imagen: 'assets/panoramas/01_inicio.jpg',
    mirarU: 0.6,
    agua: 0.05,
    aves: 0.5,
    siguiente: { u: 0.6, e: -12 },
    anterior: null,
    narracion: [
      'Bienvenida y bienvenido al sendero de la cascada Cóndor Machay.',
      'Estamos en la parroquia Rumipamba, cantón Rumiñahui, provincia de Pichincha, a unos 2.900 metros sobre el nivel del mar.',
      'En la realidad, llegar a la cascada exige caminar entre una hora y media y tres horas por un camino de tierra, piedras, lodo y puentes estrechos.',
      'Hoy lo recorreremos juntos, a tu ritmo y sin barreras.'
    ],
    info: [
      {
        u: 0.42, e: 4,
        titulo: 'Rumiñahui: rostro de piedra',
        texto: 'El nombre del cantón viene del kichwa: rumi (piedra) y ñawi (ojo o rostro). Recuerda al general Rumiñahui, defensor de este territorio durante la conquista española.'
      },
      {
        u: 0.8, e: 2,
        titulo: '¿Por qué un recorrido virtual?',
        texto: 'Para una persona en silla de ruedas, con muletas o con movilidad reducida, este sendero es prácticamente imposible de recorrer: pendientes, raíces, escalones naturales y cruces de río. Además, en agosto de 2025 un derrumbe obligó al Municipio a cerrar el acceso. La realidad virtual permite conocer el lugar sin barreras y sin riesgos.'
      }
    ]
  },
  {
    id: 'bosque',
    titulo: 'Bosque andino',
    kichwa: 'Sacha',
    imagen: 'assets/panoramas/02_bosque.jpg',
    mirarU: 0.8,
    agua: 0.15,
    aves: 0.9,
    siguiente: { u: 0.8, e: -14 },
    anterior: { u: 0.1, e: -14 },
    narracion: [
      'Entramos al bosque andino.',
      'El camino avanza entre árboles cubiertos de musgo, helechos y plantas epífitas como las bromelias.',
      'La humedad que sube del río mantiene este ecosistema verde todo el año.',
      'Escucha: aquí comienzan a oírse las aves del bosque.'
    ],
    info: [
      {
        u: 0.55, e: 6,
        titulo: 'Sacha: el bosque',
        texto: 'En kichwa, sacha significa monte o bosque. Para los pueblos andinos el bosque es un espacio vivo con el que se convive y al que se respeta, no solo un recurso.'
      },
      {
        u: 0.95, e: 0,
        titulo: 'Barreras del sendero real',
        texto: 'En varios tramos el camino es angosto y tiene raíces expuestas y escalones naturales. Una silla de ruedas necesita un ancho libre de unos 90 centímetros y una superficie firme y continua, condiciones que este sendero no ofrece.'
      }
    ]
  },
  {
    id: 'puente',
    titulo: 'Cruce del río',
    kichwa: 'Chaka',
    imagen: 'assets/panoramas/03_puente.jpg',
    mirarU: 0.5,
    agua: 0.45,
    aves: 0.5,
    siguiente: { u: 0.5, e: -10 },
    anterior: { u: 0.0, e: -10 },
    narracion: [
      'Llegamos a uno de los puentes que cruzan el río.',
      'En el recorrido real hay varios cruces como este, algunos de madera y sin pasamanos firmes.',
      'Debajo, el agua baja limpia desde los páramos.'
    ],
    info: [
      {
        u: 0.3, e: 2,
        titulo: 'Chaka: el puente',
        texto: 'Chaka significa puente en kichwa. Los puentes unen comunidades y territorios; en el mundo andino también simbolizan el encuentro entre personas.'
      }
    ]
  },
  {
    id: 'rio',
    titulo: 'Orilla del río',
    kichwa: 'Mayu',
    imagen: 'assets/panoramas/04_rio.jpg',
    mirarU: 0.7,
    agua: 0.7,
    aves: 0.4,
    siguiente: { u: 0.7, e: -12 },
    anterior: { u: 0.2, e: -14 },
    narracion: [
      'Ahora caminamos junto al río.',
      'El sonido del agua se vuelve más fuerte a medida que nos acercamos a la cascada.',
      'Este río nace en los páramos, donde la paja y los musgos funcionan como esponjas que guardan el agua para todo el valle.'
    ],
    info: [
      {
        u: 0.82, e: 0,
        titulo: 'Yaku: el agua',
        texto: 'Yaku significa agua. En la cosmovisión andina el agua es un ser vivo y sagrado; vertientes y cascadas son lugares de purificación y energía, donde se realizan rituales como los baños del Inti Raymi.'
      },
      {
        u: 0.45, e: 4,
        titulo: 'Cuidemos el entorno',
        texto: 'Si visitas el lugar: no dejes basura, no te bañes en zonas de corriente y respeta los cierres y avisos del Municipio de Rumiñahui.'
      }
    ]
  },
  {
    id: 'quebrada',
    titulo: 'La quebrada',
    kichwa: 'Wayku',
    imagen: 'assets/panoramas/05_quebrada.jpg',
    mirarU: 0.74,
    agua: 0.8,
    aves: 0.25,
    siguiente: { u: 0.74, e: -12 },
    anterior: { u: 0.22, e: -12 },
    narracion: [
      'Entramos en la quebrada, el último tramo del camino.',
      'Las rocas están cubiertas de musgo y el suelo se vuelve húmedo y resbaloso.',
      'Ya estamos muy cerca del refugio del cóndor.'
    ],
    info: [
      {
        u: 0.4, e: 6,
        titulo: 'Kuntur: el cóndor andino',
        texto: 'El cóndor andino es el ave nacional del Ecuador y está en peligro de extinción. En la cosmovisión andina representa el Hanan Pacha, el mundo de arriba, y es mensajero entre la tierra y el cielo.'
      },
      {
        u: 0.95, e: 2,
        titulo: 'Wayku: la quebrada',
        texto: 'Wayku significa quebrada en kichwa: el cauce que el agua ha tallado entre las montañas durante miles de años.'
      }
    ]
  },
  {
    id: 'cascada',
    titulo: 'Cascada Cóndor Machay',
    kichwa: 'Kuntur Machay pakcha',
    imagen: 'assets/panoramas/06_cascada.jpg',
    mirarU: 0.36,
    agua: 1.0,
    aves: 0.2,
    siguiente: null,
    anterior: { u: 0.85, e: -12 },
    narracion: [
      'Hemos llegado a la cascada Cóndor Machay.',
      'Con cerca de 80 metros de altura, es considerada la cascada más alta del cantón Rumiñahui.',
      'Su nombre une dos palabras kichwas: kuntur, el cóndor, y machay, cueva o refugio. Es el refugio del cóndor.',
      'Tómate tu tiempo para mirar y escuchar.'
    ],
    info: [
      {
        u: 0.36, e: 14,
        titulo: 'Machay: el refugio',
        texto: 'Según relatos locales, los cóndores buscaban refugio en las cuevas de las paredes de roca cercanas a la cascada, y de ahí viene su nombre.'
      },
      {
        u: 0.6, e: 2,
        titulo: 'Fin del recorrido',
        texto: 'Gracias por recorrer el sendero. Puedes volver a cualquier parada desde el mapa, o reiniciar el recorrido desde el inicio.'
      }
    ]
  }
];
