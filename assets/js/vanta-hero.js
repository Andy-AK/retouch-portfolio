(() => {
  const HERO_SELECTOR = "#home-hero";

  const VANTA_OPTIONS = {
    el: HERO_SELECTOR,
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200.0,
    minWidth: 200.0,
    highlightColor: 0x0e132a,
    midtoneColor: 0x0f1920,
    lowlightColor: 0x121c28,
    baseColor: 0x222c41,
    zoom: 0.6,
  };

  let vanta = null;
  let attempts = 0;

  const prefersReducedMotion = () =>
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const isMobileLike = () =>
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

    if (!window.VANTA || !window.VANTA.FOG) {
      if (attempts < 10) {
        attempts += 1;
        window.setTimeout(initVanta, 200);
      }
      return;
    }

    destroyVanta();
    vanta = window.VANTA.FOG(VANTA_OPTIONS);
  }

  document.addEventListener("DOMContentLoaded", initVanta);
  window.addEventListener("load", initVanta);
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
