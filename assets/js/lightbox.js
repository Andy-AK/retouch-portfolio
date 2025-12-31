import PhotoSwipeLightbox from "../vendor/photoswipe/photoswipe-lightbox.esm.js";

let lightbox = null;
let items = [];
let toggleButton = null;

function mapItem(item) {
  return {
    ...item,
    src: item.after.src,
    srcset: item.after.srcset,
    msrc: item.preview,
    width: item.after.w,
    height: item.after.h,
    w: item.after.w,
    h: item.after.h,
    display: "after",
  };
}

function setVariant(index, variant) {
  const item = items[index];
  if (!item) return;
  const payload = variant === "before" ? item.before : item.after;
  if (!payload) return;
  item.display = variant;
  item.src = payload.src;
  item.srcset = payload.srcset;
  item.width = payload.w;
  item.height = payload.h;
  item.w = payload.w;
  item.h = payload.h;
}

function updateToggleLabel(pswp) {
  if (!toggleButton || !pswp) return;
  const state = items[pswp.currIndex]?.display || "after";
  toggleButton.textContent = state === "before" ? "After" : "Before";
  toggleButton.setAttribute("data-state", state);
  toggleButton.setAttribute("aria-pressed", state === "before" ? "true" : "false");
}

function resetAll() {
  items.forEach((_, index) => setVariant(index, "after"));
}

function toggleVariant(pswp) {
  if (!pswp) return;
  const idx = pswp.currIndex;
  const item = items[idx];
  if (!item) return;
  const next = item.display === "before" ? "after" : "before";
  setVariant(idx, next);
  pswp.refreshSlideContent(idx);
  updateToggleLabel(pswp);
}

export function initLightbox(data = []) {
  if (!data.length) return;
  items = data.map(mapItem);

  if (lightbox) {
    lightbox.destroy();
    lightbox = null;
  }

  lightbox = new PhotoSwipeLightbox({
    dataSource: items,
    pswpModule: () => import("../vendor/photoswipe/photoswipe.esm.js"),
    paddingFn: (viewportSize) =>
      viewportSize.x < 900
        ? { top: 16, bottom: 16, left: 12, right: 12 }
        : { top: 28, bottom: 28, left: 36, right: 36 },
    showHideAnimationType: "fade",
    wheelToZoom: false,
    initialZoomLevel: "fit",
    secondaryZoomLevel: 1,
    maxZoomPixelRatio: 1,
    bgOpacity: 0.92,
  });

  lightbox.on("uiRegister", () => {
    lightbox.pswp.ui.registerElement({
      name: "beforeAfterToggle",
      ariaLabel: "Toggle before/after",
      order: 9,
      isButton: true,
      html: "Before",
      onClick: (_event, pswp) => toggleVariant(pswp),
      onInit: (el) => {
        toggleButton = el;
      },
    });
  });

  lightbox.on("beforeOpen", resetAll);
  lightbox.on("afterInit", () => updateToggleLabel(lightbox.pswp));
  lightbox.on("change", () => {
    const pswp = lightbox.pswp;
    const idx = pswp.currIndex;
    if (items[idx] && items[idx].display !== "after") {
      setVariant(idx, "after");
      pswp.refreshSlideContent(idx);
    }
    updateToggleLabel(pswp);
  });

  lightbox.init();
}

export function openLightbox(index) {
  if (!lightbox) return;
  lightbox.loadAndOpen(index);
}
