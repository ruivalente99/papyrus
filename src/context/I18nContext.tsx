"use client";

import React, { createContext, useContext, useMemo, useCallback } from "react";
import type { SupportedLanguage } from "@/types/cv";
import { translate, type TranslationKey } from "@/locales";

export interface I18nContextValue {
  lang: SupportedLanguage;
  setLang: (lang: SupportedLanguage) => void;
  t: (key: TranslationKey | (string & {}), params?: Record<string, string | number | undefined | null>) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

interface I18nProviderProps {
  lang: SupportedLanguage;
  onLanguageChange?: (lang: SupportedLanguage) => void;
  children: React.ReactNode;
}

export function I18nProvider({ lang = "en", onLanguageChange, children }: I18nProviderProps) {
  const setLang = useCallback(
    (newLang: SupportedLanguage) => {
      onLanguageChange?.(newLang);
    },
    [onLanguageChange]
  );

  const t = useCallback(
    (key: TranslationKey | (string & {}), params?: Record<string, string | number | undefined | null>) => {
      return translate(key, lang, params);
    },
    [lang]
  );

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t,
    }),
    [lang, setLang, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation(overrideLang?: SupportedLanguage): I18nContextValue {
  const context = useContext(I18nContext);

  // If used outside an I18nProvider, provide a fallback using overrideLang or "en"
  const activeLang = overrideLang || context?.lang || "en";

  const t = useCallback(
    (key: TranslationKey | (string & {}), params?: Record<string, string | number | undefined | null>) => {
      return translate(key, activeLang, params);
    },
    [activeLang]
  );

  if (overrideLang) {
    return {
      lang: overrideLang,
      setLang: context?.setLang || (() => {}),
      t,
    };
  }

  if (!context) {
    return {
      lang: "en",
      setLang: () => {},
      t,
    };
  }

  return context;
}
