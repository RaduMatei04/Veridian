"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Check, Moon, Sun, SunMoon } from "lucide-react";
import { RippleButton } from "@/frontend/components/ripple-button";
import { SettingsSection } from "@/frontend/components/settings/settings-section";
import { StatusMessage } from "@/frontend/components/settings/status-message";
import { AUDIT_KEY } from "@/frontend/hooks/use-audit";
import { CURRENT_USER_KEY, type CurrentUser } from "@/frontend/hooks/use-current-user";
import { useStatus } from "@/frontend/hooks/use-status";
import { useTranslation } from "@/frontend/hooks/use-translation";
import { saveUser } from "@/frontend/lib/user-api";
import { cn } from "@/frontend/lib/utils";

const THEMES = [
  { id: "light", icon: Sun },
  { id: "dark", icon: Moon },
] as const;

export function ThemeSetting({ user }: { user: CurrentUser }) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [status, setStatus] = useStatus();

  // Același mecanism ca la accent: oprim recitirile, schimbare imediată, salvare, revenire la eroare
  async function choose(theme: string) {
    if (theme === user.theme) return;
    setStatus(null);

    await queryClient.cancelQueries({ queryKey: CURRENT_USER_KEY });
    queryClient.setQueryData(CURRENT_USER_KEY, { ...user, theme });
    const result = await saveUser("/api/settings", { theme });
    if (result.user) {
      queryClient.setQueryData(CURRENT_USER_KEY, result.user);
      queryClient.invalidateQueries({ queryKey: AUDIT_KEY }); // notificările se reîncarcă
    } else {
      queryClient.setQueryData(CURRENT_USER_KEY, user);
      setStatus({ type: "error", text: t.errors[result.errorCode] });
    }
  }

  return (
    <SettingsSection icon={SunMoon} title={t.settings.themeTitle} description={t.settings.themeDescription}>
      <div className="grid grid-cols-2 gap-3">
        {THEMES.map((theme) => {
          const selected = theme.id === user.theme;
          return (
            <RippleButton
              key={theme.id}
              type="button"
              onClick={() => choose(theme.id)}
              aria-pressed={selected}
              className={cn(
                "flex items-center gap-3 rounded-xl border border-border p-4 text-left text-sm font-medium transition-colors",
                "hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                selected && "border-transparent text-primary ring-2 ring-primary"
              )}
            >
              <theme.icon className="size-5" />
              {/* t.settings.light / t.settings.dark */}
              <span className="flex-1">{t.settings[theme.id]}</span>
              {selected && <Check className="size-4" />}
            </RippleButton>
          );
        })}
      </div>
      <StatusMessage status={status} />
    </SettingsSection>
  );
}
