# Adam Horvath — Weby na předplatné

Prodejní web pro byznys "web jako předplatné" (styl FastSite): jasná nabídka,
cena, proces, služby, ukázky prací, reference, FAQ, audit webu a poptávkový
formulář. Skrytá administrace pro správu veškerého obsahu. Dvojjazyčný
(čeština/angličtina). Bez frameworku a bez buildu — stačí nahrát soubory
a otevřít `index.html`.

## Struktura projektu (plochá — bez podsložek)

```
index.html   veřejný web
admin.html    administrace (skrytá)
style.css      styly veřejného webu i administrace (základ)
admin.css       doplňkové styly administrace
data.js          datová vrstva + synchronizace s Firebase Realtime Database
i18n.js           slovník a logika přepínání čeština/angličtina
logo3d.js          interaktivní 3D logo (Three.js)
main.js           logika veřejného webu, animace, formuláře
admin.js           logika administrace (CRUD, kalendář, poznámky, nastavení)
logo.glb           3D model loga zobrazený v Hero sekci
CNAME              vlastní doména pro GitHub Pages
```

## Datové úložiště — Firebase Realtime Database

Obsah webu (ceník, proces, projekty, reference, FAQ, služby, poptávky...) se
ukládá lokálně (`localStorage`) a zároveň obousměrně synchronizuje s Firebase
Realtime Database, takže ho vidíš stejně z libovolného zařízení/prohlížeče.
Konfigurace Firebase je v `data.js` — při přesunu na jiný Firebase projekt
stačí upravit `FIREBASE_CONFIG` na začátku souboru.

Poznámka: v projektu není žádný vlastní backend server, API endpointy ani
autentizace uživatelů (přihlášení do administrace je jednoduché ověření
heslem na frontendu, ne skutečná autentizace) — to v původním zadání nebylo
a nebylo tedy co "zachovávat". Firebase databáze je jediná reálná perzistentní
vrstva a ta zůstala beze změny ve své podstatě, jen přibyly nové datové klíče
(`services`, `auditRequests`) a anglické varianty textových polí (`*_en`).

## Novinky v této verzi

- **Skutečné logo** (`logo-mark.png`, `logo-full.png`) — dodané logo bylo
  zpracované pro tmavý web: bílé pozadí odstraněno (průhlednost), černé
  tahy přebarvené na bílou, zlatý akcent (puntík/čárky) zachovaný beze
  změny. Použité v navigaci, patičce a jako favicon
  (`favicon.ico`, `favicon-32.png`, `apple-touch-icon.png`).

- **3D logo** (`logo.glb`) v Hero sekci — otáčí se tažením myši/prstem,
  jemné nasvícení, plynulý nájezd při načtení, po puštění zůstává v poslední
  pozici. Pokud se model nenačte nebo prohlížeč nepodporuje WebGL, potichu
  se použije záložní fotka/placeholder — web nikdy nezůstane rozbitý.
  ⚠️ **Soubor `logo.glb` má 43 MB** — to je na "logo" zobrazované na webu
  extrémně velké a bude se pomalu načítat, obzvlášť na mobilu. Doporučuju
  model před ostrým nasazením zkomprimovat (např. přes gltf.report,
  Blender export s Draco kompresí, nebo `gltfpack`) na jednotky MB.
  **Update:** provedeno — model neměl sdílené vrcholy mezi trojúhelníky
  (75 % dat bylo přesných duplicit). Po svaření (weld) duplicitních
  vrcholů a přidání indexového bufferu má stejný soubor 15,4 MB, **beze
  ztráty kvality** (ověřeno bajtově přesnou rekonstrukcí geometrie).
  Pro GitHub web upload (limit 25 MB) už stačí bez dalších úprav.
- **Sekce Služby** — 6 karet (Tvorba webových stránek, Redesign, UX/UI,
  SEO, Správa webu, Vývoj aplikací), editovatelné v administraci.
- **Sekce Audit webu** — nová landing sekce s formulářem (URL + e-mail).
  Zatím bez reálného backendu pro AI analýzu (ten zadání ani nevyžadovalo) —
  poptávky se ukládají a jsou vidět v administraci v sekci "Audit poptávky",
  odkud lze snadno napojit skutečnou analýzu, až bude hotová.
- **Povinný souhlas se zpracováním osobních údajů** v poptávkovém
  formuláři — bez zaškrtnutí nelze formulář odeslat.
- **Čeština/Angličtina** — přepínač v navigaci, veškerý statický text i
  obsah spravovaný z administrace (ceník, proces, projekty, FAQ, služby)
  má anglickou variantu s automatickým fallbackem na češtinu, pokud
  anglický text není vyplněný. Volba jazyka se pamatuje.
- Odstraněn text „Kontakty budou brzy doplněny“ — pokud nejsou vyplněné
  žádné kontakty, sekce je jednoduše prázdná.

## Business model — kolik klientů potřebuješ

Cíl 30 000+ Kč/měsíc při aktuální ceně z Nastavení se automaticky přepočítává
přímo na dashboardu administrace ("Klientů na 30 000 Kč/měs"). Výchozí cena
990 Kč/měsíc → potřebuješ ~30 aktivních klientů současně.

## Jak funguje administrace

- **5× rychlý klik** na logo → heslo → `/admin.html`
- Nebo napsat kdekoliv na stránce **`adminmama43`** → automatický přesun

Výchozí heslo: `adminmama43` (změň v Nastavení).

## Co administrace umí

- Domovská stránka — nadpis, podnadpis, fotka (CZ + EN)
- Ceník — cena, rychlost dodání, podmínky, garance (CZ + EN)
- Proces — kroky „Jak to funguje“ (CZ + EN)
- Služby — karty nabízených služeb (CZ + EN)
- Ukázky prací — portfolio hotových webů s odkazy (CZ + EN)
- Reference klientů (CZ + EN)
- FAQ (CZ + EN)
- Sociální sítě a kontakty
- Poptávky — zprávy z kontaktního formuláře
- Audit poptávky — URL a e-maily z formuláře „Audit webu“
- Poznámky a kalendář — na plánování follow-upů s klienty
- Nastavení: heslo, export/import dat, vymazání cache

## Nasazení (např. GitHub Pages)

1. Nahraj všechny soubory (včetně `logo.glb`) do kořene repozitáře.
2. Settings → Pages → Source: Deploy from a branch → main → / (root) → Save.
3. Po uložení počkej 1–2 minuty, GitHub zobrazí finální adresu.
4. Po úpravě souborů zkus načtení v anonymním okně, ať to není z cache.

## Technologie

HTML5, CSS3, vanilla JavaScript (ES6) — žádný framework, žádný build krok,
žádné TypeScript/lint nástroje (projekt je čistě statický, takže tohle na
něj nelze aplikovat). Knihovny z CDN: GSAP + ScrollTrigger, Lenis, ikony
Lucide, Three.js + GLTFLoader + OrbitControls (3D logo), Firebase
(Realtime Database). Obsahuje bezpečnostní pojistku: pokud animace nebo
načtení CDN skriptu z jakéhokoliv důvodu selže, obsah se po 2 vteřinách
i tak zobrazí.
