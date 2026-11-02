import { useQuery } from "@tanstack/react-query";

export type CurrentUser = {
  id: number;
  username: string;
  description: string;
  theme: string;
  accent: string;
  language: string; // "en" sau "ro"
};

// Cheia sub care TanStack Query ține minte utilizatorul curent.
export const CURRENT_USER_KEY = ["current-user"];

// Cere utilizatorul logat de la GET /api/auth/me.
// TanStack Query ține minte răspunsul, deci sidebar-ul, Home și Settings fac o singură cerere.
export function useCurrentUser() {
  return useQuery({
    queryKey: CURRENT_USER_KEY,
    queryFn: async (): Promise<CurrentUser> => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) throw new Error("Not logged in");
      return res.json();
    },
    // Datele contului se schimbă doar din aplicație (Settings / Profile), iar acolo actualizăm
    // singuri cache-ul. Fără recitiri automate (ex. la revenirea în fereastră), care ar putea
    // aduce o valoare veche peste o schimbare abia făcută. Se reîncarcă la refresh sau după logout.
    staleTime: Infinity,
  });
}
