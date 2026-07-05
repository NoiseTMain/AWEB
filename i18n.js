/* ============================================================
   i18n.js — dvojjazyčnost webu (čeština / angličtina)
   Statické texty (nadpisy sekcí, popisky, tlačítka) jsou v slovníku
   níže a značí se v HTML atributem data-i18n="klíč".
   Texty spravované z administrace (hero, ceník, proces, FAQ,
   projekty, reference, služby) mají v data.js dvojici polí
   `pole` / `pole_en` — při chybějícím anglickém překladu se
   automaticky použije český text, aby nic nezůstalo prázdné.
============================================================ */

const I18N = {
  cs: {
    "nav.pricing": "Cena",
    "nav.process": "Jak to funguje",
    "nav.projects": "Ukázky",
    "nav.services": "Služby",
    "nav.faq": "FAQ",
    "nav.audit": "Audit webu",
    "nav.cta": "Nezávazná poptávka",

    "hero.ctaPrimary": "Chci nezávaznou nabídku",
    "hero.ctaSecondary": "Zobrazit cenu",
    "scroll.label": "Scroll",

    "pricing.eyebrow": "Cena",
    "pricing.title": "Jednoduché, transparentní předplatné",
    "pricing.feature1Caption": "místo měsíců čekání",
    "pricing.feature2Caption": "a je to naostro",

    "process.eyebrow": "Jak to funguje",
    "process.title": "Od poptávky k živému webu",

    "services.eyebrow": "Služby",
    "services.title": "Co pro vás můžu udělat",

    "projects.eyebrow": "Ukázky",
    "projects.title": "Weby, které jsem postavil",
    "projects.viewLink": "Zobrazit web →",
    "projects.empty": "Ukázky prací se právě doplňují.",

    "references.eyebrow": "Reference",
    "references.title": "Co říkají klienti",
    "references.empty": "Zatím žádné reference.",

    "faq.eyebrow": "Časté dotazy",
    "faq.title": "FAQ",

    "audit.eyebrow": "Audit webu",
    "audit.title": "Zjistěte za 30 sekund,\nproč váš web neprodává.",
    "audit.subtitle": "Bezplatná analýza webu za 30 sekund.",
    "audit.reportIntro": "Dostanete detailní report:",
    "audit.point1": "SEO",
    "audit.point2": "Rychlost",
    "audit.point3": "Bezpečnost",
    "audit.point4": "UX",
    "audit.aiLine": "AI přečte váš web a řekne konkrétně, co opravit jako první.",
    "audit.benefit1": "Analýza webu zdarma, bez registrace",
    "audit.benefit2": "Výsledek za 30 sekund",
    "audit.benefit3": "30+ kontrolních bodů + AI shrnutí",
    "audit.privacyNote": "Výsledky pošleme na e-mail. Žádný spam, odhlášení jedním kliknutím.",
    "audit.placeholder": "URL vašeho webu (např. https://vasweb.cz)",
    "audit.emailPlaceholder": "Váš e-mail",
    "audit.button": "Spustit audit zdarma",
    "audit.thanks": "Díky! Report vám pošleme na e-mail, jakmile bude audit spuštěný naostro.",
    "audit.errorUrl": "Zadejte prosím platnou adresu webu.",
    "audit.errorEmail": "Zadejte prosím platný e-mail.",

    "contact.eyebrow": "Kontakt",
    "contact.title": "Pojďme na to",
    "contact.labelName": "Jméno *",
    "contact.labelEmail": "E‑mail *",
    "contact.labelPhone": "Telefon",
    "contact.labelCompany": "Firma",
    "contact.labelSubject": "Jaký web potřebujete?",
    "contact.labelMessage": "Zpráva *",
    "contact.placeholderName": "Vaše jméno",
    "contact.placeholderEmail": "vas@email.cz",
    "contact.placeholderPhone": "+420 ...",
    "contact.placeholderCompany": "Volitelné",
    "contact.placeholderSubject": "např. prezentace, e-shop, rezervace...",
    "contact.placeholderMessage": "Napište mi pár vět o vašem projektu...",
    "contact.submit": "Odeslat nezávaznou poptávku",
    "contact.consentText": "Souhlasím se zpracováním osobních údajů podle zásad ochrany soukromí.",
    "contact.consentError": "Pro odeslání je nutné potvrdit souhlas se zpracováním osobních údajů.",
    "contact.errorName": "Zadejte prosím jméno.",
    "contact.errorEmail": "Zadejte platný e‑mail.",
    "contact.errorMessage": "Zpráva by měla mít alespoň 10 znaků.",
    "contact.errorGeneric": "Zkontrolujte prosím vyznačená pole.",
    "contact.success": "Poptávka byla odeslána. Ozvu se co nejdříve!",

    "footer.rights": "Všechna práva vyhrazena.",
  },
  en: {
    "nav.pricing": "Pricing",
    "nav.process": "How it works",
    "nav.projects": "Work",
    "nav.services": "Services",
    "nav.faq": "FAQ",
    "nav.audit": "Website audit",
    "nav.cta": "Get a free quote",

    "hero.ctaPrimary": "Get a free quote",
    "hero.ctaSecondary": "See pricing",
    "scroll.label": "Scroll",

    "pricing.eyebrow": "Pricing",
    "pricing.title": "Simple, transparent subscription",
    "pricing.feature1Caption": "instead of months of waiting",
    "pricing.feature2Caption": "and it's fully live",

    "process.eyebrow": "How it works",
    "process.title": "From inquiry to a live website",

    "services.eyebrow": "Services",
    "services.title": "What I can do for you",

    "projects.eyebrow": "Work",
    "projects.title": "Websites I've built",
    "projects.viewLink": "View website →",
    "projects.empty": "Work samples are being added soon.",

    "references.eyebrow": "Testimonials",
    "references.title": "What clients say",
    "references.empty": "No testimonials yet.",

    "faq.eyebrow": "FAQ",
    "faq.title": "Frequently asked questions",

    "audit.eyebrow": "Website audit",
    "audit.title": "Find out in 30 seconds\nwhy your website isn't converting.",
    "audit.subtitle": "A free website analysis in 30 seconds.",
    "audit.reportIntro": "You'll get a detailed report on:",
    "audit.point1": "SEO",
    "audit.point2": "Speed",
    "audit.point3": "Security",
    "audit.point4": "UX",
    "audit.aiLine": "AI reads your website and tells you exactly what to fix first.",
    "audit.benefit1": "Free analysis, no signup required",
    "audit.benefit2": "Results in 30 seconds",
    "audit.benefit3": "30+ checkpoints + an AI summary",
    "audit.privacyNote": "We'll send results to your email. No spam, unsubscribe with one click.",
    "audit.placeholder": "Your website URL (e.g. https://yoursite.com)",
    "audit.emailPlaceholder": "Your email",
    "audit.button": "Run free audit",
    "audit.thanks": "Thanks! We'll email you the report once the audit is live.",
    "audit.errorUrl": "Please enter a valid website address.",
    "audit.errorEmail": "Please enter a valid email address.",

    "contact.eyebrow": "Contact",
    "contact.title": "Let's do this",
    "contact.labelName": "Name *",
    "contact.labelEmail": "Email *",
    "contact.labelPhone": "Phone",
    "contact.labelCompany": "Company",
    "contact.labelSubject": "What kind of website do you need?",
    "contact.labelMessage": "Message *",
    "contact.placeholderName": "Your name",
    "contact.placeholderEmail": "you@email.com",
    "contact.placeholderPhone": "+1 ...",
    "contact.placeholderCompany": "Optional",
    "contact.placeholderSubject": "e.g. landing page, online store, booking...",
    "contact.placeholderMessage": "Tell me a bit about your project...",
    "contact.submit": "Send a free inquiry",
    "contact.consentText": "I agree to the processing of my personal data in accordance with the privacy policy.",
    "contact.consentError": "You must agree to the processing of personal data before sending.",
    "contact.errorName": "Please enter your name.",
    "contact.errorEmail": "Please enter a valid email.",
    "contact.errorMessage": "Your message should be at least 10 characters.",
    "contact.errorGeneric": "Please check the highlighted fields.",
    "contact.success": "Your inquiry has been sent. I'll get back to you soon!",

    "footer.rights": "All rights reserved.",
  },
};

function getLang() {
  return localStorage.getItem("pf_lang") || "cs";
}

function setLang(lang) {
  localStorage.setItem("pf_lang", lang);
  document.documentElement.lang = lang;
  translateStatic();
  document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.langBtn === lang);
  });
  if (typeof renderAll === "function") renderAll();
}

function t(key) {
  const lang = getLang();
  return (I18N[lang] && I18N[lang][key]) || I18N.cs[key] || key;
}

/* Pro DB pole s dvojicí `pole` / `pole_en` — vrátí anglický text,
   pokud existuje a jsme v angličtině, jinak český (výchozí) text. */
function tField(obj, field) {
  if (!obj) return "";
  const lang = getLang();
  if (lang === "en" && obj[field + "_en"]) return obj[field + "_en"];
  return obj[field] || "";
}

function translateStatic() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    const text = t(key);
    if (el.hasAttribute("data-i18n-placeholder")) {
      el.setAttribute("placeholder", text);
    } else {
      el.textContent = text;
    }
  });
}

function initLangSwitcher() {
  document.documentElement.lang = getLang();
  document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.langBtn === getLang());
    btn.addEventListener("click", () => setLang(btn.dataset.langBtn));
  });
  translateStatic();
}
