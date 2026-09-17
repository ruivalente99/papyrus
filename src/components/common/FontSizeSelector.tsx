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
export type TextScaleId = "xs" | "sm" | "md" | "lg" | "xl";

interface DensityProps {
  value: DensityId;
  onChange: (value: DensityId) => void;
  lang?: SupportedLanguage;
  variant?: "segmented" | "stepper" | "dropdown" | "buttons" | "slider" | "slide";
  size?: "xs" | "sm" | "md" | "lg";
  label?: React.ReactNode;
  showIcon?: boolean;
  className?: string;
  classNames?: FontSizeSelectorClassNames;
}

export function DensitySelector({
  value,
  onChange,
  lang = "en",
  variant = "segmented",
  size = "xs",
  label,
  showIcon = false,
  className = "",
  classNames,
}: DensityProps) {
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

interface TextSizeProps {
  value: TextScaleId;
  onChange: (value: TextScaleId) => void;
  lang?: SupportedLanguage;
  variant?: "segmented" | "stepper" | "dropdown" | "buttons" | "slider" | "slide";
  size?: "xs" | "sm" | "md" | "lg";
  label?: React.ReactNode;
  showIcon?: boolean;
  className?: string;
  classNames?: FontSizeSelectorClassNames;
}

export function TextSizeSelector({
  value,
  onChange,
  lang = "en",
  variant = "slider",
  size = "xs",
  label,
  showIcon = false,
  className = "",
  classNames,
}: TextSizeProps) {
  const { t: tr } = useTranslation(lang);

  const scaleOptions: Array<FontSizeOption<TextScaleId>> = [
    {
      id: "xs",
      label: tr("preview.textSizeOptions.xs"),
      shortLabel: "XS",
      description: tr("preview.textSizeDescriptions.xs"),
      scaleFactor: 0.88,
    },
    {
      id: "sm",
      label: tr("preview.textSizeOptions.sm"),
      shortLabel: "S",
      description: tr("preview.textSizeDescriptions.sm"),
      scaleFactor: 0.94,
    },
    {
      id: "md",
      label: tr("preview.textSizeOptions.md"),
      shortLabel: "M",
      description: tr("preview.textSizeDescriptions.md"),
      scaleFactor: 1.0,
    },
    {
      id: "lg",
      label: tr("preview.textSizeOptions.lg"),
      shortLabel: "L",
      description: tr("preview.textSizeDescriptions.lg"),
      scaleFactor: 1.06,
    },
    {
      id: "xl",
      label: tr("preview.textSizeOptions.xl"),
      shortLabel: "XL",
      description: tr("preview.textSizeDescriptions.xl"),
      scaleFactor: 1.12,
    },
  ];

  return (
    <BibliothecaFontSizeSelector<TextScaleId>
      value={value}
      onChange={onChange}
      options={scaleOptions}
      variant={variant}
      size={size}
      label={label}
      showIcon={showIcon}
      className={className}
      classNames={classNames}
      labels={{
        title: label,
        decrease: tr("preview.toolbar.decreaseTextSize"),
        increase: tr("preview.toolbar.increaseTextSize"),
        ariaLabel: tr("preview.toolbar.textSize"),
      }}
    />
  );
}

// Alias for backwards compatibility
export const FontSizeSelector = TextSizeSelector;
