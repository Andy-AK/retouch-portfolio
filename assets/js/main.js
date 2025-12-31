const navList = document.querySelector("[data-nav-list]");
const navToggle = document.querySelector(".nav-toggle");
const header = document.getElementById("site-header");
let sectionObserver = null;

const prefersReducedMotion = window.matchMedia
  ? window.matchMedia("(prefers-reduced-motion: reduce)")
  : null;
if (prefersReducedMotion) {
  const reducedMotionHandler = (event) => {
    document.documentElement.classList.toggle("reduced-motion", event.matches);
  };
  if (prefersReducedMotion.matches) reducedMotionHandler(prefersReducedMotion);
  if (prefersReducedMotion.addEventListener) {
    prefersReducedMotion.addEventListener("change", reducedMotionHandler);
  } else if (prefersReducedMotion.addListener) {
    prefersReducedMotion.addListener(reducedMotionHandler);
  }
}

function setActiveLink(id) {
  const links = document.querySelectorAll(".nav-link");
  links.forEach((link) => {
    const target = link.getAttribute("data-nav-target");
    link.classList.toggle("is-active", target === id);
    link.setAttribute("aria-current", target === id ? "page" : "false");
  });
}

function setupSectionObserver() {
  const sections = document.querySelectorAll("[data-section]");
  if (!sections.length) return;

  if (sectionObserver) sectionObserver.disconnect();

  sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveLink(entry.target.id);
        }
      });
    },
    { rootMargin: "-45% 0px -45% 0px", threshold: 0.25 }
  );

  sections.forEach((section) => sectionObserver.observe(section));
}

function handleScroll() {
  if (!header) return;
  const scrolled = window.scrollY > 12;
  header.classList.toggle("is-scrolled", scrolled);
}

function setupMenuToggle() {
  if (!navToggle) return;

  navToggle.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  navList?.addEventListener("click", (event) => {
    const link = event.target.closest(".nav-link");
    if (!link) return;
    document.body.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
  });
}

function init() {
  setupMenuToggle();
  handleScroll();
  window.addEventListener("scroll", handleScroll, { passive: true });

  document.addEventListener("gallery:rendered", () => {
    setupSectionObserver();
    setActiveLink("home");
  });
}

document.addEventListener("DOMContentLoaded", init);
