# Veridian: context complet pentru Claude Code

> **Instrucțiuni pentru Claude Code (citește întâi)**
> - Acest fișier conține toate deciziile luate până acum într-o discuție de design. **Nu implementa nimic încă.** Începe prin a propune un plan de pași de început (ordine, ce se creează în fiecare pas, ce verifici la final) și așteaptă confirmarea utilizatorului.
> - Utilizatorul e **student la Electronică, nivel de coding începător**, și vrea să treacă spre dezvoltare software / web. Codul trebuie să fie **cât mai simplu și ușor de explicat** la susținerea proiectului. Evită abstractizările inutile și explică pe scurt ce faci și de ce.
> - Limba de lucru: **română**.
> - Tot ce e marcat **DE CONFIRMAT** nu e decis. Întreabă, nu presupune.
> - Valorile de culoare pentru light/dark sunt estimate dintr-o poză de referință și pot fi ajustate.

---

## 1. Proiectul

**Veridian: Urban Environmental Monitoring.** Proiect obligatoriu la facultate.

**Tema oficială:** „Monitorizarea parametrilor de mediu în zone urbane, cu date preluate de la senzori, cu raportare într-o aplicație web."

**Cerințe din fișa proiectului:**
- Temele se tratează ca **dezvoltare de produs / prototip / concept**.
- Pe lângă aplicație, e necesară o **documentație de dezvoltare** a produsului (simplificată, în stilul documentației pentru dezvoltarea unui produs). **NU** documentație despre funcționalitatea produsului.
- Dacă datele nu pot fi înregistrate direct de un senzor, se pot folosi seturi de date deja achiziționate (IEEE DataPort, Kaggle, UCI, data.gov, Zenodo, KDnuggets).
- Etape: P0 idee/use-case, P1 resurse (informații, hardware, software), P2 model de dezvoltare (simulator, soluție fizică, date de la senzori, seturi de date), P3 analiza SWOT, P4 proiectarea soluției, P5 implementare + documentație, P6 prezentare.
- **Evaluare:** documentație 40p, susținere 30p, prezentarea funcționalității 30p. Susținerea e obligatorie pentru nota finală.

Implicație: documentația valorează mai mult decât aplicația, deci deciziile de arhitectură trebuie să fie ușor de documentat (diagrame, tabel de rute, schema bazei de date).

---

## 2. Date

**Set principal ales: QUANT (Zenodo).**
- Date orare, decembrie 2019 – octombrie 2022, trei situri urbane din UK: Londra, Manchester, York.
- Senzori comerciali (49 de sisteme, 14 producători) + date de la stații de referință.
- Parametri: PM1, PM2.5, PM10, NO, NO2, O3, temperatură, umiditate, presiune.
- Mai multe locații, deci hartă cu stații și comparații între orașe.

**Sursa:** Zenodo, https://zenodo.org/records/10775692 (DOI 10.5281/zenodo.10775692). Licență: CC BY 4.0 pe Zenodo; datele provin de la CEDA sub Open Government Licence v3.0 (se citează sursa). Fișierele stau local în `data/quant/` (ignorat de git).

**Analiza (făcută, noiembrie 2026):**
- `QUANT_Reference_hourly.csv` (26.7 MB, 428.412 rânduri): `time, location, version, measurand, measurement`. 3 situri; `version` = Ratified / Unratified (nu se suprapun).
- `QUANT_SensorSystems_hourly.csv` (476.9 MB, 6.541.178 rânduri): `time, location, instrument, sensornumber, version, measurand, measurement, flag, flagreason`. 49 de instrumente, unele mutate între orașe; `version` = out-of-box / cal1 / cal2 (PurpleAir: atmospheric / indoor pentru PM).
- `QUANT_DuplicateRef_hourly.csv` (1.4 MB): instrumente de referință duplicate, doar Manchester. **Nu se importă.**
- Parametri prezenți: PM2.5, PM10, NO, NO2, O3, Temperature, RelHumidity, Pressure (fără PM1 și CO).
- Fișierele nu au coordonate: sunt scrise în seed (vezi mai jos).

**Decizii pentru import (`npm run seed`, `database/seed-quant.mjs`):**
- O **stație** = unul din cele 3 situri. Senzorii sunt tabel separat; stația se reține la fiecare valoare (senzorii se mută).
- Referința: **orar**, toate valorile (Ratified + Unratified, fără coloană). Presiunea de la York **nu** se importă (584–997 hPa la nivelul mării, eroare în sursă).
- Senzorii: **medie zilnică**, doar `out-of-box` (la PurpleAir, PM-ul `atmospheric`); mai mulți `sensornumber` intră în aceeași medie. Flag-urile se ignoră (se păstrează toate valorile).
- Se ignoră doar valorile fizic imposibile: concentrații sub −5 sau peste 1000, temperatură sub −40 sau peste 60 °C (~24 mii valori orare de la senzori).
- Presiunea senzorilor se aduce la hPa (Arisense raportează în Pa, Praxis în kPa).
- Rezultat: 3 stații, 49 senzori, ~409 mii valori orare de referință, ~114 mii medii zilnice; baza de date ~59 MB.

**Coordonate (din surse oficiale):**
| Stație | Lat, Lon | Tip | Sursă |
|---|---|---|---|
| London Honor Oak Park (LAQS) | 51.449674, −0.037418 | urban background | CEDA, Lewisham |
| Manchester Air Quality Supersite (Fallowfield) | 53.4442, −2.2144 | urban background | supliment AMT 2024 (convertit din grade/minute/secunde, **DE CONFIRMAT**) |
| York Fishergate | 53.951889, −1.075861 | urban traffic | UK-AIR YK11 |

**Alternative (neluate momentan):**
- Torino (Zenodo): 14 stații low-cost lângă o stație oficială, PM2.5 + temperatură + umiditate, un an. Mai simplu de importat.
- Liège (Zenodo): senzori electrochimici și optici + referință, ~133 MB.
- COMPAIR (Zenodo): 3.3 GB, prea mare.

**Date românești (doar bonus):** calitateaer.ro (istoric din 2007, fără API oficial clar) și aqicn.org (reia datele ANPM, API cu token, date nevalidate). Evitate ca bază.

Datele se încarcă din CSV în baza de date printr-un script de seed (`npm run seed`). Nu există senzori fizici și nu există ingestie live.

---

## 3. Stack tehnologic (decis)

| Strat | Alegere |
|---|---|
| Framework | **Next.js (TypeScript, App Router)**: frontend + backend în același proiect |
| UI | React (TSX), **Tailwind**, **shadcn/ui** (inclusiv componenta Sidebar) |
| Validare | **Zod** (și pe backend, și pe formulare) |
| Apeluri API din frontend | **TanStack Query** (`useQuery`), cu `QueryClientProvider` într-un component `"use client"` |
| Autentificare | **JWT propriu** cu `jose`, în cookie `httpOnly`; parole hash-uite cu `bcryptjs` (sau `argon2`). Fără Keycloak, fără Auth.js |
| Bază de date | **Neon (Postgres serverless)**, branch-uri `main` (producție) și `dev` (lucru local) |
| ORM | **Drizzle** (Prisma e alternativa acceptată) |
| Teme | `next-themes` (clasa `dark` pe `<html>`, script anti-flash) |
| Grafice / hartă | Recharts sau chart-urile shadcn; Leaflet (`"use client"`, import dinamic fără SSR) |
| Deploy | **Vercel** (push pe GitHub, build automat) |

**Excluse explicit:** Spring Boot, Keycloak, Vite, Docker / Docker Compose, MQTT, SQLite și MongoDB.

**Local:** `npm run dev` pornește frontend-ul și backend-ul într-un singur proces (`http://localhost:3000`). `DATABASE_URL` din `.env.local` arată spre branch-ul `dev` din Neon. Variabilele de mediu din `.env.local` se citesc la pornire (restart după modificări). Înainte de deploy se rulează o dată `npm run build && npm run start`.

**Pe Vercel:** funcțiile API sunt serverless, deci fără conexiuni persistente. `DATABASE_URL` se setează în variabilele de mediu din Vercel (sau automat prin integrarea Neon din Marketplace). Se folosește driverul `@neondatabase/serverless` sau connection string-ul cu pooler (`-pooler`). Codul care citește `DATABASE_URL` rulează doar pe server.

**Neon plan gratuit** (conform documentației la 2026-10-21, de reverificat înainte de deploy): scale-to-zero după 5 minute de inactivitate, nu se poate dezactiva pe Free; prima cerere după pauză e mai lentă; 0.5 GB stocare și 100 CU-ore de compute pe proiect pe lună. Pentru demo: deschide aplicația cu 1–2 minute înainte, iar UI-ul afișează stări de încărcare (TanStack Query) la primul request.

**Arhitectură pentru documentație:**
```
Browser → Next.js (UI + API routes + JWT) → Neon (Postgres) ← script seed (QUANT CSV)
```
Module descrise în documentație (nu „microservicii"): UI, API, autentificare, ingestie de date (seed), bază de date.

---

## 4. Brand și logo

- **Nume:** Veridian (din latinescul *viridis*, „verde"). Tagline posibil: *Veridian: Urban Environmental Monitoring*.
- **Numele aplicației pe Vercel** (`*.vercel.app`) se stabilește la deploy. **DE CONFIRMAT** că numele nu e luat (Google, npm, GitHub).
- **Logo (final, aprobat de utilizator):** V simetric, plat, cu colțuri convexe ușor rotunjite și bază plată. O bandă subțire de accent e lipită pe muchia interioară a brațului drept, de la vârful interior până la marginea de sus. **Fără text** lângă logo.

### Componentul pentru sidebar (`components/logo.tsx`)
```tsx
const V_PATH =
  "M8.83 12.04Q8.00 10.00 10.20 10.00L17.80 10.00Q20.00 10.00 20.83 12.04L32.00 39.33L43.17 12.04Q44.00 10.00 46.20 10.00L53.80 10.00Q56.00 10.00 55.17 12.04L38.83 51.96Q38.00 54.00 35.80 54.00L28.20 54.00Q26.00 54.00 25.17 51.96Z";
const ACCENT_PATH =
  "M43.17 12.04Q44.00 10.00 46.20 10.00L48.00 10.00L36.00 39.33L32.00 39.33Z";

export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="Veridian">
      <path d={V_PATH} fill="var(--logo-fill)" />
      <path d={ACCENT_PATH} fill="var(--accent-color)" />
    </svg>
  );
}
```
```css
:root { --logo-fill: #4b5563; }  /* light mode: corp închis */
.dark { --logo-fill: #e8ecf3; }  /* dark mode: corp luminos */
```
- Corpul urmează tema, banda urmează accentul ales de utilizator. Se actualizează instant la schimbarea setărilor.
- Poziție: **fixă, sus în sidebar**, mereu vizibilă.
- Grosimea benzii se reglează din lățimea de 4 unități din 64 (coordonatele `48.00` și `36.00` din `ACCENT_PATH`).

### Varianta fixă pentru pagina de start (`public/veridian-logo-start.svg`)
Corp luminos `#e8ecf3`, bandă Blue `#3478F6`, aceleași căi ca mai sus, cu culorile scrise direct (fără variabile). Se folosește **doar pe pagina de start**, nu pe login.

### Favicon (`app/icon.svg` sau `public/favicon.svg`)
Versiune fixă: pătrat rotunjit `#0e1420` (`rx=14`, viewBox 64) cu V-ul luminos și banda Blue, scalat la 0.72 și centrat (`transform="translate(32 32) scale(0.72) translate(-32 -32)"`). Nu poate citi variabile CSS, deci rămâne cu accentul Blue.

---

## 5. Fluxul aplicației (SPA cu rute Next.js)

1. **`/` pagina de start:** fundal gradient gri închis → gri, logo mare centrat (varianta fixă, bandă albastră), titlul „Urban Environmental Monitoring”, subtitlul „Explore air quality and climate data from urban sensor networks.” și butonul albastru **„Go to Application”**. La orice click pe fundal apare un cerc care se extinde și dispare (ripple).
2. **`/login`:** fundal **albastru fix, cu gradient** (nu mai folosește accentul utilizatorului, pentru că acesta nu e logat), iar în centru un **card alb cu colțuri rotunjite** cu username, parolă, un **buton Login mare** și link-ul „Create account” spre `/register`. Fără logo.
3. **`/home`:** după login, redirect aici (interfața principală).

**Protecție rute:** `middleware.ts` verifică cookie-ul JWT. Fără cookie, `/home` și celelalte pagini din aplicație redirecționează la `/login`. Utilizatorul deja logat care deschide `/login` e trimis la `/home`.

**Accent după login:** `localStorage` ține doar o copie rapidă a temei și accentului (anti-flash pe paginile din aplicație). După login, preferințele reale (temă + accent) se citesc din contul din Neon și se aplică. Paginile `/`, `/login` și `/register` au culori fixe.

**Conturi:** **DE CONFIRMAT.** Opțiuni: link „Create account" pe card sau utilizator demo creat prin seed. Pentru un cont nou, setările implicite sunt **Light Mode + Blue**.

**Autentificare (endpoint-uri propuse):**

| Metodă | Rută | Rol |
|---|---|---|
| POST | `/api/auth/register` | creare cont (dacă se alege varianta cu înregistrare) |
| POST | `/api/auth/login` | autentificare, setează cookie JWT |
| POST | `/api/auth/logout` | șterge cookie-ul (preferințele rămân salvate în DB) |
| GET | `/api/auth/me` | utilizatorul curent |
| PUT | `/api/profile` | actualizare profil |
| PUT | `/api/settings` | salvare temă + accent |
| GET | `/api/stations` | lista stațiilor (hartă) |
| GET | `/api/measurements?stations=1,2,3&parameter=PM2.5&period=<all, 2020, 2021, 2022 sau last-month>` | puncte pentru grafic (medii săptămânale / zilnice / valori orare, după perioadă) + medie/min/max pe stație |
| GET | `/api/audit?limit=8` | ultimele evenimente (card notificări) |

Fiecare endpoint: validare cu Zod (`safeParse`, 400 la eroare), verificare JWT la rutele protejate (funcție `getUser(request)` reutilizabilă sau middleware), coduri HTTP corecte (200, 400, 401, 404, 500). În documentație, rutele apar într-un tabel (metodă, URL, scop, autentificare necesară).

**Schema bazei de date (`database/schema.ts`):**
- `users`: id, username, password_hash, description, theme (`light`/`dark`, implicit `light`), accent (implicit `blue`), language, created_at
- `stations`: id, name, city (unic), type, lat, lon
- `sensors`: id, code (unic, ex. `AQM389`)
- `measurements` (referință, orar): id, station_id, measured_at, parameter, value; **index pe `(station_id, measured_at)`**
- `sensor_daily` (senzori, medii zilnice): id, sensor_id, station_id, day, parameter, value; indexuri pe `(station_id, day)` și `(sensor_id, day)`
- `parameter` e text (ex. `PM2.5`); lista cu unități e în `backend/parameters.ts`
- `audit_events`: id, user_id, type, message, created_at, read (**încă neadăugat**)

---

## 6. Layout-ul aplicației (după login)

**Sidebar în stânga + conținut în dreapta** (ca în imaginile de referință ale utilizatorului: un template simplu cu sidebar și un dashboard închis cu carduri).

**Sidebar:**
- **Sus:** logo-ul Veridian, poziție fixă.
- **Sub logo:** butoanele paginilor în cascadă, cu marje potrivite și egale (flexbox): **Home, Map, Analytics, Stations, Settings** (lista de pagini propusă de Claude și acceptată de utilizator; conținutul paginilor în afară de Home se discută mai târziu). Profile **nu** apare în sidebar.
- **Jos:** un **card de utilizator** cu pictogramă (avatar) și numele utilizatorului. La click se deschide în sus un meniu cu două opțiuni: **Profile** (redirect la pagina de profil personal) și **Logout** (delogare; preferințele rămân salvate). Recomandat: shadcn `DropdownMenu` cu `side="top"` (arată ca un popover).
- **Responsive:** pe telefon, sidebar-ul se ascunde sub un buton de meniu. shadcn are `npx shadcn add sidebar` cu zone pentru header (logo), content (navigare) și footer (user card), plus comportament mobil.
- **Au dispărut** popover-urile de Theme și Profile din navbar. Tema și accentul se setează **doar din Settings**.

### Stilul butoanelor din sidebar
- **Hover:** fundal gri mai pronunțat decât sidebar-ul, în familia temei (referință: un item de meniu cu fundal gri rotunjit la hover).
- **Pagina activă** (determinată din URL): **ring de 2px în culoarea de accent** + textul și iconița colorate în accent. **Fără umplerea fundalului.**

```css
:root {
  --accent-color: var(--primary);   /* accentul activ; se schimbă singur cu data-accent */
  --sidebar-hover: #e0e4ea;         /* light */
}
.dark { --sidebar-hover: #1f2a3d; } /* dark */
```
Numele `--accent-color` e ales deliberat: shadcn folosește deja `--accent` pentru fundaluri de hover, iar suprapunerea ar produce confuzii.

```tsx
// components/sidebar-link.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function SidebarLink({ href, icon: Icon, children }: {
  href: string; icon: LucideIcon; children: React.ReactNode;
}) {
  const active = usePathname() === href;
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
        "text-sidebar-foreground transition-colors duration-150",
        "hover:bg-[var(--sidebar-hover)]",
        "focus-visible:ring-2 focus-visible:ring-[var(--accent-color)]",
        active && "text-[var(--accent-color)] ring-2 ring-inset ring-[var(--accent-color)]"
      )}
    >
      <Icon className="size-5" />
      {children}
    </Link>
  );
}
```
`ring-inset` evită tăierea ring-ului la marginile sidebar-ului.

---

## 7. Pagina `/home`

**Doar două carduri, așezate unul sub altul** (stil: carduri cu colțuri rotunjite, antet cu pictogramă pătrată în accent, fundal închis pe dark mode):

1. **Card de salut (sus):** avatar cu pictogramă + „Bine ai revenit, **Username** !", cu numele utilizatorului în **culoarea de accent** (`text-primary`).
2. **Card Notificări (jos), funcționează ca un jurnal de audit:** ultimele schimbări înregistrate într-un interval de timp. Informații **utile dar minime**, vizibile din prima pagină. Fiecare rând: pictogramă după tip, text scurt, timp relativ („acum 2 ore"). Afișează ultimele 5–8 intrări. Stare goală: pictogramă + „Nu există notificări" + text explicativ scurt.

**Tipuri de evenimente posibile:** acțiuni ale utilizatorului (login, schimbare temă/accent, actualizare profil) și evenimente de date (import nou de măsurători, valoare peste prag).

**DE CONFIRMAT:**
1. Auditul e doar **personal** sau include și evenimente **globale** de date/alerte?
2. Ce interval de timp acoperă (de exemplu ultimele 7 zile)?
3. Păstrăm cele două iconițe din colțul cardului (marchează tot ca citit / golește) sau le lăsăm pentru mai târziu?

Pe telefon, cardurile rămân unul sub altul.

---

## 8. Teme (Light / Dark) și accent

**Setare:** exclusiv din pagina **Settings**, două selectoare: **THEME** (Light / Dark) și **ACCENT**.
**Implicit la cont nou:** Light + Blue.
**Persistență:** în contul din Neon (rămâne după logout și pe orice dispozitiv) + `localStorage` ca copie rapidă (anti-flash și accentul de pe `/login`).
**Efect:** schimbarea temei afectează **tot**: fundalul shell-ului, sidebar-ul, iconițele, cardurile, textul, bordurile. În dark mode totul devine închis (albastru-negru), în light mode fundalurile sunt un alb mai spălăcit.

**Regulă pentru tot codul:** niciodată culori fixe (`bg-white`, `text-gray-500`, `#fff`) în componente. Doar token-urile de mai jos (`bg-background`, `bg-card`, `border-border`, `text-muted-foreground`, `text-primary` etc.).

### Token-uri de temă (`globals.css`, valori estimate)
```css
:root {
  /* LIGHT: alb spălăcit */
  --background: #f1f3f6;          /* shell */
  --foreground: #1b2230;
  --card: #fafbfc;
  --card-foreground: #1b2230;
  --popover: #fafbfc;
  --popover-foreground: #1b2230;
  --sidebar: #eceff3;
  --sidebar-foreground: #1b2230;
  --muted: #e6e9ee;
  --muted-foreground: #667085;
  --border: #dde1e8;
  --input: #dde1e8;
  --ring: var(--primary);
  color-scheme: light;
}

.dark {
  /* DARK: albastru-negru, ca în poza de referință */
  --background: #0e1420;
  --foreground: #eef1f6;
  --card: #151c2b;
  --card-foreground: #eef1f6;
  --popover: #151c2b;
  --popover-foreground: #eef1f6;
  --sidebar: #111826;
  --sidebar-foreground: #eef1f6;
  --muted: #1c2535;
  --muted-foreground: #98a2b3;
  --border: #243044;
  --input: #243044;
  color-scheme: dark;
}
```
Dacă proiectul shadcn generat folosește alt format (de exemplu `oklch`), se păstrează numele variabilelor și se adaptează valorile.

### Culori de accent (`data-accent` pe `<html>`)
Șase culori, aranjate în 2 rânduri × 3 în Settings:

| Accent | Hex |
|---|---|
| Blue (implicit) | `#3478F6` |
| Teal | `#0D9488` |
| Orange | `#F07818` |
| Pink | `#DB2777` |
| Lila | `#8B5CF6` |
| Red | `#DC2626` |

```css
:root, [data-accent="blue"] { --primary: #3478F6; --primary-foreground: #ffffff; }
[data-accent="teal"]   { --primary: #0D9488; --primary-foreground: #ffffff; }
[data-accent="orange"] { --primary: #F07818; --primary-foreground: #1a1a1a; }
[data-accent="pink"]   { --primary: #DB2777; --primary-foreground: #ffffff; }
[data-accent="lila"]   { --primary: #8B5CF6; --primary-foreground: #ffffff; }
[data-accent="red"]    { --primary: #DC2626; --primary-foreground: #ffffff; }
```
Temă și accent sunt independente (2 × 6 combinații). **Contrast (calcule aproximate, de verificat cu DevTools):** alb pe Orange ≈ 2.8:1 (de aceea `--primary-foreground` e închis pe Orange), pe Blue ≈ 4.1:1, Teal ≈ 3.7:1, Lila ≈ 4.2:1 (la limită pentru text mic; ok pentru butoane cu text mare și bold). Pink și Red sunt în regulă.

### Mecanism
1. Settings salvează valorile în Neon și în `localStorage`.
2. `next-themes` pune/scoate clasa `dark` pe `<html>`, cu script anti-flash în `<head>`. Atributul `data-accent` se setează separat (același tip de script anti-flash).
3. Tranziție scurtă la schimbare (`transition: background-color 200ms, color 200ms`), respectând `prefers-reduced-motion`.

**Locuri unde tema nu se schimbă automat:**
- **Harta Leaflet:** tile-urile sunt imagini. Decis: Esri World Light Gray (Light) și World Dark Gray (Dark), fără cheie API; CARTO Positron / Dark Matter cer acum cheie API.
- **Graficele:** culorile seriilor și ale axelor se citesc din variabile (`var(--primary)`, `var(--muted-foreground)`), nu se scriu fix.

---

## 9. Animația de click (ripple) pentru butoane

Ripple clasic, **un singur cerc**, **fără culoare de fundal de accent**. Cercul are culoarea textului (`bg-current`), deci se adaptează la light/dark. Cod simplu, ca utilizatorul să îl poată explica.

**Unde se aplică:** inițial era gândit pentru butoanele din popover-urile de Theme/Profile, care au fost eliminate. **DE CONFIRMAT** dacă se folosește la butoanele din sidebar, la meniul user card și/sau la butoane principale (de exemplu „Login", „GO TO APPLICATION").

```css
@keyframes ripple {
  from { transform: scale(0); opacity: 0.4; }
  to   { transform: scale(1); opacity: 0; }
}
.ripple { animation: ripple 600ms ease-out forwards; }

@media (prefers-reduced-motion: reduce) {
  .ripple { animation: none; opacity: 0; }
}
```
```tsx
// components/ripple-button.tsx
"use client";
import { useState, type MouseEvent, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

type Ripple = { x: number; y: number; size: number; key: number };

export function RippleButton({ className, children, onClick, ...props }: ComponentProps<"button">) {
  const [ripple, setRipple] = useState<Ripple | null>(null);

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    setRipple({
      size,
      x: e.clientX - rect.left - size / 2,
      y: e.clientY - rect.top - size / 2,
      key: Date.now(),
    });
    onClick?.(e);
  }

  return (
    <button className={cn("relative overflow-hidden", className)} onClick={handleClick} {...props}>
      {ripple && (
        <span
          key={ripple.key}
          className="ripple pointer-events-none absolute rounded-full bg-current"
          style={{ left: ripple.x, top: ripple.y, width: ripple.size, height: ripple.size }}
        />
      )}
      {children}
    </button>
  );
}
```
**Cum se explică (4 pași):** (1) coordonatele click-ului față de buton, (2) un `<span>` rotund centrat pe acel punct, cu diametrul dublu față de latura mare a butonului, (3) animația CSS îl mărește de la `scale(0)` la `scale(1)` și îi scade opacitatea, (4) `overflow-hidden` taie cercul la marginile butonului, iar `bg-current` îi dă culoarea textului. `key` repornește animația la click-uri rapide, iar `pointer-events-none` lasă click-ul să treacă prin cerc.

---

## 10. Funcții planificate (conținutul paginilor, de discutat)

- **Map:** card mare cu harta (react-leaflet), 3 markere în accent, popup cu informațiile stației și link „View in Analytics” (`/analytics?station=<id>`).
- **Analytics:** un grafic cu linii (shadcn Chart / Recharts), doar date de referință. Filtre în URL (`?station=&parameter=&period=`): stații bifabile (cele fără parametrul ales sunt dezactivate), 8 parametri, perioade All / 2020 / 2021 / 2022 / ultima lună cu date (comună stațiilor alese). Rezoluție automată: All → săptămânal, an → zilnic, lună → orar. Carduri cu medie / min / max pe stație. Implicit: toate stațiile, PM2.5, All. Culorile liniilor: `--chart-1` (accent) + `--chart-2…5`, sărind culoarea egală cu accentul.
- **Stations:** câte un card pe stație (oraș, tip, coordonate, perioadă, număr de senzori, parametri).
- **Settings:** selectoarele THEME și ACCENT (conținutul detaliat se stabilește la implementare).
- **Profile:** pagina de profil personal (acces din user card).
- Valori curente și istoric pentru parametri (PM2.5, PM10, NO2, O3, temperatură etc.).

**Nu a fost discutat încă:** designul detaliat al paginilor Map, Analytics, Stations, Settings și Profile.

---

## 11. Întrebări deschise (de rezolvat cu utilizatorul)

1. Cum se creează conturile (înregistrare vs utilizator demo)?
2. Auditul din Home: personal sau și global? Ce interval? Păstrăm iconițele din colțul cardului?
3. Unde se aplică ripple-ul (sidebar, user menu, butoane principale)?
4. Structura și conținutul paginilor Map, Analytics, Stations, Settings, Profile.
5. Detalii ale paginii de start (în afară de logo, fundal gri închis și butonul „GO TO APPLICATION").
6. Numele aplicației pe Vercel.
7. ~~Structura exactă a setului QUANT și dimensiunea lui~~ (rezolvat, vezi secțiunea 2).

---

## 12. Starea curentă și pași următori propuși

**Ce există:** doar decizii de design și fișierele logo (`logo.tsx`, `veridian-logo-start.svg`, `favicon.svg`). Nu există cod de aplicație.

**Pași de început propuși pentru discuție (nu se execută fără confirmare):**
1. Inițializare proiect Next.js (TypeScript, App Router, Tailwind) + `shadcn init` (cu componentele Sidebar, Button, Card, DropdownMenu, Avatar).
2. Token-urile de temă și de accent în `globals.css`, `next-themes`, scripturile anti-flash.
3. Componentul `Logo`, favicon și pagina de start (`/`).
4. Layout-ul cu sidebar (`/home` cu cele două carduri, cu date simulate).
5. Conectare la Neon (branch `dev`), schema Drizzle și migrarea.
6. Autentificare: `/login`, endpoint-uri, JWT cu `jose`, `middleware.ts`.
7. Analiza setului QUANT și scriptul `npm run seed`.
8. Pagina Settings (THEME + ACCENT) cu salvare în DB și `localStorage`.

Fiecare pas trebuie explicat pe scurt utilizatorului, pentru că el va prezenta proiectul și trebuie să poată spune cum a fost construit.
