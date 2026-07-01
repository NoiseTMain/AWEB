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
function csv(arr) { return (arr || []).join(", "); }
function parseCsv(str) { return (str || "").split(",").map((s) => s.trim()).filter(Boolean); }

/* ============================================================
   INIT
============================================================ */
function initAdmin() {
  initSidebar();
  renderDashboard();
  initHeroForm();
  initAboutForm();
  initResumeForms();
  initGallery();
  initLinks();
  initSocial();
  initSkills();
  initPortfolio();
  initTestimonials();
  initNotes();
  initCalendar();
  renderMessages();
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
      if (l.dataset.view === "dashboard") renderDashboard();
    })
  );
  document.querySelector("#sidebar-toggle")?.addEventListener("click", () => document.querySelector(".sidebar").classList.toggle("open"));
}

function renderDashboard() {
  const counts = {
    gallery: DB.get(DB.KEYS.gallery).length,
    links: DB.get(DB.KEYS.links).length,
    projects: DB.get(DB.KEYS.projects).length,
    testimonials: DB.get(DB.KEYS.testimonials).length,
    notes: DB.get(DB.KEYS.notes).filter((n) => !n.done).length,
    events: DB.get(DB.KEYS.events).length,
    messages: DB.get(DB.KEYS.contactMessages).length,
  };
  const grid = document.querySelector("#dashboard-stats");
  if (!grid) return;
  grid.innerHTML = `
    <div class="stat-card glass"><div class="stat-num">${counts.gallery}</div><div class="stat-label">Fotek v galerii</div></div>
    <div class="stat-card glass"><div class="stat-num">${counts.projects}</div><div class="stat-label">Projektů v portfoliu</div></div>
    <div class="stat-card glass"><div class="stat-num">${counts.links}</div><div class="stat-label">Externích odkazů</div></div>
    <div class="stat-card glass"><div class="stat-num">${counts.testimonials}</div><div class="stat-label">Referencí</div></div>
    <div class="stat-card glass"><div class="stat-num">${counts.notes}</div><div class="stat-label">Aktivních poznámek</div></div>
    <div class="stat-card glass"><div class="stat-num">${counts.events}</div><div class="stat-label">Událostí v kalendáři</div></div>
    <div class="stat-card glass"><div class="stat-num">${counts.messages}</div><div class="stat-label">Zpráv z formuláře</div></div>
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
  form.slogan.value = h.slogan || "";
  updatePreviewImg("#hero-photo-preview", h.photo);

  form.photo.addEventListener("change", async () => {
    if (form.photo.files[0]) updatePreviewImg("#hero-photo-preview", await fileToDataURL(form.photo.files[0]));
  });
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = DB.get(DB.KEYS.hero);
    data.name = form.name.value.trim();
    data.slogan = form.slogan.value.trim();
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
   ABOUT
============================================================ */
function initAboutForm() {
  const a = DB.get(DB.KEYS.about);
  const form = document.querySelector("#about-form");
  if (!form) return;
  form.text.value = a.text || "";
  updatePreviewImg("#about-photo-preview", a.photo);
  form.photo.addEventListener("change", async () => {
    if (form.photo.files[0]) updatePreviewImg("#about-photo-preview", await fileToDataURL(form.photo.files[0]));
  });
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = DB.get(DB.KEYS.about);
    data.text = form.text.value.trim();
    if (form.photo.files[0]) data.photo = await fileToDataURL(form.photo.files[0]);
    DB.set(DB.KEYS.about, data);
    toast("Sekce „O mně“ uložena.");
  });
}

/* ============================================================
   RESUME (timeline lists + tags)
============================================================ */
function initResumeForms() {
  const r = DB.get(DB.KEYS.resume);
  ["education", "experience", "certificates"].forEach((key) => renderResumeList(key));
  ["skills", "languages", "softSkills", "hardSkills"].forEach((key) => {
    const input = document.querySelector(`#resume-${key}`);
    if (input) input.value = csv(r[key]);
  });
  const licenseInput = document.querySelector("#resume-license");
  if (licenseInput) licenseInput.value = r.license || "";

  document.querySelectorAll(".resume-add-form").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const key = form.dataset.key;
      const data = DB.get(DB.KEYS.resume);
      data[key] = data[key] || [];
      data[key].push({ title: form.title.value.trim(), period: form.period.value.trim(), desc: form.desc.value.trim() });
      DB.set(DB.KEYS.resume, data);
      form.reset();
      renderResumeList(key);
      toast("Položka přidána.");
    });
  });

  document.querySelector("#resume-tags-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = DB.get(DB.KEYS.resume);
    ["skills", "languages", "softSkills", "hardSkills"].forEach((key) => {
      data[key] = parseCsv(document.querySelector(`#resume-${key}`).value);
    });
    data.license = licenseInput.value.trim();
    DB.set(DB.KEYS.resume, data);
    toast("Dovednosti a jazyky uloženy.");
  });
}
function renderResumeList(key) {
  const container = document.querySelector(`#resume-list-${key}`);
  if (!container) return;
  const items = DB.get(DB.KEYS.resume)[key] || [];
  container.innerHTML = items.map((it, i) => `
    <div class="item-row">
      <div class="info"><strong>${esc(it.title)}</strong><span>${esc(it.period)} — ${esc(it.desc)}</span></div>
      <div class="actions"><button class="btn-icon" data-remove="${key}:${i}" title="Smazat">✕</button></div>
    </div>`).join("") || `<div class="empty-hint">Zatím žádné položky.</div>`;
  container.querySelectorAll("[data-remove]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const [k, idx] = btn.dataset.remove.split(":");
      if (!confirmDelete()) return;
      const data = DB.get(DB.KEYS.resume);
      data[k].splice(+idx, 1);
      DB.set(DB.KEYS.resume, data);
      renderResumeList(k);
    })
  );
}

/* ============================================================
   GALLERY (upload, delete, reorder via drag & drop)
============================================================ */
function initGallery() {
  const drop = document.querySelector("#gallery-drop");
  const input = document.querySelector("#gallery-input");
  if (!drop) return;
  drop.addEventListener("click", () => input.click());
  ["dragenter", "dragover"].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add("drag"); }));
  ["dragleave", "drop"].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove("drag"); }));
  drop.addEventListener("drop", (e) => handleGalleryFiles(e.dataTransfer.files));
  input.addEventListener("change", () => handleGalleryFiles(input.files));
  renderAdminGallery();
}
async function handleGalleryFiles(fileList) {
  const items = DB.get(DB.KEYS.gallery);
  let order = items.length;
  for (const file of fileList) {
    if (!file.type.startsWith("image/")) continue;
    const url = await fileToDataURL(file);
    items.push({ id: DB.uid(), url, name: file.name, order: order++ });
  }
  DB.set(DB.KEYS.gallery, items);
  renderAdminGallery();
  toast("Fotografie nahrány.");
}
function renderAdminGallery() {
  const grid = document.querySelector("#admin-gallery-grid");
  if (!grid) return;
  const items = DB.get(DB.KEYS.gallery).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  grid.innerHTML = items.map((it) => `
    <div class="admin-gallery-item" draggable="true" data-id="${it.id}">
      <img src="${it.url}" alt="">
      <button class="remove" data-del="${it.id}">✕</button>
    </div>`).join("") || `<div class="empty-hint">Zatím žádné fotografie.</div>`;

  grid.querySelectorAll("[data-del]").forEach((btn) =>
    btn.addEventListener("click", () => {
      if (!confirmDelete("Smazat tuto fotografii?")) return;
      const items = DB.get(DB.KEYS.gallery).filter((g) => g.id !== btn.dataset.del);
      DB.set(DB.KEYS.gallery, items);
      renderAdminGallery();
    })
  );

  let dragEl = null;
  grid.querySelectorAll(".admin-gallery-item").forEach((el) => {
    el.addEventListener("dragstart", () => { dragEl = el; el.classList.add("dragging"); });
    el.addEventListener("dragend", () => { el.classList.remove("dragging"); persistGalleryOrder(grid); });
    el.addEventListener("dragover", (e) => {
      e.preventDefault();
      const after = [...grid.querySelectorAll(".admin-gallery-item:not(.dragging)")].find((sib) => {
        const r = sib.getBoundingClientRect();
        return e.clientY < r.top + r.height / 2 && e.clientX < r.right;
      });
      if (after) grid.insertBefore(dragEl, after); else grid.appendChild(dragEl);
    });
  });
}
function persistGalleryOrder(grid) {
  const ids = [...grid.querySelectorAll(".admin-gallery-item")].map((el) => el.dataset.id);
  const items = DB.get(DB.KEYS.gallery);
  items.forEach((it) => (it.order = ids.indexOf(it.id)));
  DB.set(DB.KEYS.gallery, items);
}

/* ============================================================
   EXTERNAL LINKS
============================================================ */
function initLinks() {
  const form = document.querySelector("#links-form");
  if (!form) return;
  renderLinksAdmin();
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const items = DB.get(DB.KEYS.links);
    const editId = form.dataset.editId;
    const logo = form.logo.files[0] ? await fileToDataURL(form.logo.files[0]) : (editId ? items.find((i) => i.id === editId)?.logo : "");
    const payload = { title: form.title.value.trim(), url: form.url.value.trim(), desc: form.desc.value.trim(), logo: logo || "" };
    if (editId) {
      const idx = items.findIndex((i) => i.id === editId);
      items[idx] = { ...items[idx], ...payload };
      delete form.dataset.editId;
    } else {
      items.push({ id: DB.uid(), ...payload });
    }
    DB.set(DB.KEYS.links, items);
    form.reset();
    renderLinksAdmin();
    toast("Odkaz uložen.");
  });
}
function renderLinksAdmin() {
  const container = document.querySelector("#links-list");
  if (!container) return;
  const items = DB.get(DB.KEYS.links);
  container.innerHTML = items.map((it) => `
    <div class="item-row">
      <div class="thumb"><img src="${it.logo || `https://www.google.com/s2/favicons?sz=64&domain=${(() => { try { return new URL(it.url).hostname; } catch { return ""; } })()}`}" alt=""></div>
      <div class="info"><strong>${esc(it.title)}</strong><span>${esc(it.url)}</span></div>
      <div class="actions">
        <button class="btn-icon" data-edit="${it.id}">✎</button>
        <button class="btn-icon" data-del="${it.id}">✕</button>
      </div>
    </div>`).join("") || `<div class="empty-hint">Zatím žádné odkazy.</div>`;

  container.querySelectorAll("[data-edit]").forEach((btn) => btn.addEventListener("click", () => {
    const it = items.find((i) => i.id === btn.dataset.edit);
    const form = document.querySelector("#links-form");
    form.title.value = it.title; form.url.value = it.url; form.desc.value = it.desc;
    form.dataset.editId = it.id;
    form.scrollIntoView({ behavior: "smooth", block: "center" });
  }));
  container.querySelectorAll("[data-del]").forEach((btn) => btn.addEventListener("click", () => {
    if (!confirmDelete()) return;
    DB.set(DB.KEYS.links, DB.get(DB.KEYS.links).filter((i) => i.id !== btn.dataset.del));
    renderLinksAdmin();
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
   SKILLS
============================================================ */
function initSkills() {
  const form = document.querySelector("#skills-form");
  if (!form) return;
  renderSkillsAdmin();
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const items = DB.get(DB.KEYS.skills);
    const editId = form.dataset.editId;
    const payload = { name: form.name.value.trim(), level: +form.level.value, icon: form.icon.value.trim() || "star" };
    if (editId !== undefined && editId !== "") {
      items[+editId] = payload;
      delete form.dataset.editId;
    } else {
      items.push(payload);
    }
    DB.set(DB.KEYS.skills, items);
    form.reset();
    renderSkillsAdmin();
    toast("Dovednost uložena.");
  });
}
function renderSkillsAdmin() {
  const container = document.querySelector("#skills-list");
  const items = DB.get(DB.KEYS.skills);
  container.innerHTML = items.map((it, i) => `
    <div class="item-row">
      <div class="info"><strong>${esc(it.name)}</strong><span>${it.level}% · ikona: ${esc(it.icon)}</span></div>
      <div class="actions">
        <button class="btn-icon" data-edit="${i}">✎</button>
        <button class="btn-icon" data-del="${i}">✕</button>
      </div>
    </div>`).join("") || `<div class="empty-hint">Zatím žádné dovednosti.</div>`;
  container.querySelectorAll("[data-edit]").forEach((btn) => btn.addEventListener("click", () => {
    const it = items[+btn.dataset.edit];
    const form = document.querySelector("#skills-form");
    form.name.value = it.name; form.level.value = it.level; form.icon.value = it.icon;
    form.dataset.editId = btn.dataset.edit;
  }));
  container.querySelectorAll("[data-del]").forEach((btn) => btn.addEventListener("click", () => {
    if (!confirmDelete()) return;
    const arr = DB.get(DB.KEYS.skills); arr.splice(+btn.dataset.del, 1);
    DB.set(DB.KEYS.skills, arr);
    renderSkillsAdmin();
  }));
}

/* ============================================================
   PORTFOLIO PROJECTS
============================================================ */
function initPortfolio() {
  const form = document.querySelector("#portfolio-form");
  if (!form) return;
  renderPortfolioAdmin();
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const items = DB.get(DB.KEYS.projects);
    const editId = form.dataset.editId;
    const image = form.image.files[0] ? await fileToDataURL(form.image.files[0]) : (editId ? items.find((i) => i.id === editId)?.image : "");
    const payload = { title: form.title.value.trim(), desc: form.desc.value.trim(), link: form.link.value.trim(), tech: form.tech.value.trim(), image: image || "" };
    if (editId) {
      const idx = items.findIndex((i) => i.id === editId);
      items[idx] = { ...items[idx], ...payload };
      delete form.dataset.editId;
    } else {
      items.push({ id: DB.uid(), ...payload });
    }
    DB.set(DB.KEYS.projects, items);
    form.reset();
    renderPortfolioAdmin();
    toast("Projekt uložen.");
  });
}
function renderPortfolioAdmin() {
  const container = document.querySelector("#portfolio-list");
  const items = DB.get(DB.KEYS.projects);
  container.innerHTML = items.map((it) => `
    <div class="item-row">
      <div class="thumb">${it.image ? `<img src="${it.image}" alt="">` : ""}</div>
      <div class="info"><strong>${esc(it.title)}</strong><span>${esc(it.tech)}</span></div>
      <div class="actions">
        <button class="btn-icon" data-edit="${it.id}">✎</button>
        <button class="btn-icon" data-del="${it.id}">✕</button>
      </div>
    </div>`).join("") || `<div class="empty-hint">Zatím žádné projekty.</div>`;
  container.querySelectorAll("[data-edit]").forEach((btn) => btn.addEventListener("click", () => {
    const it = items.find((i) => i.id === btn.dataset.edit);
    const form = document.querySelector("#portfolio-form");
    form.title.value = it.title; form.desc.value = it.desc; form.link.value = it.link; form.tech.value = it.tech;
    form.dataset.editId = it.id;
    form.scrollIntoView({ behavior: "smooth", block: "center" });
  }));
  container.querySelectorAll("[data-del]").forEach((btn) => btn.addEventListener("click", () => {
    if (!confirmDelete()) return;
    DB.set(DB.KEYS.projects, DB.get(DB.KEYS.projects).filter((i) => i.id !== btn.dataset.del));
    renderPortfolioAdmin();
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
      tags: parseCsv(form.tags.value),
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
  }));
  grid.querySelectorAll("[data-del]").forEach((btn) => btn.addEventListener("click", () => {
    if (!confirmDelete()) return;
    DB.set(DB.KEYS.notes, DB.get(DB.KEYS.notes).filter((x) => x.id !== btn.dataset.del));
    renderNotes();
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
  const firstDay = (new Date(y, m, 1).getDay() + 6) % 7; // pondělí=0
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
   CONTACT MESSAGES (příchozí zprávy z formuláře)
============================================================ */
function renderMessages() {
  const container = document.querySelector("#messages-list");
  if (!container) return;
  const items = DB.get(DB.KEYS.contactMessages);
  container.innerHTML = items.map((m) => `
    <div class="item-row" style="align-items:flex-start;">
      <div class="info">
        <strong>${esc(m.name)} — ${esc(m.email)}</strong>
        <span>${esc(m.subject || "(bez předmětu)")} · ${new Date(m.date).toLocaleString("cs-CZ")}</span>
        <p style="font-size:.85rem; color:var(--text-muted); margin:8px 0 0;">${esc(m.message)}</p>
      </div>
      <div class="actions"><button class="btn-icon" data-del="${m.id}">✕</button></div>
    </div>`).join("") || `<div class="empty-hint">Zatím žádné zprávy.</div>`;
  container.querySelectorAll("[data-del]").forEach((btn) => btn.addEventListener("click", () => {
    if (!confirmDelete()) return;
    DB.set(DB.KEYS.contactMessages, DB.get(DB.KEYS.contactMessages).filter((m) => m.id !== btn.dataset.del));
    renderMessages();
  }));
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
    a.download = "portfolio-data.json";
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
