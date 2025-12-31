import { initLightbox, openLightbox } from "./lightbox.js";

const sectionsContainer = document.getElementById("sections");
const navList = document.querySelector("[data-nav-list]");
const brandNameEls = document.querySelectorAll("[data-brand-name]");
const brandSubtitleEls = document.querySelectorAll("[data-brand-subtitle]");
const homeTaglineEl = document.querySelector("[data-home-tagline]");
const footerLinksEl = document.querySelector("[data-footer-links]");

function createSrcset(sources = []) {
  return sources.map((item) => `${item.src} ${item.w}w`).join(", ");
}

function ratioSizeFromAspect(width, aspect) {
  if (!aspect || !aspect.includes("/")) return { width, height: width };
  const [a, b] = aspect.split("/").map(Number);
  const height = Math.round((width / a) * b);
  return { width, height };
}

async function fetchJSON(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Cannot load ${path}`);
  return response.json();
}

async function loadData() {
  const [site, works] = await Promise.all([
    fetchJSON("assets/data/site.json"),
    fetchJSON("assets/data/works.json"),
  ]);
  return { site, works };
}

function applySiteCopy(site) {
  brandNameEls.forEach((el) => (el.textContent = site.brandName));
  brandSubtitleEls.forEach((el) => (el.textContent = site.brandSubtitle));
  if (homeTaglineEl) homeTaglineEl.textContent = site.homeTagline;
  document.title = `${site.brandName} — ${site.brandSubtitle} Portfolio`;
}

function renderFooter(contacts) {
  if (!footerLinksEl) return;
  footerLinksEl.innerHTML = "";

  if (contacts?.email) {
    const mail = document.createElement("a");
    mail.className = "footer-link";
    mail.href = `mailto:${contacts.email}`;
    mail.textContent = contacts.email;
    footerLinksEl.appendChild(mail);
  }

  (contacts?.links || []).forEach((link) => {
    const a = document.createElement("a");
    a.className = "footer-link";
    a.href = link.url;
    a.target = "_blank";
    a.rel = "noreferrer noopener";
    a.textContent = link.label;
    footerLinksEl.appendChild(a);
  });
}

function buildNav(sections = []) {
  if (!navList) return;
  navList.querySelectorAll("[data-dynamic-nav]").forEach((item) => item.remove());
  sections.forEach((section) => {
    const li = document.createElement("li");
    li.setAttribute("data-dynamic-nav", "true");
    const link = document.createElement("a");
    link.className = "nav-link";
    link.href = `#${section.id}`;
    link.textContent = section.title;
    link.setAttribute("data-nav-target", section.id);
    li.appendChild(link);
    navList.appendChild(li);
  });
}

function createLightboxItem(work) {
  const after = {
    src: work.fullAfter.largest.src,
    w: work.fullAfter.largest.w,
    h: work.fullAfter.largest.h,
    srcset: createSrcset(work.fullAfter.sources),
    sizes: "100vw",
  };
  const before = {
    src: work.fullBefore.largest.src,
    w: work.fullBefore.largest.w,
    h: work.fullBefore.largest.h,
    srcset: createSrcset(work.fullBefore.sources),
    sizes: "100vw",
  };
  return {
    id: work.id,
    alt: work.alt,
    after,
    before,
    display: "after",
    preview: work.previewAfter.sources[0]?.src || "",
  };
}

function createWorkCard(work, lightboxIndex) {
  const card = document.createElement("article");
  card.className = "work-card";
  card.setAttribute("tabindex", "0");
  card.setAttribute("data-lightbox-index", lightboxIndex);
  card.setAttribute("aria-label", `${work.alt} — open lightbox`);

  const afterSrcset = createSrcset(work.previewAfter.sources);
  const { width, height } = ratioSizeFromAspect(
    work.previewAfter.sources[work.previewAfter.sources.length - 1].w,
    work.previewAfter.aspect
  );

  const preview = document.createElement("div");
  preview.className = "work-preview";

  const picture = document.createElement("picture");
  const afterSource = document.createElement("source");
  afterSource.type = "image/webp";
  afterSource.srcset = afterSrcset;
  afterSource.sizes = work.previewAfter.sizes;

  const afterImg = document.createElement("img");
  afterImg.className = "work-img";
  afterImg.loading = "lazy";
  afterImg.decoding = "async";
  afterImg.src = work.previewAfter.sources[0].src;
  afterImg.srcset = afterSrcset;
  afterImg.sizes = work.previewAfter.sizes;
  afterImg.width = width;
  afterImg.height = height;
  afterImg.alt = `${work.alt} — after`;

  picture.appendChild(afterSource);
  picture.appendChild(afterImg);

  preview.appendChild(picture);

  const tag = document.createElement("span");
  tag.className = "work-chip";
  tag.textContent = "";

  card.appendChild(preview);
  // chip left empty intentionally (no label)

  card.addEventListener("click", (event) => {
    event.preventDefault();
    openLightbox(lightboxIndex);
  });

  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openLightbox(lightboxIndex);
    }
  });
  return card;
}

function renderSection(section, works, lightboxItems) {
  const filtered = works
    .filter((work) => work.section === section.id)
    .sort((a, b) => a.order - b.order);
  if (!filtered.length) return;

  const sectionEl = document.createElement("section");
  sectionEl.className = "content-section";
  sectionEl.id = section.id;
  sectionEl.dataset.section = section.id;
  sectionEl.style.setProperty("--cols", section.desktopCols || 3);

  const header = document.createElement("div");
  header.className = "section-header";
  const h2 = document.createElement("h2");
  h2.textContent = section.title;
  const sub = document.createElement("p");
  sub.className = "section-subtitle";
  sub.textContent = section.tagline;
  const divider = document.createElement("div");
  divider.className = "section-divider";
  header.appendChild(h2);
  header.appendChild(sub);
  header.appendChild(divider);

  const grid = document.createElement("div");
  grid.className = "work-grid";

  filtered.forEach((work) => {
    const lightboxIndex = lightboxItems.length;
    lightboxItems.push(createLightboxItem(work));
    const card = createWorkCard(work, lightboxIndex);
    grid.appendChild(card);
  });

  sectionEl.appendChild(header);
  sectionEl.appendChild(grid);
  sectionsContainer.appendChild(sectionEl);
}

async function initGallery() {
  try {
    const { site, works } = await loadData();
    applySiteCopy(site);
    buildNav(site.sections);
    renderFooter(site.contacts);

    if (sectionsContainer) sectionsContainer.innerHTML = "";
    const lightboxItems = [];
    site.sections.forEach((section) => renderSection(section, works, lightboxItems));
    initLightbox(lightboxItems);

    document.dispatchEvent(new CustomEvent("gallery:rendered"));
  } catch (error) {
    console.error(error);
    if (sectionsContainer) {
      sectionsContainer.innerHTML =
        '<div class="error">Не удалось загрузить работы. Проверьте JSON.</div>';
    }
  }
}

document.addEventListener("DOMContentLoaded", initGallery);
