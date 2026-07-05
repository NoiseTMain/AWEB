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
    services: "services",
    social: "social",
    notes: "notes",
    events: "events",
    settings: "settings",
    leads: "leads",
    auditRequests: "auditRequests",
  };

  const DEFAULTS = {
    hero: {
      name: "Adam Horvath",
      eyebrow: "Weby na předplatné",
      headline: "Web jako předplatné,\nne velká investice.",
      subheadline: "Místo statisícové investice na začátku platíte jednoduché měsíční předplatné. Líbí se vám web? Platíte dál. Nelíbí? Prostě přestanete.",
      eyebrow_en: "Websites on subscription",
      headline_en: "A website on subscription,\nnot a big investment.",
      subheadline_en: "Instead of a large upfront investment, you pay one simple monthly subscription. Like the site? Keep paying. Don't? Just stop.",
      photo: "",
    },
    pricing: {
      comparePrice: 25999,
      comparePriceLabel: "Průměrná cena webu na zakázku od agentury",
      comparePriceLabel_en: "Average price of a custom agency website",
      price: 990,
      priceUnit: "Kč / měsíc",
      priceUnit_en: "CZK / month",
      turnaround1: "První návrh do 5 dní",
      turnaround1_en: "First draft within 5 days",
      turnaround2: "Web online za 7–11 pracovních dní",
      turnaround2_en: "Live site within 7–11 business days",
      commitment: "Bez závazku — zrušíte kdykoli",
      commitment_en: "No commitment — cancel anytime",
      guarantee: "Buď se vám web líbí a začnete platit, nebo se vám nelíbí a prostě neplatíte. Žádný háček.",
      guarantee_en: "Either you like the site and start paying, or you don't and simply don't pay. No catch.",
    },
    process: [
      { title: "Nezávazná poptávka", title_en: "No-obligation inquiry", desc: "Napíšete mi, co potřebujete — ozvu se do pár hodin.", desc_en: "Tell me what you need — I'll reply within a few hours." },
      { title: "První návrh do 5 dní", title_en: "First draft within 5 days", desc: "Uvidíte konkrétní vizuál na míru, ne jen sliby.", desc_en: "You'll see a real, tailored design — not just promises." },
      { title: "Doladíme detaily", title_en: "We fine-tune the details", desc: "Upravíme podle vašich připomínek, dokud to nesedí.", desc_en: "We adjust based on your feedback until it's right." },
      { title: "Web je online", title_en: "Your site goes live", desc: "Do 7–11 pracovních dní běží naostro na vaší doméně.", desc_en: "Live on your domain within 7–11 business days." },
      { title: "Platíte, dokud chcete", title_en: "You pay for as long as you want", desc: "Žádná smlouva na roky, žádný skrytý závazek.", desc_en: "No multi-year contract, no hidden commitment." },
    ],
    projects: [
      {
        id: "demo-1",
        title: "Web pro řemeslnou dílnu",
        title_en: "Website for a craft workshop",
        desc: "Jednoduchá prezentace s galerií realizací a poptávkovým formulářem.",
        desc_en: "A simple showcase site with a project gallery and inquiry form.",
        category: "Řemeslo",
        category_en: "Craft",
        url: "",
        image: "",
      },
      {
        id: "demo-2",
        title: "Web pro menší e-shop",
        title_en: "Website for a small online store",
        desc: "Katalog produktů, kontaktní formulář a napojení na sociální sítě.",
        desc_en: "Product catalog, contact form, and social media integration.",
        category: "E-commerce",
        category_en: "E-commerce",
        url: "",
        image: "",
      },
    ],
    testimonials: [],
    faq: [
      { q: "Co přesně je v ceně předplatného?", q_en: "What exactly is included in the subscription?", a: "Hosting, drobné úpravy obsahu, technická údržba a podpora. Nemusíte řešit nic navíc.", a_en: "Hosting, minor content edits, technical maintenance and support. You don't have to deal with anything extra." },
      { q: "Co když budu chtít zrušit?", q_en: "What if I want to cancel?", a: "Napíšete mi a předplatné ke konci období skončí. Žádná výpovědní lhůta ani pokuta.", a_en: "Just message me and the subscription ends at the end of the period. No notice period, no penalty." },
      { q: "Jak dlouho trvá, než bude web hotový?", q_en: "How long until the website is ready?", a: "První návrh do 5 pracovních dní, ostrý provoz do 7–11 pracovních dní od zadání.", a_en: "First draft within 5 business days, live within 7–11 business days from the start." },
      { q: "Co když budu chtít víc než jen jednoduchý web?", q_en: "What if I need more than a simple website?", a: "Probereme to individuálně — u větších projektů se cena i rozsah upraví podle potřeby.", a_en: "We'll discuss it individually — for bigger projects, price and scope adjust to fit." },
    ],
    services: [
      { icon: "layout-template", title: "Tvorba webových stránek", title_en: "Website creation", desc: "Nový web na míru, od návrhu po spuštění.", desc_en: "A custom website from design to launch." },
      { icon: "refresh-cw", title: "Redesign webu", title_en: "Website redesign", desc: "Modernizace stávajícího webu bez ztráty obsahu.", desc_en: "Modernizing your existing site without losing content." },
      { icon: "layers", title: "UX/UI design", title_en: "UX/UI design", desc: "Přehledný, moderní a použitelný design.", desc_en: "Clear, modern, and usable design." },
      { icon: "search", title: "SEO", title_en: "SEO", desc: "Aby vás lidé na Googlu skutečně našli.", desc_en: "So people can actually find you on Google." },
      { icon: "settings", title: "Správa webu", title_en: "Website management", desc: "Údržba, aktualizace a technická podpora.", desc_en: "Maintenance, updates, and technical support." },
      { icon: "code-2", title: "Vývoj aplikací", title_en: "Application development", desc: "Webové aplikace a nástroje na míru.", desc_en: "Custom web applications and tools." },
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
    auditRequests: [],
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
