const canvas = document.getElementById("rangel_background");

if (!canvas) {
  // Page include without canvas — nothing to do
} else {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /** Longest side of the WebGL drawing buffer (device pixels). */
  const MAX_DIM = 768;
  /** Cap for high-DPI; noise bg does not need full retina cost. */
  const MAX_DPR = 1.5;
  const RESIZE_THROTTLE_MS = 200;

  function resolveDpr() {
    const raw = window.devicePixelRatio || 1;
    let cap = MAX_DPR;

    try {
      if (navigator.connection && navigator.connection.saveData) {
        cap = 1;
      }
    } catch (_) { /* ignore */ }

    try {
      if (typeof navigator.deviceMemory === "number" && navigator.deviceMemory > 0 && navigator.deviceMemory <= 4) {
        cap = Math.min(cap, 1);
      }
    } catch (_) { /* ignore */ }

    try {
      if (window.matchMedia("(pointer: coarse)").matches) {
        cap = Math.min(cap, 1);
      }
    } catch (_) { /* ignore */ }

    return Math.min(Math.max(raw, 1), cap);
  }

  /**
   * Internal buffer size matching the on-screen canvas aspect,
   * capped for GPU cost. CSS still stretches #rangel_background fullscreen.
   */
  function computeBufferSize() {
    const cssW = Math.max(1, canvas.clientWidth || window.innerWidth || 1);
    const cssH = Math.max(1, canvas.clientHeight || window.innerHeight || 1);
    const dpr = resolveDpr();

    let w = cssW * dpr;
    let h = cssH * dpr;
    const longest = Math.max(w, h);

    if (longest > MAX_DIM) {
      const scale = MAX_DIM / longest;
      w *= scale;
      h *= scale;
    }

    return {
      width: Math.max(1, Math.round(w)),
      height: Math.max(1, Math.round(h)),
    };
  }

  function applyCanvasBuffer(size) {
    if (canvas.width !== size.width) canvas.width = size.width;
    if (canvas.height !== size.height) canvas.height = size.height;
  }

  function applyHydraResolution(hydra, size) {
    if (!hydra) return;
    if (typeof hydra.setResolution === "function") {
      hydra.setResolution(size.width, size.height);
    } else if (typeof hydra.resize === "function") {
      hydra.resize(size.width, size.height);
    } else if (typeof setResolution === "function") {
      setResolution(size.width, size.height);
    } else {
      applyCanvasBuffer(size);
    }
  }

  let hydraInstance = null;
  let resizeTimer = null;
  let lastSize = { width: 0, height: 0 };

  function sizesEqual(a, b) {
    return a.width === b.width && a.height === b.height;
  }

  function startHydra() {
    const size = computeBufferSize();
    applyCanvasBuffer(size);
    lastSize = size;

    hydraInstance = new Hydra({
      canvas,
      width: size.width,
      height: size.height,
      detectAudio: false,
      enableStreamCapture: false,
    });

    noise(0.75, 0.0333)
      .diff(noise(0.36, 0.0222))
      .color(0.32, 0.32, 0.32)
      .contrast(() => Math.sin(time / 2) * 0.2 + 1.15)
      //.mult( solid(0.1,0.1,0.1), 0.6 )
      .out();
  }

  function paintStatic() {
    const size = computeBufferSize();
    applyCanvasBuffer(size);
    lastSize = size;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  function onResize() {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const size = computeBufferSize();
      if (sizesEqual(size, lastSize)) return;
      lastSize = size;

      if (hydraInstance && !prefersReducedMotion.matches) {
        applyHydraResolution(hydraInstance, size);
      } else if (prefersReducedMotion.matches) {
        paintStatic();
      }
    }, RESIZE_THROTTLE_MS);
  }

  if (!prefersReducedMotion.matches) {
    startHydra();
  } else {
    // Leave canvas static/blank when user prefers reduced motion
    paintStatic();
  }

  window.addEventListener("resize", onResize, { passive: true });
  if (typeof ResizeObserver === "function") {
    try {
      new ResizeObserver(onResize).observe(canvas);
    } catch (_) { /* ignore */ }
  }

  // Optional: if preference changes later, reload so Hydra can start/stop cleanly
  if (typeof prefersReducedMotion.addEventListener === "function") {
    prefersReducedMotion.addEventListener("change", () => {
      location.reload();
    });
  }
}
