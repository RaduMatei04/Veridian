import { defineConfig } from "drizzle-kit";

// drizzle-kit rulează în afara Next.js, deci citim singuri .env.local (funcție din Node).
process.loadEnvFile(".env.local");

export default defineConfig({
  schema: "./database/schema.ts",
  out: "./database/migrations", // aici apar fișierele SQL generate
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
