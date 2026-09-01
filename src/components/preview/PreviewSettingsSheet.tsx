"use client";

import React, { useEffect } from "react";
import type { SupportedLanguage, TemplateId, CVDocument } from "@/types/cv";
import { tUI } from "@/lib/i18n";
import {
  X,
  Columns,
  AlignLeft,
  LayoutGrid,
  Check,
  Palette,
  Sparkles,
} from "lucide-react";

export const ACCENT_COLORS = [
  { name: "Teal (Lateralis)", hex: "#005555" },
  { name: "Royal Blue (Classic)", hex: "#004f90" },
  { name: "Navy Blue (Matrix)", hex: "#1e3a8a" },
  { name: "Emerald", hex: "#047857" },
  { name: "Amber / Bronze", hex: "#b45309" },
  { name: "Rose / Burgundy", hex: "#9f1239" },
  { name: "Slate / Charcoal", hex: "#334155" },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: SupportedLanguage;
  currentTemplate: TemplateId;
  currentDensity?: "compact" | "normal" | "spacious";
  currentColor?: string;
  onSetTemplate: (template: TemplateId) => void;
  onUpdateTheme: (theme: Partial<CVDocument["theme"]>) => void;
}

export function PreviewSettingsSheet({
  isOpen,
  onClose,
  lang,
  currentTemplate,
  currentDensity = "normal",
  currentColor = "#005555",
  onSetTemplate,
  onUpdateTheme,
}: Props) {
  const isPt = lang === "pt";

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const TEMPLATES: { id: TemplateId; name: string; subtitle: string; icon: any }[] = [
    {
      id: "lateralis",
      name: "Lateralis",
      subtitle: isPt ? "Split moderno com barra" : "Modern split sidebar",
      icon: Columns,
    },
    {
      id: "classic",
      name: "Classic",
      subtitle: isPt ? "Minimalista ATS TeX" : "Minimalist ATS & TeX",
      icon: AlignLeft,
    },
    {
      id: "matrix",
      name: "Matrix",
      subtitle: isPt ? "Grelha executiva" : "Structured executive",
      icon: LayoutGrid,
    },
  ];

  const DENSITIES: { id: "compact" | "normal" | "spacious"; label: string; desc: string }[] = [
    {
      id: "compact",
      label: tUI("densityCompact", lang),
      desc: isPt ? "Mais compacto" : "More content",
    },
    {
      id: "normal",
      label: tUI("densityNormal", lang),
      desc: isPt ? "Padrão equilibrado" : "Balanced",
    },
    {
      id: "spacious",
      label: tUI("densitySpacious", lang),
      desc: isPt ? "Maior respiro" : "Breathing room",
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-settings-title"
      className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Bottom Sheet Modal Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-stone-900 rounded-t-3xl border-t border-stone-200/80 dark:border-stone-800 shadow-2xl w-full max-h-[88vh] overflow-y-auto pb-safe animate-in slide-in-from-bottom-6 duration-200"
      >
        {/* iOS Pull Indicator */}
        <div className="pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1 rounded-full bg-stone-300 dark:bg-stone-700" />
        </div>

        {/* Sheet Header */}
        <div className="px-5 py-3 flex items-center justify-between border-b border-stone-100 dark:border-stone-800/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <Palette size={15} />
            </div>
            <h2 id="preview-settings-title" className="text-base font-bold text-stone-900 dark:text-stone-100">
              {tUI("customizeModalTitle", lang)}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sheet Body */}
        <div className="p-5 space-y-6">
          {/* 1. Template Selection */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                {tUI("layoutTemplate", lang)}
              </span>
              <span className="text-[11px] text-amber-700 dark:text-amber-400 font-bold font-mono">
                {TEMPLATES.find((t) => t.id === currentTemplate)?.name}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {TEMPLATES.map((tmpl) => {
                const isSelected =
                  currentTemplate === tmpl.id ||
                  (tmpl.id === "lateralis" && currentTemplate === ("canva" as any)) ||
                  (tmpl.id === "classic" && currentTemplate === ("latex" as any)) ||
                  (tmpl.id === "matrix" && currentTemplate === ("europass" as any));
                const Icon = tmpl.icon;

                return (
                  <button
                    key={tmpl.id}
                    onClick={() => onSetTemplate(tmpl.id)}
                    className={`flex flex-col items-center justify-center text-center p-3 rounded-2xl border transition-all active:scale-95 ${
                      isSelected
                        ? "bg-amber-500/10 dark:bg-amber-500/15 border-amber-600 dark:border-amber-500 text-stone-900 dark:text-stone-100 shadow-xs ring-1 ring-amber-500/30"
                        : "bg-stone-50/80 dark:bg-stone-800/60 border-stone-200/80 dark:border-stone-700/80 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 transition-colors ${
                        isSelected
                          ? "bg-amber-600 text-white shadow-xs"
                          : "bg-stone-200/70 dark:bg-stone-700/70 text-stone-600 dark:text-stone-300"
                      }`}
                    >
                      <Icon size={18} />
                    </div>
                    <span className="text-xs font-bold leading-tight">{tmpl.name}</span>
                    <span className="text-[10px] text-stone-400 dark:text-stone-500 leading-tight mt-0.5 line-clamp-1">
                      {tmpl.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Spacing / Density Selection */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                {tUI("densitySpacing", lang)}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-stone-100/90 dark:bg-stone-800/80 p-1.5 rounded-2xl border border-stone-200/80 dark:border-stone-700/80">
              {DENSITIES.map((d) => {
                const isSelected = currentDensity === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => onUpdateTheme({ fontSize: d.id })}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center justify-center ${
                      isSelected
                        ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs"
                        : "text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
                    }`}
                  >
                    <span>{d.label}</span>
                    <span className="text-[9.5px] font-normal opacity-70 mt-0.5">{d.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Accent Color Palette */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                {tUI("accentColor", lang)}
              </span>
              <span className="text-[11px] font-mono text-stone-400">
                {ACCENT_COLORS.find((c) => c.hex.toLowerCase() === currentColor?.toLowerCase())?.name || currentColor}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 p-3 bg-stone-50/80 dark:bg-stone-800/50 rounded-2xl border border-stone-200/80 dark:border-stone-700/80 overflow-x-auto no-scrollbar">
              {ACCENT_COLORS.map((c) => {
                const isSelected = currentColor?.toLowerCase() === c.hex.toLowerCase();
                return (
                  <button
                    key={c.hex}
                    onClick={() => onUpdateTheme({ primaryColor: c.hex })}
                    title={c.name}
                    className={`w-9 h-9 rounded-full transition-transform flex items-center justify-center shrink-0 active:scale-90 ${
                      isSelected
                        ? "scale-110 ring-3 ring-amber-500 ring-offset-2 dark:ring-offset-stone-900 shadow-md"
                        : "hover:scale-105 opacity-90 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: c.hex }}
                  >
                    {isSelected && <Check size={16} className="text-white drop-shadow-sm" strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sheet Footer */}
        <div className="px-5 pt-2 pb-5 border-t border-stone-100 dark:border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-3 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-bold text-sm rounded-2xl shadow-xs transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Sparkles size={16} />
            <span>{tUI("done", lang)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
