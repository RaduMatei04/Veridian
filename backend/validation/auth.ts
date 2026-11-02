import { z } from "zod";

// Regula pentru username, folosită la înregistrare și la schimbarea din Settings.
export const usernameSchema = z
  .string()
  .trim()
  .min(3)
  .max(30)
  .regex(/^[a-zA-Z0-9_.-]+$/); // litere, cifre și _ . -

// Ce trebuie să trimită formularul de login.
export const loginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});

// Reguli pentru un cont nou.
export const registerSchema = z.object({
  username: usernameSchema,
  password: z.string().min(8).max(72), // bcrypt folosește doar primii 72 de bytes
});
