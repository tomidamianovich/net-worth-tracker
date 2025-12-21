import { useTranslation as useI18nTranslation } from "./index";

/**
 * React hook to access translations
 * @example
 * const { t } = useTranslation();
 * <h1>{t("portfolio.title")}</h1>
 */
export const useTranslation = () => {
  return useI18nTranslation();
};

