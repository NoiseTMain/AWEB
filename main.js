/* ============================================================
   main.js — veřejný web: vykreslení dat + interakce + animace
============================================================ */

/* Bezpečnostní pojistka — viz předchozí oprava: pokud animace z
   jakéhokoliv důvodu neproběhne, po 2s se obsah natvrdo zobrazí. */
setTimeout(() => {
  document.querySelectorAll(
    "[data-reveal], .hero-name, .hero-slogan, .hero-actions, .hero-eyebrow, .hero-photo-wrap"
  ).forEach((el) => {
    el.style.opacity = 1;
    el.style.transform = "none";
  });
}, 2000);

document.addEventListener("DOMContentLoaded", () => {
  const steps = [
    initSmoothScroll, initNav, initCursorSpotlight, renderAll,
    initContactForm, initFaqAccordion, initScrollAnimations, initHiddenAdminAccess,
  ];
  steps.forEach((fn) => {
    try { fn(); } catch (e) { console.error(`Chyba v ${fn.name}:`, e); }
  });
  window.addEventListener("storage", () => location.reload());
  window.addEventListener("pf:update", () => renderAll());
});

function renderAll() {
  [renderHero, renderPricing, renderProcess, renderProjects, renderTestimonials, renderFaq, renderContacts]
    .forEach((fn) => {
      try { fn(); } catch (e) { console.error(`Chyba v ${fn.name}:`, e); }
    });
}

/* ---------------- smooth scroll (Lenis) ---------------- */
function initSmoothScroll() {
  if (typeof Lenis === "undefined") return;
  const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
  if (window.gsap && window.ScrollTrigger) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }
}

/* ---------------- nav ---------------- */
function initNav() {
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 40);
  });
  toggle?.addEventListener("click", () => links.classList.toggle("open"));
  links?.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => links.classList.remove("open"))
  );
}

/* ---------------- cursor spotlight ---------------- */
function initCursorSpotlight() {
  const bg = document.querySelector(".bg-layer");
  window.addEventListener("mousemove", (e) => {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    bg?.style.setProperty("--mx", x + "%");
    bg?.style.setProperty("--my", y + "%");
  });
  bindSpotlight(document);
}
function bindSpotlight(container) {
  container.querySelectorAll(".glass").forEach((card) => {
    if (card._spotlightBound) return;
    card._spotlightBound = true;
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--cx", ((e.clientX - r.left) / r.width) * 100 + "%");
      card.style.setProperty("--cy", ((e.clientY - r.top) / r.height) * 100 + "%");
    });
  });
}

/* ---------------- helpers ---------------- */
function esc(str) {
  return (str ?? "").toString().replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ---------------- HERO ---------------- */
function renderHero() {
  const h = DB.get(DB.KEYS.hero);
  document.querySelector("[data-hero-eyebrow]").textContent = h.eyebrow || "";
  document.querySelector("[data-hero-headline]").textContent = h.headline || "";
  document.querySelector("[data-hero-subheadline]").textContent = h.subheadline || "";
  const photoWrap = document.querySelector("[data-hero-photo]");
  if (photoWrap) {
    photoWrap.innerHTML = h.photo
      ? `<img src="${h.photo}" alt="${esc(h.name)}">`
      : `<div class="placeholder">${(h.name || "?").trim().charAt(0).toUpperCase()}</div>`;
  }
}

/* ---------------- PRICING ---------------- */
function renderPricing() {
  const p = DB.get(DB.KEYS.pricing);
  document.querySelector("[data-price]").textContent = `${p.price} ${p.priceUnit}`;
  const compareEl = document.querySelector("[data-compare-price]");
  if (compareEl) {
    if (p.comparePrice) {
      compareEl.textContent = `${p.comparePrice.toLocaleString("cs-CZ")} Kč`;
      compareEl.style.display = "block";
    } else {
      compareEl.style.display = "none";
    }
  }
  const compareLabelEl = document.querySelector("[data-compare-label]");
  if (compareLabelEl) compareLabelEl.textContent = p.comparePriceLabel || "";
  document.querySelector("[data-turnaround1]").textContent = p.turnaround1;
  document.querySelector("[data-turnaround2]").textContent = p.turnaround2;
  document.querySelector("[data-commitment]").textContent = p.commitment;
  document.querySelector("[data-guarantee]").textContent = p.guarantee;
  if (window.lucide) lucide.createIcons();
}

/* ---------------- PROCESS ---------------- */
function renderProcess() {
  const items = DB.get(DB.KEYS.process);
  const el = document.querySelector("[data-process]");
  if (!el) return;
  el.innerHTML = items
    .map((s) => `<div class="process-step"><div><h4>${esc(s.title)}</h4><p>${esc(s.desc)}</p></div></div>`)
    .join("");
}

/* ---------------- PROJECTS / UKÁZKY ---------------- */
function renderProjects() {
  const items = DB.get(DB.KEYS.projects);
  const grid = document.querySelector("[data-projects]");
  if (!grid) return;
  if (!items.length) {
    grid.innerHTML = `<p class="portfolio-empty">Ukázky prací se právě doplňují.</p>`;
    return;
  }
  grid.innerHTML = items
    .map(
      (p) => `
    <div class="project-card glass">
      <div class="project-media">${p.image ? `<img src="${p.image}" alt="${esc(p.title)}">` : ""}</div>
      <div class="project-body">
        <span class="tag" style="margin-bottom:10px; display:inline-block;">${esc(p.category)}</span>
        <h3 class="project-title">${esc(p.title)}</h3>
        <p class="project-desc">${esc(p.desc)}</p>
        ${p.url ? `<a class="project-link" href="${esc(p.url)}" target="_blank" rel="noopener">Zobrazit web →</a>` : ""}
      </div>
    </div>`
    )
    .join("");
  bindSpotlight(grid);
}

/* ---------------- TESTIMONIALS ---------------- */
function renderTestimonials() {
  const items = DB.get(DB.KEYS.testimonials);
  const grid = document.querySelector("[data-testimonials]");
  if (!grid) return;
  if (!items.length) {
    grid.innerHTML = `<p class="testimonial-empty">Zatím žádné reference.</p>`;
    return;
  }
  grid.innerHTML = items
    .map(
      (t) => `
    <div class="testimonial-card glass">
      <p class="testimonial-text">„${esc(t.text)}“</p>
      <div class="testimonial-author">
        <div class="testimonial-avatar">${t.avatar ? `<img src="${t.avatar}" alt="${esc(t.name)}">` : ""}</div>
        <div>
          <div class="testimonial-name">${esc(t.name)}</div>
          <div class="testimonial-role">${esc(t.role)}</div>
        </div>
      </div>
    </div>`
    )
    .join("");
  bindSpotlight(grid);
}

/* ---------------- FAQ ---------------- */
function renderFaq() {
  const items = DB.get(DB.KEYS.faq);
  const el = document.querySelector("[data-faq]");
  if (!el) return;
  el.innerHTML = items
    .map(
      (f, i) => `
    <div class="faq-item" data-faq-item="${i}">
      <button type="button" class="faq-q">${esc(f.q)}<span class="plus">+</span></button>
      <div class="faq-a"><p>${esc(f.a)}</p></div>
    </div>`
    )
    .join("");
}
function initFaqAccordion() {
  document.querySelector("[data-faq]")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".faq-q");
    if (!btn) return;
    btn.closest(".faq-item").classList.toggle("open");
  });
}

/* ---------------- CONTACTS ---------------- */
function renderContacts() {
  const s = DB.get(DB.KEYS.social);
  const map = {
    facebook: { icon: "facebook", label: s.facebook },
    instagram: { icon: "instagram", label: s.instagram },
    linkedin: { icon: "linkedin", label: s.linkedin },
    tiktok: { icon: "music-2", label: s.tiktok },
    github: { icon: "github", label: s.github },
    discord: { icon: "message-square", label: s.discord },
    email: { icon: "mail", label: s.email },
    phone: { icon: "phone", label: s.phone },
  };
  const grid = document.querySelector("[data-contacts]");
  if (grid) {
    grid.innerHTML = Object.entries(map)
      .filter(([, v]) => v.label)
      .map(([key, v]) => {
        const href = key === "email" ? `mailto:${v.label}` : key === "phone" ? `tel:${v.label}` : v.label;
        return `<a class="contact-icon-card glass" href="${esc(href)}" target="_blank" rel="noopener"><i data-lucide="${v.icon}"></i><span>${esc(v.label)}</span></a>`;
      })
      .join("") || `<p style="color:var(--text-faint)">Kontakty budou brzy doplněny.</p>`;
    bindSpotlight(grid);
  }
  const footerSocials = document.querySelector("[data-footer-socials]");
  if (footerSocials) {
    footerSocials.innerHTML = Object.entries(map)
      .filter(([k, v]) => v.label && k !== "email" && k !== "phone")
      .map(([, v]) => `<a href="${esc(v.label)}" target="_blank" rel="noopener"><i data-lucide="${v.icon}"></i></a>`)
      .join("");
  }
  if (window.lucide) lucide.createIcons();
}

/* ---------------- CONTACT FORM (poptávka) ---------------- */
function initContactForm() {
  const form = document.querySelector("#contact-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    let valid = true;
    form.querySelectorAll(".field").forEach((f) => f.classList.remove("error"));

    function markError(name, msg) {
      const field = form.querySelector(`[data-field="${name}"]`);
      field?.classList.add("error");
      const err = field?.querySelector(".field-error");
      if (err) err.textContent = msg;
      valid = false;
    }

    if (!data.name || data.name.trim().length < 2) markError("name", "Zadejte prosím jméno.");
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) markError("email", "Zadejte platný e‑mail.");
    if (!data.message || data.message.trim().length < 10) markError("message", "Zpráva by měla mít alespoň 10 znaků.");

    const status = form.querySelector(".form-status");
    if (!valid) {
      status.textContent = "Zkontrolujte prosím vyznačená pole.";
      status.className = "form-status err";
      return;
    }

    const leads = DB.get(DB.KEYS.leads);
    leads.unshift({ id: DB.uid(), ...data, date: new Date().toISOString() });
    DB.set(DB.KEYS.leads, leads);

    status.textContent = "Poptávka byla odeslána. Ozvu se co nejdříve!";
    status.className = "form-status ok";
    form.reset();
  });
}

/* ---------------- scroll animations ---------------- */
function initScrollAnimations() {
  document.querySelectorAll("section:not(.hero) .glass, section:not(.hero) .process-step, section:not(.hero) .faq-item").forEach((el) => {
    if (!el.hasAttribute("data-reveal")) el.setAttribute("data-reveal", "");
  });

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    document.querySelectorAll("[data-reveal]").forEach((el, i) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.9, ease: "power3.out",
        delay: (i % 4) * 0.06,
        scrollTrigger: { trigger: el, start: "top 90%" },
      });
    });
    gsap.from(".hero-name", { opacity: 0, y: 30, duration: 1, ease: "power3.out", delay: 0.2 });
    gsap.from(".hero-slogan, .hero-actions, .hero-eyebrow", { opacity: 0, y: 20, duration: 0.9, stagger: 0.1, delay: 0.4 });
    gsap.from(".hero-photo-wrap", { opacity: 0, scale: 0.92, duration: 1, ease: "power3.out", delay: 0.3 });
  } else {
    document.querySelectorAll("[data-reveal]").forEach((el) => { el.style.opacity = 1; el.style.transform = "none"; });
  }
}

/* ============================================================
   HIDDEN ADMIN ACCESS
============================================================ */
function initHiddenAdminAccess() {
  let clicks = 0, clickTimer = null;
  const trigger = () => {
    clicks++;
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => (clicks = 0), 1800);
    if (clicks >= 5) {
      clicks = 0;
      openPasswordModal();
    }
  };
  document.querySelector(".logo")?.addEventListener("click", trigger);

  let buffer = "";
  const secret = () => (DB.get(DB.KEYS.settings).adminPassword || "adminmama43").toLowerCase();
  window.addEventListener("keydown", (e) => {
    if (e.key.length !== 1) return;
    buffer = (buffer + e.key).slice(-40).toLowerCase();
    if (buffer.includes(secret())) {
      buffer = "";
      goToAdmin();
    }
  });

  document.querySelector("#admin-modal .modal-close")?.addEventListener("click", closePasswordModal);
  document.querySelector("#admin-modal")?.addEventListener("click", (e) => {
    if (e.target.id === "admin-modal") closePasswordModal();
  });
  document.querySelector("#admin-pass-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = document.querySelector("#admin-pass-input").value;
    if (val === (DB.get(DB.KEYS.settings).adminPassword || "adminmama43")) {
      goToAdmin();
    } else {
      document.querySelector("#admin-modal .modal-error").textContent = "Nesprávné heslo.";
    }
  });
}
function openPasswordModal() {
  document.querySelector("#admin-modal")?.classList.add("open");
  document.querySelector("#admin-pass-input")?.focus();
}
function closePasswordModal() {
  document.querySelector("#admin-modal")?.classList.remove("open");
  document.querySelector("#admin-modal .modal-error").textContent = "";
  document.querySelector("#admin-pass-input").value = "";
}
function goToAdmin() {
  sessionStorage.setItem("pf_admin_auth", "1");
  window.location.href = "admin.html";
}
