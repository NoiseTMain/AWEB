/* ============================================================
   data.js — jednotná datová vrstva (localStorage)
   Používá jak index.html, tak admin.html.
   Vše, co admin uloží, se okamžitě promítne na veřejný web,
   protože oba čtou ze stejného úložiště.
============================================================ */

const DB = (() => {
  const PREFIX = "pf_";

  const KEYS = {
    hero: "hero",
    about: "about",
    resume: "resume",
    gallery: "gallery",
    links: "links",
    social: "social",
    skills: "skills",
    projects: "projects",
    testimonials: "testimonials",
    notes: "notes",
    events: "events",
    settings: "settings",
    contactMessages: "contactMessages",
  };

  const DEFAULTS = {
    hero: {
      name: "Jan Novák",
      slogan: "Vytvářím digitální produkty, které vypadají tak dobře, jak fungují.",
      photo: "",
    },
    about: {
      text:
        "Jsem full‑stack vývojář a UI/UX designér se zaměřením na moderní webové aplikace. " +
        "Baví mě propojovat čistý kód s promyšleným designem a stavět produkty, na které jsou " +
        "uživatelé i klienti hrdí. Hledám spolupráci na projektech, kde záleží na detailu.",
      photo: "",
    },
    resume: {
      education: [
        { title: "SPŠ elektrotechnická", period: "2016 – 2020", desc: "Obor Informační technologie." },
      ],
      experience: [
        { title: "Frontend Developer, Freelance", period: "2021 – dosud", desc: "Tvorba webů a webových aplikací pro klienty." },
      ],
      certificates: [
        { title: "Meta Front‑End Developer", period: "2023", desc: "Coursera / Meta" },
      ],
      skills: ["JavaScript", "React", "Node.js", "UI/UX", "Grafika"],
      languages: ["Čeština — rodilý mluvčí", "Angličtina — B2"],
      license: "B",
      softSkills: ["Komunikace", "Týmová práce", "Time management"],
      hardSkills: ["HTML/CSS", "JavaScript", "React", "Figma"],
    },
    gallery: [],
    links: [],
    social: {
      facebook: "",
      instagram: "",
      linkedin: "",
      tiktok: "",
      github: "",
      discord: "",
      email: "",
      phone: "",
    },
    skills: [
      { name: "HTML / CSS", level: 95, icon: "code" },
      { name: "JavaScript", level: 90, icon: "js" },
      { name: "React", level: 80, icon: "react" },
      { name: "Node.js", level: 70, icon: "server" },
      { name: "Grafika", level: 65, icon: "image" },
      { name: "Marketing", level: 55, icon: "trending-up" },
      { name: "Komunikace", level: 90, icon: "message-circle" },
    ],
    projects: [],
    testimonials: [],
    notes: [],
    events: [],
    settings: { adminPassword: "adminmama43" },
    contactMessages: [],
  };

  function get(key) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (raw === null) return structuredCloneSafe(DEFAULTS[key]);
      return JSON.parse(raw);
    } catch (e) {
      console.error("DB.get error", key, e);
      return structuredCloneSafe(DEFAULTS[key]);
    }
  }

  function set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      window.dispatchEvent(new CustomEvent("pf:update", { detail: { key } }));
      return true;
    } catch (e) {
      console.error("DB.set error", key, e);
      return false;
    }
  }

  function structuredCloneSafe(v) {
    return v === undefined ? v : JSON.parse(JSON.stringify(v));
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function ensureSeeded() {
    Object.keys(DEFAULTS).forEach((key) => {
      if (localStorage.getItem(PREFIX + key) === null) {
        localStorage.setItem(PREFIX + key, JSON.stringify(DEFAULTS[key]));
      }
    });
  }

  function exportAll() {
    const out = {};
    Object.keys(DEFAULTS).forEach((key) => (out[key] = get(key)));
    return out;
  }

  function importAll(obj) {
    Object.keys(DEFAULTS).forEach((key) => {
      if (obj[key] !== undefined) set(key, obj[key]);
    });
  }

  function clearCache() {
    Object.keys(DEFAULTS).forEach((key) => localStorage.removeItem(PREFIX + key));
    ensureSeeded();
  }

  return { KEYS, DEFAULTS, get, set, uid, ensureSeeded, exportAll, importAll, clearCache };
})();

DB.ensureSeeded();
