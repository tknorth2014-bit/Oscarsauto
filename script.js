/* ==========================================================
   BUSINESS INFO — edit these values and the whole site updates.
   ========================================================== */
const BUSINESS = {
  phone: "(352) 000-0000",            // TODO: real shop phone number
  address: "3140 SW 7th St, Ocala, FL 34474", // TODO: confirm address
  email: "",                           // shop email that receives appointment requests
  formEndpoint: "",                    // optional: Formspree/Getform URL to receive requests without email
  hours: [                             // Sunday first
    ["Sunday", "Closed"],
    ["Monday", "Open 24 Hours"],
    ["Tuesday", "Open 24 Hours"],
    ["Wednesday", "Open 24 Hours"],
    ["Thursday", "Open 24 Hours"],
    ["Friday", "Open 24 Hours"],
    ["Saturday", "Open 24 Hours"],
  ],
  hoursShort: "Mon–Sat: Open 24 Hours · Sun: Closed",
};

(function applyBusinessInfo() {
  const tel = "tel:+1" + BUSINESS.phone.replace(/\D/g, "").slice(-10);
  const map = "https://maps.google.com/?q=" + encodeURIComponent(BUSINESS.address);

  document.querySelectorAll("[data-biz]").forEach((el) => {
    const value = BUSINESS[el.dataset.biz];
    if (typeof value === "string") el.textContent = value;
  });
  document.querySelectorAll('[data-biz-href="tel"]').forEach((el) => (el.href = tel));
  document.querySelectorAll('[data-biz-href="map"]').forEach((el) => (el.href = map));

  const frame = document.getElementById("mapFrame");
  if (frame) frame.src = "https://maps.google.com/maps?q=" + encodeURIComponent(BUSINESS.address) + "&z=15&output=embed";

  const table = document.getElementById("hoursTable");
  if (table) {
    const today = new Date().getDay();
    table.innerHTML = BUSINESS.hours
      .map(([day, time], i) => `<tr${i === today ? ' class="is-today"' : ""}><td>${day}</td><td>${time}</td></tr>`)
      .join("");
  }

  document.getElementById("year").textContent = new Date().getFullYear();
})();

/* Mobile menu */
const header = document.getElementById("header");
const toggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");

function setMenu(open) {
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  if (open) nav.style.setProperty("--nav-top", header.getBoundingClientRect().bottom + "px");
  nav.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open);
}
toggle.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
window.addEventListener("resize", () => window.innerWidth > 900 && setMenu(false));

/* Header shadow + active nav link */
const sections = [...document.querySelectorAll("main section[id]")];
const navLinks = [...nav.querySelectorAll('a:not(.btn)')];

function onScroll() {
  header.classList.toggle("is-scrolled", window.scrollY > 10);
  const y = window.scrollY + window.innerHeight * 0.35;
  let current = "home";
  sections.forEach((s) => { if (s.offsetTop <= y) current = s.id; });
  if (current === "appointment") current = "contact";
  navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + current));
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* Reveal on scroll + count-up stats */
const revealTargets = document.querySelectorAll(".service, .review, .feature, .about__text, .about__media, .stat, .section__head");
revealTargets.forEach((el) => el.classList.add("reveal"));

function countUp(el) {
  const target = Number(el.dataset.count);
  const suffix = el.dataset.suffix || "";
  const start = performance.now();
  const dur = 1400;
  (function tick(now) {
    const p = Math.min((now - start) / dur, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString() + suffix;
    if (p < 1) requestAnimationFrame(tick);
  })(start);
}

if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-visible");
      const num = e.target.querySelector("[data-count]");
      if (num) countUp(num);
      io.unobserve(e.target);
    });
  }, { threshold: 0.15 });
  revealTargets.forEach((el) => io.observe(el));
} else {
  revealTargets.forEach((el) => el.classList.add("is-visible"));
  document.querySelectorAll("[data-count]").forEach(countUp);
}

/* Hide any image that fails to load so the dark section background shows instead */
document.querySelectorAll("img").forEach((img) => {
  const hide = () => (img.style.visibility = "hidden");
  if (img.complete && img.naturalWidth === 0) hide();
  else img.addEventListener("error", hide);
});

/* Appointment form */
const form = document.getElementById("apptForm");
const note = document.getElementById("formNote");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  note.className = "form__note";
  note.textContent = "";

  let valid = true;
  form.querySelectorAll("[required]").forEach((field) => {
    const ok = field.value.trim() !== "";
    field.classList.toggle("is-invalid", !ok);
    if (!ok) valid = false;
  });
  if (!valid) {
    note.classList.add("is-err");
    note.textContent = "Please fill in your name, phone and the service needed.";
    return;
  }

  const data = Object.fromEntries(new FormData(form));

  if (BUSINESS.formEndpoint) {
    try {
      const res = await fetch(BUSINESS.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      form.reset();
      note.classList.add("is-ok");
      note.textContent = "Thank you! We'll call you shortly to confirm your appointment.";
    } catch {
      note.classList.add("is-err");
      note.textContent = "Something went wrong. Please call us at " + BUSINESS.phone + ".";
    }
    return;
  }

  if (BUSINESS.email) {
    const body = [
      `Name: ${data.name}`, `Phone: ${data.phone}`, `Email: ${data.email}`,
      `Vehicle: ${data.vehicle}`, `Service: ${data.service}`, `Preferred date: ${data.date}`,
      "", data.message,
    ].join("\n");
    window.location.href = `mailto:${BUSINESS.email}?subject=${encodeURIComponent("Appointment Request – " + data.service)}&body=${encodeURIComponent(body)}`;
    note.classList.add("is-ok");
    note.textContent = "Your email app is opening to send the request.";
    return;
  }

  note.classList.add("is-ok");
  note.textContent = "Thanks! To lock in your appointment, please call us at " + BUSINESS.phone + ".";
});
