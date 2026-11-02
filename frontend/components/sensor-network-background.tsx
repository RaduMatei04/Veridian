"use client";

import { useEffect, useRef } from "react";
import { createNetwork, drawNetwork, updateNetwork } from "@/frontend/lib/sensor-network";

// Canvas-ul cu animația rețelei de senzori, întins pe tot fundalul paginii de start.
// Stă sub logo, texte și buton; pointer-events-none lasă click-urile să treacă spre buton.
export function SensorNetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;
    let network = createNetwork(1, 1);
    let lastTime = performance.now();
    let rafId = 0;

    // Mărimea canvas-ului = mărimea pe ecran. Pe ecranele cu densitate mare (dpr = 2)
    // desenăm la rezoluție dublă, ca punctele să nu fie neclare.
    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      network = createNetwork(width, height); // rețea nouă pe noua mărime
    }

    // Poziția cursorului, față de colțul canvas-ului (pentru glow)
    function handlePointerMove(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      network.mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    function handlePointerLeave() {
      network.mouse = null;
    }

    // Bucla animației: actualizează, desenează, cere următorul cadru. Rulează continuu.
    function frame(time: number) {
      updateNetwork(network, time - lastTime);
      drawNetwork(ctx!, network, width, height);
      lastTime = time;
      rafId = requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handlePointerMove);
    document.documentElement.addEventListener("pointerleave", handlePointerLeave);
    rafId = requestAnimationFrame(frame);

    // Când pleci de pe pagină: oprim bucla și ascultătorii
    // (altfel ar rula invizibil și, la întoarcere, ar porni a doua buclă).
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 size-full" />;
}
