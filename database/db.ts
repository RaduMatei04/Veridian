import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Conexiune prin HTTP: potrivită pentru Vercel (funcții serverless, fără conexiuni persistente).
// DATABASE_URL vine din .env.local (local) sau din variabilele de mediu Vercel (producție).
export const db = drizzle(neon(process.env.DATABASE_URL!), { schema });
