import { useCurrentUser } from "@/frontend/hooks/use-current-user";
import { DEFAULT_LANGUAGE, translations, type Language } from "@/frontend/lib/i18n";

// Textele în limba aleasă de utilizator (salvată în cont).
// Cât timp contul se încarcă, folosim engleza.
// Folosire: const { t } = useTranslation();  →  t.sidebar.home
export function useTranslation() {
  const { data: user } = useCurrentUser();
  const language: Language = user?.language === "ro" ? "ro" : DEFAULT_LANGUAGE;
  return { t: translations[language], language };
}
