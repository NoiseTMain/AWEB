# Adam Horvath — Weby na předplatné

Prodejní web pro byznys "web jako předplatné" (styl FastSite): jasná nabídka,
cena, proces, ukázky prací, reference, FAQ a poptávkový formulář. Skrytá
administrace pro správu veškerého obsahu. Bez frameworků, bez buildu — stačí
otevřít `index.html`.

## Struktura projektu (plochá — bez podsložek)

```
index.html   veřejný web
admin.html    administrace (skrytá)
style.css      styly veřejného webu
admin.css       styly administrace
data.js          datová vrstva (LocalStorage)
main.js           logika veřejného webu, animace
admin.js           logika administrace (CRUD, kalendář, poznámky, nastavení)
```

## Business model — kolik klientů potřebuješ

Cíl 30 000+ Kč/měsíc při aktuální ceně z Nastavení se automaticky přepočítává
přímo na dashboardu administrace ("Klientů na 30 000 Kč/měs"). Výchozí cena
990 Kč/měsíc → potřebuješ ~30 aktivních klientů současně. Zvýšení ceny snižuje
potřebný počet klientů, ale i poptávku — vyzkoušej, co funguje.

**Klíčové pro tenhle model:** není důležité kolik webů uděláš, ale kolik jich
**zůstane platit každý měsíc**. Nízký odchod klientů (retence) je důležitější
než nábor nových.

## Jak funguje administrace

- **5× rychlý klik** na logo → heslo → `/admin.html`
- Nebo napsat kdekoliv na stránce **`adminmama43`** → automatický přesun

Výchozí heslo: `adminmama43` (změň v Nastavení).

## Co administrace umí

- Domovská stránka — nadpis, podnadpis, fotka
- Ceník — cena, rychlost dodání, podmínky, garance
- Proces — kroky „Jak to funguje“
- Ukázky prací — portfolio hotových webů s odkazy
- Reference klientů
- FAQ
- Sociální sítě a kontakty
- Poptávky — zprávy z kontaktního formuláře
- Poznámky a kalendář — na plánování follow-upů s klienty
- Nastavení: heslo, export/import dat, vymazání cache

## Ukládání dat

Vše se ukládá do `localStorage` prohlížeče, nic se nezapisuje přímo do HTML.
Data jsou vázaná na konkrétní prohlížeč/zařízení — pro přenos mezi zařízeními
použij Export/Import v Nastavení.

## Nasazení (např. GitHub Pages)

1. Nahraj všechny soubory do kořene repozitáře (bez podsložek).
2. Settings → Pages → Source: Deploy from a branch → main → / (root) → Save.
3. Po uložení počkej 1–2 minuty, GitHub zobrazí finální adresu.
4. Po úpravě souborů zkus načtení v anonymním okně, ať to není z cache.

## Technologie

HTML5, CSS3, vanilla JavaScript (ES6). GSAP + ScrollTrigger, Lenis, ikony
Lucide — vše z CDN. Obsahuje bezpečnostní pojistku: pokud animace z jakéhokoliv
důvodu selže, obsah se po 2 vteřinách i tak zobrazí.
