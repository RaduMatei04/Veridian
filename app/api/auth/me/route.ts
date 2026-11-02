import { NextResponse } from "next/server";
import { getUser } from "@/auth/session";
import { findUserById } from "@/backend/users";

// GET /api/auth/me: utilizatorul curent (nume, descriere, temă, accent, limbă), fără hash-ul parolei
export async function GET() {
  const session = await getUser();
  if (!session) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const user = await findUserById(session.userId);
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }
  return NextResponse.json(user);
}
