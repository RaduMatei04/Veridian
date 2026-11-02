// Încarcă setul QUANT (CSV-urile din data/quant/) în Neon.
// Rulare: npm run seed
//
// Scriptul se poate rula de mai multe ori: întâi golește tabelele, apoi le umple din nou.
// CSV-urile se citesc linie cu linie, ca să nu încărcăm sute de MB în memorie.
import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { neon } from "@neondatabase/serverless";

process.loadEnvFile(".env.local"); // citește DATABASE_URL
const sql = neon(process.env.DATABASE_URL);

const REFERENCE_CSV = "data/quant/QUANT_Reference_hourly.csv";
const SENSORS_CSV = "data/quant/QUANT_SensorSystems_hourly.csv";
const BATCH_SIZE = 20000; // câte rânduri trimitem într-o singură cerere

// Cele 3 situri. Fișierele nu au coordonate, deci le scriem aici (surse oficiale):
// London: CEDA / Lewisham, Manchester: articolul AMT 2024 (supliment), York: UK-AIR YK11.
const STATIONS = [
  { city: "London", name: "London Honor Oak Park (LAQS)", type: "urban background", lat: 51.449674, lon: -0.037418 },
  { city: "Manchester", name: "Manchester Air Quality Supersite", type: "urban background", lat: 53.4442, lon: -2.2144 },
  { city: "York", name: "York Fishergate", type: "urban traffic", lat: 53.951889, lon: -1.075861 },
];

// Citește un CSV și apelează onRow(obiect) pentru fiecare rând
async function readCsv(file, onRow) {
  const lines = createInterface({ input: createReadStream(file), crlfDelay: Infinity });
  let header;
  for await (const line of lines) {
    // Coloanele de care avem nevoie nu conțin virgule, deci un split simplu e suficient
    const values = line.split(",");
    if (!header) {
      header = values;
      continue;
    }
    onRow(Object.fromEntries(header.map((name, i) => [name, values[i]])));
  }
}

// Trimite rândurile în grupuri. Fiecare coloană pleacă ca un array, iar unnest() le transformă în rânduri.
async function insertInBatches(rows, insert) {
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    await insert(rows.slice(i, i + BATCH_SIZE));
    process.stdout.write(`\r  ${Math.min(i + BATCH_SIZE, rows.length)} / ${rows.length}`);
  }
  process.stdout.write("\n");
}

// Senzorii raportează presiunea în unități diferite: Arisense în Pa (~101000), Praxis în kPa (~101),
// restul în hPa (~1010). O aducem pe toată la hPa, ca la stațiile de referință.
function toHectopascal(value) {
  if (value > 10000) return value / 100; // Pa → hPa
  if (value < 200) return value * 10; // kPa → hPa
  return value;
}

// Limitele valorilor posibile fizic. Unele valori "out-of-box" ale senzorilor sunt mult în afara lor
// (ex. NO2 -502044 ppb, temperatură 2120 °C) și ar strica mediile, deci le ignorăm.
const LIMITS = {
  NO: [-5, 1000], // ppb
  NO2: [-5, 1000],
  O3: [-5, 1000],
  PM10: [-5, 1000], // µg/m³
  "PM2.5": [-5, 1000],
  Temperature: [-40, 60], // °C
};
function isImpossible(parameter, value) {
  const limits = LIMITS[parameter];
  return limits !== undefined && (value < limits[0] || value > limits[1]);
}

// 1. Golim tabelele (în ordinea inversă a legăturilor dintre ele)
console.log("Golesc tabelele...");
await sql`TRUNCATE sensor_daily, measurements, sensors, stations RESTART IDENTITY`;

// 2. Stațiile
const stationRows = await sql`
  INSERT INTO stations (city, name, type, lat, lon)
  SELECT * FROM unnest(
    ${STATIONS.map((s) => s.city)}::text[], ${STATIONS.map((s) => s.name)}::text[],
    ${STATIONS.map((s) => s.type)}::text[], ${STATIONS.map((s) => s.lat)}::float8[],
    ${STATIONS.map((s) => s.lon)}::float8[]
  )
  RETURNING id, city
`;
const stationId = Object.fromEntries(stationRows.map((s) => [s.city, s.id])); // { London: 1, ... }
console.log("Stații:", stationRows.length);

// 3. Valorile orare de referință (Ratified și Unratified)
// Presiunea de la York e greșită în sursă (584–997 hPa la nivelul mării), deci nu o importăm.
console.log("Citesc valorile de referință...");
const reference = [];
let skipped = 0;
await readCsv(REFERENCE_CSV, (r) => {
  const value = Number(r.measurement);
  if (r.location === "York" && r.measurand === "Pressure") return;
  if (isImpossible(r.measurand, value)) return skipped++;
  reference.push([stationId[r.location], r.time, r.measurand, value]);
});
console.log("Valori imposibile ignorate:", skipped);
console.log("Inserez valorile de referință:");
await insertInBatches(reference, (batch) => sql`
  INSERT INTO measurements (station_id, measured_at, parameter, value)
  SELECT * FROM unnest(
    ${batch.map((r) => r[0])}::int[], ${batch.map((r) => r[1])}::timestamp[],
    ${batch.map((r) => r[2])}::text[], ${batch.map((r) => r[3])}::real[]
  )
`);

// 4. Senzorii: media pe zi pentru fiecare senzor, stație și parametru.
// Păstrăm doar valorile "out-of-box"; la PurpleAir, PM-ul există doar ca "atmospheric" / "indoor",
// iar pentru aer exterior folosim "atmospheric". Dacă un aparat are mai mulți senzori
// (sensornumber 1, 2, 3), valorile lor intră în aceeași medie.
console.log("Citesc valorile senzorilor (fișier mare, durează puțin)...");
skipped = 0;
const daily = new Map(); // "senzor|oraș|zi|parametru" → { sum, count }
await readCsv(SENSORS_CSV, (r) => {
  if (r.version !== "out-of-box" && r.version !== "atmospheric") return;
  let value = Number(r.measurement);
  if (r.measurand === "Pressure") value = toHectopascal(value);
  if (isImpossible(r.measurand, value)) return skipped++;
  const key = `${r.instrument}|${r.location}|${r.time.slice(0, 10)}|${r.measurand}`;
  const day = daily.get(key) ?? { sum: 0, count: 0 };
  day.sum += value;
  day.count += 1;
  daily.set(key, day);
});
console.log("Valori imposibile ignorate:", skipped);

// Lista de senzori (codurile unice)
const codes = [...new Set([...daily.keys()].map((key) => key.split("|")[0]))].sort();
const sensorRows = await sql`
  INSERT INTO sensors (code) SELECT * FROM unnest(${codes}::text[]) RETURNING id, code
`;
const sensorId = Object.fromEntries(sensorRows.map((s) => [s.code, s.id]));
console.log("Senzori:", sensorRows.length);

const sensorValues = [...daily.entries()].map(([key, { sum, count }]) => {
  const [code, city, day, parameter] = key.split("|");
  return [sensorId[code], stationId[city], day, parameter, sum / count];
});
console.log("Inserez mediile zilnice ale senzorilor:");
await insertInBatches(sensorValues, (batch) => sql`
  INSERT INTO sensor_daily (sensor_id, station_id, day, parameter, value)
  SELECT * FROM unnest(
    ${batch.map((r) => r[0])}::int[], ${batch.map((r) => r[1])}::int[], ${batch.map((r) => r[2])}::date[],
    ${batch.map((r) => r[3])}::text[], ${batch.map((r) => r[4])}::real[]
  )
`);

console.log("Gata.");
