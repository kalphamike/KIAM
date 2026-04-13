import { Globe } from "lucide-react";
import { useLanguage } from "./LanguageProvider";

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  const cycleLanguage = () => {
    setLanguage(language === "en" ? "fr" : language === "fr" ? "es" : "en");
  };

  return (
    <button
      onClick={cycleLanguage}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20"
      aria-label={`Current language: ${language}. Click to change.`}
    >
      <Globe className="h-4 w-4" />
      <span className="ml-1 text-xs font-bold">{language.toUpperCase()}</span>
    </button>
  );
};

export default LanguageToggle;