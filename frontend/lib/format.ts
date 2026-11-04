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
