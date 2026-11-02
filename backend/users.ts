import { eq } from "drizzle-orm";
import { db } from "@/database/db";
import { users } from "@/database/schema";

// Câmpurile pe care le trimitem în frontend (fără hash-ul parolei!).
const publicFields = {
  id: users.id,
  username: users.username,
  description: users.description,
  theme: users.theme,
  accent: users.accent,
  language: users.language,
};

export async function findUserById(id: number) {
  const [user] = await db.select(publicFields).from(users).where(eq(users.id, id));
  return user ?? null;
}

export async function isUsernameTaken(username: string) {
  const rows = await db.select({ id: users.id }).from(users).where(eq(users.username, username));
  return rows.length > 0;
}

// Actualizează câmpurile primite și întoarce utilizatorul nou.
export async function updateUser(
  id: number,
  changes: { username?: string; description?: string; theme?: string; accent?: string; language?: string }
) {
  const [user] = await db.update(users).set(changes).where(eq(users.id, id)).returning(publicFields);
  return user ?? null;
}
