"use client";

import { UserRound } from "lucide-react";
import { PageHeader, UserLoader } from "@/frontend/components/page-header";
import { DescriptionSetting } from "@/frontend/components/profile/description-setting";
import { UsernameSetting } from "@/frontend/components/profile/username-setting";
import { useTranslation } from "@/frontend/hooks/use-translation";

// Pagina Profile: titlu în accent, apoi Change username → Description.
export function ProfileView() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-4/5">
      <PageHeader icon={UserRound} title={t.profile.title} />
      <UserLoader>
        {(user) => (
          <div className="flex flex-col gap-10">
            <UsernameSetting user={user} />
            <DescriptionSetting user={user} />
          </div>
        )}
      </UserLoader>
    </div>
  );
}
