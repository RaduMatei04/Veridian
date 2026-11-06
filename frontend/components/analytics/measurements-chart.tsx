"use client";

import { useEffect, useRef, useState } from "react";
import { ChartLine, ChartNoAxesColumn, LoaderCircle } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { PARAMETERS, type Parameter } from "@/backend/parameters";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/frontend/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  type ChartConfig,
} from "@/frontend/components/ui/chart";
import { useMeasurements } from "@/frontend/hooks/use-measurements";
import { useTranslation } from "@/frontend/hooks/use-translation";
import { formatTime } from "@/frontend/lib/format";

type ChartStation = { id: number; city: string; color: string };

// Cardurile cu statistici (medie / min / max) și graficul cu câte o linie pe stație.
export function MeasurementsChart({
  stations,
  parameter,
  period,
}: {
  stations: ChartStation[];
  parameter: string;
  period: string;
}) {
  const { t, language } = useTranslation();
  const { data, isLoading, isError, isFetching } = useMeasurements(
    stations.map((s) => s.id),
    parameter,
    period
  );
  const unit = PARAMETERS[parameter as Parameter].unit;
  // Indexul punctului de sub cursor (null = cursorul nu e pe grafic)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const hoveredPoint = hoveredIndex === null ? undefined : data?.points[hoveredIndex];
  function showPoint(state: { activeTooltipIndex?: unknown }) {
    setHoveredIndex(state.activeTooltipIndex == null ? null : Number(state.activeTooltipIndex));
  }

  // Cât timp sidebar-ul se deschide / se închide, lățimea zonei graficului se schimbă la fiecare cadru.
  // În acest timp ascundem graficul și arătăm „Se încarcă...”; după 150 ms fără schimbări
  // (tranziția s-a terminat), graficul se desenează o singură dată, la lățimea finală.
  const chartBoxRef = useRef<HTMLDivElement>(null);
  const [resizing, setResizing] = useState(false);
  const hasStations = stations.length > 0;
  useEffect(() => {
    const box = chartBoxRef.current;
    if (!box) return;
    let lastWidth = box.offsetWidth;
    let timer: number | undefined;
    const observer = new ResizeObserver(() => {
      if (box.offsetWidth === lastWidth) return; // doar înălțimea s-a schimbat (ex. graficul a apărut)
      lastWidth = box.offsetWidth;
      setResizing(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setResizing(false), 150);
    });
    observer.observe(box);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [hasStations]);

  // Stare goală: nicio stație aleasă nu măsoară parametrul
  if (stations.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
          <ChartNoAxesColumn className="size-8 text-muted-foreground" />
          <p className="font-medium">{t.analytics.noData}</p>
          <p className="text-sm text-muted-foreground">{t.analytics.noDataHint}</p>
        </CardContent>
      </Card>
    );
  }

  // Legenda și tooltip-ul iau numele și culoarea fiecărei linii de aici (cheia = s1, s2, s3)
  const config: ChartConfig = Object.fromEntries(
    stations.map((s) => [`s${s.id}`, { label: s.city, color: s.color }])
  );

  return (
    <>
      {/* Statistici: câte un card mic pe stație, în culoarea liniei ei */}
      {data && (
        <div className="grid gap-4 sm:grid-cols-3">
          {stations.map((station) => {
            const stat = data.stats.find((s) => s.stationId === station.id);
            return (
              <Card key={station.id} size="sm">
                <CardContent className="flex flex-col gap-2">
                  <p className="flex items-center gap-2 font-medium">
                    <span className="size-2.5 rounded-full" style={{ background: station.color }} />
                    {station.city}
                    <span className="ml-auto text-xs font-normal text-muted-foreground">{unit}</span>
                  </p>
                  {stat ? (
                    <dl className="grid grid-cols-3 gap-2">
                      <Stat label={t.analytics.average} value={stat.avg} />
                      <Stat label={t.analytics.minimum} value={stat.min} />
                      <Stat label={t.analytics.maximum} value={stat.max} />
                    </dl>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t.analytics.noData}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card>
        {/* items-start: pictograma stă sus, la aceeași înălțime cu caseta de valori din dreapta */}
        <CardHeader className="relative flex flex-row items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ChartLine className="size-5" />
          </span>
          <div className="flex flex-1 flex-col gap-1">
            <CardTitle>
              {t.parameters[parameter] ?? parameter} ({unit})
            </CardTitle>
            {data && <CardDescription>{t.analytics.resolutions[data.resolution]}</CardDescription>}
          </div>
          {/* La schimbarea filtrelor, graficul vechi rămâne vizibil; arătăm doar un indicator mic */}
          {isFetching && <LoaderCircle className="size-4 animate-spin text-muted-foreground" />}

          {/* Valorile punctului de sub cursor: în dreapta sus, aliniate cu pictograma din stânga.
              E poziționată absolut, ca la apariție să nu împingă antetul în jos. */}
          {hoveredPoint && data && (
            <div className="absolute top-0 right-4 z-10 flex w-44 flex-col gap-1.5 rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-xl">
              <p className="font-medium">{formatTime(String(hoveredPoint.time), data.resolution, language, true)}</p>
              {stations.map((station) => (
                <p key={station.id} className="flex items-center gap-2">
                  <span className="size-2.5 shrink-0 rounded-[2px]" style={{ background: station.color }} />
                  <span className="flex-1 text-muted-foreground">{station.city}</span>
                  <span className="font-mono font-medium tabular-nums">{hoveredPoint[`s${station.id}`] ?? "–"}</span>
                </p>
              ))}
            </div>
          )}
        </CardHeader>

        {/* ref: urmărim lățimea acestei zone, ca să știm când se mișcă sidebar-ul (vezi resizing) */}
        <CardContent ref={chartBoxRef}>
          {/* Încărcare: la prima cerere sau cât timp sidebar-ul se deschide / se închide */}
          {(isLoading || (resizing && data)) && (
            <div className="flex h-80 items-center justify-center gap-2 text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" /> {t.common.loading}
            </div>
          )}
          {isError && <p className="text-destructive">{t.analytics.loadError}</p>}

          {data && !resizing && (
            <ChartContainer config={config} className="aspect-auto h-80 w-full">
              <LineChart
                data={data.points}
                margin={{ left: 0, right: 8 }}
                // Ținem minte ce punct e sub cursor (sau atins pe telefon), ca să-i afișăm valorile în antet
                onMouseMove={showPoint}
                onClick={showPoint}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="time"
                  tickLine={false}
                  axisLine={false}
                  minTickGap={40}
                  tickFormatter={(time: string) => formatTime(time, data.resolution, language)}
                />
                <YAxis tickLine={false} axisLine={false} width={40} />
                {/* Tooltip-ul Recharts desenează doar linia verticală de sub cursor;
                    valorile apar în antetul cardului (vezi mai sus) */}
                <ChartTooltip isAnimationActive={false} content={() => null} />
                <ChartLegend content={<ChartLegendContent />} />
                {stations.map((station) => (
                  <Line
                    key={station.id}
                    dataKey={`s${station.id}`}
                    type="monotone"
                    stroke={`var(--color-s${station.id})`}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </>
  );
}

// O statistică: eticheta mică, valoarea mare (unitatea e în titlul cardului)
function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-lg font-semibold">{value.toFixed(1)}</dd>
    </div>
  );
}
