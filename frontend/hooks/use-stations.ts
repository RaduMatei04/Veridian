import { useQuery } from "@tanstack/react-query";
import type { StationsResponse } from "@/backend/stations";

// Cere lista stațiilor de la GET /api/stations.
// Datele QUANT nu se schimbă în timpul vizitei, deci nu le recitim automat.
export function useStations() {
  return useQuery({
    queryKey: ["stations"],
    queryFn: async (): Promise<StationsResponse> => {
      const res = await fetch("/api/stations");
      if (!res.ok) throw new Error("Could not load stations");
      return res.json();
    },
    staleTime: Infinity,
  });
}
