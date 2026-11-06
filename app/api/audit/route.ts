import { NextResponse } from "next/server";
import { getUser } from "@/auth/session";
import { listEvents } from "@/backend/audit";

// GET /api/audit: ultimele 8 evenimente ale utilizatorului logat (cardul Notifications de pe Home)
export async function GET() {
  const session = await getUser();
  if (!session) {
    return NextResponse.json({ error: "Not logged in.", code: "not_logged_in" }, { status: 401 });
  }

  return NextResponse.json(await listEvents(session.userId));
}
