import { NextResponse } from "next/server";
import { getUser } from "@/auth/session";
import { getMeasurements } from "@/backend/measurements";
import { measurementsQuerySchema } from "@/backend/validation/measurements";

// GET /api/measurements?stations=1,2,3&parameter=PM2.5&period=2021
// Datele pentru graficul din Analytics (valorile stațiilor de referință).
export async function GET(request: Request) {
  const session = await getUser();
  if (!session) {
    return NextResponse.json({ error: "Not logged in.", code: "not_logged_in" }, { status: 401 });
  }

  // Parametrii din URL (?stations=...&parameter=...&period=...)
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = measurementsQuerySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid stations, parameter or period.", code: "invalid_query" }, { status: 400 });
  }

  const { stations, parameter, period } = parsed.data;
  return NextResponse.json(await getMeasurements(stations, parameter, period));
}
