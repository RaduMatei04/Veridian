"use client";

import { Settings } from "lucide-react";
import { AccentSetting } from "@/frontend/components/settings/accent-setting";
import { LanguageSetting } from "@/frontend/components/settings/language-setting";
import { PageHeader, UserLoader } from "@/frontend/components/page-header";
import { ThemeSetting } from "@/frontend/components/settings/theme-setting";
import { useTranslation } from "@/frontend/hooks/use-translation";

// Pagina Settings: titlu în accent, apoi Accent → Theme → Language, una sub alta.
export function SettingsView() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-4/5">
      <PageHeader icon={Settings} title={t.settings.title} />
      <UserLoader>
        {(user) => (
          <div className="flex flex-col gap-6">
            <AccentSetting user={user} />
            <ThemeSetting user={user} />
            <LanguageSetting user={user} />
          </div>
        )}
      </UserLoader>
    </div>
  );
}
