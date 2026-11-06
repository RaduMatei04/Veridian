import { NextResponse } from "next/server";
import { clearSessionCookie, getUser } from "@/auth/session";
import { logEvent } from "@/backend/audit";

// POST /api/auth/logout: șterge cookie-ul (preferințele rămân salvate în baza de date)
export async function POST() {
  // Citim utilizatorul înainte să ștergem cookie-ul, ca să notăm logout-ul în jurnalul lui
  const session = await getUser();
  if (session) await logEvent(session.userId, "logout");

  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
