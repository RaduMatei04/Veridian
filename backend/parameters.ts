// Parametrii măsurați în setul QUANT și unitățile lor.
// În baza de date, coloana `parameter` conține exact aceste nume (ex. "PM2.5").
export const PARAMETERS = {
  "PM2.5": { unit: "µg/m³" },
  PM10: { unit: "µg/m³" },
  NO: { unit: "ppb" },
  NO2: { unit: "ppb" },
  O3: { unit: "ppb" },
  Temperature: { unit: "°C" },
  RelHumidity: { unit: "%" },
  Pressure: { unit: "hPa" },
} as const;

export type Parameter = keyof typeof PARAMETERS;
