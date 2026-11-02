import type { CurrentUser } from "@/frontend/hooks/use-current-user";
import type { ErrorCode } from "@/frontend/lib/i18n";

// Trimite modificări la API (PUT) și întoarce utilizatorul actualizat sau codul erorii.
// Codul (ex. "username_taken") se traduce în componentă: t.errors[code].
export async function saveUser(
  url: "/api/profile" | "/api/settings",
  changes: Partial<Pick<CurrentUser, "username" | "description" | "theme" | "accent" | "language">>
): Promise<{ user: CurrentUser | null; errorCode: ErrorCode }> {
  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(changes),
    });
    const data = await res.json();
    if (!res.ok) return { user: null, errorCode: data.code ?? "generic" };
    return { user: data, errorCode: "generic" };
  } catch {
    return { user: null, errorCode: "network" };
  }
}
