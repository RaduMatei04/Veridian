import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/database/db";
import { users } from "@/database/schema";
import { checkPassword } from "@/auth/password";
import { setSessionCookie } from "@/auth/session";
import { loginSchema } from "@/backend/validation/auth";

// POST /api/auth/login: verifică parola și setează cookie-ul cu JWT
export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please fill in both fields." }, { status: 400 });
  }
  const { username, password } = parsed.data;

  const [user] = await db.select().from(users).where(eq(users.username, username));

  // Același mesaj pentru „nu există” și „parolă greșită”, ca să nu se poată ghici username-urile
  if (!user || !(await checkPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "Wrong username or password." }, { status: 401 });
  }

  await setSessionCookie({ userId: user.id, username: user.username });
  return NextResponse.json({ ok: true });
}
