import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { MeasurementsResponse } from "@/backend/measurements";

// Cere datele pentru graficul din Analytics de la GET /api/measurements.
// keepPreviousData: la schimbarea unui filtru, graficul vechi rămâne până vin datele noi (fără „clipire”).
export function useMeasurements(stationIds: number[], parameter: string, period: string) {
  return useQuery({
    queryKey: ["measurements", stationIds, parameter, period],
    queryFn: async (): Promise<MeasurementsResponse> => {
      const query = new URLSearchParams({ stations: stationIds.join(","), parameter, period });
      const res = await fetch(`/api/measurements?${query}`);
      if (!res.ok) throw new Error("Could not load measurements");
      return res.json();
    },
    enabled: stationIds.length > 0, // fără stații alese nu avem ce cere
    placeholderData: keepPreviousData,
    staleTime: Infinity, // datele QUANT nu se schimbă
  });
}
