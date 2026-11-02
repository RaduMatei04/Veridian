"use client";

import { CalendarRange, Cpu, LoaderCircle, MapPin, RadioTower } from "lucide-react";
import type { StationsResponse } from "@/backend/stations";
import { PageHeader } from "@/frontend/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/components/ui/card";
import { useStations } from "@/frontend/hooks/use-stations";
import { useTranslation } from "@/frontend/hooks/use-translation";

type Station = StationsResponse["stations"][number];

// Pagina Stations: titlu, un rând despre sursa datelor, apoi câte un card pe stație.
export function StationsView() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useStations();

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-4/5">
      <div className="flex flex-col gap-2">
        <PageHeader icon={RadioTower} title={t.stations.title} />
        {data && data.stations.length > 0 && (
          <p className="text-muted-foreground">{t.stations.summary(data.stations.length, data.totalSensors)}</p>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" /> {t.common.loading}
        </div>
      )}

      {isError && <p className="text-destructive">{t.stations.loadError}</p>}

      {/* Stare goală: baza de date nu are încă stații */}
      {data && data.stations.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <RadioTower className="size-8 text-muted-foreground" />
          <p className="font-medium">{t.stations.empty}</p>
          <p className="text-sm text-muted-foreground">{t.stations.emptyHint}</p>
        </div>
      )}

      {data?.stations.map((station) => <StationCard key={station.id} station={station} />)}
    </div>
  );
}

function StationCard({ station }: { station: Station }) {
  const { t, language } = useTranslation();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <RadioTower className="size-5" />
        </span>
        <CardTitle>{station.name}</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 text-sm">
        <InfoRow icon={MapPin}>
          {station.city} · {t.stations.types[station.type] ?? station.type} · {station.lat.toFixed(4)},{" "}
          {station.lon.toFixed(4)}
        </InfoRow>
        <InfoRow icon={CalendarRange}>
          {formatMonth(station.firstDay, language)} – {formatMonth(station.lastDay, language)}
        </InfoRow>
        <InfoRow icon={Cpu}>{t.stations.sensorCount(station.sensorCount)}</InfoRow>

        {/* Parametrii măsurați, ca etichete mici */}
        <ul className="flex flex-wrap gap-2 pt-1">
          {station.parameters.map((parameter) => (
            <li key={parameter} className="rounded-md bg-muted px-2 py-1 text-xs font-medium">
              {t.parameters[parameter] ?? parameter}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

// Un rând de informații: pictogramă gri + text
function InfoRow({ icon: Icon, children }: { icon: typeof MapPin; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <span>{children}</span>
    </p>
  );
}

// "2019-12-10" → "Dec 2019" (en) sau "dec. 2019" (ro), fără biblioteci
function formatMonth(day: string, language: string) {
  const [year, month] = day.split("-").map(Number);
  return new Intl.DateTimeFormat(language, { month: "short", year: "numeric" }).format(new Date(year, month - 1));
}
