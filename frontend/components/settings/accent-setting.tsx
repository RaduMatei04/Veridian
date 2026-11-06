"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Check, Palette } from "lucide-react";
import { RippleButton } from "@/frontend/components/ripple-button";
import { SettingsSection } from "@/frontend/components/settings/settings-section";
import { StatusMessage } from "@/frontend/components/settings/status-message";
import { AUDIT_KEY } from "@/frontend/hooks/use-audit";
import { CURRENT_USER_KEY, type CurrentUser } from "@/frontend/hooks/use-current-user";
import { useStatus } from "@/frontend/hooks/use-status";
import { useTranslation } from "@/frontend/hooks/use-translation";
import { ACCENTS, type Accent } from "@/frontend/lib/accent";
import { saveUser } from "@/frontend/lib/user-api";
import { cn } from "@/frontend/lib/utils";

export function AccentSetting({ user }: { user: CurrentUser }) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [status, setStatus] = useStatus();

  async function choose(accent: Accent) {
    if (accent === user.accent) return;
    setStatus(null);

    // 1. Oprim o eventuală recitire a utilizatorului aflată în curs,
    //    ca să nu ne suprascrie schimbarea cu valoarea veche
    await queryClient.cancelQueries({ queryKey: CURRENT_USER_KEY });
    // 2. Schimbăm imediat datele ținute minte → PreferencesSync aplică noua culoare
    queryClient.setQueryData(CURRENT_USER_KEY, { ...user, accent });
    // 3. Salvăm în baza de date
    const result = await saveUser("/api/settings", { accent });
    if (result.user) {
      // 4a. Succes: păstrăm ce a confirmat serverul
      queryClient.setQueryData(CURRENT_USER_KEY, result.user);
      queryClient.invalidateQueries({ queryKey: AUDIT_KEY }); // notificările se reîncarcă
    } else {
      // 4b. Eroare: revenim la culoarea veche
      queryClient.setQueryData(CURRENT_USER_KEY, user);
      setStatus({ type: "error", text: t.errors[result.errorCode] });
    }
  }

  return (
    <SettingsSection icon={Palette} title={t.settings.accentTitle} description={t.settings.accentDescription}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {ACCENTS.map((accent) => {
          const selected = accent.id === user.accent;
          return (
            <RippleButton
              key={accent.id}
              type="button"
              onClick={() => choose(accent.id)}
              aria-pressed={selected}
              className={cn(
                "flex items-center gap-3 rounded-xl border border-border p-3 text-left text-sm font-medium transition-colors",
                "hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                selected && "border-transparent ring-2 ring-primary"
              )}
            >
              {/* Mostra de culoare: valoarea hex vine din lista ACCENTS (accent.ts) */}
              <span className="size-7 shrink-0 rounded-full" style={{ backgroundColor: accent.hex }} />
              {/* Numele culorii, tradus (ex. Blue / Albastru) */}
              <span className="flex-1">{t.settings.accents[accent.id]}</span>
              {selected && <Check className="size-4 text-primary" />}
            </RippleButton>
          );
        })}
      </div>
      <StatusMessage status={status} />
    </SettingsSection>
  );
}
