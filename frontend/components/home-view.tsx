"use client";

import {
  Bell,
  BellOff,
  FileText,
  Languages,
  LoaderCircle,
  LogIn,
  LogOut,
  Palette,
  SunMoon,
  User,
  UserPen,
  type LucideIcon,
} from "lucide-react";
import { CurrentUsername } from "@/frontend/components/current-username";
import { Avatar, AvatarFallback } from "@/frontend/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/components/ui/card";
import { useAudit } from "@/frontend/hooks/use-audit";
import { useCurrentUser } from "@/frontend/hooks/use-current-user";
import { useTranslation } from "@/frontend/hooks/use-translation";
import { formatDateTime, formatRelative } from "@/frontend/lib/format";
import { LANGUAGES } from "@/frontend/lib/i18n";

// Pictograma fiecărui tip de eveniment din jurnal (tipurile sunt în backend/audit.ts)
const EVENT_ICONS: Record<string, LucideIcon> = {
  login: LogIn,
  logout: LogOut,
  theme_changed: SunMoon,
  accent_changed: Palette,
  language_changed: Languages,
  username_changed: UserPen,
  description_changed: FileText,
};

export function HomeView() {
  const { t, language } = useTranslation();
  // Descrierea setată în Profile (textul utilizatorului, nu se traduce)
  const description = useCurrentUser().data?.description.trim();
  // Ultimele 8 evenimente ale utilizatorului (GET /api/audit)
  const { data: events, isLoading, isError } = useAudit();

  // Valoarea nouă din eveniment, tradusă: "teal" → "Teal" / "Turcoaz", "dark" → "Dark" / "Întunecată"
  function eventValue(type: string, detail: string | null) {
    if (!detail) return "";
    if (type === "theme_changed") return t.settings[detail as "light" | "dark"] ?? detail;
    if (type === "accent_changed") return t.settings.accents[detail as keyof typeof t.settings.accents] ?? detail;
    if (type === "language_changed") return LANGUAGES.find((l) => l.id === detail)?.label ?? detail;
    return detail; // username-ul nou rămâne cum l-a scris utilizatorul
  }

  return (
    // Aceeași lățime ca la celelalte pagini: 80% pe ecrane mari, toată lățimea pe telefon
    <div className="mx-auto flex w-full flex-col gap-10 md:w-4/5">
      {/* Card de salut */}
      <Card>
        <CardContent className="flex items-center gap-4">
          <Avatar className="size-12">
            <AvatarFallback className="bg-primary text-primary-foreground">
              <User className="size-6" />
            </AvatarFallback>
          </Avatar>
          <p className="text-lg">
            {t.home.welcomePrefix}
            <CurrentUsername /> !
          </p>
        </CardContent>
      </Card>

      {/* Card „Despre mine”: descrierea din Profile. Apare doar dacă utilizatorul are una. */}
      {description && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <FileText className="size-5" />
            </span>
            <CardTitle>{t.home.aboutMe}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* whitespace-pre-line păstrează rândurile noi; break-words rupe cuvintele foarte lungi */}
            <p className="text-sm whitespace-pre-line break-words">{description}</p>
          </CardContent>
        </Card>
      )}

      {/* Card Notificări (jurnal de audit) */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Bell className="size-5" />
          </span>
          <CardTitle>{t.home.notifications}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" /> {t.common.loading}
            </div>
          )}
          {isError && <p className="text-sm text-destructive">{t.home.loadNotificationsError}</p>}

          {events && events.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <BellOff className="size-8 text-muted-foreground" />
              <p className="font-medium">{t.home.noNotifications}</p>
              <p className="text-sm text-muted-foreground">{t.home.noNotificationsHint}</p>
            </div>
          )}

          {events && events.length > 0 && (
            <ul className="flex flex-col divide-y divide-border">
              {events.map((event) => {
                const Icon = EVENT_ICONS[event.type] ?? Bell;
                return (
                  <li key={event.id} className="flex items-center gap-3 py-3">
                    <Icon className="size-5 shrink-0 text-muted-foreground" />
                    <span className="flex-1 text-sm">
                      {t.home.events[event.type]?.(eventValue(event.type, event.detail)) ?? event.type}
                    </span>
                    {/* Timp relativ („acum 5 minute”); data exactă apare la hover */}
                    <time
                      dateTime={event.createdAt}
                      title={formatDateTime(event.createdAt, language)}
                      className="shrink-0 text-xs text-muted-foreground"
                    >
                      {formatRelative(event.createdAt, language)}
                    </time>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
