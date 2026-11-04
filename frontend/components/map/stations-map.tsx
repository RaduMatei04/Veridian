"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useLayoutEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import type { StationsResponse } from "@/backend/stations";
import { useTranslation } from "@/frontend/hooks/use-translation";
import { formatMonth } from "@/frontend/lib/format";

type Station = StationsResponse["stations"][number];

// Fundalul hărții (tile-uri Esri, fără cheie API): gri deschis pe Light, gri închis pe Dark.
// (CARTO Positron / Dark Matter cer acum cheie API.)
const TILES = {
  light: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
  dark: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
};

// Markerul: un cerc în culoarea de accent (clasele Tailwind urmează accentul ales)
const stationIcon = L.divIcon({
  className: "",
  html: '<span class="block size-5 rounded-full border-2 border-card bg-primary shadow-md"></span>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -12],
});

// Harta cu stațiile. Se încarcă doar în browser (Leaflet folosește `window`), vezi MapView.
export default function StationsMap({ stations }: { stations: Station[] }) {
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "dark" ? "dark" : "light";

  // Next.js nu scoate pagina când pleci de pe ea, ci o ascunde (React <Activity>).
  // La ascundere, react-leaflet distruge harta, dar componenta rămâne; la revenire ar folosi
  // harta distrusă (eroarea „appendChild”). Schimbăm `key`-ul în cleanup, ca la revenire
  // să se creeze o hartă nouă (modelul din ghidul Next „preserving-ui-state”).
  const [mapKey, setMapKey] = useState(0);
  useLayoutEffect(() => {
    return () => setMapKey((key) => key + 1);
  }, []);

  return (
    <MapContainer
      key={mapKey}
      // La deschidere: zoom cât să se vadă toate stațiile
      bounds={stations.map((s) => [s.lat, s.lon] as [number, number])}
      boundsOptions={{ padding: [60, 60] }}
      maxZoom={16} // tile-urile Esri Canvas nu au detalii mai mari
      attributionControl={false} // fără textul de jos („Leaflet | Tiles © Esri...”), la cererea utilizatorului
      className="size-full"
    >
      <ResizeWatcher />
      {/* key: la schimbarea temei, stratul de tile-uri se recreează cu noul fundal */}
      <TileLayer key={theme} url={TILES[theme]} />
      {stations.map((station) => (
        <Marker key={station.id} position={[station.lat, station.lon]} icon={stationIcon} title={station.name}>
          <Popup>
            <StationPopup station={station} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

// Leaflet nu observă singur când i se schimbă mărimea containerului (ex. la închiderea sidebar-ului)
// și ar lăsa o zonă gri. ResizeObserver ne anunță la fiecare schimbare, iar invalidateSize()
// recalculează harta pe noua mărime.
function ResizeWatcher() {
  const map = useMap();
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
}

// Conținutul popup-ului: aceleași informații ca pe pagina Stations + link spre Analytics
function StationPopup({ station }: { station: Station }) {
  const { t, language } = useTranslation();

  return (
    <div className="flex flex-col gap-1 text-sm">
      <p className="font-semibold">{station.name}</p>
      <p className="text-muted-foreground">
        {station.city} · {t.stations.types[station.type] ?? station.type}
      </p>
      <p>
        {formatMonth(station.firstDay, language)} – {formatMonth(station.lastDay, language)}
      </p>
      <p>{t.stations.sensorCount(station.sensorCount)}</p>
      <Link
        href={`/analytics?station=${station.id}`}
        className="map-popup-link mt-2 rounded-lg bg-primary px-3 py-1.5 text-center font-semibold transition-opacity hover:opacity-90"
      >
        {t.map.viewInAnalytics}
      </Link>
    </div>
  );
}
