# Veridian: reguli de lucru

Veridian: Urban Environmental Monitoring. Proiect de facultate (Next.js + Neon), date din setul QUANT. Contextul complet al deciziilor: [veridian-context.md](../veridian-context.md).

## Cum lucrăm

- Limba de lucru: **română** (explicații, comentarii în cod). Textele din interfață sunt în engleză și română, prin dicționar (vezi „Limbă și traduceri”).
- Utilizatorul e începător și va susține proiectul la facultate. Codul trebuie să fie **simplu și ușor de explicat**: fără abstractizări inutile, fără biblioteci în plus, comentarii scurte unde nu e evident ce face codul.
- Se lucrează **pas cu pas**, după planul stabilit. Nu implementa nimic fără confirmarea utilizatorului. Când utilizatorul spune „doar planificăm”, nu se scrie cod.
- Tot ce e marcat **DE CONFIRMAT** în `veridian-context.md` nu e decis: întreabă, nu presupune.
- La finalul fiecărui pas: verificare (`npm run build`, `npm run lint`, verificare în browser) și un rezumat scurt cu ce s-a introdus.
- Commit-uri doar când utilizatorul cere.

## Next.js 16

- Versiunea instalată e Next.js 16 (React 19, Tailwind v4). Înainte de a folosi un API Next.js, citește ghidul din `node_modules/next/dist/docs/`.
- `middleware.ts` se numește acum **`proxy.ts`** (în rădăcină). `cookies()` și `headers()` sunt asincrone (`await cookies()`).
- `cacheComponents` e activ: la navigare, paginile nu se demontează, ci se ascund cu React `<Activity>` (efectele fac cleanup, starea rămâne). Bibliotecile care creează obiecte proprii în DOM (ex. Leaflet) trebuie recreate la revenire: `useLayoutEffect` cu cleanup care schimbă `key`-ul (vezi `stations-map.tsx` și ghidul `preserving-ui-state.md`).
- `"use client"` doar unde e nevoie (hook-uri React, evenimente, `localStorage`). Restul rămân componente de server.

## Structura folderelor

| Folder | Ce conține |
|---|---|
| `app/` | doar rutele Next.js (pagini, `layout.tsx`, `app/api/.../route.ts`). Fișierele de aici sunt subțiri și apelează codul din celelalte foldere. |
| `frontend/components/` | componentele noastre (logo, sidebar-link, carduri, formulare) |
| `frontend/components/ui/` | componentele shadcn. Se adaugă cu `npx shadcn@latest add <nume>` (ajung automat aici). Se modifică doar dacă e necesar. |
| `frontend/lib/` | utilitare de interfață (`utils.ts` cu `cn`, `accent.ts`) |
| `frontend/hooks/` | hook-uri React |
| `frontend/styles/globals.css` | temele, accentele și stilurile globale |
| `backend/` | logica rutelor API (stații, măsurători, audit, validări Zod) |
| `database/` | conexiunea Neon, schema Drizzle, migrări, seed |
| `auth/` | JWT (`jose`), parole (`bcryptjs`), sesiune; fiecare fișier începe cu `import "server-only"` |
| `public/` | fișiere statice (logo-ul pentru pagina de start) |

- Importurile folosesc aliasul `@/`: `@/frontend/components/...`, `@/frontend/lib/...`.
- `components.json`, `package.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs` și `proxy.ts` rămân în rădăcină (le caută uneltele acolo).

## Bază de date și autentificare

- `.env.local` (nu intră în git) conține `DATABASE_URL` (Neon, branch `dev`, adresa cu `-pooler`) și `JWT_SECRET`. Nu se afișează și nu se copiază valorile lor nicăieri. După modificarea lui, serverul de dezvoltare se repornește.
- Datele QUANT se încarcă cu `npm run seed` (`database/seed-quant.mjs`, CSV-urile din `data/quant/`, ignorat de git). Scriptul golește și reumple tabelele `stations`, `sensors`, `measurements`, `sensor_daily`.
- Schema e în `database/schema.ts`. După orice modificare: `npm run db:generate` (creează fișierul SQL în `database/migrations/`), apoi `npm run db:migrate` (îl aplică în Neon).
- Rutele API protejate încep cu `const user = await getUser()` (din `@/auth/session`) și întorc 401 dacă e `null`. `proxy.ts` e doar prima barieră.
- Datele trimise la API se validează cu Zod (`safeParse`, 400 la eroare). Hash-ul parolei nu se trimite niciodată în răspunsuri.
- În frontend, datele se citesc cu TanStack Query (`useQuery`); utilizatorul curent vine din `useCurrentUser()` (`frontend/hooks/use-current-user.ts`).
- Modificările contului se trimit cu `saveUser()` (`frontend/lib/user-api.ts`): `PUT /api/profile` (username, descriere) și `PUT /api/settings` (temă, accent). Răspunsul se pune în cache cu `queryClient.setQueryData(CURRENT_USER_KEY, user)`, ca sidebar-ul și restul paginilor să se actualizeze imediat.
- Tema și accentul din cont se aplică automat de `PreferencesSync` (în `app/(app)/layout.tsx`), pe baza datelor din cache. Pentru o schimbare imediată: `cancelQueries` → se actualizează cache-ul → se salvează → la succes se pune în cache răspunsul serverului, la eroare valoarea veche. `useCurrentUser` are `staleTime: Infinity` (nu se recitește automat).

## Reguli de UI

### Culori: doar token-uri

- **Niciodată culori fixe în componente**: fără `bg-white`, `text-gray-500`, `bg-zinc-50`, `#fff` etc.
- Se folosesc doar token-urile din `globals.css`:
  - fundaluri: `bg-background` (shell), `bg-card`, `bg-popover`, `bg-muted`, `bg-sidebar`
  - text: `text-foreground`, `text-card-foreground`, `text-muted-foreground`, `text-sidebar-foreground`
  - borduri: `border-border`, `border-input`
  - accent: `text-primary`, `bg-primary`, `text-primary-foreground`, `ring-primary` sau `var(--accent-color)`
- **Atenție:** în shadcn, `--accent` / `bg-accent` înseamnă fundalul de hover, **nu** culoarea de accent a utilizatorului. Culoarea de accent este `--primary` (alias `--accent-color`).
- Excepții aprobate (culori scrise direct), pentru că utilizatorul nu e încă logat:
  - pagina de start `/` (gradient gri `#1c1f24` → `#4b5058`, logo, buton albastru `#3478F6`) și `public/veridian-logo-start.svg`
  - paginile `/login` și `/register` (fundal gradient albastru, card alb, câmpuri și buton cu culori fixe)
  - favicon-ul (`app/icon.svg`)
  - coperta de după login/register (`LoginCover`, `frontend/components/login-cover.tsx`): gradientul de la /login, logo alb cu bandă `#1e4fbf`

### Teme și accent

- Două teme: **Light** (implicită) și **Dark** (clasa `dark` pe `<html>`, gestionată de `next-themes`, `useTheme()`).
- Șase accente, prin atributul `data-accent` pe `<html>`: `blue` (implicit), `teal`, `orange`, `pink`, `lila`, `red`. Lista și funcția `setAccent()` sunt în `frontend/lib/accent.ts`; nu se duplică în alte fișiere.
- Tema și accentul sunt independente (2 × 6 combinații). Orice componentă nouă trebuie să arate bine în toate.
- Tema și accentul se schimbă **doar din pagina Settings**. Se salvează în Neon (contul utilizatorului) și în `localStorage` (copie rapidă: `veridian-theme`, `veridian-accent`).
- Schimbarea temei și a accentului e **instantă**: fără tranziție globală de culori în `globals.css`; tranzițiile sunt oprite pentru un cadru la schimbare (`disableTransitionOnChange` în `providers.tsx`, același mecanism în `setAccent()`). Animațiile (ripple, hover) rămân.
- Paginile `/`, `/login` și `/register` **nu** folosesc tema sau accentul utilizatorului (culori fixe, vezi mai sus).
- Cont nou: Light + Blue.

### Layout și navigare

- După login: **sidebar în stânga + conținut în dreapta** (componenta shadcn Sidebar).
- Sidebar colapsabil (`collapsible="offcanvas"`): închis → dispare complet și rămâne doar butonul `rounded-lg` în accent din stânga sus (`SidebarOpenButton`); deschis → butonul de restrângere stă în dreapta logo-ului, tot în accent. Tranziția e lină (300 ms, `ease-in-out`), iar conținutul sidebar-ului apare cu fade după ce acesta începe să se lărgească. Pe telefon sidebar-ul e un panou care alunecă din stânga și se închide după alegerea unei pagini.
- Sidebar: logo sus (fix, fără text), apoi butoanele **Home, Map, Analytics, Stations, Settings** (spațiere egală, flexbox), jos cardul de utilizator (avatar + nume). Click pe card → `DropdownMenu` cu `side="top"` și opțiunile **Profile** și **Logout**. Profile nu apare în lista din sidebar.
- Buton din sidebar:
  - hover: `hover:bg-[var(--sidebar-hover)]`
  - pagina activă (din `usePathname()`): `ring-2 ring-inset ring-[var(--accent-color)]` + text și iconiță în accent, **fără fundal umplut**
- Iconițe: `lucide-react`.
- Fluxul paginilor: `/` (start: gradient gri, logo mare, titlul „VERIDIAN Application”, subtitlu, buton albastru „Go to Application”; texte în engleză) → `/login` (gradient albastru fix, card alb centrat cu colțuri rotunjite, buton Login mare, link „Create account” spre `/register`, fără logo) → `/home`. Logout duce înapoi la pagina de start `/`.

### Componente și stil

- Carduri cu colțuri rotunjite (`rounded-xl`, componenta shadcn `Card`); antetul are o pictogramă pătrată în culoarea de accent.
- Logo: componenta `Logo` (corp `var(--logo-fill)`, bandă `var(--accent-color)`), fără text alături. Pe pagina de start se folosește `public/veridian-logo-start.svg`.
- Ripple la click: hook-ul `useRipple()` (`frontend/hooks/use-ripple.tsx`) + clasa `.ripple` din `globals.css`. Un singur cerc, culoarea textului (`bg-current`, opacitate 0.3 → 0, 600 ms), pornește din punctul de click și acoperă tot butonul; butonul are `relative overflow-hidden`. Pentru `<button>` se folosește `RippleButton` (`frontend/components/ripple-button.tsx`). Aplicat pe: butoanele din meniul sidebar (`SidebarLink`), opțiunile de accent și de temă din Settings. Pe alte butoane: **DE CONFIRMAT**.
- Mesaje după salvare: componenta `StatusMessage` (`frontend/components/settings/status-message.tsx`). Succes = card cu contur și text verde (`border-success bg-success-muted text-success`), eroare = roșu (`destructive`).
- Butoane de salvare: `rounded-lg`, în accent (`saveButtonClass` din `settings-section.tsx`).
- Pagina Settings (ordinea opțiunilor): Accent color → Theme → Language. Pagina Profile: Change username → Description (max 300). Ambele au titlul în accent (`PageHeader`) și conținut pe 80% din lățime (`md:w-4/5`), 100% pe telefon.
- Logo-ul din sidebar duce la `/home` (al doilea drum spre Home, pe lângă butonul Home).
- Animații scurte (200 ms) și dezactivate la `prefers-reduced-motion`.
- Pagina de start are în fundal animația „rețea de senzori” (`SensorNetworkBackground` + logica din `frontend/lib/sensor-network.ts`, pe `<canvas>`): stații și legături albastre (`#3478F6`), unde emise din când în când de o stație, pachete de date care alunecă pe legături, glow la stațiile de lângă cursor. Bucla rulează continuu (fără pauze, **inclusiv la `prefers-reduced-motion`**, la cererea utilizatorului); se oprește doar la plecarea de pe pagină. Setările (număr de stații, viteze, raze) sunt constantele de la începutul fișierului.
- Stări de încărcare vizibile (TanStack Query) și stări goale cu pictogramă + text scurt.

### Limbă și traduceri

- Două limbi: **English** (implicită la cont nou) și **Română**, salvate în cont (coloana `language`, `PUT /api/settings`), alese din Settings.
- Toate textele de după login vin din dicționarul `frontend/lib/i18n.ts` (obiectele `en` și `ro`), prin `const { t } = useTranslation()` (`frontend/hooks/use-translation.ts`). **Nu se scriu texte direct în componente.** Orice text nou se adaugă în ambele limbi; româna se scrie cu diacritice (ă, â, î, ș, ț).
- Erorile de la API au un `code` (ex. `username_taken`); frontend-ul afișează `t.errors[code]`.
- Paginile `/`, `/login` și `/register` rămân în engleză (utilizatorul nu e logat, deci nu i se știe limba).

### Responsive

- Totul trebuie să funcționeze și pe lățime de telefon: pe mobil sidebar-ul se ascunde sub un buton de meniu, iar cardurile stau unul sub altul.

### Grafice și hartă

- Graficele citesc culorile din variabile (`var(--chart-1)`…`var(--chart-3)`, `var(--primary)`, `var(--muted-foreground)`), nu valori fixe.
- Graficele rămân în familia accentului: `--chart-1` = accentul, `--chart-2` / `--chart-3` = nuanțe mai închise / mai deschise ale lui, definite pentru fiecare accent și temă în `globals.css` („NUANȚE PENTRU GRAFICE”). Fără alte culori pe grafice.
- Harta Leaflet (`react-leaflet`): componentă `"use client"` încărcată cu import dinamic fără SSR (`frontend/components/map/`). Tile-uri Esri fără cheie API: World Light Gray pe Light, World Dark Gray pe Dark (CARTO cere acum cheie). Stilurile Leaflet (popup, controale) sunt suprascrise cu token-uri în `globals.css` (`.map-card ...`); butoanele de zoom sunt carduri rotunjite separate, cu + / − în accent. Harta se recalculează la schimbarea mărimii containerului (`ResizeWatcher`).

### Contrast

- Textul de pe butoanele în accent folosește `text-primary-foreground` (pe Orange e închis, pe restul alb). Nu forța `text-white` pe fundal de accent.
