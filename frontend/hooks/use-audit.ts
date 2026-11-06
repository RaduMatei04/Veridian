import { useQuery } from "@tanstack/react-query";
import type { AuditEvent } from "@/backend/audit";

// Cheia sub care TanStack Query ține minte notificările.
// După o salvare în Settings / Profile, componentele o marchează ca expirată (invalidateQueries),
// ca la revenirea pe Home să apară și evenimentul nou.
export const AUDIT_KEY = ["audit"];

// Prin JSON, data evenimentului ajunge ca text ("2026-11-06T12:30:00.000Z"), nu ca Date
type AuditEventJson = Omit<AuditEvent, "createdAt"> & { createdAt: string };

// Cere ultimele 8 evenimente ale utilizatorului de la GET /api/audit.
export function useAudit() {
  return useQuery({
    queryKey: AUDIT_KEY,
    queryFn: async (): Promise<AuditEventJson[]> => {
      const res = await fetch("/api/audit");
      if (!res.ok) throw new Error("Could not load notifications");
      return res.json();
    },
  });
}
