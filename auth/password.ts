import "server-only";
import bcrypt from "bcryptjs";

// Transformă parola într-un hash (cu „sare” aleatorie, 10 runde).
export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

// Verifică dacă parola introdusă corespunde hash-ului salvat.
export function checkPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
