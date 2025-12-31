(() => {
  const HERO_SELECTOR = "#home-hero";

  const VANTA_OPTIONS = {
    el: HERO_SELECTOR,
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200.0,
    minWidth: 200.0,
    scale: 1.0,
    scaleMobile: 1.0,
    color1: 0x2d3c52,
    color2: 0x17192d,
    size: 2.7,
    speed: 0.9,
  };

  let vanta = null;

  const prefersReducedMotion = () =>
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const isMobileLike = () =>
    (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) ||
    window.innerWidth < 768;

  function destroyVanta() {
    if (vanta && typeof vanta.destroy === "function") {
      vanta.destroy();
    }
    vanta = null;
  }

  function initVanta() {
    const el = document.querySelector(HERO_SELECTOR);
    if (!el) return;

    if (prefersReducedMotion() || isMobileLike()) {
      destroyVanta();
      return;
    }

    if (!window.VANTA || !window.VANTA.CELLS) return;

    destroyVanta();
    vanta = window.VANTA.CELLS(VANTA_OPTIONS);
  }

  document.addEventListener("DOMContentLoaded", initVanta);
  window.addEventListener("beforeunload", destroyVanta);

  let t = null;
  window.addEventListener("resize", () => {
    window.clearTimeout(t);
    t = window.setTimeout(() => initVanta(), 200);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) destroyVanta();
    else initVanta();
  });
})();
