/*
 * Sendero Cóndor Machay · Recorrido inmersivo accesible
 * Lógica principal: navegación por paradas, puntos interactivos, narración,
 * subtítulos, audio ambiente, modo un botón (barrido), comandos de voz y ajustes.
 */
(function () {
  'use strict';

  const ESC = window.ESCENAS;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const rad = (g) => g * Math.PI / 180;
  const grad = (r) => r * 180 / Math.PI;
  const esperar = (ms) => new Promise((res) => setTimeout(res, ms));

  /* ------------------------------------------------------------------ */
  /* Ajustes (se recuerdan en este navegador)                            */
  /* ------------------------------------------------------------------ */
  const PREDETERMINADOS = {
    textoGrande: false,
    altoContraste: false,
    subtitulos: true,
    kichwa: true,
    narracionAuto: true,
    velocidadVoz: '1',
    volumenAmbiente: 0.5,
    barrido: false,
    intervaloBarrido: '2500',
    voz: false,
    mirada: false,
    tiempoMirada: '2000',
    giro: 'pasos',
    reducirAnimaciones: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    recorridoAuto: false
  };
  let ajustes = cargarAjustes();

  function cargarAjustes() {
    try {
      return Object.assign({}, PREDETERMINADOS, JSON.parse(localStorage.getItem('cm-ajustes') || '{}'));
    } catch (e) {
      return Object.assign({}, PREDETERMINADOS);
    }
  }
  function guardarAjustes() {
    try { localStorage.setItem('cm-ajustes', JSON.stringify(ajustes)); } catch (e) { /* sin almacenamiento */ }
  }

  /* ------------------------------------------------------------------ */
  /* Referencias                                                         */
  /* ------------------------------------------------------------------ */
  const escena = $('#escena');
  const cielo = $('#cielo');
  const puntos = $('#puntos');
  const rig = $('#rig');
  const camara = $('#camara');
  const cursorMirada = $('#cursor-mirada');
  const panelVR = $('#panel-vr');
  const dlgBienvenida = $('#dlg-bienvenida');
  const dlgInfo = $('#dlg-info');
  const dlgMapa = $('#dlg-mapa');
  const dlgAjustes = $('#dlg-ajustes');
  const formAjustes = $('#form-ajustes');

  let indice = 0;
  let yawRig = 0;
  let transicionando = false;
  let srcActual = null;
  let temporizadorAuto = null;
  let recorridoIniciado = false;

  /* ------------------------------------------------------------------ */
  /* Geometría 360°                                                      */
  /* u = posición horizontal en la imagen equirectangular (0..1).        */
  /* ------------------------------------------------------------------ */
  function posicionDesdeU(u, e, r) {
    const a = 2 * Math.PI * u;
    const el = rad(e);
    return new THREE.Vector3(Math.cos(a) * Math.cos(el) * r, Math.sin(el) * r, Math.sin(a) * Math.cos(el) * r);
  }
  // Rotación del rig para que la cámara mire hacia la posición u de la imagen.
  function yawParaU(u) {
    const a = 2 * Math.PI * u;
    return Math.atan2(-Math.cos(a), -Math.sin(a));
  }
  function enVR() { return escena.is && escena.is('vr-mode'); }

  /* ------------------------------------------------------------------ */
  /* Texturas dibujadas en canvas (permite tildes y ñ en la escena 3D)   */
  /* ------------------------------------------------------------------ */
  function partirLineas(g, texto, maxAncho) {
    const palabras = texto.split(/\s+/);
    const lineas = [];
    let linea = '';
    palabras.forEach((p) => {
      const prueba = linea ? linea + ' ' + p : p;
      if (g.measureText(prueba).width > maxAncho && linea) { lineas.push(linea); linea = p; } else { linea = prueba; }
    });
    if (linea) lineas.push(linea);
    return lineas;
  }
  function rectRedondeado(g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }

  function texturaPunto(tipo, etiqueta) {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 700;
    const g = c.getContext('2d');
    const color = tipo === 'info' ? '#2ec4f1' : '#ffd23f';
    // Halo oscuro para contraste sobre cualquier fondo
    g.beginPath(); g.arc(256, 210, 200, 0, Math.PI * 2); g.fillStyle = 'rgba(0,0,0,0.5)'; g.fill();
    g.beginPath(); g.arc(256, 210, 165, 0, Math.PI * 2); g.fillStyle = color; g.fill();
    g.lineWidth = 16; g.strokeStyle = '#ffffff'; g.stroke();
    g.fillStyle = '#111'; g.strokeStyle = '#111';
    if (tipo === 'info') {
      g.font = 'bold 220px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText('i', 256, 222);
    } else {
      g.lineWidth = 48; g.lineCap = 'round'; g.lineJoin = 'round';
      g.beginPath();
      if (tipo === 'anterior') { g.moveTo(160, 170); g.lineTo(256, 266); g.lineTo(352, 170); }
      else { g.moveTo(160, 256); g.lineTo(256, 160); g.lineTo(352, 256); }
      g.stroke();
    }
    // Etiqueta
    g.font = 'bold 50px system-ui, Segoe UI, Arial, sans-serif';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    const lineas = partirLineas(g, etiqueta, 470).slice(0, 3);
    const alto = lineas.length * 60 + 30;
    rectRedondeado(g, 6, 430, 500, alto, 24);
    g.fillStyle = 'rgba(0,0,0,0.82)'; g.fill();
    g.fillStyle = '#ffffff';
    lineas.forEach((l, i) => g.fillText(l, 256, 430 + 45 + i * 60));
    return c;
  }

  function texturaPanel(titulo, texto) {
    const c = document.createElement('canvas');
    c.width = 1024; c.height = 720;
    const g = c.getContext('2d');
    rectRedondeado(g, 8, 8, 1008, 704, 36);
    g.fillStyle = 'rgba(14, 34, 24, 0.95)'; g.fill();
    g.lineWidth = 8; g.strokeStyle = '#2ec4f1'; g.stroke();
    g.fillStyle = '#ffd23f'; g.font = 'bold 56px system-ui, Segoe UI, Arial, sans-serif'; g.textBaseline = 'top';
    partirLineas(g, titulo, 920).slice(0, 2).forEach((l, i) => g.fillText(l, 52, 44 + i * 64));
    g.fillStyle = '#ffffff'; g.font = '40px system-ui, Segoe UI, Arial, sans-serif';
    partirLineas(g, texto, 920).slice(0, 9).forEach((l, i) => g.fillText(l, 52, 190 + i * 52));
    g.fillStyle = '#ffd23f'; g.font = 'bold 40px system-ui, Segoe UI, Arial, sans-serif'; g.textAlign = 'center';
    g.fillText('✕  Seleccionar para cerrar', 512, 656);
    return c;
  }

  /* ------------------------------------------------------------------ */
  /* Puntos interactivos en la escena                                    */
  /* ------------------------------------------------------------------ */
  // Malla plana con textura de canvas. Se crea directamente con three.js porque
  // A-Frame cachea las texturas de canvas sin id y todas acabarían iguales.
  function mallaCanvas(c, ancho) {
    const tex = new THREE.CanvasTexture(c);
    if ('colorSpace' in tex) tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, alphaTest: 0.02 });
    return new THREE.Mesh(new THREE.PlaneGeometry(ancho, ancho * c.height / c.width), mat);
  }
  function vaciarMallas(contenedor) {
    while (contenedor.firstChild) {
      const el = contenedor.firstChild;
      const malla = el.getObject3D('mesh');
      contenedor.removeChild(el);
      if (malla) {
        malla.geometry.dispose();
        malla.material.map.dispose();
        malla.material.dispose();
      }
    }
  }
  // Coloca la entidad en p y la orienta hacia el usuario (origen).
  function orientarHaciaUsuario(el, p) {
    const o = new THREE.Object3D();
    o.rotation.order = 'YXZ'; // mismo orden que usa A-Frame
    o.position.copy(p);
    o.lookAt(0, 0, 0);
    el.setAttribute('position', { x: p.x, y: p.y, z: p.z });
    el.setAttribute('rotation', { x: grad(o.rotation.x), y: grad(o.rotation.y), z: grad(o.rotation.z) });
  }

  function crearPunto(opc) {
    const c = texturaPunto(opc.tipo, opc.etiqueta);
    const el = document.createElement('a-entity');
    el.classList.add('clicable');
    orientarHaciaUsuario(el, posicionDesdeU(opc.u, opc.e, opc.r || 7));
    el.addEventListener('mouseenter', () => { if (!ajustes.reducirAnimaciones) el.setAttribute('scale', '1.15 1.15 1.15'); });
    el.addEventListener('mouseleave', () => el.setAttribute('scale', '1 1 1'));
    el.addEventListener('click', () => { if (!transicionando) opc.alActivar(); });
    puntos.appendChild(el);
    el.setObject3D('mesh', mallaCanvas(c, opc.tam || 2));
    return el;
  }

  function construirPuntos(e) {
    vaciarMallas(puntos);
    const i = ESC.indexOf(e);
    if (e.siguiente) {
      const s = ESC[i + 1];
      crearPunto({ tipo: 'siguiente', u: e.siguiente.u, e: e.siguiente.e, etiqueta: 'Avanzar: ' + s.titulo, alActivar: siguiente });
    }
    if (e.anterior) {
      const a = ESC[i - 1];
      crearPunto({ tipo: 'anterior', u: e.anterior.u, e: e.anterior.e, etiqueta: 'Regresar: ' + a.titulo, alActivar: anterior });
    }
    e.info.forEach((inf) => {
      crearPunto({ tipo: 'info', u: inf.u, e: inf.e, etiqueta: inf.titulo, tam: 1.6, alActivar: () => abrirInfo([inf]) });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Panel informativo dentro de la realidad virtual                     */
  /* ------------------------------------------------------------------ */
  function direccionMirada() {
    const v = new THREE.Vector3();
    const r = escena.renderer;
    if (r && r.xr && r.xr.isPresenting) r.xr.getCamera().getWorldDirection(v);
    else camara.getObject3D('camera').getWorldDirection(v);
    v.y = Math.max(-0.25, Math.min(0.25, v.y));
    return v.normalize();
  }
  function mostrarPanelVR(inf) {
    cerrarPanelVR();
    const c = texturaPanel(inf.titulo, inf.texto);
    const el = document.createElement('a-entity');
    el.classList.add('clicable');
    orientarHaciaUsuario(el, direccionMirada().multiplyScalar(3.5));
    el.addEventListener('click', cerrarPanelVR);
    panelVR.appendChild(el);
    el.setObject3D('mesh', mallaCanvas(c, 3.2));
    panelVR.setAttribute('visible', true);
  }
  function cerrarPanelVR() {
    vaciarMallas(panelVR);
    panelVR.setAttribute('visible', false);
  }

  /* ------------------------------------------------------------------ */
  /* Transiciones                                                        */
  /* ------------------------------------------------------------------ */
  function fundir(opacidad) {
    const dur = ajustes.reducirAnimaciones ? 150 : 400;
    $('#fundido').style.opacity = opacidad;
    const plano = $('#fundido-vr');
    const mat = plano.getObject3D('mesh') && plano.getObject3D('mesh').material;
    if (mat) {
      const desde = mat.opacity;
      const t0 = performance.now();
      const paso = (t) => {
        const k = Math.min(1, (t - t0) / dur);
        mat.opacity = desde + (opacidad - desde) * k;
        if (k < 1) requestAnimationFrame(paso);
      };
      requestAnimationFrame(paso);
    }
    return esperar(dur + 30);
  }

  const imagenes = new Map();
  function cargarImagen(src) {
    if (imagenes.has(src)) return imagenes.get(src);
    const carga = new Promise((res, rechazar) => {
      const im = new Image();
      let hecho = false;
      const fin = (error) => {
        if (hecho) return;
        hecho = true;
        clearTimeout(temporizador);
        im.onload = im.onerror = null;
        if (error) rechazar(error); else res(im);
      };
      const temporizador = setTimeout(() => fin(new Error('Tiempo agotado al cargar: ' + src)), 12000);
      im.crossOrigin = 'anonymous';
      im.onload = () => {
        if (im.decode) im.decode().then(() => fin(), fin); else fin();
      };
      im.onerror = () => fin(new Error('No se pudo cargar: ' + src));
      im.src = src;
    });
    imagenes.set(src, carga);
    carga.catch(() => imagenes.delete(src));
    return carga;
  }

  async function cargarCielo(src) {
    if (src === srcActual) return;
    const im = await cargarImagen(src);
    // A-Frame puede reutilizar la textura sin emitir materialtextureloaded.
    cielo.setAttribute('material', { src: im, color: '#ffffff', shader: 'flat', side: 'back', npot: true });
    srcActual = src;
  }

  function precargar(i) {
    if (ESC[i]) cargarImagen(ESC[i].imagen).catch(() => { /* se reintenta al navegar */ });
  }

  function reiniciarMirada() {
    const lc = camara.components['look-controls'];
    if (lc && lc.pitchObject && lc.yawObject) {
      lc.pitchObject.rotation.x = 0;
      lc.yawObject.rotation.y = 0;
    }
  }

  /* ------------------------------------------------------------------ */
  /* Navegación                                                          */
  /* ------------------------------------------------------------------ */
  async function irA(i, opciones) {
    opciones = opciones || {};
    if (i < 0 || i >= ESC.length || transicionando) return;
    transicionando = true;
    cancelarAuto();
    Narrador.detener();
    cerrarPanelVR();
    const e = ESC[i];
    try {
      await fundir(1);
      await cargarCielo(e.imagen);
      indice = i;
      construirPuntos(e);
      yawRig = yawParaU(e.mirarU);
      rig.object3D.rotation.y = yawRig;
      reiniciarMirada();
      actualizarUI();
      Ambiente.ajustar(e.agua, e.aves);
    } catch (error) {
      console.error('No se pudo cambiar de parada.', error);
      return;
    } finally {
      try { await fundir(0); } finally { transicionando = false; }
    }
    precargar(i + 1);
    precargar(i - 1);

    if (opciones.silencioso) return;
    anunciar('Parada ' + (i + 1) + ' de ' + ESC.length + ': ' + e.titulo);
    if (ajustes.narracionAuto || ajustes.recorridoAuto) {
      Narrador.hablar(e.narracion, programarAuto);
    } else {
      programarAuto();
    }
  }
  function siguiente() { irA(indice + 1); }
  function anterior() { irA(indice - 1); }

  function girar(grados) {
    const destino = yawRig + rad(grados);
    if (ajustes.giro === 'suave' && !ajustes.reducirAnimaciones) {
      const desde = yawRig;
      const t0 = performance.now();
      const paso = (t) => {
        const k = Math.min(1, (t - t0) / 500);
        const suav = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        rig.object3D.rotation.y = desde + (destino - desde) * suav;
        if (k < 1) requestAnimationFrame(paso);
      };
      requestAnimationFrame(paso);
    } else {
      rig.object3D.rotation.y = destino;
    }
    yawRig = destino;
  }

  function cancelarAuto() {
    if (temporizadorAuto) { clearTimeout(temporizadorAuto); temporizadorAuto = null; }
  }
  function programarAuto() {
    cancelarAuto();
    if (!ajustes.recorridoAuto || indice >= ESC.length - 1) return;
    const espera = (ajustes.narracionAuto || ajustes.recorridoAuto) ? 7000 : 20000;
    temporizadorAuto = setTimeout(() => {
      if (!ajustes.recorridoAuto || $$('dialog[open]').length) { programarAuto(); return; }
      siguiente();
    }, espera);
  }

  /* ------------------------------------------------------------------ */
  /* Interfaz                                                            */
  /* ------------------------------------------------------------------ */
  function actualizarUI() {
    const e = ESC[indice];
    $('#progreso').textContent = 'Parada ' + (indice + 1) + ' de ' + ESC.length;
    $('#titulo-escena').textContent = e.titulo;
    $('#titulo-kichwa').textContent = ajustes.kichwa ? e.kichwa : '';
    document.title = e.titulo + ' · Sendero Cóndor Machay';
    $('[data-accion="anterior"]').disabled = indice === 0;
    $('[data-accion="siguiente"]').disabled = indice === ESC.length - 1;
    $('[data-accion="info"]').disabled = !e.info.length;
    construirMapa();
  }

  function anunciar(texto) {
    const a = $('#anuncio');
    a.textContent = '';
    setTimeout(() => { a.textContent = texto; }, 60);
  }

  function mostrarSubtitulo(texto) {
    const s = $('#subtitulos');
    s.textContent = texto;
    s.hidden = !ajustes.subtitulos || !texto;
  }

  function abrirDialogo(d) {
    $$('dialog[open]').forEach((x) => { if (x !== d) x.close(); });
    if (!d.open) d.showModal();
    Barrido.reiniciar();
  }

  function abrirInfo(lista) {
    if (!lista || !lista.length) return;
    if (enVR()) {
      mostrarPanelVR(lista[0]);
      if (ajustes.narracionAuto) Narrador.hablar([lista[0].titulo + '.', lista[0].texto]);
      return;
    }
    const cont = $('#info-contenido');
    cont.innerHTML = '';
    $('#info-titulo').textContent = lista.length === 1 ? lista[0].titulo : 'Información: ' + ESC[indice].titulo;
    lista.forEach((inf) => {
      if (lista.length > 1) {
        const h = document.createElement('h3');
        h.textContent = inf.titulo;
        cont.appendChild(h);
      }
      const p = document.createElement('p');
      p.textContent = inf.texto;
      cont.appendChild(p);
    });
    $('#info-leer').onclick = () => {
      const frases = [];
      lista.forEach((inf) => { frases.push(inf.titulo + '.'); frases.push(inf.texto); });
      Narrador.hablar(frases);
    };
    abrirDialogo(dlgInfo);
  }

  function construirMapa() {
    const ol = $('#mapa-lista');
    ol.innerHTML = '';
    ESC.forEach((e, i) => {
      const li = document.createElement('li');
      if (i === indice) li.classList.add('actual');
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('data-escaneable', '');
      if (i === indice) b.setAttribute('aria-current', 'step');
      b.innerHTML = '<span class="num" aria-hidden="true"></span><span><span class="nom"></span><br><span class="kq" lang="qu"></span></span>' +
        (i === indice ? '<span class="etq-actual">Estás aquí</span>' : '');
      b.querySelector('.num').textContent = i + 1;
      b.querySelector('.nom').textContent = e.titulo;
      b.querySelector('.kq').textContent = ajustes.kichwa ? e.kichwa : '';
      b.setAttribute('aria-label', 'Parada ' + (i + 1) + ': ' + e.titulo + (i === indice ? ' (estás aquí)' : ''));
      b.addEventListener('click', () => { dlgMapa.close(); irA(i); });
      li.appendChild(b);
      ol.appendChild(li);
    });
  }

  function ejecutarAccion(accion) {
    switch (accion) {
      case 'anterior': cancelarAuto(); anterior(); break;
      case 'siguiente': cancelarAuto(); siguiente(); break;
      case 'girar-izq': girar(30); break;
      case 'girar-der': girar(-30); break;
      case 'narrar':
        if (Narrador.activo) Narrador.detener(); else Narrador.hablar(ESC[indice].narracion);
        break;
      case 'info': abrirInfo(ESC[indice].info); break;
      case 'mapa': construirMapa(); abrirDialogo(dlgMapa); break;
      case 'ajustes': llenarFormulario(); abrirDialogo(dlgAjustes); break;
    }
  }

  /* ------------------------------------------------------------------ */
  /* Narración con voz sintética + subtítulos frase por frase            */
  /* ------------------------------------------------------------------ */
  let vozEspanol = null;
  function elegirVoz() {
    if (!('speechSynthesis' in window)) return;
    const voces = speechSynthesis.getVoices();
    const prefer = ['es-EC', 'es-419', 'es-CO', 'es-MX', 'es-US', 'es-ES'];
    for (const l of prefer) {
      const v = voces.find((x) => x.lang && x.lang.replace('_', '-').toLowerCase() === l.toLowerCase());
      if (v) { vozEspanol = v; return; }
    }
    vozEspanol = voces.find((x) => x.lang && x.lang.toLowerCase().startsWith('es')) || null;
  }
  if ('speechSynthesis' in window) {
    elegirVoz();
    speechSynthesis.addEventListener('voiceschanged', elegirVoz);
  }

  const Narrador = {
    activo: false,
    token: 0,
    hablar(frases, alTerminar) {
      this.detener();
      const t = ++this.token;
      let i = 0;
      this.activo = true;
      const sig = () => {
        if (t !== this.token) return;
        if (i >= frases.length) {
          this.activo = false;
          mostrarSubtitulo('');
          if (alTerminar) alTerminar();
          return;
        }
        const f = frases[i++];
        mostrarSubtitulo(f);
        const vel = parseFloat(ajustes.velocidadVoz) || 1;
        if ('speechSynthesis' in window && vozEspanol !== undefined) {
          const u = new SpeechSynthesisUtterance(f);
          u.lang = (vozEspanol && vozEspanol.lang) || 'es-EC';
          if (vozEspanol) u.voice = vozEspanol;
          u.rate = vel;
          u.onend = () => setTimeout(sig, 300);
          u.onerror = () => setTimeout(sig, 300);
          speechSynthesis.speak(u);
        } else {
          setTimeout(sig, Math.max(2500, f.length * 70) / vel);
        }
      };
      sig();
    },
    detener() {
      this.token++;
      this.activo = false;
      if ('speechSynthesis' in window) speechSynthesis.cancel();
      mostrarSubtitulo('');
    }
  };

  /* ------------------------------------------------------------------ */
  /* Audio ambiente generado (agua + aves), sin archivos externos        */
  /* ------------------------------------------------------------------ */
  const Ambiente = {
    ctx: null, maestro: null, agua: null, filtro: null, nivelAves: 0, temporizador: null,
    iniciar() {
      if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx = this.ctx = new AC();
      this.maestro = ctx.createGain();
      this.maestro.gain.value = ajustes.volumenAmbiente;
      this.maestro.connect(ctx.destination);
      // Ruido marrón = rumor de agua
      const dur = 4;
      const buf = ctx.createBuffer(2, ctx.sampleRate * dur, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const d = buf.getChannelData(ch);
        let ultimo = 0;
        for (let i = 0; i < d.length; i++) {
          const blanco = Math.random() * 2 - 1;
          ultimo = (ultimo + 0.02 * blanco) / 1.02;
          d[i] = ultimo * 3.5;
        }
      }
      const fuente = ctx.createBufferSource();
      fuente.buffer = buf; fuente.loop = true;
      this.filtro = ctx.createBiquadFilter();
      this.filtro.type = 'lowpass'; this.filtro.frequency.value = 600;
      this.agua = ctx.createGain(); this.agua.gain.value = 0;
      fuente.connect(this.filtro).connect(this.agua).connect(this.maestro);
      fuente.start();
      this.cantar();
    },
    ajustar(nivelAgua, nivelAves) {
      this.nivelAves = nivelAves;
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      this.agua.gain.cancelScheduledValues(t);
      this.agua.gain.setValueAtTime(this.agua.gain.value, t);
      this.agua.gain.linearRampToValueAtTime(0.05 + nivelAgua * 0.9, t + 1.5);
      this.filtro.frequency.setTargetAtTime(400 + nivelAgua * 1800, t, 0.5);
    },
    volumen(v) { if (this.maestro) this.maestro.gain.setTargetAtTime(v, this.ctx.currentTime, 0.2); },
    trino() {
      const ctx = this.ctx;
      const notas = 2 + Math.floor(Math.random() * 4);
      const base = 2200 + Math.random() * 2200;
      const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      const g = ctx.createGain();
      g.gain.value = 0;
      if (pan) { pan.pan.value = Math.random() * 2 - 1; g.connect(pan).connect(this.maestro); } else g.connect(this.maestro);
      let t = ctx.currentTime + 0.05;
      for (let i = 0; i < notas; i++) {
        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.setValueAtTime(base, t);
        o.frequency.exponentialRampToValueAtTime(base * (1.2 + Math.random() * 0.4), t + 0.08);
        o.connect(g);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.06, t + 0.02);
        g.gain.linearRampToValueAtTime(0, t + 0.1);
        o.start(t); o.stop(t + 0.12);
        t += 0.14 + Math.random() * 0.08;
      }
    },
    cantar() {
      const sig = () => {
        if (this.ctx && this.ctx.state === 'running' && Math.random() < this.nivelAves) this.trino();
        this.temporizador = setTimeout(sig, 1200 + Math.random() * 3000);
      };
      sig();
    }
  };

  /* ------------------------------------------------------------------ */
  /* Modo un solo botón (barrido / escaneo)                              */
  /* Recorre los controles uno por uno; ESPACIO, ENTER o un clic eligen. */
  /* ------------------------------------------------------------------ */
  const Barrido = {
    activo: false, idx: -1, timer: null,
    elementos() {
      const abiertos = $$('dialog[open]');
      const raiz = abiertos.length ? abiertos[abiertos.length - 1] : $('#controles');
      const sel = abiertos.length ? 'button, input[type="checkbox"]' : 'button';
      return $$(sel, raiz).filter((el) => !el.disabled && el.offsetParent !== null);
    },
    objetivo(el) { return el.closest('label') || el; },
    limpiar() { $$('.barrido-activo').forEach((e) => e.classList.remove('barrido-activo')); },
    paso() {
      const els = this.elementos();
      this.limpiar();
      if (!els.length) return;
      this.idx = (this.idx + 1) % els.length;
      const el = els[this.idx];
      this.objetivo(el).classList.add('barrido-activo');
      el.focus({ preventScroll: true });
    },
    iniciar() {
      if (this.activo) return;
      this.activo = true;
      this.reiniciar();
    },
    reiniciar() {
      if (!this.activo) return;
      clearInterval(this.timer);
      this.idx = -1;
      setTimeout(() => this.paso(), 60);
      this.timer = setInterval(() => this.paso(), parseInt(ajustes.intervaloBarrido, 10) || 2500);
    },
    seleccionar() {
      const els = this.elementos();
      const el = els[this.idx];
      if (!el) return;
      el.click();
      setTimeout(() => this.reiniciar(), 80);
    },
    detener() {
      this.activo = false;
      clearInterval(this.timer);
      this.limpiar();
    }
  };

  document.addEventListener('keydown', (ev) => {
    if (!Barrido.activo) return;
    if (ev.key === ' ' || ev.key === 'Enter') {
      ev.preventDefault();
      ev.stopPropagation();
      Barrido.seleccionar();
    }
  }, true);
  // En modo barrido, cualquier clic físico (o pulsador conectado como ratón) elige el elemento resaltado.
  document.addEventListener('click', (ev) => {
    if (!Barrido.activo || !ev.isTrusted) return;
    ev.preventDefault();
    ev.stopPropagation();
    Barrido.seleccionar();
  }, true);

  /* ------------------------------------------------------------------ */
  /* Comandos de voz (Web Speech API: Chrome / Edge)                     */
  /* ------------------------------------------------------------------ */
  const Voz = {
    rec: null, activo: false,
    disponible() { return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window; },
    iniciar() {
      if (this.activo) return;
      if (!this.disponible()) {
        anunciar('Tu navegador no admite comandos de voz. Usa Google Chrome o Microsoft Edge.');
        mostrarSubtitulo('Tu navegador no admite comandos de voz. Usa Google Chrome o Microsoft Edge.');
        setTimeout(() => mostrarSubtitulo(''), 5000);
        ajustes.voz = false; guardarAjustes(); actualizarIndicadores();
        return;
      }
      const R = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.rec = new R();
      this.rec.lang = 'es-EC';
      this.rec.continuous = true;
      this.rec.interimResults = false;
      this.rec.onresult = (ev) => {
        const r = ev.results[ev.results.length - 1];
        if (r.isFinal) procesarComando(r[0].transcript);
      };
      this.rec.onend = () => { if (this.activo) { try { this.rec.start(); } catch (e) { /* ya iniciado */ } } };
      this.rec.onerror = (e) => {
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          this.activo = false;
          ajustes.voz = false; guardarAjustes(); actualizarIndicadores();
          anunciar('No se pudo usar el micrófono. Revisa los permisos del navegador.');
        }
      };
      this.activo = true;
      try { this.rec.start(); } catch (e) { /* ya iniciado */ }
    },
    detener() {
      this.activo = false;
      if (this.rec) { try { this.rec.stop(); } catch (e) { /* nada */ } }
    }
  };

  function procesarComando(texto) {
    const t = texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const tiene = (...p) => p.some((x) => t.includes(x));
    if (tiene('cerrar', 'salir')) { $$('dialog[open]').forEach((d) => { if (d !== dlgBienvenida) d.close(); }); cerrarPanelVR(); return; }
    if (tiene('comenzar', 'empezar') && dlgBienvenida.open) { comenzar(); return; }
    if (tiene('siguiente', 'avanzar', 'adelante', 'continuar')) { ejecutarAccion('siguiente'); return; }
    if (tiene('anterior', 'regresar', 'atras', 'volver')) { ejecutarAccion('anterior'); return; }
    if (tiene('izquierda')) { ejecutarAccion('girar-izq'); return; }
    if (tiene('derecha')) { ejecutarAccion('girar-der'); return; }
    if (tiene('detener', 'silencio', 'callar', 'pausa', 'parar')) { Narrador.detener(); cancelarAuto(); return; }
    if (tiene('narrar', 'escuchar', 'leer', 'repetir')) { Narrador.hablar(ESC[indice].narracion); return; }
    if (tiene('informacion', 'info', 'dato')) { ejecutarAccion('info'); return; }
    if (tiene('mapa')) { ejecutarAccion('mapa'); return; }
    if (tiene('ajuste', 'configura')) { ejecutarAccion('ajustes'); return; }
    if (tiene('inicio', 'reiniciar')) { irA(0); return; }
    if (tiene('ayuda')) {
      Narrador.hablar(['Puedes decir: siguiente, anterior, izquierda, derecha, narrar, información, mapa, detener o cerrar.']);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Aplicar ajustes                                                     */
  /* ------------------------------------------------------------------ */
  function actualizarIndicadores() {
    $('#ind-voz').hidden = !(ajustes.voz && Voz.activo);
    $('#ind-barrido').hidden = !ajustes.barrido;
    $('#ind-auto').hidden = !ajustes.recorridoAuto;
  }

  function aplicarAjustes() {
    const raiz = document.documentElement;
    raiz.classList.toggle('texto-grande', !!ajustes.textoGrande);
    raiz.classList.toggle('alto-contraste', !!ajustes.altoContraste);
    raiz.classList.toggle('reducir-animaciones', !!ajustes.reducirAnimaciones);
    $('#subtitulos').hidden = !ajustes.subtitulos || !$('#subtitulos').textContent;

    const tm = parseInt(ajustes.tiempoMirada, 10) || 2000;
    if (cursorMirada.hasLoaded) {
      cursorMirada.setAttribute('cursor', { fuse: true, fuseTimeout: tm });
      cursorMirada.setAttribute('raycaster', 'enabled', !!ajustes.mirada);
      cursorMirada.setAttribute('visible', !!ajustes.mirada);
      cursorMirada.setAttribute('animation__fusing', 'dur', tm);
    }

    if (ajustes.barrido) {
      if (Barrido.activo) Barrido.reiniciar(); else Barrido.iniciar();
    } else {
      Barrido.detener();
    }

    if (recorridoIniciado) {
      if (ajustes.voz) Voz.iniciar(); else Voz.detener();
    }

    Ambiente.volumen(parseFloat(ajustes.volumenAmbiente));
    if (!ajustes.recorridoAuto) cancelarAuto();
    else if (recorridoIniciado && !temporizadorAuto && !Narrador.activo) programarAuto();

    if (ESC[indice]) actualizarUI();
    actualizarIndicadores();
    guardarAjustes();
  }

  function llenarFormulario() {
    Array.from(formAjustes.elements).forEach((el) => {
      if (!el.name || !(el.name in ajustes)) return;
      if (el.type === 'checkbox') el.checked = !!ajustes[el.name];
      else el.value = String(ajustes[el.name]);
    });
  }

  formAjustes.addEventListener('change', (ev) => {
    const el = ev.target;
    if (!el.name) return;
    ajustes[el.name] = el.type === 'checkbox' ? el.checked : (el.type === 'range' ? parseFloat(el.value) : el.value);
    aplicarAjustes();
  });
  formAjustes.addEventListener('submit', (ev) => ev.preventDefault());
  $('#aj-restablecer').addEventListener('click', () => {
    ajustes = Object.assign({}, PREDETERMINADOS);
    llenarFormulario();
    aplicarAjustes();
    anunciar('Ajustes restablecidos');
  });

  /* ------------------------------------------------------------------ */
  /* Eventos de la interfaz                                              */
  /* ------------------------------------------------------------------ */
  $$('#controles [data-accion]').forEach((b) => b.addEventListener('click', () => ejecutarAccion(b.dataset.accion)));
  $$('[data-cerrar]').forEach((b) => b.addEventListener('click', () => b.closest('dialog').close()));
  $$('dialog').forEach((d) => d.addEventListener('close', () => {
    Barrido.reiniciar();
    if (d === dlgBienvenida && !recorridoIniciado) comenzar();
  }));

  document.addEventListener('keydown', (ev) => {
    if (Barrido.activo) return;
    if ($$('dialog[open]').length) return;
    const tag = (ev.target && ev.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
    const k = ev.key.length === 1 ? ev.key.toLowerCase() : ev.key;
    const mapa = {
      ArrowLeft: 'girar-izq', ArrowRight: 'girar-der',
      ArrowUp: 'siguiente', ArrowDown: 'anterior', n: 'siguiente', p: 'anterior',
      l: 'narrar', i: 'info', m: 'mapa', a: 'ajustes'
    };
    if (mapa[k]) { ev.preventDefault(); ejecutarAccion(mapa[k]); }
    if (k === 's' || k === 'Escape') { Narrador.detener(); cancelarAuto(); }
  });

  // Bienvenida: las opciones elegidas se aplican al instante
  const vinculos = { 'bv-barrido': 'barrido', 'bv-voz': 'voz', 'bv-mirada': 'mirada', 'bv-auto': 'recorridoAuto' };
  Object.keys(vinculos).forEach((id) => {
    const cb = document.getElementById(id);
    cb.checked = !!ajustes[vinculos[id]];
    cb.addEventListener('change', () => {
      ajustes[vinculos[id]] = cb.checked;
      aplicarAjustes();
    });
  });

  function comenzar() {
    if (recorridoIniciado) return;
    recorridoIniciado = true;
    if (dlgBienvenida.open) dlgBienvenida.close();
    Ambiente.iniciar();
    aplicarAjustes();
    const e = ESC[0];
    Ambiente.ajustar(e.agua, e.aves);
    anunciar('Parada 1 de ' + ESC.length + ': ' + e.titulo);
    if (ajustes.narracionAuto || ajustes.recorridoAuto) Narrador.hablar(e.narracion, programarAuto);
    else programarAuto();
  }
  $('#bv-comenzar').addEventListener('click', comenzar);

  escena.addEventListener('enter-vr', () => {
    $$('dialog[open]').forEach((d) => d.close());
  });

  /* ------------------------------------------------------------------ */
  /* Arranque                                                            */
  /* ------------------------------------------------------------------ */
  // ?parada=N abre directamente una parada (útil para demostraciones y pruebas)
  const paradaInicial = Math.min(ESC.length, Math.max(1, parseInt(new URLSearchParams(location.search).get('parada'), 10) || 1)) - 1;
  const saltarBienvenida = new URLSearchParams(location.search).has('parada');

  function arrancar() {
    aplicarAjustes();
    irA(paradaInicial, { silencioso: true });
  }
  if (saltarBienvenida) {
    recorridoIniciado = true;
    // Sin bienvenida no hubo clic en «Comenzar»: el navegador solo permite iniciar
    // el audio tras una interacción, así que el sonido ambiente arranca con la primera.
    const activarAudio = () => {
      document.removeEventListener('pointerdown', activarAudio, true);
      document.removeEventListener('keydown', activarAudio, true);
      Ambiente.iniciar();
      const e = ESC[indice];
      Ambiente.ajustar(e.agua, e.aves);
    };
    document.addEventListener('pointerdown', activarAudio, true);
    document.addEventListener('keydown', activarAudio, true);
  } else {
    dlgBienvenida.showModal();
    dlgBienvenida.scrollTop = 0;
  }
  aplicarAjustes();
  if (escena.hasLoaded) arrancar(); else escena.addEventListener('loaded', arrancar);

  // API mínima para los componentes A-Frame
  window.CondorMachay = { girar: girar, irA: irA };
})();
