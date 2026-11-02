import { NextResponse } from "next/server";
import { getUser, setSessionCookie } from "@/auth/session";
import { isUsernameTaken, updateUser } from "@/backend/users";
import { profileSchema } from "@/backend/validation/settings";

// PUT /api/profile: schimbă username-ul și/sau descrierea utilizatorului logat
// Erorile au și un `code`, după care frontend-ul afișează mesajul în limba aleasă.
export async function PUT(request: Request) {
  const session = await getUser();
  if (!session) {
    return NextResponse.json({ error: "Not logged in.", code: "not_logged_in" }, { status: 401 });
  }

  const parsed = profileSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Username: 3–30 characters (letters, digits, _ . -). Description: max 300 characters.",
        code: "invalid_profile",
      },
      { status: 400 }
    );
  }
  const { username, description } = parsed.data;

  // Username nou: trebuie să nu fie folosit de altcineva
  if (username !== undefined && username !== session.username && (await isUsernameTaken(username))) {
    return NextResponse.json({ error: "This username is already taken.", code: "username_taken" }, { status: 409 });
  }

  const user = await updateUser(session.userId, { username, description });
  if (!user) {
    return NextResponse.json({ error: "User not found.", code: "not_found" }, { status: 404 });
  }

  // Username-ul e și în JWT, deci emitem un bilet nou cu numele actualizat
  if (username !== undefined) {
    await setSessionCookie({ userId: user.id, username: user.username });
  }
  return NextResponse.json(user);
}
