/* ============================================================
   admin.js — administrace: CRUD nad daty v localStorage (DB)
============================================================ */

/* ---------------- AUTH ---------------- */
function checkAuth() {
  const authed = sessionStorage.getItem("pf_admin_auth") === "1";
  if (authed) {
    document.querySelector(".admin-login").style.display = "none";
    document.querySelector(".admin-shell").style.display = "flex";
    initAdmin();
  } else {
    document.querySelector(".admin-login").style.display = "flex";
    document.querySelector(".admin-shell").style.display = "none";
  }
}
document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  document.querySelector("#login-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = document.querySelector("#login-input").value;
    if (val === (DB.get(DB.KEYS.settings).adminPassword || "adminmama43")) {
      sessionStorage.setItem("pf_admin_auth", "1");
      checkAuth();
    } else {
      document.querySelector(".login-error").textContent = "Nesprávné heslo.";
    }
  });
});

function logout() {
  sessionStorage.removeItem("pf_admin_auth");
  window.location.href = "index.html";
}

/* ---------------- helpers ---------------- */
function esc(str) { return (str ?? "").toString().replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
function toast(msg) {
  const t = document.querySelector(".toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 2400);
}
function confirmDelete(msg) { return window.confirm(msg || "Opravdu smazat?"); }

/* ============================================================
   INIT
============================================================ */
function initAdmin() {
  initSidebar();
  renderDashboard();
  initHeroForm();
  initPricingForm();
  initProcess();
  initProjects();
  initTestimonials();
  initFaq();
  initSocial();
  renderLeads();
  initNotes();
  initCalendar();
  initSettings();
}

function initSidebar() {
  const links = document.querySelectorAll(".side-link[data-view]");
  links.forEach((l) =>
    l.addEventListener("click", () => {
      links.forEach((x) => x.classList.remove("active"));
      l.classList.add("active");
      document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
      document.querySelector(`#view-${l.dataset.view}`)?.classList.add("active");
      document.querySelector(".sidebar")?.classList.remove("open");
      document.querySelector("#sidebar-backdrop")?.classList.remove("open");
      if (l.dataset.view === "dashboard") renderDashboard();
    })
  );
  document.querySelector("#sidebar-toggle")?.addEventListener("click", () => {
    document.querySelector(".sidebar").classList.toggle("open");
    document.querySelector("#sidebar-backdrop")?.classList.toggle("open");
  });
  document.querySelector("#sidebar-backdrop")?.addEventListener("click", () => {
    document.querySelector(".sidebar").classList.remove("open");
    document.querySelector("#sidebar-backdrop").classList.remove("open");
  });
}

function renderDashboard() {
  const pricing = DB.get(DB.KEYS.pricing);
  const leads = DB.get(DB.KEYS.leads);
  const counts = {
    projects: DB.get(DB.KEYS.projects).length,
    testimonials: DB.get(DB.KEYS.testimonials).length,
    faq: DB.get(DB.KEYS.faq).length,
    leads: leads.length,
    notes: DB.get(DB.KEYS.notes).filter((n) => !n.done).length,
    events: DB.get(DB.KEYS.events).length,
  };
  // Kolik klientů (aktivních poptávek) potřebuješ na 30 000 Kč/měsíc při aktuální ceně
  const targetClients = pricing.price > 0 ? Math.ceil(30000 / pricing.price) : "—";
  const grid = document.querySelector("#dashboard-stats");
  if (!grid) return;
  grid.innerHTML = `
    <div class="stat-card glass"><div class="stat-num">${leads.length}</div><div class="stat-label">Poptávek celkem</div></div>
    <div class="stat-card glass"><div class="stat-num">${targetClients}</div><div class="stat-label">Klientů na 30 000 Kč/měs při ${pricing.price} Kč</div></div>
    <div class="stat-card glass"><div class="stat-num">${counts.projects}</div><div class="stat-label">Ukázek prací</div></div>
    <div class="stat-card glass"><div class="stat-num">${counts.testimonials}</div><div class="stat-label">Referencí</div></div>
    <div class="stat-card glass"><div class="stat-num">${counts.faq}</div><div class="stat-label">FAQ položek</div></div>
    <div class="stat-card glass"><div class="stat-num">${counts.notes}</div><div class="stat-label">Aktivních poznámek</div></div>
    <div class="stat-card glass"><div class="stat-num">${counts.events}</div><div class="stat-label">Událostí v kalendáři</div></div>
  `;
}

/* ============================================================
   HERO
============================================================ */
function initHeroForm() {
  const h = DB.get(DB.KEYS.hero);
  const form = document.querySelector("#hero-form");
  if (!form) return;
  form.name.value = h.name || "";
  form.eyebrow.value = h.eyebrow || "";
  form.headline.value = h.headline || "";
  form.subheadline.value = h.subheadline || "";
  updatePreviewImg("#hero-photo-preview", h.photo);

  form.photo.addEventListener("change", async () => {
    if (form.photo.files[0]) updatePreviewImg("#hero-photo-preview", await fileToDataURL(form.photo.files[0]));
  });
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = DB.get(DB.KEYS.hero);
    data.name = form.name.value.trim();
    data.eyebrow = form.eyebrow.value.trim();
    data.headline = form.headline.value.trim();
    data.subheadline = form.subheadline.value.trim();
    if (form.photo.files[0]) data.photo = await fileToDataURL(form.photo.files[0]);
    DB.set(DB.KEYS.hero, data);
    toast("Domovská stránka uložena.");
  });
}
function updatePreviewImg(sel, src) {
  const el = document.querySelector(sel);
  if (!el) return;
  el.innerHTML = src ? `<img src="${src}" alt="">` : `<span style="color:var(--text-faint); font-size:.8rem;">Bez fotografie</span>`;
}

/* ============================================================
   PRICING
============================================================ */
function initPricingForm() {
  const p = DB.get(DB.KEYS.pricing);
  const form = document.querySelector("#pricing-form");
  if (!form) return;
  form.comparePrice.value = p.comparePrice || "";
  form.comparePriceLabel.value = p.comparePriceLabel || "";
  form.price.value = p.price;
  form.priceUnit.value = p.priceUnit;
  form.turnaround1.value = p.turnaround1;
  form.turnaround2.value = p.turnaround2;
  form.commitment.value = p.commitment;
  form.guarantee.value = p.guarantee;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    DB.set(DB.KEYS.pricing, {
      comparePrice: form.comparePrice.value ? +form.comparePrice.value : 0,
      comparePriceLabel: form.comparePriceLabel.value.trim(),
      price: +form.price.value,
      priceUnit: form.priceUnit.value.trim(),
      turnaround1: form.turnaround1.value.trim(),
      turnaround2: form.turnaround2.value.trim(),
      commitment: form.commitment.value.trim(),
      guarantee: form.guarantee.value.trim(),
    });
    toast("Ceník uložen.");
    renderDashboard();
  });
}

/* ============================================================
   PROCESS
============================================================ */
function initProcess() {
  const form = document.querySelector("#process-form");
  if (!form) return;
  renderProcessAdmin();
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const items = DB.get(DB.KEYS.process);
    items.push({ title: form.title.value.trim(), desc: form.desc.value.trim() });
    DB.set(DB.KEYS.process, items);
    form.reset();
    renderProcessAdmin();
    toast("Krok přidán.");
  });
}
function renderProcessAdmin() {
  const container = document.querySelector("#process-list");
  const items = DB.get(DB.KEYS.process);
  container.innerHTML = items.map((it, i) => `
    <div class="item-row">
      <div class="info"><strong>${i + 1}. ${esc(it.title)}</strong><span>${esc(it.desc)}</span></div>
      <div class="actions"><button class="btn-icon" data-del="${i}">✕</button></div>
    </div>`).join("") || `<div class="empty-hint">Zatím žádné kroky.</div>`;
  container.querySelectorAll("[data-del]").forEach((btn) => btn.addEventListener("click", () => {
    if (!confirmDelete()) return;
    const arr = DB.get(DB.KEYS.process);
    arr.splice(+btn.dataset.del, 1);
    DB.set(DB.KEYS.process, arr);
    renderProcessAdmin();
  }));
}

/* ============================================================
   PROJECTS / UKÁZKY
============================================================ */
function initProjects() {
  const form = document.querySelector("#projects-form");
  if (!form) return;
  renderProjectsAdmin();
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const items = DB.get(DB.KEYS.projects);
    const editId = form.dataset.editId;
    const image = form.image.files[0] ? await fileToDataURL(form.image.files[0]) : (editId ? items.find((i) => i.id === editId)?.image : "");
    const payload = { title: form.title.value.trim(), category: form.category.value.trim() || "Web", desc: form.desc.value.trim(), url: form.url.value.trim(), image: image || "" };
    if (editId) {
      const idx = items.findIndex((i) => i.id === editId);
      items[idx] = { ...items[idx], ...payload };
      delete form.dataset.editId;
    } else {
      items.push({ id: DB.uid(), ...payload });
    }
    DB.set(DB.KEYS.projects, items);
    form.reset();
    renderProjectsAdmin();
    renderDashboard();
    toast("Ukázka uložena.");
  });
}
function renderProjectsAdmin() {
  const container = document.querySelector("#projects-list");
  const items = DB.get(DB.KEYS.projects);
  container.innerHTML = items.map((it) => `
    <div class="item-row">
      <div class="thumb">${it.image ? `<img src="${it.image}" alt="">` : ""}</div>
      <div class="info"><strong>${esc(it.title)}</strong><span>${esc(it.category)}</span></div>
      <div class="actions">
        <button class="btn-icon" data-edit="${it.id}">✎</button>
        <button class="btn-icon" data-del="${it.id}">✕</button>
      </div>
    </div>`).join("") || `<div class="empty-hint">Zatím žádné ukázky.</div>`;
  container.querySelectorAll("[data-edit]").forEach((btn) => btn.addEventListener("click", () => {
    const it = items.find((i) => i.id === btn.dataset.edit);
    const form = document.querySelector("#projects-form");
    form.title.value = it.title; form.category.value = it.category; form.desc.value = it.desc; form.url.value = it.url;
    form.dataset.editId = it.id;
    form.scrollIntoView({ behavior: "smooth", block: "center" });
  }));
  container.querySelectorAll("[data-del]").forEach((btn) => btn.addEventListener("click", () => {
    if (!confirmDelete()) return;
    DB.set(DB.KEYS.projects, DB.get(DB.KEYS.projects).filter((i) => i.id !== btn.dataset.del));
    renderProjectsAdmin();
    renderDashboard();
  }));
}

/* ============================================================
   TESTIMONIALS
============================================================ */
function initTestimonials() {
  const form = document.querySelector("#testimonials-form");
  if (!form) return;
  renderTestimonialsAdmin();
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const items = DB.get(DB.KEYS.testimonials);
    const editId = form.dataset.editId;
    const avatar = form.avatar.files[0] ? await fileToDataURL(form.avatar.files[0]) : (editId ? items.find((i) => i.id === editId)?.avatar : "");
    const payload = { name: form.name.value.trim(), role: form.role.value.trim(), text: form.text.value.trim(), avatar: avatar || "" };
    if (editId) {
      const idx = items.findIndex((i) => i.id === editId);
      items[idx] = { ...items[idx], ...payload };
      delete form.dataset.editId;
    } else {
      items.push({ id: DB.uid(), ...payload });
    }
    DB.set(DB.KEYS.testimonials, items);
    form.reset();
    renderTestimonialsAdmin();
    renderDashboard();
    toast("Reference uložena.");
  });
}
function renderTestimonialsAdmin() {
  const container = document.querySelector("#testimonials-list");
  const items = DB.get(DB.KEYS.testimonials);
  container.innerHTML = items.map((it) => `
    <div class="item-row">
      <div class="thumb" style="border-radius:50%;">${it.avatar ? `<img src="${it.avatar}" alt="">` : ""}</div>
      <div class="info"><strong>${esc(it.name)}</strong><span>${esc(it.role)}</span></div>
      <div class="actions">
        <button class="btn-icon" data-edit="${it.id}">✎</button>
        <button class="btn-icon" data-del="${it.id}">✕</button>
      </div>
    </div>`).join("") || `<div class="empty-hint">Zatím žádné reference.</div>`;
  container.querySelectorAll("[data-edit]").forEach((btn) => btn.addEventListener("click", () => {
    const it = items.find((i) => i.id === btn.dataset.edit);
    const form = document.querySelector("#testimonials-form");
    form.name.value = it.name; form.role.value = it.role; form.text.value = it.text;
    form.dataset.editId = it.id;
  }));
  container.querySelectorAll("[data-del]").forEach((btn) => btn.addEventListener("click", () => {
    if (!confirmDelete()) return;
    DB.set(DB.KEYS.testimonials, DB.get(DB.KEYS.testimonials).filter((i) => i.id !== btn.dataset.del));
    renderTestimonialsAdmin();
    renderDashboard();
  }));
}

/* ============================================================
   FAQ
============================================================ */
function initFaq() {
  const form = document.querySelector("#faq-form");
  if (!form) return;
  renderFaqAdmin();
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const items = DB.get(DB.KEYS.faq);
    items.push({ q: form.q.value.trim(), a: form.a.value.trim() });
    DB.set(DB.KEYS.faq, items);
    form.reset();
    renderFaqAdmin();
    renderDashboard();
    toast("Otázka přidána.");
  });
}
function renderFaqAdmin() {
  const container = document.querySelector("#faq-list");
  const items = DB.get(DB.KEYS.faq);
  container.innerHTML = items.map((it, i) => `
    <div class="item-row">
      <div class="info"><strong>${esc(it.q)}</strong><span>${esc(it.a)}</span></div>
      <div class="actions"><button class="btn-icon" data-del="${i}">✕</button></div>
    </div>`).join("") || `<div class="empty-hint">Zatím žádné otázky.</div>`;
  container.querySelectorAll("[data-del]").forEach((btn) => btn.addEventListener("click", () => {
    if (!confirmDelete()) return;
    const arr = DB.get(DB.KEYS.faq);
    arr.splice(+btn.dataset.del, 1);
    DB.set(DB.KEYS.faq, arr);
    renderFaqAdmin();
    renderDashboard();
  }));
}

/* ============================================================
   SOCIAL
============================================================ */
function initSocial() {
  const s = DB.get(DB.KEYS.social);
  const form = document.querySelector("#social-form");
  if (!form) return;
  Object.keys(s).forEach((key) => { if (form[key]) form[key].value = s[key] || ""; });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = {};
    Object.keys(s).forEach((key) => (data[key] = form[key].value.trim()));
    DB.set(DB.KEYS.social, data);
    toast("Kontakty a sítě uloženy.");
  });
}

/* ============================================================
   LEADS (poptávky)
============================================================ */
function renderLeads() {
  const container = document.querySelector("#leads-list");
  if (!container) return;
  const items = DB.get(DB.KEYS.leads);
  container.innerHTML = items.map((m) => `
    <div class="item-row" style="align-items:flex-start;">
      <div class="info">
        <strong>${esc(m.name)} — ${esc(m.email)}</strong>
        <span>${esc(m.subject || "(bez upřesnění)")} · ${esc(m.phone || "bez telefonu")} · ${new Date(m.date).toLocaleString("cs-CZ")}</span>
        <p style="font-size:.85rem; color:var(--text-muted); margin:8px 0 0;">${esc(m.message)}</p>
      </div>
      <div class="actions"><button class="btn-icon" data-del="${m.id}">✕</button></div>
    </div>`).join("") || `<div class="empty-hint">Zatím žádné poptávky.</div>`;
  container.querySelectorAll("[data-del]").forEach((btn) => btn.addEventListener("click", () => {
    if (!confirmDelete()) return;
    DB.set(DB.KEYS.leads, DB.get(DB.KEYS.leads).filter((m) => m.id !== btn.dataset.del));
    renderLeads();
    renderDashboard();
  }));
}

/* ============================================================
   NOTES (+ volitelně vytvoří i událost v kalendáři)
============================================================ */
function initNotes() {
  const form = document.querySelector("#notes-form");
  if (!form) return;
  renderNotes();
  form.querySelector("#note-add-cal")?.addEventListener("change", (e) => {
    document.querySelector("#note-cal-date").style.display = e.target.checked ? "block" : "none";
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const notes = DB.get(DB.KEYS.notes);
    const note = {
      id: DB.uid(),
      text: form.text.value.trim(),
      color: form.color.value,
      priority: form.priority.value,
      tags: (form.tags.value || "").split(",").map((s) => s.trim()).filter(Boolean),
      done: false,
    };
    if (form["add-cal"].checked && form["cal-date"].value) {
      const events = DB.get(DB.KEYS.events);
      const ev = { id: DB.uid(), date: form["cal-date"].value, time: "", title: note.text.slice(0, 40), desc: note.text, color: note.color, reminder: false };
      events.push(ev);
      DB.set(DB.KEYS.events, events);
      note.eventId = ev.id;
      renderCalendar();
    }
    notes.unshift(note);
    DB.set(DB.KEYS.notes, notes);
    form.reset();
    document.querySelector("#note-cal-date").style.display = "none";
    renderNotes();
    renderDashboard();
    toast("Poznámka přidána.");
  });
}
function renderNotes() {
  const grid = document.querySelector("#notes-grid");
  if (!grid) return;
  const items = DB.get(DB.KEYS.notes);
  grid.innerHTML = items.map((n) => `
    <div class="note-card glass ${n.done ? "done" : ""}" style="border-left-color:${n.color || "#7c5cff"}">
      <div class="note-tags">${(n.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
      <div class="note-text">${esc(n.text)}</div>
      <div class="note-meta">
        <span class="priority-${n.priority}">${{ high: "Vysoká priorita", med: "Střední priorita", low: "Nízká priorita" }[n.priority] || ""}</span>
        <div class="actions">
          <button class="btn-icon" data-done="${n.id}">${n.done ? "↺" : "✓"}</button>
          <button class="btn-icon" data-del="${n.id}">✕</button>
        </div>
      </div>
    </div>`).join("") || `<div class="empty-hint">Žádné poznámky.</div>`;
  grid.querySelectorAll("[data-done]").forEach((btn) => btn.addEventListener("click", () => {
    const arr = DB.get(DB.KEYS.notes);
    const n = arr.find((x) => x.id === btn.dataset.done);
    n.done = !n.done;
    DB.set(DB.KEYS.notes, arr);
    renderNotes();
    renderDashboard();
  }));
  grid.querySelectorAll("[data-del]").forEach((btn) => btn.addEventListener("click", () => {
    if (!confirmDelete()) return;
    DB.set(DB.KEYS.notes, DB.get(DB.KEYS.notes).filter((x) => x.id !== btn.dataset.del));
    renderNotes();
    renderDashboard();
  }));
}

/* ============================================================
   CALENDAR
============================================================ */
let calCursor = new Date();
function initCalendar() {
  const grid = document.querySelector("#cal-grid");
  if (!grid) return;
  document.querySelector("#cal-prev").addEventListener("click", () => { calCursor.setMonth(calCursor.getMonth() - 1); renderCalendar(); });
  document.querySelector("#cal-next").addEventListener("click", () => { calCursor.setMonth(calCursor.getMonth() + 1); renderCalendar(); });
  document.querySelector("#event-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.target;
    const events = DB.get(DB.KEYS.events);
    events.push({
      id: DB.uid(), date: form.date.value, time: form.time.value, title: form.title.value.trim(),
      desc: form.desc.value.trim(), color: form.color.value, reminder: form.reminder.checked,
    });
    DB.set(DB.KEYS.events, events);
    form.reset();
    closeEventModal();
    renderCalendar();
    renderDashboard();
    toast("Událost přidána.");
  });
  document.querySelector("#event-modal-close").addEventListener("click", closeEventModal);
  renderCalendar();
}
function renderCalendar() {
  const grid = document.querySelector("#cal-grid");
  const label = document.querySelector("#cal-label");
  if (!grid) return;
  const y = calCursor.getFullYear(), m = calCursor.getMonth();
  label.textContent = calCursor.toLocaleDateString("cs-CZ", { month: "long", year: "numeric" });
  const firstDay = (new Date(y, m, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const events = DB.get(DB.KEYS.events);
  const todayStr = new Date().toISOString().slice(0, 10);

  let html = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"].map((d) => `<div class="cal-dow">${d}</div>`).join("");
  for (let i = 0; i < firstDay; i++) html += `<div class="cal-cell empty"></div>`;
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dayEvents = events.filter((e) => e.date === dateStr);
    html += `
      <div class="cal-cell ${dateStr === todayStr ? "today" : ""}" data-date="${dateStr}">
        <div class="cal-date">${d}</div>
        ${dayEvents.map((e) => `<div class="cal-event" style="background:${e.color || "#7c5cff"}" data-event="${e.id}" title="${esc(e.desc)}">${esc(e.title)}</div>`).join("")}
      </div>`;
  }
  grid.innerHTML = html;
  grid.querySelectorAll(".cal-cell:not(.empty)").forEach((cell) =>
    cell.addEventListener("click", (e) => {
      if (e.target.closest("[data-event]")) {
        if (confirmDelete("Smazat tuto událost?")) {
          DB.set(DB.KEYS.events, DB.get(DB.KEYS.events).filter((ev) => ev.id !== e.target.closest("[data-event]").dataset.event));
          renderCalendar();
          renderDashboard();
        }
        return;
      }
      openEventModal(cell.dataset.date);
    })
  );
}
function openEventModal(date) {
  document.querySelector("#event-form input[name=date]").value = date;
  document.querySelector("#event-modal").classList.add("open");
}
function closeEventModal() {
  document.querySelector("#event-modal").classList.remove("open");
}

/* ============================================================
   SETTINGS
============================================================ */
function initSettings() {
  const form = document.querySelector("#password-form");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const current = DB.get(DB.KEYS.settings);
    if (form.current.value !== (current.adminPassword || "adminmama43")) {
      toast("Současné heslo není správné.");
      return;
    }
    if (form.next.value.length < 4) {
      toast("Nové heslo musí mít alespoň 4 znaky.");
      return;
    }
    current.adminPassword = form.next.value;
    DB.set(DB.KEYS.settings, current);
    form.reset();
    toast("Heslo bylo změněno.");
  });

  document.querySelector("#export-btn")?.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(DB.exportAll(), null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "web-data.json";
    a.click();
  });

  document.querySelector("#import-input")?.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      DB.importAll(JSON.parse(text));
      toast("Data byla importována.");
      setTimeout(() => location.reload(), 800);
    } catch {
      toast("Soubor se nepodařilo načíst.");
    }
  });

  document.querySelector("#clear-cache-btn")?.addEventListener("click", () => {
    if (!confirmDelete("Opravdu smazat všechna data a obnovit výchozí obsah?")) return;
    DB.clearCache();
    toast("Cache vymazána, obnovuji...");
    setTimeout(() => location.reload(), 800);
  });
}
