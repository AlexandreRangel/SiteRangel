const canvas = document.getElementById("rangel_background");

canvas.width = 512;
canvas.height = 512;

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function startHydra() {
  var hydra = new Hydra({
    canvas,
    detectAudio: false,
    enableStreamCapture: false,
  })

  noise(0.75,0.0333)
  .diff(
    noise(0.36,0.0222)
  )
  .color(0.32,0.32,0.32)
  .contrast( ()=>Math.sin(time/2)*0.2+1.15 )
  //.mult( solid(0.1,0.1,0.1), 0.6 )
  .out()
}

if (!prefersReducedMotion.matches) {
  startHydra();
} else {
  // Leave canvas static/blank when user prefers reduced motion
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

// Optional: if preference changes later, reload so Hydra can start/stop cleanly
if (typeof prefersReducedMotion.addEventListener === 'function') {
  prefersReducedMotion.addEventListener('change', () => {
    location.reload();
  });
}
