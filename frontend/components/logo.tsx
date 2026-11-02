// Logo-ul Veridian: un V cu o bandă de accent pe brațul drept.
// Corpul urmează tema (--logo-fill), banda urmează accentul ales (--accent-color).
const V_PATH =
  "M8.83 12.04Q8.00 10.00 10.20 10.00L17.80 10.00Q20.00 10.00 20.83 12.04L32.00 39.33L43.17 12.04Q44.00 10.00 46.20 10.00L53.80 10.00Q56.00 10.00 55.17 12.04L38.83 51.96Q38.00 54.00 35.80 54.00L28.20 54.00Q26.00 54.00 25.17 51.96Z";
const ACCENT_PATH =
  "M43.17 12.04Q44.00 10.00 46.20 10.00L48.00 10.00L36.00 39.33L32.00 39.33Z";

export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="Veridian">
      <path d={V_PATH} fill="var(--logo-fill)" />
      <path d={ACCENT_PATH} fill="var(--accent-color)" />
    </svg>
  );
}
