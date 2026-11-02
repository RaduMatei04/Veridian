// Creează (sau resetează) contul demo folosit la testare și la prezentare.
// Rulare: npm run db:seed-demo
//
// Cont DOAR pentru demo: nu păstra date reale în el.
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const DEMO_USERNAME = "demo";
const DEMO_PASSWORD = "Veridian-Demo-2026";

process.loadEnvFile(".env.local"); // citește DATABASE_URL
const sql = neon(process.env.DATABASE_URL);

const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

// Dacă username-ul există deja, doar îi resetăm parola (scriptul se poate rula de mai multe ori).
const rows = await sql`
  INSERT INTO users (username, password_hash)
  VALUES (${DEMO_USERNAME}, ${passwordHash})
  ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash
  RETURNING id, username, theme, accent
`;

console.log("Cont demo gata:", rows[0]);
