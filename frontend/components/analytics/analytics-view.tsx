"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChartLine, LoaderCircle } from "lucide-react";
import { PARAMETERS, PERIODS, type Parameter, type Period } from "@/backend/parameters";
import { MeasurementsChart } from "@/frontend/components/analytics/measurements-chart";
import { PageHeader } from "@/frontend/components/page-header";
import { Card, CardContent } from "@/frontend/components/ui/card";
import { useStations } from "@/frontend/hooks/use-stations";
import { useTranslation } from "@/frontend/hooks/use-translation";
import { cn } from "@/frontend/lib/utils";

const PARAMETER_NAMES = Object.keys(PARAMETERS);

// Culoarea liniei fiecărei stații (în ordinea London, Manchester, York): accentul și două nuanțe ale lui.
// Valorile se schimbă singure cu accentul și tema (vezi „NUANȚE PENTRU GRAFICE” în globals.css).
const LINE_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"];

// Pagina Analytics: titlu, filtre (stații, parametru, perioadă), statistici și grafic.
export function AnalyticsView() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-4/5">
      <PageHeader icon={ChartLine} title={t.analytics.title} />
      {/* useSearchParams cere un <Suspense> în jur (vezi ghidul Next use-search-params) */}
      <Suspense fallback={<Loading />}>
        <AnalyticsContent />
      </Suspense>
    </div>
  );
}

function Loading() {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <LoaderCircle className="size-4 animate-spin" /> {t.common.loading}
    </div>
  );
}

function AnalyticsContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data, isLoading, isError } = useStations();

  if (isLoading) return <Loading />;
  if (isError || !data) return <p className="text-destructive">{t.stations.loadError}</p>;

  const stations = data.stations;

  // Filtrele stau în URL (?station=1,2&parameter=NO2&period=2021), ca linkul din Map să funcționeze.
  // Valorile lipsă sau greșite se înlocuiesc cu cele implicite: toate stațiile, PM2.5, tot setul.
  const parameterParam = searchParams.get("parameter") ?? "";
  const parameter = PARAMETER_NAMES.includes(parameterParam) ? parameterParam : "PM2.5";
  const periodParam = searchParams.get("period") as Period;
  const period: Period = PERIODS.includes(periodParam) ? periodParam : "all";
  // Fără `station` în URL → toate stațiile; `station=` (gol) → nicio stație (le-a debifat utilizatorul)
  const stationParam = searchParams.get("station");
  const selected =
    stationParam === null
      ? stations.map((s) => s.id)
      : stationParam.split(",").map(Number).filter((id) => stations.some((s) => s.id === id));

  // Stațiile care chiar apar în grafic: alese și care măsoară parametrul
  const hasParameter = (station: (typeof stations)[number]) => station.parameters.includes(parameter as Parameter);
  const active = stations.filter((s) => selected.includes(s.id) && hasParameter(s));

  // Schimbă un filtru: scriem noul URL, iar pagina se redesenează din el
  function update(changes: Record<string, string>) {
    const params = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(changes)) params.set(key, value);
    router.replace(`${pathname}?${params}`, { scroll: false });
  }

  function toggleStation(id: number) {
    const next = selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id];
    update({ station: next.sort().join(",") });
  }

  return (
    <>
      <Card>
        <CardContent className="flex flex-col gap-4">
          <FilterGroup label={t.analytics.stations}>
            {stations.map((station) => {
              const available = hasParameter(station);
              return (
                <FilterButton
                  key={station.id}
                  selected={available && selected.includes(station.id)}
                  disabled={!available}
                  title={available ? undefined : t.analytics.unavailable}
                  onClick={() => toggleStation(station.id)}
                >
                  {station.city}
                </FilterButton>
              );
            })}
          </FilterGroup>

          <FilterGroup label={t.analytics.parameter}>
            {PARAMETER_NAMES.map((name) => (
              <FilterButton key={name} selected={name === parameter} onClick={() => update({ parameter: name })}>
                {t.parameters[name] ?? name}
              </FilterButton>
            ))}
          </FilterGroup>

          <FilterGroup label={t.analytics.period}>
            {PERIODS.map((p) => (
              <FilterButton key={p} selected={p === period} onClick={() => update({ period: p })}>
                {t.analytics.periods[p]}
              </FilterButton>
            ))}
          </FilterGroup>
        </CardContent>
      </Card>

      <MeasurementsChart
        stations={active.map((s) => ({ id: s.id, city: s.city, color: LINE_COLORS[stations.indexOf(s)] }))}
        parameter={parameter}
        period={period}
      />
    </>
  );
}

// Un rând de filtre: eticheta sus, butoanele dedesubt (se rup pe mai multe rânduri pe telefon)
function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

// Buton de filtru: ales = fundal în accent; dezactivat = estompat
function FilterButton({
  selected,
  className,
  ...props
}: React.ComponentProps<"button"> & { selected: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40",
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card hover:bg-muted",
        className
      )}
      {...props}
    />
  );
}
