import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  real,
  doublePrecision,
  date,
  index,
} from "drizzle-orm/pg-core";

// Tabelul utilizatorilor. Parola se salvează doar ca hash, niciodată în clar.
// Tabelul audit_events se adaugă mai târziu.
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 30 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  description: varchar("description", { length: 300 }).notNull().default(""),
  theme: varchar("theme", { length: 10 }).notNull().default("light"),
  accent: varchar("accent", { length: 10 }).notNull().default("blue"),
  language: varchar("language", { length: 2 }).notNull().default("en"), // "en" sau "ro"
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---- Date din setul QUANT (încărcate cu npm run seed) ----

// Cele 3 situri de măsurare (London, Manchester, York). Coordonatele sunt scrise în seed.
export const stations = pgTable("stations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 80 }).notNull(),
  city: varchar("city", { length: 30 }).notNull().unique(),
  type: varchar("type", { length: 30 }).notNull(), // "urban background" sau "urban traffic"
  lat: doublePrecision("lat").notNull(),
  lon: doublePrecision("lon").notNull(),
});

// Senzorii comerciali (ex. "AQM389"). Se pot muta între stații, deci stația e la fiecare valoare.
export const sensors = pgTable("sensors", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 20 }).notNull().unique(),
});

// Valorile orare ale stațiilor de referință.
// parameter: "PM2.5", "NO2" etc. (lista cu unități e în backend/parameters.ts)
export const measurements = pgTable(
  "measurements",
  {
    id: serial("id").primaryKey(),
    stationId: integer("station_id").notNull().references(() => stations.id),
    measuredAt: timestamp("measured_at").notNull(),
    parameter: varchar("parameter", { length: 12 }).notNull(),
    value: real("value").notNull(),
  },
  // Graficele caută după stație și interval de timp
  (t) => [index("measurements_station_time_idx").on(t.stationId, t.measuredAt)],
);

// Mediile zilnice ale senzorilor (valorile "out-of-box"; la PurpleAir, PM-ul "atmospheric").
export const sensorDaily = pgTable(
  "sensor_daily",
  {
    id: serial("id").primaryKey(),
    sensorId: integer("sensor_id").notNull().references(() => sensors.id),
    stationId: integer("station_id").notNull().references(() => stations.id),
    day: date("day").notNull(),
    parameter: varchar("parameter", { length: 12 }).notNull(),
    value: real("value").notNull(),
  },
  (t) => [
    index("sensor_daily_station_day_idx").on(t.stationId, t.day),
    index("sensor_daily_sensor_day_idx").on(t.sensorId, t.day),
  ],
);

// ---- Jurnalul de activitate (cardul Notifications de pe Home) ----

// Un rând pe acțiune a utilizatorului (login, schimbare de accent etc.).
// Se salvează tipul și valoarea, nu textul: textul vine din dicționar, în limba aleasă.
// Rândurile mai vechi de 30 de zile se șterg la scrierea unui eveniment nou (backend/audit.ts).
export const auditEvents = pgTable(
  "audit_events",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 30 }).notNull(), // ex. "accent_changed"
    detail: varchar("detail", { length: 30 }), // ex. "teal" (poate lipsi)
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  // Cardul cere ultimele evenimente ale unui utilizator
  (t) => [index("audit_events_user_time_idx").on(t.userId, t.createdAt)]
);
