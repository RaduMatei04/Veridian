"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Check, Languages } from "lucide-react";
import { RippleButton } from "@/frontend/components/ripple-button";
import { SettingsSection } from "@/frontend/components/settings/settings-section";
import { StatusMessage } from "@/frontend/components/settings/status-message";
import { AUDIT_KEY } from "@/frontend/hooks/use-audit";
import { CURRENT_USER_KEY, type CurrentUser } from "@/frontend/hooks/use-current-user";
import { useStatus } from "@/frontend/hooks/use-status";
import { useTranslation } from "@/frontend/hooks/use-translation";
import { LANGUAGES, type Language } from "@/frontend/lib/i18n";
import { saveUser } from "@/frontend/lib/user-api";
import { cn } from "@/frontend/lib/utils";

export function LanguageSetting({ user }: { user: CurrentUser }) {
  const queryClient = useQueryClient();
  const { t, language: current } = useTranslation();
  const [status, setStatus] = useStatus();

  // Același mecanism ca la temă și accent: schimbăm cache-ul → toate textele
  // care folosesc useTranslation() trec imediat în noua limbă, apoi salvăm.
  async function choose(language: Language) {
    if (language === current) return;
    setStatus(null);

    await queryClient.cancelQueries({ queryKey: CURRENT_USER_KEY });
    queryClient.setQueryData(CURRENT_USER_KEY, { ...user, language });
    const result = await saveUser("/api/settings", { language });
    if (result.user) {
      queryClient.setQueryData(CURRENT_USER_KEY, result.user);
      queryClient.invalidateQueries({ queryKey: AUDIT_KEY }); // notificările se reîncarcă
    } else {
      queryClient.setQueryData(CURRENT_USER_KEY, user);
      setStatus({ type: "error", text: t.errors[result.errorCode] });
    }
  }

  return (
    <SettingsSection icon={Languages} title={t.settings.languageTitle} description={t.settings.languageDescription}>
      <div className="grid grid-cols-2 gap-3">
        {LANGUAGES.map((language) => {
          const selected = language.id === current;
          return (
            <RippleButton
              key={language.id}
              type="button"
              onClick={() => choose(language.id)}
              aria-pressed={selected}
              className={cn(
                "flex items-center gap-3 rounded-xl border border-border p-3 text-left text-sm font-medium transition-colors",
                "hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                selected && "border-transparent text-primary ring-2 ring-primary"
              )}
            >
              {/* Codul limbii într-un pătrățel (EN / RO) */}
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-bold uppercase text-muted-foreground">
                {language.id}
              </span>
              {/* Numele limbii rămâne în limba ei (English / Română) */}
              <span className="flex-1">{language.label}</span>
              {selected && <Check className="size-4" />}
            </RippleButton>
          );
        })}
      </div>
      <StatusMessage status={status} />
    </SettingsSection>
  );
}
