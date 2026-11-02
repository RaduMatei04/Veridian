"use client";

import { useTranslation } from "@/frontend/hooks/use-translation";

// Pagină de completat (Map, Analytics, Stations): titlu + „Pagină în lucru”.
export function PlaceholderPage({ page }: { page: "map" | "analytics" | "stations" }) {
  const { t } = useTranslation();

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="text-2xl font-semibold">{t.pages[page]}</h1>
      <p className="mt-2 text-muted-foreground">{t.pages.workInProgress}</p>
    </div>
  );
}
