import { es } from "./translations/es";

export type Translations = typeof es;

// Currently only Spanish is supported
const translations = {
  es,
};

export type Language = "es";

let currentLanguage: Language = "es";

export const setLanguage = (lang: Language) => {
  currentLanguage = lang;
};

export const getLanguage = (): Language => {
  return currentLanguage;
};

export const t = (key: string, params?: Record<string, string | number>): string => {
  const keys = key.split(".");
  let value: any = translations[currentLanguage];

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k as keyof typeof value];
    } else {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  }

  if (typeof value !== "string") {
    console.warn(`Translation value is not a string: ${key}`);
    return key;
  }

  // Replace parameters in the string
  if (params) {
    return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
      const paramValue = params[paramKey];
      if (paramValue !== undefined) {
        // Handle pluralization for simple cases
        if (paramKey === "plural" && typeof paramValue === "number") {
          return paramValue !== 1 ? "s" : "";
        }
        return String(paramValue);
      }
      return match;
    });
  }

  return value;
};

// React hook for translations
export const useTranslation = () => {
  return {
    t,
    language: currentLanguage,
    setLanguage,
  };
};

