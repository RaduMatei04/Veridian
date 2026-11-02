"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { LoginCoverProvider } from "@/frontend/components/login-cover";
import { TooltipProvider } from "@/frontend/components/ui/tooltip";

// Componente care trebuie să încadreze toată aplicația.
export function Providers({ children }: { children: React.ReactNode }) {
  // Un singur QueryClient pe toată durata vizitei (ține minte răspunsurile API-ului)
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {/* Pune / scoate clasa "dark" pe <html>. Pornește pe Light și ignoră tema sistemului. */}
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        storageKey="veridian-theme"
      >
        <TooltipProvider>
          {/* Coperta animată dintre /login și /home */}
          <LoginCoverProvider>{children}</LoginCoverProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
