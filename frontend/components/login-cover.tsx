"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { authGradientClass } from "@/frontend/components/auth-card";
import { Logo } from "@/frontend/components/logo";
import { useCurrentUser } from "@/frontend/hooks/use-current-user";

// Coperta de tranziție dintre /login (sau /register) și /home.
// Stă în Providers (deci în layout-ul principal), ca să rămână pe ecran când se schimbă pagina.
//
// Etapele (clasele CSS sunt în globals.css):
//   "enter" → coperta apare (fade-in), logo-ul e mic și nemișcat
//   "wait"  → așteptăm să fim pe /home și să avem datele utilizatorului
//   "zoom"  → logo-ul se întoarce 360° și crește până la 70% din ecran, iar în același timp
//             toată coperta se estompează peste /home; la final dispare din pagină
type Phase = "enter" | "wait" | "zoom";

// Funcția prin care formularele pornesc coperta
const LoginCoverContext = createContext<() => void>(() => {});

export function useLoginCover() {
  return useContext(LoginCoverContext);
}

export function LoginCoverProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);

  function showCover() {
    // Cine a dezactivat animațiile din sistem merge direct la /home, fără copertă
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setVisible(true);
  }

  return (
    <LoginCoverContext.Provider value={showCover}>
      {children}
      {visible && <LoginCover onDone={() => setVisible(false)} />}
    </LoginCoverContext.Provider>
  );
}

function LoginCover({ onDone }: { onDone: () => void }) {
  const [entered, setEntered] = useState(false); // s-a terminat fade-in-ul
  const pathname = usePathname();
  // Aceeași cerere ca în sidebar și Home: când e gata, /home are deja datele
  const { data: user, isError } = useCurrentUser();

  // Animația pornește abia când suntem pe /home și avem datele utilizatorului
  const ready = pathname === "/home" && !!user;
  const phase: Phase = !entered ? "enter" : ready ? "zoom" : "wait";

  // Dacă datele nu pot fi citite, nu blocăm ecranul
  useEffect(() => {
    if (isError) onDone();
  }, [isError, onDone]);

  return (
    <div
      aria-hidden="true"
      className={`login-cover fixed inset-0 z-100 flex items-center justify-center ${authGradientClass} ${phase === "zoom" ? "login-cover-exit" : "login-cover-enter"}`}
      // Trecem la etapa următoare când se termină animația copertei (nu și a logo-ului din ea)
      onAnimationEnd={(e) => {
        if (e.target !== e.currentTarget) return;
        if (phase === "enter") setEntered(true);
        if (phase === "zoom") onDone();
      }}
    >
      <div
        // Logo alb cu banda albastru închis, ca să se vadă pe gradient (culori fixe, ca la /login)
        style={{ "--logo-fill": "#ffffff", "--accent-color": "#1e4fbf" } as React.CSSProperties}
        className={`login-cover-logo ${phase === "zoom" ? "login-cover-zoom" : ""}`}
      >
        <Logo className="size-full" />
      </div>
    </div>
  );
}
