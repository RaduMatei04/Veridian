// Formatări folosite în mai multe pagini (Stations, Map, Analytics).

// "2019-12-10" → "Dec 2019" (en) sau "dec. 2019" (ro), fără biblioteci
export function formatMonth(day: string, language: string) {
  const [year, month] = day.split("-").map(Number);
  return new Intl.DateTimeFormat(language, { month: "short", year: "numeric" }).format(new Date(year, month - 1));
}

// Momentul unui punct din grafic ("2021-03-12T14:00"), în limba aleasă.
// Scurt pe axă, complet în tooltip; ora apare doar la valorile orare.
export function formatTime(time: string, resolution: string, language: string, long = false) {
  const date = new Date(time); // fără "Z" la final → ora locală, exact ca în date
  const options: Intl.DateTimeFormatOptions =
    resolution === "hour"
      ? { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }
      : resolution === "day" || long
        ? { day: "numeric", month: "short", year: long ? "numeric" : undefined }
        : { month: "short", year: "numeric" };
  return new Intl.DateTimeFormat(language, options).format(date);
}

// Cât timp a trecut de la un moment: "acum", "acum 5 minute", "ieri", "acum 3 zile" (în limba aleasă).
export function formatRelative(iso: string, language: string) {
  const seconds = (new Date(iso).getTime() - Date.now()) / 1000; // negativ = în trecut
  const rtf = new Intl.RelativeTimeFormat(language, { numeric: "auto" }); // „auto” → „ieri” în loc de „acum 1 zi”
  if (Math.abs(seconds) < 45) return rtf.format(0, "second"); // „now” / „acum”
  if (Math.abs(seconds) < 3600) return rtf.format(Math.round(seconds / 60), "minute");
  if (Math.abs(seconds) < 86400) return rtf.format(Math.round(seconds / 3600), "hour");
  return rtf.format(Math.round(seconds / 86400), "day");
}

// Data și ora exacte (apar la hover peste timpul relativ): "6 Nov 2026, 14:32"
export function formatDateTime(iso: string, language: string) {
  return new Intl.DateTimeFormat(language, { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}
