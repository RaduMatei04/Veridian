import { z } from "zod";
import { ACCENTS } from "@/frontend/lib/accent";
import { usernameSchema } from "./auth";

// PUT /api/profile: se poate trimite doar username-ul, doar descrierea, sau ambele.
export const profileSchema = z
  .object({
    username: usernameSchema.optional(),
    description: z.string().trim().max(300).optional(),
  })
  .refine((data) => data.username !== undefined || data.description !== undefined, {
    message: "Nothing to update.",
  });

// PUT /api/settings: tema, accentul și/sau limba.
// Lista de accente vine din frontend/lib/accent.ts, ca să nu fie scrisă de două ori.
const accentIds = ACCENTS.map((a) => a.id) as [string, ...string[]];

export const settingsSchema = z
  .object({
    theme: z.enum(["light", "dark"]).optional(),
    accent: z.enum(accentIds).optional(),
    language: z.enum(["en", "ro"]).optional(),
  })
  .refine((data) => data.theme !== undefined || data.accent !== undefined || data.language !== undefined, {
    message: "Nothing to update.",
  });
