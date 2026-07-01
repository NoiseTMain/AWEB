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
      name: "Adam Horvath",
      slogan: "Energický a cílevědomý profesionál s vášní pro techniku, kreativitu a lidské interakce.",
      photo: "",
    },
    about: {
      text:
        "Jsem energetický a cílevědomý s vášní pro kreativitu a lidské interakce. Mám schopnost rychle " +
        "se přizpůsobit novým situacím a pracovnímu prostředí. Vždy se snažím překračovat očekávání a " +
        "dosahovat vynikajících výsledků. Mám dobré organizační dovednosti a schopnost řídit více úkolů současně.",
      photo: "",
    },
    resume: {
      education: [
        {
          title: "Strojní a manuální práce se dřevem",
          period: "2023 – 2026",
          desc: "Střední škola a školní jídelna, Obořiště 1 — techniky měření a přesného řezání dřeva podle výkresové dokumentace, základy konstrukčního navrhování a bezpečnostní postupy při práci se dřevem.",
        },
        {
          title: "Mechanik a opravář motorových vozidel (automechanik)",
          period: "2022 – 2023",
          desc: "Střední odborná škola střední odborné učiliště, Sušice — diagnostika a oprava závad motorových vozidel, montáž a seřízení motorů, převodovek a brzdových systémů.",
        },
      ],
      experience: [
        {
          title: "Logistická podpora — Alza s.r.o, Praha",
          period: "",
          desc: "Koordinace a organizace přepravy zboží a materiálu v rámci skladových a distribučních procesů.",
        },
        {
          title: "Dohledové centrum — PK HOLDING CZ s.r.o, Praha",
          period: "",
          desc: "Koordinace reakce na bezpečnostní události a bezodkladné informování příslušných složek.",
        },
        {
          title: "Kuchař — Rex Concepta PLK Czech s.r.o (Popeyes), Praha",
          period: "",
          desc: "Dodržování hygienických a bezpečnostních standardů při přípravě jídel.",
        },
        {
          title: "Prodejce, Runner — Amrest s.r.o (KFC), Brno / Praha",
          period: "",
          desc: "Obsluha zákazníků, prodej a podpora provozu rychlého občerstvení.",
        },
      ],
      certificates: [
        { title: "Nejvyšší dosažené vzdělání", period: "", desc: "Odborná střední škola bez maturity." },
      ],
      skills: ["Nastavení sítí", "Windows Server", "Active Directory", "Group Policy", "Linux", "DHCP/DNS", "PowerShell"],
      languages: ["Čeština — rodilý mluvčí"],
      license: "AM, B1, B",
      softSkills: ["Energetický", "Cílevědomý", "Kreativita", "Lidské interakce", "Rychlá adaptace na nové situace"],
      hardSkills: ["Nastavení bezpečnosti", "Konfigurace LAN sítí (5–10 PC)", "MS Windows Server / AD / GPO", "Linux", "DHCP a DNS server", "PowerShell"],
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
      email: "adamhorvath07@icloud.com",
      phone: "+420604133151",
    },
    skills: [
      { name: "Nastavení bezpečnosti", level: 100, icon: "shield" },
      { name: "Konfigurace LAN sítí", level: 100, icon: "network" },
      { name: "Windows Server / AD / GPO", level: 80, icon: "server" },
      { name: "DHCP / DNS server", level: 80, icon: "globe" },
      { name: "Linux", level: 40, icon: "terminal" },
      { name: "PowerShell", level: 20, icon: "code" },
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
