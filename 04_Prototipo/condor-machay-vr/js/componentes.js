/* Componentes A-Frame propios (se registran antes de que se cree la escena). */

// Giro por pasos con el joystick de los mandos VR (30° por movimiento, reduce el mareo).
AFRAME.registerComponent('giro-por-pasos', {
  init: function () {
    this.listo = true;
    this.el.addEventListener('thumbstickmoved', (e) => {
      const x = e.detail.x;
      if (Math.abs(x) < 0.3) { this.listo = true; return; }
      if (this.listo && Math.abs(x) > 0.75) {
        this.listo = false;
        if (window.CondorMachay) window.CondorMachay.girar(x > 0 ? -30 : 30);
      }
    });
  }
});
