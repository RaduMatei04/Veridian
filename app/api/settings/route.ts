import { NextResponse } from "next/server";
import { getUser } from "@/auth/session";
import { updateUser } from "@/backend/users";
import { settingsSchema } from "@/backend/validation/settings";

// PUT /api/settings: salvează tema, accentul și/sau limba în contul utilizatorului logat
// Erorile au și un `code`, după care frontend-ul afișează mesajul în limba aleasă.
export async function PUT(request: Request) {
  const session = await getUser();
  if (!session) {
    return NextResponse.json({ error: "Not logged in.", code: "not_logged_in" }, { status: 401 });
  }

  const parsed = settingsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid theme, accent or language.", code: "invalid_settings" }, { status: 400 });
  }

  const user = await updateUser(session.userId, parsed.data);
  if (!user) {
    return NextResponse.json({ error: "User not found.", code: "not_found" }, { status: 404 });
  }
  return NextResponse.json(user);
}
