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
    initSmoothScroll, initNav, initCursorSpotlight, initLangSwitcher, renderAll,
    initContactForm, initAuditForm, initFaqAccordion, initScrollAnimations, initHiddenAdminAccess,
  ];
  steps.forEach((fn) => {
    try { fn(); } catch (e) { console.error(`Chyba v ${fn.name}:`, e); }
  });
  // 3D logo se zkouší až po prvním vykreslení (které už zobrazilo běžnou
  // fotku/placeholder jako výchozí stav). Pokud 3D selže hned na startu
  // (chybí WebGL, nenačetl se three.js z CDN), fotka/placeholder už tam je.
  try { initLogo3D(); } catch (e) { console.error("initLogo3D:", e); }
  window.addEventListener("storage", () => location.reload());
  window.addEventListener("pf:update", () => renderAll());
});

function renderAll() {
  [renderHero, renderPricing, renderProcess, renderServices, renderProjects, renderTestimonials, renderFaq, renderContacts]
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
  document.querySelector("[data-hero-eyebrow]").textContent = tField(h, "eyebrow");
  document.querySelector("[data-hero-headline]").textContent = tField(h, "headline");
  document.querySelector("[data-hero-subheadline]").textContent = tField(h, "subheadline");
  const photoWrap = document.querySelector("[data-hero-photo]");
  // Pokud právě běží 3D logo, jeho plátno nepřepisujeme — monogram je
  // statický (postavený jednou při načtení), takže ho není potřeba
  // překreslovat při každé změně dat.
  if (photoWrap && !photoWrap.querySelector(".logo3d-canvas")) {
    photoWrap.innerHTML = h.photo
      ? `<img src="${h.photo}" alt="${esc(h.name)}">`
      : `<div class="placeholder">${(h.name || "?").trim().charAt(0).toUpperCase()}</div>`;
  }
}

/* ---------------- PRICING ---------------- */
function renderPricing() {
  const p = DB.get(DB.KEYS.pricing);
  document.querySelector("[data-price]").textContent = `${p.price} ${tField(p, "priceUnit")}`;
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
  if (compareLabelEl) compareLabelEl.textContent = tField(p, "comparePriceLabel");
  document.querySelector("[data-turnaround1]").textContent = tField(p, "turnaround1");
  document.querySelector("[data-turnaround2]").textContent = tField(p, "turnaround2");
  document.querySelector("[data-commitment]").textContent = tField(p, "commitment");
  document.querySelector("[data-guarantee]").textContent = tField(p, "guarantee");
  if (window.lucide) lucide.createIcons();
}

/* ---------------- PROCESS ---------------- */
function renderProcess() {
  const items = DB.get(DB.KEYS.process);
  const el = document.querySelector("[data-process]");
  if (!el) return;
  el.innerHTML = items
    .map((s) => `<div class="process-step"><div><h4>${esc(tField(s, "title"))}</h4><p>${esc(tField(s, "desc"))}</p></div></div>`)
    .join("");
}

/* ---------------- SLUŽBY / SERVICES ---------------- */
function renderServices() {
  const items = DB.get(DB.KEYS.services);
  const grid = document.querySelector("[data-services]");
  if (!grid) return;
  grid.innerHTML = items
    .map(
      (s) => `
    <div class="service-card glass">
      <div class="service-icon"><i data-lucide="${esc(s.icon || "sparkles")}"></i></div>
      <h3 class="service-title">${esc(tField(s, "title"))}</h3>
      <p class="service-desc">${esc(tField(s, "desc"))}</p>
    </div>`
    )
    .join("");
  bindSpotlight(grid);
  if (window.lucide) lucide.createIcons();
}

/* ---------------- PROJECTS / UKÁZKY ---------------- */
function renderProjects() {
  const items = DB.get(DB.KEYS.projects);
  const grid = document.querySelector("[data-projects]");
  if (!grid) return;
  if (!items.length) {
    grid.innerHTML = `<p class="portfolio-empty">${t("projects.empty")}</p>`;
    return;
  }
  grid.innerHTML = items
    .map(
      (p) => `
    <div class="project-card glass">
      <div class="project-media">${p.image ? `<img src="${p.image}" alt="${esc(tField(p, "title"))}">` : ""}</div>
      <div class="project-body">
        <span class="tag" style="margin-bottom:10px; display:inline-block;">${esc(tField(p, "category"))}</span>
        <h3 class="project-title">${esc(tField(p, "title"))}</h3>
        <p class="project-desc">${esc(tField(p, "desc"))}</p>
        ${p.url ? `<a class="project-link" href="${esc(p.url)}" target="_blank" rel="noopener">${t("projects.viewLink")}</a>` : ""}
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
    grid.innerHTML = `<p class="testimonial-empty">${t("references.empty")}</p>`;
    return;
  }
  grid.innerHTML = items
    .map(
      (item) => `
    <div class="testimonial-card glass">
      <p class="testimonial-text">„${esc(tField(item, "text"))}“</p>
      <div class="testimonial-author">
        <div class="testimonial-avatar">${item.avatar ? `<img src="${item.avatar}" alt="${esc(item.name)}">` : ""}</div>
        <div>
          <div class="testimonial-name">${esc(item.name)}</div>
          <div class="testimonial-role">${esc(tField(item, "role"))}</div>
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
      <button type="button" class="faq-q">${esc(tField(f, "q"))}<span class="plus">+</span></button>
      <div class="faq-a"><p>${esc(tField(f, "a"))}</p></div>
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
      .join("");
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
    form.querySelector("[data-field=consent]")?.classList.remove("error");

    function markError(name, msg) {
      const field = form.querySelector(`[data-field="${name}"]`);
      field?.classList.add("error");
      const err = field?.querySelector(".field-error");
      if (err) err.textContent = msg;
      valid = false;
    }

    if (!data.name || data.name.trim().length < 2) markError("name", t("contact.errorName"));
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) markError("email", t("contact.errorEmail"));
    if (!data.message || data.message.trim().length < 10) markError("message", t("contact.errorMessage"));
    if (!form.consent || !form.consent.checked) markError("consent", t("contact.consentError"));

    const status = form.querySelector(".form-status");
    if (!valid) {
      status.textContent = t("contact.errorGeneric");
      status.className = "form-status err";
      return;
    }

    delete data.consent;
    const leads = DB.get(DB.KEYS.leads);
    leads.unshift({ id: DB.uid(), ...data, date: new Date().toISOString() });
    DB.set(DB.KEYS.leads, leads);

    status.textContent = t("contact.success");
    status.className = "form-status ok";
    form.reset();
  });
}

/* ---------------- AUDIT WEBU (formulář, zatím bez reálného backendu) ---------------- */
function initAuditForm() {
  const form = document.querySelector("#audit-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const url = form.url.value.trim();
    const email = form.email.value.trim();
    const status = form.querySelector(".form-status");

    if (!url || !/^https?:\/\/.+\..+/.test(url)) {
      status.textContent = t("audit.errorUrl");
      status.className = "form-status err";
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      status.textContent = t("audit.errorEmail");
      status.className = "form-status err";
      return;
    }

    // Zatím se jen ukládá poptávka na audit (viz administrace → sdílené
    // s poptávkami). Až bude hotový backend pro reálnou AI analýzu,
    // stačí sem doplnit fetch() na příslušný endpoint.
    const requests = DB.get(DB.KEYS.auditRequests);
    requests.unshift({ id: DB.uid(), url, email, date: new Date().toISOString() });
    DB.set(DB.KEYS.auditRequests, requests);

    status.textContent = t("audit.thanks");
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
