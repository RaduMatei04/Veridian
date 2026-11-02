import { useState, type MouseEvent } from "react";

// Cercul animat de la click: poziția (față de buton), diametrul și o cheie unică.
type Ripple = { x: number; y: number; size: number; key: number };

const RIPPLE_DURATION = 600; // ms, la fel ca animația `.ripple` din globals.css

// Efectul ripple: un cerc transparent pornește din punctul apăsat și acoperă tot butonul.
// Butonul care îl folosește trebuie să aibă clasele `relative overflow-hidden`.
// Animația (clasa `.ripple`) e în globals.css.
export function useRipple() {
  const [ripple, setRipple] = useState<Ripple | null>(null);

  function startRipple(e: MouseEvent<HTMLElement>) {
    // 1. Dimensiunile butonului și diametrul cercului: dublul laturii mari,
    //    ca cercul să acopere tot butonul din orice punct ar porni
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;

    // 2. Punctul de click față de colțul butonului.
    //    De la tastatură (Enter / Space) nu există punct de click, deci pornim din centru.
    const fromKeyboard = e.detail === 0;
    const clickX = fromKeyboard ? rect.width / 2 : e.clientX - rect.left;
    const clickY = fromKeyboard ? rect.height / 2 : e.clientY - rect.top;

    // 3. Cercul e centrat pe acel punct; `key` nou repornește animația la fiecare click
    const key = Date.now();
    setRipple({ size, x: clickX - size / 2, y: clickY - size / 2, key });

    // 4. După animație scoatem cercul din pagină. Altfel, Next.js păstrează pagina ascunsă
    //    când navighezi în altă parte, iar la întoarcere browserul ar reporni animația.
    //    Ștergem doar dacă între timp nu a pornit un cerc nou (alt click).
    setTimeout(() => {
      setRipple((current) => (current?.key === key ? null : current));
    }, RIPPLE_DURATION);
  }

  const rippleElement = ripple && (
    <span
      key={ripple.key}
      // bg-current: cercul are culoarea textului, deci se potrivește pe light și pe dark
      // pointer-events-none: click-urile trec prin cerc
      // opacity-0: starea finală; animația `ripple` o suprascrie cât rulează
      className="ripple pointer-events-none absolute rounded-full bg-current opacity-0"
      style={{ left: ripple.x, top: ripple.y, width: ripple.size, height: ripple.size }}
    />
  );

  return { startRipple, rippleElement };
}
