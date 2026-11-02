"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useCurrentUser } from "@/frontend/hooks/use-current-user";
import { setAccent, type Accent } from "@/frontend/lib/accent";

// Aplică tema și accentul salvate în contul utilizatorului (din baza de date).
// Așa preferințele se păstrează pe orice dispozitiv, după login.
// Nu afișează nimic.
export function PreferencesSync() {
  const { data: user } = useCurrentUser();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (!user) return;
    if (theme !== user.theme) setTheme(user.theme);
    if (document.documentElement.dataset.accent !== user.accent) setAccent(user.accent as Accent);
  }, [user, theme, setTheme]);

  return null;
}
