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
  const REMOTE_PATH = "predplatne-data/";

  const KEYS = {
    hero: "hero",
    pricing: "pricing",
    process: "process",
    projects: "projects",
    testimonials: "testimonials",
    faq: "faq",
    social: "social",
    notes: "notes",
    events: "events",
    settings: "settings",
    leads: "leads",
  };

  const DEFAULTS = {
    hero: {
      name: "Adam Horvath",
      eyebrow: "Weby na předplatné",
      headline: "Web jako předplatné,\nne velká investice.",
      subheadline: "Místo statisícové investice na začátku platíte jednoduché měsíční předplatné. Líbí se vám web? Platíte dál. Nelíbí? Prostě přestanete.",
      photo: "",
    },
    pricing: {
      comparePrice: 25999,
      comparePriceLabel: "Průměrná cena webu na zakázku od agentury",
      price: 990,
      priceUnit: "Kč / měsíc",
      turnaround1: "První návrh do 5 dní",
      turnaround2: "Web online za 7–11 pracovních dní",
      commitment: "Bez závazku — zrušíte kdykoli",
      guarantee: "Buď se vám web líbí a začnete platit, nebo se vám nelíbí a prostě neplatíte. Žádný háček.",
    },
    process: [
      { title: "Nezávazná poptávka", desc: "Napíšete mi, co potřebujete — ozvu se do pár hodin." },
      { title: "První návrh do 5 dní", desc: "Uvidíte konkrétní vizuál na míru, ne jen sliby." },
      { title: "Doladíme detaily", desc: "Upravíme podle vašich připomínek, dokud to nesedí." },
      { title: "Web je online", desc: "Do 7–11 pracovních dní běží naostro na vaší doméně." },
      { title: "Platíte, dokud chcete", desc: "Žádná smlouva na roky, žádný skrytý závazek." },
    ],
    projects: [
      {
        id: "demo-1",
        title: "Web pro řemeslnou dílnu",
        desc: "Jednoduchá prezentace s galerií realizací a poptávkovým formulářem.",
        category: "Řemeslo",
        url: "",
        image: "",
      },
      {
        id: "demo-2",
        title: "Web pro menší e-shop",
        desc: "Katalog produktů, kontaktní formulář a napojení na sociální sítě.",
        category: "E-commerce",
        url: "",
        image: "",
      },
    ],
    testimonials: [],
    faq: [
      { q: "Co přesně je v ceně předplatného?", a: "Hosting, drobné úpravy obsahu, technická údržba a podpora. Nemusíte řešit nic navíc." },
      { q: "Co když budu chtít zrušit?", a: "Napíšete mi a předplatné ke konci období skončí. Žádná výpovědní lhůta ani pokuta." },
      { q: "Jak dlouho trvá, než bude web hotový?", a: "První návrh do 5 pracovních dní, ostrý provoz do 7–11 pracovních dní od zadání." },
      { q: "Co když budu chtít víc než jen jednoduchý web?", a: "Probereme to individuálně — u větších projektů se cena i rozsah upraví podle potřeby." },
    ],
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
    notes: [],
    events: [],
    settings: { adminPassword: "adminmama43" },
    leads: [],
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
