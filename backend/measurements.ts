import { and, avg, eq, inArray, max, min, sql, type SQL } from "drizzle-orm";
import { db } from "@/database/db";
import { measurements } from "@/database/schema";
import type { Period } from "@/backend/parameters";

// Rezoluția graficului se alege după perioadă, ca graficul să nu aibă zeci de mii de puncte:
// tot setul → medii săptămânale, un an → medii zilnice, o lună → valori orare.
const RESOLUTION = { all: "week", "last-month": "hour", year: "day" } as const;
export type Resolution = (typeof RESOLUTION)[keyof typeof RESOLUTION];

// Datele pentru graficul din Analytics: punctele (câte o coloană pe stație) și statisticile.
export async function getMeasurements(stationIds: number[], parameter: string, period: Period) {
  const resolution: Resolution = period === "all" || period === "last-month" ? RESOLUTION[period] : RESOLUTION.year;

  // 1. Intervalul de timp [from, to) al perioadei alese (null = fără limită)
  let from: string | null = null;
  let to: string | null = null;
  if (period === "last-month") {
    // Ultima lună cu date comună tuturor stațiilor alese: cea mai mică dintre „ultimele zile”
    const rows = await db
      .select({ last: sql<string>`to_char(max(${measurements.measuredAt}), 'YYYY-MM-DD')` })
      .from(measurements)
      .where(and(inArray(measurements.stationId, stationIds), eq(measurements.parameter, parameter)))
      .groupBy(measurements.stationId);
    if (rows.length === 0) return { resolution, from, to, points: [], stats: [] };
    const lastDay = rows.map((r) => r.last).sort()[0]; // "2022-08-31"
    const [year, month] = lastDay.split("-").map(Number);
    from = `${year}-${String(month).padStart(2, "0")}-01`;
    to = month === 12 ? `${year + 1}-01-01` : `${year}-${String(month + 1).padStart(2, "0")}-01`;
  } else if (period !== "all") {
    from = `${period}-01-01`;
    to = `${Number(period) + 1}-01-01`;
  }

  const filters: SQL[] = [inArray(measurements.stationId, stationIds), eq(measurements.parameter, parameter)];
  // Comparăm cu text ("2021-01-01"), nu cu Date, ca fusul orar să nu mute limitele
  if (from && to) {
    filters.push(sql`${measurements.measuredAt} >= ${from}::timestamp`, sql`${measurements.measuredAt} < ${to}::timestamp`);
  }
  const where = and(...filters);

  // 2. Mediile pe săptămână / zi / oră. sql.raw e sigur aici: rezoluția vine din lista fixă de mai sus.
  //    to_char trimite timpul ca text, ca să nu fie mutat de fusul orar.
  const bucket = sql`date_trunc(${sql.raw(`'${resolution}'`)}, ${measurements.measuredAt})`;
  const rows = await db
    .select({
      stationId: measurements.stationId,
      time: sql<string>`to_char(${bucket}, 'YYYY-MM-DD"T"HH24:MI')`,
      value: sql<number>`round(avg(${measurements.value})::numeric, 2)::float8`,
    })
    .from(measurements)
    .where(where)
    .groupBy(measurements.stationId, bucket)
    .orderBy(bucket);

  // Un rând pe moment de timp, cu câte o coloană pe stație: { time, s1: 12.3, s2: 9.8 }
  const byTime = new Map<string, Record<string, string | number>>();
  for (const row of rows) {
    const point = byTime.get(row.time) ?? { time: row.time };
    point[`s${row.stationId}`] = row.value;
    byTime.set(row.time, point);
  }

  // 3. Media, minimul și maximul valorilor orare din perioadă, pentru fiecare stație (2 zecimale)
  const stats = await db
    .select({
      stationId: measurements.stationId,
      avg: sql<number>`round(${avg(measurements.value)}::numeric, 2)::float8`,
      min: sql<number>`round(${min(measurements.value)}::numeric, 2)::float8`,
      max: sql<number>`round(${max(measurements.value)}::numeric, 2)::float8`,
    })
    .from(measurements)
    .where(where)
    .groupBy(measurements.stationId);

  return { resolution, from, to, points: [...byTime.values()], stats };
}

export type MeasurementsResponse = Awaited<ReturnType<typeof getMeasurements>>;
