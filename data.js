/* ============================================================
   data.js — jednotná datová vrstva
   Lokálně se vše cachuje v localStorage (rychlé první vykreslení,
   funguje i offline), ale zdroj pravdy je Firebase Realtime
   Database. Cokoliv admin uloží, se odešle do Firebase a odtud
   se v reálném čase (přes onValue listener) rozešle úplně všem
   otevřeným prohlížečům — admin.html i index.html, na jakémkoliv
   zařízení, ne jen v tom, kde se úprava provedla.

   NASTAVENÍ (nutné provést jednou):
   1) Založte projekt zdarma na https://console.firebase.google.com
   2) V projektu zapněte "Realtime Database" (ne Firestore).
   3) Zkopírujte firebaseConfig (Project settings → obecné →
      "Vaše aplikace" → Web app) a vložte ho níže do FIREBASE_CONFIG.
   4) V Realtime Database → Rules nastavte alespoň:
      { "rules": { ".read": true, ".write": true } }
      (Je to zjednodušené — kdokoliv se znalostí URL může zapisovat.
      Pro osobní portfolio je to obvykle přijatelné riziko, protože
      admin.html i tak chrání jen heslem na straně klienta. Pro
      opravdové zabezpečení přidejte Firebase Authentication a
      pravidla omezte na přihlášeného uživatele.)
============================================================ */

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyD5NHfA-6_h6LYIKNQAHdArXD_okboNRYQ",
  authDomain: "adamhorvathportfolio.firebaseapp.com",
  databaseURL: "https://adamhorvathportfolio-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "adamhorvathportfolio",
  storageBucket: "adamhorvathportfolio.firebasestorage.app",
  messagingSenderId: "849858033011",
  appId: "1:849858033011:web:03a0a0c69f835360b5c106",
};

const DB = (() => {
  const PREFIX = "pf_";
  const REMOTE_PATH = "pf-data/";

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

  function structuredCloneSafe(v) {
    return v === undefined ? v : JSON.parse(JSON.stringify(v));
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  /* ---------- localStorage cache (rychlé první vykreslení / offline) ---------- */
  function readLocal(key) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw === null ? structuredCloneSafe(DEFAULTS[key]) : JSON.parse(raw);
    } catch (e) {
      console.error("DB readLocal error", key, e);
      return structuredCloneSafe(DEFAULTS[key]);
    }
  }
  function writeLocal(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.error("DB writeLocal error", key, e);
    }
  }

  const cache = {};
  Object.keys(DEFAULTS).forEach((key) => (cache[key] = readLocal(key)));

  /* ---------- Firebase Realtime Database (sdílený zdroj pravdy) ---------- */
  let fbDb = null;
  let fbReady = false;
  const isConfigured = FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.apiKey !== "REPLACE_ME";
  if (isConfigured && typeof firebase !== "undefined") {
    try {
      firebase.initializeApp(FIREBASE_CONFIG);
      fbDb = firebase.database();
      fbReady = true;
    } catch (e) {
      console.error("Firebase init selhal — pracuji jen s lokálním úložištěm v tomto prohlížeči.", e);
    }
  } else if (!isConfigured) {
    console.warn(
      "Firebase není nastaven (FIREBASE_CONFIG v data.js). Úpravy v adminu se zatím ukládají " +
      "jen do tohoto prohlížeče a ostatní je neuvidí. Vyplňte FIREBASE_CONFIG podle návodu v hlavičce data.js."
    );
  }

  function get(key) {
    return structuredCloneSafe(cache[key] !== undefined ? cache[key] : DEFAULTS[key]);
  }

  function set(key, value) {
    cache[key] = value;
    writeLocal(key, value);
    window.dispatchEvent(new CustomEvent("pf:update", { detail: { key, remote: false } }));
    if (fbReady) {
      fbDb.ref(REMOTE_PATH + key).set(value).catch((e) => console.error("Firebase set error", key, e));
    }
    return true;
  }

  function initRealtimeSync() {
    if (!fbReady) return;
    Object.keys(DEFAULTS).forEach((key) => {
      let firstSnapshot = true;
      fbDb.ref(REMOTE_PATH + key).on("value", (snap) => {
        const val = snap.val();
        if (val === null) {
          firstSnapshot = false;
          // v databázi zatím nic není pro tento klíč — nahrajeme aktuální (lokální/výchozí) hodnotu
          fbDb.ref(REMOTE_PATH + key).set(cache[key] !== undefined ? cache[key] : DEFAULTS[key]);
          return;
        }
        cache[key] = val;
        writeLocal(key, val);
        // První snapshot je jen počáteční "dorovnání" s tím, co už máme lokálně
        // vykreslené — nejde o skutečnou změnu, takže tady nepřekreslujeme
        // (zbytečné překreslení by rozbilo GSAP animace navázané na DOM prvky).
        if (firstSnapshot) {
          firstSnapshot = false;
          return;
        }
        window.dispatchEvent(new CustomEvent("pf:update", { detail: { key, remote: true } }));
      });
    });
  }

  function ensureSeeded() {
    // Lokální fallback, kdyby Firebase nebyl nastavený vůbec.
    Object.keys(DEFAULTS).forEach((key) => {
      if (localStorage.getItem(PREFIX + key) === null) {
        localStorage.setItem(PREFIX + key, JSON.stringify(DEFAULTS[key]));
      }
    });
    initRealtimeSync();
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
    Object.keys(DEFAULTS).forEach((key) => set(key, structuredCloneSafe(DEFAULTS[key])));
  }

  return { KEYS, DEFAULTS, get, set, uid, ensureSeeded, exportAll, importAll, clearCache };
})();

DB.ensureSeeded();
