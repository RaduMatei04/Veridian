"use client";

import { Bell, BellOff, Database, FileText, LogIn, Palette, User } from "lucide-react";
import { CurrentUsername } from "@/frontend/components/current-username";
import { Avatar, AvatarFallback } from "@/frontend/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/components/ui/card";
import { useCurrentUser } from "@/frontend/hooks/use-current-user";
import { useTranslation } from "@/frontend/hooks/use-translation";

// Date simulate pentru cardul de notificări (textele vin din dicționar).
// Vor fi înlocuite cu GET /api/audit după crearea tabelului audit_events.
const MOCK_EVENTS = [
  { id: 1, icon: LogIn, text: "login", time: "minutes" },
  { id: 2, icon: Palette, text: "accent", time: "hours" },
  { id: 3, icon: Database, text: "import", time: "yesterday" },
] as const;

export function HomeView() {
  const { t } = useTranslation();
  // Descrierea setată în Profile (textul utilizatorului, nu se traduce)
  const description = useCurrentUser().data?.description.trim();
  // Listă obișnuită (poate fi și goală când vor veni datele reale)
  const events: readonly (typeof MOCK_EVENTS)[number][] = MOCK_EVENTS;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
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
          {events.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <BellOff className="size-8 text-muted-foreground" />
              <p className="font-medium">{t.home.noNotifications}</p>
              <p className="text-sm text-muted-foreground">{t.home.noNotificationsHint}</p>
            </div>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {events.map((event) => (
                <li key={event.id} className="flex items-center gap-3 py-3">
                  <event.icon className="size-5 text-muted-foreground" />
                  <span className="flex-1 text-sm">{t.home.mockEvents[event.text]}</span>
                  <span className="text-xs text-muted-foreground">{t.home.mockTimes[event.time]}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
