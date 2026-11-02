// Culorile de accent disponibile. `id` e valoarea din atributul data-accent
// de pe <html> (vezi globals.css), `hex` e folosit pentru mostrele din Settings.
export const ACCENTS = [
  { id: "blue", label: "Blue", hex: "#3478F6" },
  { id: "teal", label: "Teal", hex: "#0D9488" },
  { id: "orange", label: "Orange", hex: "#F07818" },
  { id: "pink", label: "Pink", hex: "#DB2777" },
  { id: "lila", label: "Lila", hex: "#8B5CF6" },
  { id: "red", label: "Red", hex: "#DC2626" },
] as const;

export type Accent = (typeof ACCENTS)[number]["id"];

export const DEFAULT_ACCENT: Accent = "blue";

// Cheia din localStorage unde ținem o copie rapidă a accentului.
export const ACCENT_STORAGE_KEY = "veridian-accent";

// Schimbă accentul imediat și îl ține minte în browser.
export function setAccent(accent: Accent) {
  document.documentElement.dataset.accent = accent;
  try {
    localStorage.setItem(ACCENT_STORAGE_KEY, accent);
  } catch {
    // localStorage poate fi blocat (de ex. fereastră privată); accentul rămâne doar pe pagina curentă
  }
}

// Script rulat în <head> înainte de afișarea paginii, ca accentul salvat
// să apară din prima (fără „flash” de Blue).
export const ACCENT_SCRIPT = `try{var a=localStorage.getItem("${ACCENT_STORAGE_KEY}");if(a)document.documentElement.dataset.accent=a}catch(e){}`;
