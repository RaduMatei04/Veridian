import { NextResponse } from "next/server";
import { getUser } from "@/auth/session";
import { listStations } from "@/backend/stations";

// GET /api/stations: lista stațiilor (pagina Stations). Fără parametri, deci fără validare Zod.
export async function GET() {
  const session = await getUser();
  if (!session) {
    return NextResponse.json({ error: "Not logged in.", code: "not_logged_in" }, { status: 401 });
  }

  return NextResponse.json(await listStations());
}
