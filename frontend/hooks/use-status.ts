import { useEffect, useRef, useState } from "react";
import type { Status } from "@/frontend/components/settings/status-message";

const SUCCESS_DURATION = 3000; // ms, la fel ca animația `status-fade` din globals.css

// Starea mesajului de după salvare.
// Mesajele de succes dispar singure după 3 secunde; cele de eroare rămân până la următoarea acțiune.
export function useStatus() {
  const [status, setStatus] = useState<Status>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showStatus(next: Status) {
    if (timer.current) clearTimeout(timer.current); // oprim cronometrul mesajului anterior
    setStatus(next);
    if (next?.type === "success") {
      timer.current = setTimeout(() => setStatus(null), SUCCESS_DURATION);
    }
  }

  // Dacă utilizatorul pleacă de pe pagină înainte de 3 secunde, oprim cronometrul
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return [status, showStatus] as const;
}
