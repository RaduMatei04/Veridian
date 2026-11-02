import { NextResponse, type NextRequest } from "next/server";
import { verifyToken, SESSION_COOKIE } from "@/auth/jwt";

// Rulează înainte de fiecare pagină din `matcher` și decide dacă utilizatorul are voie acolo.
// E prima barieră; rutele API verifică din nou cu getUser().
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const user = token ? await verifyToken(token) : null;
  const isAuthPage = pathname === "/login" || pathname === "/register";

  // Nelogat pe o pagină din aplicație → la login
  if (!user && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  // Deja logat pe login/register → în aplicație
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL("/home", request.url));
  }
  return NextResponse.next();
}

// Paginile verificate (pagina de start `/` rămâne publică)
export const config = {
  matcher: ["/home", "/map", "/analytics", "/stations", "/settings", "/profile", "/login", "/register"],
};
