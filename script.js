/* Mobile menu */
const header = document.getElementById("header");
const toggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");

function setMenu(open) {
  if (open) nav.style.top = header.getBoundingClientRect().bottom + "px";
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  nav.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open);
}
toggle.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
window.addEventListener("resize", () => window.innerWidth > 920 && setMenu(false));

document.querySelectorAll(".js-year").forEach((el) => (el.textContent = new Date().getFullYear()));

/* Highlight today's row in the hours table */
const today = String(new Date().getDay());
document.querySelectorAll(".hours tr[data-days]").forEach((tr) => {
  if (tr.dataset.days.split(",").includes(today)) tr.classList.add("is-today");
});

/* Fade sections in as they scroll into view */
const revealEls = document.querySelectorAll(".card, .review, .value, .quick__item, .split__text, .about__text, .about__media, .info, .gallery__item");
if ("IntersectionObserver" in window) {
  revealEls.forEach((el) => el.classList.add("reveal"));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  revealEls.forEach((el) => io.observe(el));
}

/* Gallery filters + lightbox */
const gallery = document.getElementById("gallery");
if (gallery) {
  const items = [...gallery.querySelectorAll(".gallery__item")];
  const filters = document.querySelectorAll(".filter");

  filters.forEach((btn) => btn.addEventListener("click", () => {
    filters.forEach((b) => { b.classList.toggle("is-active", b === btn); b.setAttribute("aria-pressed", String(b === btn)); });
    const cat = btn.dataset.filter;
    items.forEach((it) => it.classList.toggle("is-hidden", cat !== "all" && it.dataset.cat !== cat));
  }));

  const box = document.getElementById("lightbox");
  const boxImg = box.querySelector("img");
  let index = 0;

  const visible = () => items.filter((it) => !it.classList.contains("is-hidden") && !it.classList.contains("img-missing"));
  function show(i) {
    const list = visible();
    if (!list.length) return;
    index = (i + list.length) % list.length;
    const src = list[index].querySelector("img");
    boxImg.src = src.currentSrc || src.src;
    boxImg.alt = src.alt;
  }
  function close() { box.hidden = true; document.body.classList.remove("menu-open"); }

  items.forEach((it) => it.addEventListener("click", () => {
    if (it.classList.contains("img-missing")) return;
    show(visible().indexOf(it));
    box.hidden = false;
    document.body.classList.add("menu-open");
  }));
  box.querySelector(".lightbox__close").addEventListener("click", close);
  box.querySelector(".lightbox__prev").addEventListener("click", () => show(index - 1));
  box.querySelector(".lightbox__next").addEventListener("click", () => show(index + 1));
  box.addEventListener("click", (e) => e.target === box && close());
  document.addEventListener("keydown", (e) => {
    if (box.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(index - 1);
    if (e.key === "ArrowRight") show(index + 1);
  });

  let startX = 0;
  box.addEventListener("touchstart", (e) => (startX = e.touches[0].clientX), { passive: true });
  box.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
  });
}
