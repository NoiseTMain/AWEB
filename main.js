/* ============================================================
   main.js — veřejný web: vykreslení dat + interakce + animace
============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  initSmoothScroll();
  initNav();
  initCursorSpotlight();
  renderAll();
  initContactForm();
  initTimelineTabs();
  initScrollAnimations();
  initHiddenAdminAccess();

  // Živé překreslení, jakmile přijde změna z Firebase (od admina, odkudkoliv)
  // nebo lokálně (např. odeslání kontaktního formuláře).
  window.addEventListener("pf:update", () => renderAll());

  // Záložní chování pro případ, že Firebase není nastaven: aspoň mezi
  // otevřenými panely ve stejném prohlížeči se to synchronizuje.
  window.addEventListener("storage", () => renderAll());
});

function renderAll() {
  renderHero();
  renderAbout();
  renderResume();
  renderGallery();
  renderLinks();
  renderSkills();
  renderPortfolio();
  renderTestimonials();
  renderContacts();
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
  document.querySelectorAll(".glass").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--cx", ((e.clientX - r.left) / r.width) * 100 + "%");
      card.style.setProperty("--cy", ((e.clientY - r.top) / r.height) * 100 + "%");
    });
  });
}
// re-bind spotlight for dynamically injected cards
function bindSpotlight(container) {
  container.querySelectorAll(".glass").forEach((card) => {
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
function faviconFor(url) {
  try {
    const u = new URL(url);
    return `https://www.google.com/s2/favicons?sz=64&domain=${u.hostname}`;
  } catch {
    return "";
  }
}

/* ---------------- HERO ---------------- */
function renderHero() {
  const h = DB.get(DB.KEYS.hero);
  document.querySelectorAll("[data-hero-name]").forEach((el) => (el.textContent = h.name || "Vaše jméno"));
  document.querySelectorAll("[data-hero-slogan]").forEach((el) => (el.textContent = h.slogan || ""));
  const photoWrap = document.querySelector("[data-hero-photo]");
  if (photoWrap) {
    photoWrap.innerHTML = h.photo
      ? `<img src="${h.photo}" alt="${esc(h.name)}">`
      : `<div class="placeholder">${(h.name || "?").trim().charAt(0).toUpperCase()}</div>`;
  }
}

/* ---------------- ABOUT ---------------- */
function renderAbout() {
  const a = DB.get(DB.KEYS.about);
  const textEl = document.querySelector("[data-about-text]");
  if (textEl) textEl.innerHTML = (a.text || "").split("\n\n").map((p) => `<p>${esc(p)}</p>`).join("");
  const photoEl = document.querySelector("[data-about-photo]");
  const hero = DB.get(DB.KEYS.hero);
  const photo = a.photo || hero.photo;
  if (photoEl) {
    photoEl.innerHTML = photo
      ? `<img src="${photo}" alt="O mně">`
      : `<div class="placeholder" style="height:100%;">${(hero.name || "?").charAt(0).toUpperCase()}</div>`;
  }
}

/* ---------------- RESUME / TIMELINE ---------------- */
function renderResume() {
  const r = DB.get(DB.KEYS.resume);
  const map = { education: r.education, experience: r.experience, certificates: r.certificates };
  Object.entries(map).forEach(([key, items]) => {
    const el = document.querySelector(`[data-timeline="${key}"]`);
    if (!el) return;
    el.innerHTML = (items || [])
      .map(
        (it) => `
      <div class="timeline-item">
        <div class="period">${esc(it.period)}</div>
        <h4>${esc(it.title)}</h4>
        <p>${esc(it.desc)}</p>
      </div>`
      )
      .join("") || `<p style="color:var(--text-faint)">Zatím nevyplněno.</p>`;
  });

  const tagFields = {
    skills: r.skills, languages: r.languages, softSkills: r.softSkills, hardSkills: r.hardSkills,
  };
  Object.entries(tagFields).forEach(([key, arr]) => {
    const el = document.querySelector(`[data-tags="${key}"]`);
    if (el) el.innerHTML = (arr || []).map((t) => `<span class="tag">${esc(t)}</span>`).join("");
  });
  const lic = document.querySelector("[data-license]");
  if (lic) lic.textContent = r.license || "—";
}

function initTimelineTabs() {
  const tabs = document.querySelectorAll(".tab-btn");
  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabs.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll(".timeline").forEach((t) => t.classList.remove("active"));
      document.querySelector(`.timeline[data-timeline="${btn.dataset.tab}"]`)?.classList.add("active");
    });
  });
}

/* ---------------- GALLERY + LIGHTBOX ---------------- */
let galleryImages = [];
function renderGallery() {
  const items = DB.get(DB.KEYS.gallery).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  galleryImages = items;
  const grid = document.querySelector("[data-gallery]");
  if (!grid) return;
  if (!items.length) {
    grid.innerHTML = `<p class="gallery-empty">Galerie zatím neobsahuje žádné fotografie.</p>`;
    return;
  }
  grid.innerHTML = items
    .map((it, i) => `<div class="gallery-item" data-index="${i}"><img src="${it.url}" alt="${esc(it.name || "")}" loading="lazy"></div>`)
    .join("");
  grid.querySelectorAll(".gallery-item").forEach((el) => el.addEventListener("click", () => openLightbox(+el.dataset.index)));
}
let lightboxIndex = 0;
function openLightbox(i) {
  lightboxIndex = i;
  const lb = document.querySelector(".lightbox");
  document.querySelector(".lightbox img").src = galleryImages[i].url;
  lb.classList.add("open");
}
function closeLightbox() {
  document.querySelector(".lightbox").classList.remove("open");
}
function shiftLightbox(dir) {
  lightboxIndex = (lightboxIndex + dir + galleryImages.length) % galleryImages.length;
  document.querySelector(".lightbox img").src = galleryImages[lightboxIndex].url;
}
document.addEventListener("click", (e) => {
  if (e.target.closest(".lightbox-close") || e.target.classList.contains("lightbox")) closeLightbox();
  if (e.target.closest(".lightbox-prev")) shiftLightbox(-1);
  if (e.target.closest(".lightbox-next")) shiftLightbox(1);
});
document.addEventListener("keydown", (e) => {
  if (!document.querySelector(".lightbox")?.classList.contains("open")) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") shiftLightbox(-1);
  if (e.key === "ArrowRight") shiftLightbox(1);
});

/* ---------------- EXTERNAL LINKS ---------------- */
function renderLinks() {
  const items = DB.get(DB.KEYS.links);
  const grid = document.querySelector("[data-links]");
  if (!grid) return;
  if (!items.length) {
    grid.innerHTML = `<p class="portfolio-empty">Zatím žádné externí odkazy.</p>`;
    return;
  }
  grid.innerHTML = items
    .map(
      (it) => `
    <div class="link-card glass">
      <div class="link-head">
        <div class="link-logo"><img src="${it.logo || faviconFor(it.url)}" alt="" onerror="this.style.display='none'"></div>
        <div class="link-title">${esc(it.title)}</div>
      </div>
      <p class="link-desc">${esc(it.desc)}</p>
      <a class="link-open" href="${esc(it.url)}" target="_blank" rel="noopener">Otevřít →</a>
    </div>`
    )
    .join("");
  bindSpotlight(grid);
}

/* ---------------- SKILLS ---------------- */
function renderSkills() {
  const items = DB.get(DB.KEYS.skills);
  const grid = document.querySelector("[data-skills]");
  if (!grid) return;
  grid.innerHTML = items
    .map(
      (s) => `
    <div class="skill-card glass">
      <div class="skill-head">
        <div class="skill-name"><i data-lucide="${esc(s.icon || "star")}"></i>${esc(s.name)}</div>
        <div class="skill-pct">${s.level}%</div>
      </div>
      <div class="skill-bar"><div class="skill-bar-fill" data-level="${s.level}"></div></div>
    </div>`
    )
    .join("");
  bindSpotlight(grid);
  if (window.lucide) lucide.createIcons();
}

/* ---------------- PORTFOLIO ---------------- */
function renderPortfolio() {
  const items = DB.get(DB.KEYS.projects);
  const grid = document.querySelector("[data-portfolio]");
  if (!grid) return;
  if (!items.length) {
    grid.innerHTML = `<p class="portfolio-empty">Portfolio se právě plní novými projekty.</p>`;
    return;
  }
  grid.innerHTML = items
    .map(
      (p) => `
    <div class="project-card glass">
      <div class="project-media">${p.image ? `<img src="${p.image}" alt="${esc(p.title)}">` : ""}</div>
      <div class="project-body">
        <h3 class="project-title">${esc(p.title)}</h3>
        <p class="project-desc">${esc(p.desc)}</p>
        <div class="project-tech">${(p.tech || "").split(",").filter(Boolean).map((t) => `<span class="tag">${esc(t.trim())}</span>`).join("")}</div>
        ${p.link ? `<a class="project-link" href="${esc(p.link)}" target="_blank" rel="noopener">Zobrazit projekt →</a>` : ""}
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
  const heroLinkedin = document.querySelector("[data-linkedin-link]");
  if (heroLinkedin && s.linkedin) heroLinkedin.href = s.linkedin;

  const footerSocials = document.querySelector("[data-footer-socials]");
  if (footerSocials) {
    footerSocials.innerHTML = Object.entries(map)
      .filter(([k, v]) => v.label && k !== "email" && k !== "phone")
      .map(([, v]) => `<a href="${esc(v.label)}" target="_blank" rel="noopener"><i data-lucide="${v.icon}"></i></a>`)
      .join("");
  }
  if (window.lucide) lucide.createIcons();
}

/* ---------------- CONTACT FORM ---------------- */
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

    const messages = DB.get(DB.KEYS.contactMessages);
    messages.unshift({ id: DB.uid(), ...data, date: new Date().toISOString() });
    DB.set(DB.KEYS.contactMessages, messages);

    status.textContent = "Zpráva byla odeslána. Ozvu se co nejdříve!";
    status.className = "form-status ok";
    form.reset();
  });
}

/* ---------------- scroll animations ---------------- */
function initScrollAnimations() {
  document.querySelectorAll("section:not(.hero) [data-reveal], section:not(.hero) .glass").forEach((el) => {
    if (!el.hasAttribute("data-reveal")) el.setAttribute("data-reveal", "");
  });

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    document.querySelectorAll("[data-reveal]").forEach((el, i) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.9, ease: "power3.out",
        delay: (i % 4) * 0.06,
        scrollTrigger: { trigger: el, start: "top 88%" },
      });
    });
    gsap.utils.toArray(".skill-bar-fill").forEach((bar) => {
      gsap.to(bar, {
        width: bar.dataset.level + "%",
        scrollTrigger: { trigger: bar, start: "top 90%" },
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
   1) 5x klik na logo/jméno -> heslo -> /admin.html
   2) napsání "adminmama43" kdekoliv na stránce -> automatické otevření
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
  document.querySelector("[data-hero-name]")?.addEventListener("click", trigger);

  // typed secret buffer
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

  document.querySelector(".modal-close")?.addEventListener("click", closePasswordModal);
  document.querySelector(".modal-overlay")?.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal-overlay")) closePasswordModal();
  });
  document.querySelector("#admin-pass-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = document.querySelector("#admin-pass-input").value;
    if (val === (DB.get(DB.KEYS.settings).adminPassword || "adminmama43")) {
      goToAdmin();
    } else {
      document.querySelector(".modal-error").textContent = "Nesprávné heslo.";
    }
  });
}
function openPasswordModal() {
  document.querySelector(".modal-overlay")?.classList.add("open");
  document.querySelector("#admin-pass-input")?.focus();
}
function closePasswordModal() {
  document.querySelector(".modal-overlay")?.classList.remove("open");
  document.querySelector(".modal-error").textContent = "";
  document.querySelector("#admin-pass-input").value = "";
}
function goToAdmin() {
  sessionStorage.setItem("pf_admin_auth", "1");
  window.location.href = "admin.html";
}
