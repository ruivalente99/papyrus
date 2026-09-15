"use client";

import React from "react";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "@/hooks/useTranslation";
import { ThemeSelector as BibliothecaThemeSelector } from "@ruivalente99/bibliotheca/ui";

interface Props {
  lang?: string;
}

export function ThemeSelector({ lang = "en" }: Props) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { t: tr } = useTranslation(lang as any);

  return (
    <BibliothecaThemeSelector
      theme={theme}
      resolvedTheme={resolvedTheme}
      onThemeChange={setTheme}
      labels={{
        light: tr("common.theme.light"),
        dark: tr("common.theme.dark"),
        system: tr("common.theme.system"),
        toggleTitle: tr("common.theme.title"),
        ariaLabel: tr("common.theme.current", { label: theme }),
      }}
    />
  );
}
