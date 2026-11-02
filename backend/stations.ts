import { countDistinct, sql } from "drizzle-orm";
import { db } from "@/database/db";
import { measurements, sensorDaily, sensors, stations } from "@/database/schema";
import { PARAMETERS, type Parameter } from "@/backend/parameters";

// Ordinea parametrilor pe card: cea din backend/parameters.ts (PM2.5, PM10, NO, NO2...)
const PARAMETER_ORDER = Object.keys(PARAMETERS);

// Lista stațiilor pentru pagina Stations: date de bază, perioada măsurătorilor,
// parametrii măsurați și câți senzori comerciali au funcționat acolo.
export async function listStations() {
  // 1. Stațiile + prima / ultima zi și parametrii din valorile de referință.
  //    to_char trimite data ca text "YYYY-MM-DD", ca să nu fie mutată de fusul orar.
  const rows = await db
    .select({
      id: stations.id,
      name: stations.name,
      city: stations.city,
      type: stations.type,
      lat: stations.lat,
      lon: stations.lon,
      firstDay: sql<string>`to_char(min(${measurements.measuredAt}), 'YYYY-MM-DD')`,
      lastDay: sql<string>`to_char(max(${measurements.measuredAt}), 'YYYY-MM-DD')`,
      parameters: sql<string[]>`array_agg(distinct ${measurements.parameter})`,
    })
    .from(stations)
    .innerJoin(measurements, sql`${measurements.stationId} = ${stations.id}`)
    .groupBy(stations.id)
    .orderBy(stations.city);

  // 2. Câți senzori distincți au trimis date la fiecare stație
  const sensorCounts = await db
    .select({ stationId: sensorDaily.stationId, count: countDistinct(sensorDaily.sensorId) })
    .from(sensorDaily)
    .groupBy(sensorDaily.stationId);

  // 3. Totalul senzorilor (unii s-au mutat între orașe, deci nu adunăm cifrele de mai sus)
  const [{ total }] = await db.select({ total: sql<number>`count(*)::int` }).from(sensors);

  return {
    stations: rows.map((station) => ({
      ...station,
      parameters: [...station.parameters].sort(
        (a, b) => PARAMETER_ORDER.indexOf(a) - PARAMETER_ORDER.indexOf(b)
      ) as Parameter[],
      sensorCount: sensorCounts.find((c) => c.stationId === station.id)?.count ?? 0,
    })),
    totalSensors: total,
  };
}

export type StationsResponse = Awaited<ReturnType<typeof listStations>>;
