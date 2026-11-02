import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/auth/session";

// POST /api/auth/logout: șterge cookie-ul (preferințele rămân salvate în baza de date)
export async function POST() {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
