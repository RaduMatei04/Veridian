import "server-only";
import { cookies } from "next/headers";
import { createToken, verifyToken, SESSION_COOKIE, type SessionPayload } from "./jwt";

const SEVEN_DAYS = 60 * 60 * 24 * 7; // în secunde

// Pune biletul în cookie. httpOnly = JavaScript-ul din pagină nu îl poate citi.
export async function setSessionCookie(payload: SessionPayload) {
  const token = await createToken(payload);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // pe Vercel: doar prin HTTPS
    sameSite: "lax",
    path: "/",
    maxAge: SEVEN_DAYS,
  });
}

export async function clearSessionCookie() {
  (await cookies()).delete(SESSION_COOKIE);
}

// Utilizatorul curent (din cookie) sau null. Se folosește în rutele API protejate.
export async function getUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? verifyToken(token) : null;
}
