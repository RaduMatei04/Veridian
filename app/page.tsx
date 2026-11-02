import Link from "next/link";
import { LogIn } from "lucide-react";
import { SensorNetworkBackground } from "@/frontend/components/sensor-network-background";

// Pagina de start. Culorile sunt fixe (excepție aprobată): nu depind de temă sau accent.
export default function StartPage() {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-linear-to-b from-[#1c1f24] to-[#4b5058] px-4 text-center select-none">
      {/* Animația de fundal: rețeaua de senzori (sub conținut) */}
      <SensorNetworkBackground />

      <div className="relative z-10 flex flex-col items-center">
        {/* eslint-disable-next-line @next/next/no-img-element -- SVG mic, static */}
        <img src="/veridian-logo-start.svg" alt="Veridian" className="size-50 sm:size-86" />

        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-[#e8ecf3] sm:text-4xl">
          VERIDIAN Application
        </h1>
        <p className="mt-3 max-w-500px text-base text-[#e8ecf3]/70 sm:text-lg">
          Bringing together air quality and climate data from city sensor networks
        </p>

        <Link
          href="/login"
          className="mt-15 inline-flex items-center gap-3 rounded-lg bg-[#3478F6] px-8 py-3 text-base font-semibold tracking-wide text-white shadow-lg transition-colors hover:bg-[#2563eb] focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
        >
          Go to Application
          <LogIn className="size-5" />
        </Link>
      </div>
    </main>
  );
}
