import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/database/db";
import { users } from "@/database/schema";
import { hashPassword } from "@/auth/password";
import { setSessionCookie } from "@/auth/session";
import { registerSchema } from "@/backend/validation/auth";

// POST /api/auth/register: creează un cont și îl loghează direct
export async function POST(request: Request) {
  // 1. Validare
  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Username: 3–30 characters (letters, digits, _ . -). Password: 8–72 characters." },
      { status: 400 }
    );
  }
  const { username, password } = parsed.data;

  // 2. Username-ul trebuie să fie liber
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.username, username));
  if (existing.length > 0) {
    return NextResponse.json({ error: "This username is already taken." }, { status: 409 });
  }

  // 3. Salvăm contul (tema și accentul primesc valorile implicite: light + blue)
  const [user] = await db
    .insert(users)
    .values({ username, passwordHash: await hashPassword(password) })
    .returning({ id: users.id, username: users.username });

  // 4. Îl logăm direct
  await setSessionCookie({ userId: user.id, username: user.username });
  return NextResponse.json({ ok: true }, { status: 201 });
}
