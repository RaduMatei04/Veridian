// Textele interfeței (după login), în engleză și în română.
// Componentele nu scriu texte direct: le iau de aici prin useTranslation().

export const LANGUAGES = [
  { id: "en", label: "English" },
  { id: "ro", label: "Română" },
] as const;

export type Language = (typeof LANGUAGES)[number]["id"];

export const DEFAULT_LANGUAGE: Language = "en";

const en = {
  sidebar: {
    home: "Home",
    map: "Map",
    analytics: "Analytics",
    stations: "Stations",
    settings: "Settings",
    profile: "Profile",
    logout: "Logout",
    goHome: "Go to Home",
    collapse: "Collapse menu",
    open: "Open menu",
  },
  home: {
    welcomePrefix: "Welcome back, ",
    aboutMe: "About me",
    notifications: "Notifications",
    noNotifications: "No notifications",
    noNotificationsHint: "Your actions and new data events will appear here.",
    // Date simulate până la tabelul audit_events
    mockEvents: {
      login: "Signed in successfully",
      accent: "Accent color changed to Blue",
      import: "New measurements imported (QUANT)",
    },
    mockTimes: {
      minutes: "5 minutes ago",
      hours: "2 hours ago",
      yesterday: "yesterday",
    },
  },
  common: {
    save: "Save",
    saving: "Saving...",
    loading: "Loading...",
    loadError: "Could not load your data.",
  },
  settings: {
    title: "Settings",
    accentTitle: "Accent color",
    accentDescription: "The color used for buttons, icons and highlights.",
    accents: {
      blue: "Blue",
      teal: "Teal",
      orange: "Orange",
      pink: "Pink",
      lila: "Lila",
      red: "Red",
    },
    themeTitle: "Theme",
    themeDescription: "Light or dark appearance for the whole application.",
    light: "Light",
    dark: "Dark",
    languageTitle: "Language",
    languageDescription: "The language of the application's texts.",
  },
  profile: {
    title: "Profile",
    usernameTitle: "Change username",
    usernameDescription: "3–30 characters: letters, digits, _ . -",
    usernameLabel: "Username",
    usernameChanged: "Username has been changed.",
    descriptionTitle: "Description",
    descriptionDescription: "A few words about you (max 300 characters).",
    descriptionLabel: "Description",
    descriptionPlaceholder: "Write a description...",
    descriptionSaved: "Description has been saved.",
  },
  stations: {
    title: "Stations",
    // Texte cu numere: funcții mici care primesc numerele și întorc propoziția
    summary: (stations: number, sensors: number) =>
      `${stations} reference stations and ${sensors} commercial sensors from the QUANT dataset (UK).`,
    sensorCount: (n: number) => (n === 1 ? "1 sensor" : `${n} sensors`),
    loadError: "Could not load the stations.",
    empty: "No stations yet",
    emptyHint: "Run npm run seed to import the QUANT dataset.",
    // Tipul stației, după valoarea din baza de date
    types: {
      "urban background": "Urban background",
      "urban traffic": "Urban traffic",
    } as Record<string, string>,
  },
  map: {
    title: "Map",
    viewInAnalytics: "View in Analytics",
  },
  analytics: {
    title: "Analytics",
    stations: "Stations",
    parameter: "Parameter",
    period: "Period",
    periods: { all: "All", "2020": "2020", "2021": "2021", "2022": "2022", "last-month": "Last month of data" },
    // Ce reprezintă un punct din grafic (depinde de perioadă)
    resolutions: { week: "Weekly averages", day: "Daily averages", hour: "Hourly values" },
    average: "Average",
    minimum: "Min",
    maximum: "Max",
    unavailable: "No data for this parameter",
    noData: "No data",
    noDataHint: "Choose at least one station that measures this parameter.",
    loadError: "Could not load the measurements.",
  },
  // Numele parametrilor măsurați (cheile sunt cele din backend/parameters.ts)
  parameters: {
    "PM2.5": "PM2.5",
    PM10: "PM10",
    NO: "NO",
    NO2: "NO2",
    O3: "O3",
    Temperature: "Temperature",
    RelHumidity: "Relative humidity",
    Pressure: "Pressure",
  } as Record<string, string>,
  // Mesajele de eroare primite de la API, după `code`
  errors: {
    invalid_profile: "Username: 3–30 characters (letters, digits, _ . -). Description: max 300 characters.",
    username_taken: "This username is already taken.",
    invalid_settings: "Invalid theme, accent or language.",
    not_logged_in: "You are not logged in.",
    not_found: "User not found.",
    network: "Could not reach the server.",
    generic: "Something went wrong.",
    invalid_query: "Invalid stations, parameter or period.",
  },
};

// În română, de la 20 în sus se spune „de”: „3 senzori”, dar „49 de senzori”.
function withDe(n: number) {
  return n !== 0 && (n % 100 === 0 || n % 100 >= 20) ? `${n} de` : `${n}`;
}

// `typeof en`: TypeScript verifică să existe exact aceleași chei și în română.
const ro: typeof en = {
  sidebar: {
    home: "Acasă",
    map: "Hartă",
    analytics: "Analize",
    stations: "Stații",
    settings: "Setări",
    profile: "Profil",
    logout: "Deconectare",
    goHome: "Mergi la pagina principală",
    collapse: "Restrânge meniul",
    open: "Deschide meniul",
  },
  home: {
    welcomePrefix: "Bine ai revenit, ",
    aboutMe: "Despre mine",
    notifications: "Notificări",
    noNotifications: "Nu există notificări",
    noNotificationsHint: "Aici vor apărea acțiunile tale și evenimentele noi din date.",
    mockEvents: {
      login: "Autentificare reușită",
      accent: "Culoarea de accent a fost schimbată în Albastru",
      import: "Import nou de măsurători (QUANT)",
    },
    mockTimes: {
      minutes: "acum 5 minute",
      hours: "acum 2 ore",
      yesterday: "ieri",
    },
  },
  common: {
    save: "Salvează",
    saving: "Se salvează...",
    loading: "Se încarcă...",
    loadError: "Datele nu au putut fi încărcate.",
  },
  settings: {
    title: "Setări",
    accentTitle: "Culoare de accent",
    accentDescription: "Culoarea folosită pentru butoane, pictograme și evidențieri.",
    accents: {
      blue: "Albastru",
      teal: "Turcoaz",
      orange: "Portocaliu",
      pink: "Roz",
      lila: "Lila",
      red: "Roșu",
    },
    themeTitle: "Temă",
    themeDescription: "Aspect luminos sau întunecat pentru toată aplicația.",
    light: "Luminoasă",
    dark: "Întunecată",
    languageTitle: "Limbă",
    languageDescription: "Limba în care sunt afișate textele aplicației.",
  },
  profile: {
    title: "Profil",
    usernameTitle: "Schimbă numele de utilizator",
    usernameDescription: "3–30 caractere: litere, cifre, _ . -",
    usernameLabel: "Nume de utilizator",
    usernameChanged: "Numele de utilizator a fost schimbat.",
    descriptionTitle: "Descriere",
    descriptionDescription: "Câteva cuvinte despre tine (maximum 300 de caractere).",
    descriptionLabel: "Descriere",
    descriptionPlaceholder: "Scrie o descriere...",
    descriptionSaved: "Descrierea a fost salvată.",
  },
  stations: {
    title: "Stații",
    summary: (stations: number, sensors: number) =>
      `${stations} stații de referință și ${withDe(sensors)} senzori comerciali din setul QUANT (Marea Britanie).`,
    sensorCount: (n: number) => (n === 1 ? "1 senzor" : `${withDe(n)} senzori`),
    loadError: "Stațiile nu au putut fi încărcate.",
    empty: "Nu există stații",
    emptyHint: "Rulează npm run seed ca să imporți setul QUANT.",
    types: {
      "urban background": "Fond urban",
      "urban traffic": "Trafic urban",
    },
  },
  map: {
    title: "Hartă",
    viewInAnalytics: "Vezi în Analize",
  },
  analytics: {
    title: "Analize",
    stations: "Stații",
    parameter: "Parametru",
    period: "Perioadă",
    periods: { all: "Tot", "2020": "2020", "2021": "2021", "2022": "2022", "last-month": "Ultima lună cu date" },
    resolutions: { week: "Medii săptămânale", day: "Medii zilnice", hour: "Valori orare" },
    average: "Medie",
    minimum: "Min",
    maximum: "Max",
    unavailable: "Nu există date pentru acest parametru",
    noData: "Nu există date",
    noDataHint: "Alege cel puțin o stație care măsoară acest parametru.",
    loadError: "Măsurătorile nu au putut fi încărcate.",
  },
  parameters: {
    "PM2.5": "PM2.5",
    PM10: "PM10",
    NO: "NO",
    NO2: "NO2",
    O3: "O3",
    Temperature: "Temperatură",
    RelHumidity: "Umiditate relativă",
    Pressure: "Presiune",
  },
  errors: {
    invalid_profile:
      "Numele de utilizator: 3–30 caractere (litere, cifre, _ . -). Descrierea: maximum 300 de caractere.",
    username_taken: "Acest nume de utilizator este deja folosit.",
    invalid_settings: "Temă, accent sau limbă invalidă.",
    not_logged_in: "Nu ești autentificat.",
    not_found: "Utilizatorul nu a fost găsit.",
    network: "Serverul nu a putut fi contactat.",
    generic: "Ceva nu a funcționat.",
    invalid_query: "Stații, parametru sau perioadă invalide.",
  },
};

export type Translations = typeof en;
export type ErrorCode = keyof Translations["errors"];

export const translations: Record<Language, Translations> = { en, ro };
