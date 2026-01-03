import PhotoSwipeLightbox from "../vendor/photoswipe/photoswipe-lightbox.esm.js";

let lightbox = null;
let items = [];
let toggleButton = null;
let cleanupHover = null;
let hintEl = null;

function mapItem(item) {
  return {
    ...item,
    src: item.srcAfter || item.after.src,
    srcAfter: item.srcAfter || item.after.src,
    srcBefore: item.srcBefore || item.before.src,
    srcset: item.after.srcset,
    msrc: item.after.src,
    sizes: item.after.sizes || "",
    width: item.after.w,
    height: item.after.h,
    w: item.after.w,
    h: item.after.h,
    display: "after",
    _variant: "after",
  };
}

function applyVariantToSlide(pswp, payload) {
  const slide = pswp?.currSlide;
  if (!slide || !payload) return;

  // keep slide data in sync for future renders
  if (slide.data) {
    slide.data.src = payload.src;
    slide.data.srcset = payload.srcset;
    slide.data.w = payload.w;
    slide.data.h = payload.h;
    slide.data.width = payload.w;
    slide.data.height = payload.h;
  }

  const el = slide.content?.element;
  if (el && el.tagName === "IMG") {
    el.srcset = payload.srcset || "";
    el.sizes = payload.sizes || "";
    el.src = payload.src;
    el.width = payload.w;
    el.height = payload.h;
  }
  slide.width = payload.w;
  slide.height = payload.h;
  slide.updateContentSize(true);
  slide.zoomAndPanToInitial();
  slide.applyCurrentZoomPan();
  pswp.updateSize(true);
}

function setVariant(index, variant, pswp, refresh = false) {
  const item = items[index];
  if (!item) return;
  const payload = variant === "before" ? item.before : item.after;
  if (!payload) return;
  item.display = variant;
  item._variant = variant;
  item.src = payload.src;
  item.srcset = payload.srcset;
  item.sizes = payload.sizes || "";
  item.width = payload.w;
  item.height = payload.h;
  item.w = payload.w;
  item.h = payload.h;
  if (pswp && pswp.currIndex === index) {
    const slide = pswp.currSlide;
    if (slide?.data) {
      slide.data._variant = variant;
    }
    if (refresh) {
      pswp.refreshSlideContent(index);
      pswp.currSlide && applyVariantToSlide(pswp, payload);
    } else {
      applyVariantToSlide(pswp, payload);
    }
  }
}

function updateToggleLabel(pswp) {
  if (!toggleButton || !pswp) return;
  const slide = pswp.currSlide;
  const state =
    slide?.data?._variant ||
    items[pswp.currIndex]?._variant ||
    items[pswp.currIndex]?.display ||
    "after";
  const label = state === "before" ? "AFTER" : "BEFORE";
  toggleButton.textContent = label;
  toggleButton.setAttribute("data-state", state);
  toggleButton.setAttribute("aria-pressed", state === "before" ? "true" : "false");
}

function resetAll() {
  items.forEach((_, index) => setVariant(index, "after"));
}

function toggleVariant(pswp) {
  // deprecated old toggle (kept for hover)
  if (!pswp) return;
  const slide = pswp.currSlide;
  if (!slide) return;
  const d = slide.data;
  d._showBefore = !d._showBefore;
  d.src = d._showBefore ? d._srcBefore || d.beforeSrc : d._srcAfter || d.afterSrc || d.src;
  pswp.refreshSlideContent(slide.index);
  pswp.updateSize(true);
  updateToggleLabel(pswp);
}

function setHoverVariant(pswp, variant) {
  if (!pswp) return;
  const idx = pswp.currIndex;
  setVariant(idx, variant, pswp, false);
  updateToggleLabel(pswp);
}

function bindHover(pswp) {
  if (cleanupHover) cleanupHover();
  const imgEl = pswp?.currSlide?.content?.element;
  if (!imgEl) return;

  const onEnter = (ev) => {
    if (ev.pointerType === "mouse") setHoverVariant(pswp, "before");
  };
  const onLeave = (ev) => {
    if (ev.pointerType === "mouse") setHoverVariant(pswp, "after");
  };

  imgEl.addEventListener("pointerenter", onEnter);
  imgEl.addEventListener("pointerleave", onLeave);

  cleanupHover = () => {
    imgEl.removeEventListener("pointerenter", onEnter);
    imgEl.removeEventListener("pointerleave", onLeave);
    cleanupHover = null;
  };

  pswp.on("destroy", () => cleanupHover && cleanupHover());
}

function ensureHint(pswp) {
  if (hintEl && document.body.contains(hintEl)) return;
  const wrapper = pswp?.scrollWrap;
  if (!wrapper) return;
  hintEl = document.createElement("div");
  hintEl.className = "pswp-hover-hint";
  hintEl.textContent = "Hover to see Before";
  wrapper.appendChild(hintEl);
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
    showHideAnimationType: "none",
    zoomAnimationDuration: 0,
    wheelToZoom: false,
    initialZoomLevel: "fit",
    secondaryZoomLevel: 1,
    maxZoomPixelRatio: 1,
    bgOpacity: 0.92,
  });

  lightbox.addFilter("itemData", (itemData, element) => {
    const after = element?.dataset?.after || itemData.srcAfter || itemData.src;
    const before = element?.dataset?.before || itemData.srcBefore;
    if (after) {
      itemData.afterSrc = after;
      itemData.src = after;
    }
    if (before) {
      itemData.beforeSrc = before;
    }
    itemData._showBefore = false;
    itemData._variant = "after";
    return itemData;
  });

  const isTouchDevice =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(hover: none) and (pointer: coarse)").matches;

  lightbox.on("uiRegister", function () {
    if (!isTouchDevice) return;

    lightbox.pswp.ui.registerElement({
      name: "toggle-before-after",
      isButton: true,
      tagName: "button",
      className: "pswp__button pswp__button--toggle-ba",
      html: "BEFORE",
      onInit: (el, pswp) => {
        toggleButton = el;

        const sync = () => updateToggleLabel(pswp);

        pswp.on("afterInit", sync);
        pswp.on("change", sync);
      },

      onClick: (e, el, pswp) => {
        e.preventDefault();
        if (!pswp) return;

        const idx = pswp.currIndex;

        const current =
          pswp.currSlide?.data?._variant ||
          items[idx]?._variant ||
          items[idx]?.display ||
          "after";

        const next = current === "before" ? "after" : "before";

        setVariant(idx, next, pswp, true);

        updateToggleLabel(pswp);
      },
    });
  });

  lightbox.on("beforeOpen", resetAll);
  lightbox.on("afterInit", () => {
    const pswp = lightbox.pswp;
    updateToggleLabel(pswp);
    hintEl = null;
    ensureHint(pswp);
    bindHover(pswp);
    pswp.on("destroy", () => {
      if (hintEl && hintEl.parentNode) hintEl.parentNode.removeChild(hintEl);
      hintEl = null;
    });
  });
  lightbox.on("change", () => {
    const pswp = lightbox.pswp;
    const idx = pswp.currIndex;
    if (items[idx] && items[idx].display !== "after") {
      setVariant(idx, "after", pswp);
    }
    updateToggleLabel(pswp);
    bindHover(pswp);
  });

  lightbox.init();
}

export function openLightbox(index) {
  if (!lightbox) return;
  lightbox.loadAndOpen(index);
}
