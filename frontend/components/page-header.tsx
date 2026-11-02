"use client";

import { LoaderCircle, type LucideIcon } from "lucide-react";
import { useCurrentUser, type CurrentUser } from "@/frontend/hooks/use-current-user";
import { useTranslation } from "@/frontend/hooks/use-translation";

// Titlul unei pagini: pictogramă + text, în culoarea de accent.
export function PageHeader({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <header className="flex items-center gap-3">
      <Icon className="size-8 text-primary" />
      <h1 className="text-3xl font-bold tracking-tight text-primary">{title}</h1>
    </header>
  );
}

// Așteaptă datele utilizatorului: arată „Se încarcă...” sau o eroare,
// iar când datele au venit, afișează conținutul primit.
export function UserLoader({ children }: { children: (user: CurrentUser) => React.ReactNode }) {
  const { data: user, isLoading, isError } = useCurrentUser();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <LoaderCircle className="size-4 animate-spin" /> {t.common.loading}
      </div>
    );
  }
  if (isError || !user) {
    return <p className="text-destructive">{t.common.loadError}</p>;
  }
  return children(user);
}
