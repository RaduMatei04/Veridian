"use client";

import dynamic from "next/dynamic";
import { LoaderCircle, Map as MapIcon } from "lucide-react";
import { PageHeader } from "@/frontend/components/page-header";
import { Card } from "@/frontend/components/ui/card";
import { useStations } from "@/frontend/hooks/use-stations";
import { useTranslation } from "@/frontend/hooks/use-translation";

// Leaflet are nevoie de `window`, deci harta se încarcă doar în browser (fără SSR)
const StationsMap = dynamic(() => import("@/frontend/components/map/stations-map"), { ssr: false });

// Pagina Map: titlu, apoi harta cu stațiile într-un card mare.
export function MapView() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useStations();

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-4/5">
      <PageHeader icon={MapIcon} title={t.map.title} />

      {/* isolate: z-index-urile Leaflet rămân în card și nu acoperă meniul de pe telefon */}
      <Card className="map-card isolate h-[70svh] p-0">
        {isLoading && (
          <div className="flex size-full items-center justify-center gap-2 text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" /> {t.common.loading}
          </div>
        )}
        {isError && (
          <div className="flex size-full items-center justify-center text-destructive">{t.stations.loadError}</div>
        )}
        {data && <StationsMap stations={data.stations} />}
      </Card>
    </div>
  );
}
