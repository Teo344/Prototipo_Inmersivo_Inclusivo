# Diseño UX: Sendero Cóndor Machay VR

## 1. Personas

**Rosa, 34 años: usuaria de silla de ruedas (lesión medular), Sangolquí**
- Usa celular y computadora sin problema. Le encanta la naturaleza, pero sus amigos van a las cascadas y ella se queda.
- Necesita: modo sentado, información honesta sobre la accesibilidad y sentir que "estuvo ahí".
- Usa: ratón o táctil y, a veces, un visor VR prestado.

**Don Luis, 71 años: adulto mayor con artrosis y bastón, Rumipamba**
- Conoció la cascada de joven y ya no puede caminar el sendero. Ve poco de cerca.
- Necesita: texto grande, narración por voz, controles simples y ningún apuro.
- Usa: computadora con teclado y la opción de recorrido automático.

**Mateo, 16 años: parálisis cerebral, usa un pulsador adaptado**
- Controla la computadora con un solo botón conectado como tecla ESPACIO.
- Necesita: modo un botón (barrido) con velocidad lenta y botones grandes.

## 2. Escenario principal
1. Rosa abre el enlace en su celular. Aparece la bienvenida: elige "Mirada" y pulsa **Comenzar**.
2. Escucha la narración del inicio del sendero con subtítulos; mueve el celular para mirar alrededor.
3. Toca el punto azul ⓘ "¿Por qué un recorrido virtual?" y lee sobre las barreras y el cierre del sendero.
4. Mira fijamente la flecha amarilla "Avanzar: Bosque andino" durante 2 s: fundido y siguiente parada.
5. En el puente pulsa 🗺️ **Mapa** y salta directamente a la **cascada**. El sonido del agua sube.
6. Escucha el significado de *Kuntur Machay*, "refugio del cóndor".

## 3. Flujo
```
Bienvenida (elige modos de control) ─► Parada 1 ─► 2 ─► 3 ─► 4 ─► 5 ─► Parada 6 (cascada)
                                          ▲  ◄─── Anterior / Siguiente / Mapa (salto directo) ───►
             En cada parada: [Narrar] [ⓘ Información] [Girar ↺ ↻] [Ajustes]
```

## 4. Paradas del recorrido
| # | Parada | Kichwa | Contenido cultural / informativo |
|---|---|---|---|
| 1 | Inicio del sendero | Ñan kallari | Rumiñahui = *rumi* (piedra) + *ñawi* (rostro); barreras reales y cierre del sendero |
| 2 | Bosque andino | Sacha | Bosque como espacio vivo; ancho mínimo de paso para una silla de ruedas |
| 3 | Cruce del río | Chaka | El puente como unión de comunidades |
| 4 | Orilla del río | Mayu | *Yaku*: el agua sagrada; baños rituales del Inti Raymi; cuidado del entorno |
| 5 | La quebrada | Wayku | *Kuntur*: el cóndor andino, ave nacional y mensajero del *Hanan Pacha* |
| 6 | Cascada Cóndor Machay | Kuntur Machay pakcha | ≈ 80 m de altura; *machay* = cueva o refugio |

## 5. Interfaz (wireframe)
```
┌───────────────────────────────────────────────────────────────┐
│ ┌──────────────────┐                              [ VR ]      │
│ │ Parada 2 de 6    │                 Imágenes referenciales   │
│ │ Bosque andino    │                                          │
│ │ Sacha            │        (ⓘ)                               │
│ └──────────────────┘                    (^)                   │
│                             Barreras   Avanzar:               │
│        imagen 360°          del sendero Cruce del río         │
│  ┌──────────────────────────────────────────────────────┐     │
│  │  Subtítulos: «Entramos al bosque andino.»            │     │
│  └──────────────────────────────────────────────────────┘     │
│  [⏮ Anterior][↺ Girar][🔊 Narrar][ℹ Info][🗺 Mapa][↻ Girar][⏭ Siguiente][⚙]│
└───────────────────────────────────────────────────────────────┘
```

## 6. Decisiones de accesibilidad
| Decisión | Justificación |
|---|---|
| Navegación por paradas con fundido, sin caminar de forma continua | Evita el cibermareo (XAUR) y no exige control fino |
| Giro por pasos de 30° con botones o joystick | Permite usarlo sentado y sin girar el cuerpo |
| Amarillo para avanzar o regresar, celeste para información, con halo oscuro y etiqueta de texto | Contraste alto sobre cualquier fondo; no depende solo del color |
| Botones de 64 px o más (76 px con texto grande) | WCAG 2.5.8 y motricidad reducida |
| Modo barrido, voz, mirada y recorrido automático | Varias vías de entrada según la capacidad motriz |
| Narración + subtítulos frase por frase | Doble canal: audio y texto |
| Términos kichwa con su significado | Enfoque intercultural y valoración del patrimonio inmaterial |
| Avisos honestos (imágenes referenciales, cierre del sitio) | Información veraz para decidir una visita real |
