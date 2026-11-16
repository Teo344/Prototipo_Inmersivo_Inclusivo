# Matriz de necesidades → requisitos

Grupo: personas con discapacidad física (movilidad reducida). Experiencia: recorrido virtual 360° por el sendero y la cascada Cóndor Machay (Rumiñahui).

| ID | Necesidad del grupo | Tipo | Evidencia / fuente | Requisito derivado | Prioridad (MoSCoW) |
|---|---|---|---|---|---|
| N01 | Conocer la cascada sin recorrer físicamente un sendero de unos 8 km con pendientes, lodo y raíces | Física | Descripción del sendero (MINTUR, prensa); Ficha §2 | **RF-01** Recorrido por 6 paradas 360° (inicio → bosque → puente → río → quebrada → cascada) | Must |
| N02 | Usar la aplicación sentado, sin girar el cuerpo | Física | XAUR (W3C): modo sentado | **RA-01** Botones y teclas para girar la vista (pasos de 30°); espacio de referencia WebXR *local* (sentado) | Must |
| N03 | Controlar la app con poca precisión o fuerza en las manos | Física / motriz | WCAG 2.5.8 (tamaño del objetivo) | **RA-02** Botones de al menos 64 px; puntos 3D grandes; sin gestos complejos ni arrastres obligatorios | Must |
| N04 | Usar un solo pulsador o interruptor adaptado | Física / motriz | Usuarios de pulsadores (tecnología de apoyo) | **RA-03** Modo un botón (barrido automático) con velocidad ajustable: ESPACIO, ENTER o un clic eligen | Must |
| N05 | No poder usar las manos en absoluto | Física | — | **RA-04** Comandos de voz en español; selección por mirada (2 s); recorrido automático | Should |
| N06 | Navegar solo con teclado | Física / motriz | WCAG 2.1.1 | **RA-05** Todas las funciones con teclado (flechas, N/P, L, I, M, A); foco visible | Must |
| N07 | No marearse (cibermareo) | Física / comodidad | XAUR; literatura de VR | **RNF-01** Sin movimiento continuo: saltos con fundido; giro por pasos; opción de reducir animaciones | Must |
| N08 | Tener tiempo suficiente, sin presión | Cognitiva / emocional | WCAG 2.2.1 | **RA-06** Sin límites de tiempo; el recorrido automático es opcional y se puede detener | Must |
| N09 | Comprender la información aunque haya baja visión o audición | Sensorial (secundaria) | WCAG 1.2.2 y 1.4.4 | **RA-07** Narración por voz + subtítulos frase por frase; texto grande; alto contraste | Must |
| N10 | Sentirse realmente en el lugar (presencia) | Emocional | Objetivo de inclusión turística | **RF-02** Sonido ambiente de agua (sube al acercarse a la cascada) y aves; imágenes 360° | Should |
| N11 | Conocer el significado cultural del lugar | Cultural / lingüística | Toponimia kichwa del cantón | **RF-03** Puntos de información con palabras kichwa (*kuntur, machay, yaku, sacha, chaka, wayku*) y su cosmovisión | Must |
| N12 | Saber dónde estoy y poder saltar a cualquier punto | Cognitiva | WCAG 2.4.8 (ubicación) | **RF-04** Indicador "Parada X de 6" y mapa del sendero con saltos directos | Must |
| N13 | Acceder sin comprar equipos caros | Económica | Contexto socioeconómico | **RNF-02** App web (WebXR): funciona en navegador de PC o celular; visor VR opcional | Must |
| N14 | Funcionar con lectores de pantalla | Sensorial | WCAG 4.1.2 / 4.1.3 | **RA-08** HTML semántico, `aria-live` para anunciar cambios de parada, diálogos nativos | Should |
| N15 | Recordar mis preferencias | Cognitiva / comodidad | — | **RNF-03** Guardar los ajustes en el navegador | Could |
| N16 | Información veraz sobre la accesibilidad y la seguridad del sitio real | Física / seguridad | Cierre por derrumbe (agosto 2025) | **RF-05** Avisos sobre las barreras reales, el cierre y el carácter referencial de las imágenes | Must |
| N17 | Ver el sitio real (no imágenes similares) | Todas | — | **RF-06** Sustituir las imágenes referenciales por fotos 360° tomadas en el sitio | Should (fase 2) |

## Requisitos de accesibilidad (RA): resumen
- **Percepción:** subtítulos sincronizados con la narración, texto grande, alto contraste, iconos con etiqueta de texto, sonido ambiente con volumen ajustable.
- **Operación:** ratón o táctil, teclado, un solo botón (barrido), voz, mirada, mandos VR (láser y giro con joystick), modo sentado, sin límite de tiempo.
- **Comprensión:** lenguaje claro, frases cortas, términos kichwa explicados, mapa del recorrido.
- **Comodidad:** sin desplazamiento continuo, giro por pasos, fundido entre escenas, opción de reducir animaciones.
