import { and, desc, eq, lt, sql } from "drizzle-orm";
import { db } from "@/database/db";
import { auditEvents } from "@/database/schema";

// Tipurile de evenimente din jurnal. Textul fiecăruia e în dicționar (t.home.events[type]).
export const EVENT_TYPES = [
  "login",
  "logout",
  "theme_changed",
  "accent_changed",
  "language_changed",
  "username_changed",
  "description_changed",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

// Scrie un eveniment pentru utilizator, apoi șterge evenimentele lui mai vechi de 30 de zile.
export async function logEvent(userId: number, type: EventType, detail?: string) {
  await db.insert(auditEvents).values({ userId, type, detail });
  await db
    .delete(auditEvents)
    .where(and(eq(auditEvents.userId, userId), lt(auditEvents.createdAt, sql`now() - interval '30 days'`)));
}

// Ultimele evenimente ale utilizatorului, cele mai noi primele (cardul Notifications de pe Home).
export async function listEvents(userId: number, limit = 8) {
  return db
    .select({
      id: auditEvents.id,
      type: auditEvents.type,
      detail: auditEvents.detail,
      createdAt: auditEvents.createdAt,
    })
    .from(auditEvents)
    .where(eq(auditEvents.userId, userId))
    .orderBy(desc(auditEvents.createdAt), desc(auditEvents.id))
    .limit(limit);
}

export type AuditEvent = Awaited<ReturnType<typeof listEvents>>[number];
