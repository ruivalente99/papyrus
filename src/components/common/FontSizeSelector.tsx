"use client";

import React from "react";
import { useTranslation } from "@/hooks/useTranslation";
import type { SupportedLanguage } from "@/types/cv";
import {
  FontSizeSelector as BibliothecaFontSizeSelector,
  type FontSizeOption,
  type FontSizeSelectorClassNames,
} from "@ruivalente99/bibliotheca/ui";

export type DensityId = "compact" | "normal" | "spacious";

interface Props {
  value: DensityId;
  onChange: (value: DensityId) => void;
  lang?: SupportedLanguage;
  variant?: "segmented" | "stepper" | "dropdown" | "buttons";
  size?: "xs" | "sm" | "md" | "lg";
  label?: React.ReactNode;
  showIcon?: boolean;
  className?: string;
  classNames?: FontSizeSelectorClassNames;
}

export function FontSizeSelector({
  value,
  onChange,
  lang = "en",
  variant = "segmented",
  size = "xs",
  label,
  showIcon = false,
  className = "",
  classNames,
}: Props) {
  const { t: tr } = useTranslation(lang);

  const densityOptions: Array<FontSizeOption<DensityId>> = [
    {
      id: "compact",
      label: tr("preview.toolbar.densityCompact"),
      shortLabel: "A-",
      description: tr("preview.densityDescriptions.compact"),
    },
    {
      id: "normal",
      label: tr("preview.toolbar.densityNormal"),
      shortLabel: "A",
      description: tr("preview.densityDescriptions.normal"),
    },
    {
      id: "spacious",
      label: tr("preview.toolbar.densitySpacious"),
      shortLabel: "A+",
      description: tr("preview.densityDescriptions.spacious"),
    },
  ];

  return (
    <BibliothecaFontSizeSelector<DensityId>
      value={value}
      onChange={onChange}
      options={densityOptions}
      variant={variant}
      size={size}
      label={label}
      showIcon={showIcon}
      className={className}
      classNames={classNames}
      labels={{
        title: label,
        decrease: tr("preview.toolbar.decreaseFont"),
        increase: tr("preview.toolbar.increaseFont"),
        ariaLabel: tr("preview.toolbar.density"),
      }}
    />
  );
}
