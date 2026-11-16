# Sendero Cóndor Machay VR: prototipo web inmersivo e inclusivo

Recorrido virtual 360° por el sendero y la cascada Cóndor Machay (Rumipamba, Rumiñahui, Ecuador), diseñado para personas con discapacidad física.
Hecho con **A-Frame 1.6 (WebXR)**: funciona en el navegador de una computadora, en el celular y en visores VR (Meta Quest, etc.).

## Cómo abrirlo
1. Doble clic en **`iniciar.bat`**. Necesita Python instalado; abre `http://localhost:8000`.
   - Alternativa: en VS Code, extensión *Live Server* → "Open with Live Server".
   - **No** sirve abrir `index.html` con doble clic: el navegador bloquea las imágenes 360° si no hay servidor.
2. Para abrir una parada directamente: `http://localhost:8000/?parada=6`.
3. Para publicarlo gratis con un enlace: subir la carpeta a **GitHub Pages** o **Netlify Drop**. HTTPS es obligatorio para usar el visor VR, el giroscopio del celular y el micrófono.

## Funciones de accesibilidad
| Función | Cómo se usa |
|---|---|
| Ratón o táctil | Arrastrar para mirar; clic en las flechas amarillas (avanzar o regresar) y en los puntos celestes ⓘ |
| Teclado | ← → girar · ↑ / N siguiente · ↓ / P anterior · L narrar · I información · M mapa · A ajustes · S o Esc detener la voz |
| Un solo botón (barrido) | Los botones se resaltan en rojo uno por uno; ESPACIO, ENTER o un clic eligen. Velocidad ajustable |
| Voz (Chrome o Edge) | «siguiente», «anterior», «izquierda», «derecha», «narrar», «información», «mapa», «detener», «cerrar», «ayuda» |
| Mirada | Mirar fijo un punto durante 1,5, 2 o 3 s para seleccionarlo (celular o visor) |
| Recorrido automático | Avanza solo después de cada narración |
| Visor VR | Botón «VR»; láser de los mandos para elegir; joystick para girar 30° |
| Lectura | Narración por voz + subtítulos, texto grande, alto contraste, nombres en kichwa |
| Comodidad | Sin movimiento continuo, fundido entre paradas, giro por pasos, opción de reducir animaciones |

## Estructura
```
index.html            interfaz accesible + escena A-Frame
css/estilos.css       estilos (alto contraste, texto grande, responsive)
js/escenas.js         CONTENIDO: paradas, narraciones, puntos de información
js/app.js             lógica: navegación, narración, audio, barrido, voz, ajustes
js/componentes.js     componente A-Frame de giro con joystick
assets/panoramas/     imágenes 360° (equirectangulares 2:1, 4096×2048)
```

## Cambiar por fotos reales del sitio
1. Tomar fotos 360° en cada parada: con la app Google Street View o la cámara panorámica / *Photo Sphere* del celular, o con una cámara 360 (Insta360, Ricoh Theta).
2. Exportar en formato equirectangular 2:1 (idealmente 4096×2048) y reemplazar `assets/panoramas/0X_*.jpg`.
3. En `js/escenas.js`, ajustar `mirarU` (hacia dónde mira la cámara al llegar) y la `u` de cada punto: 0 = borde izquierdo de la foto, 0,5 = centro, 1 = borde derecho.

## Créditos de imágenes (referenciales, CC0, Poly Haven, https://polyhaven.com)
| Archivo | Original | Autor |
|---|---|---|
| 01_inicio.jpg | Lush Dirt Path | Poly Haven |
| 02_bosque.jpg | Rainforest Trail | Poly Haven |
| 03_puente.jpg | Wobbly Bridge | Poly Haven |
| 04_rio.jpg | Lauter Waterfall | Poly Haven |
| 05_quebrada.jpg | Mossy Forest | Poly Haven |
| 06_cascada.jpg | Blue Grotto | Poly Haven |

Las imágenes **no corresponden al sitio real**. Se usan solo para el prototipo, y la aplicación lo indica en pantalla.
El sonido ambiente (agua y aves) se genera por código con Web Audio, sin archivos externos.
