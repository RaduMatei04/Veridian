import "server-only";
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "session";
export type SessionPayload = { userId: number; username: string };

// Cheia secretă din .env.local, transformată în bytes (așa o cere jose).
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

// Creează biletul: datele utilizatorului + semnătura, valabil 7 zile.
export function createToken(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

// Verifică semnătura și expirarea. Bilet modificat sau expirat → null.
export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    return { userId: payload.userId as number, username: payload.username as string };
  } catch {
    return null;
  }
}
