"use client";

import React, { useState, useRef } from "react";
import type { CVDocument, SupportedLanguage, LinterReport } from "@/types/cv";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { LinterBadge } from "./linter/LinterBadge";
import { LinterModal } from "./linter/LinterModal";
import { LatexModal } from "./latex/LatexModal";
import { ThemeSelector } from "@/components/common/ThemeSelector";
import { NanoBananaLogo } from "@/components/common/NanoBananaLogo";
import { PRESET_SEEDS } from "@/data/seeds";
import { tUI } from "@/lib/i18n";
import {
  FileUp,
  FileDown,
  Layers,
  ChevronDown,
  Code2,
  Plus,
} from "lucide-react";

interface Props {
  cv: CVDocument;
  activeLang: SupportedLanguage;
  onSwitchLanguage: (lang: SupportedLanguage) => void;
  onAddLanguage: (code: string, label: string) => void;
  onLoadPreset: (id: string) => void;
  onOpenSetup?: () => void;
  onImportJson: (data: CVDocument) => void;
  onExportJson: () => void;
  linterReport: LinterReport;
}

export function BuilderHeader({
  cv,
  activeLang,
  onSwitchLanguage,
  onAddLanguage,
  onLoadPreset,
  onOpenSetup,
  onImportJson,
  onExportJson,
  linterReport,
}: Props) {
  const [showPresets, setShowPresets] = useState(false);
  const [showLinterModal, setShowLinterModal] = useState(false);
  const [showLatexModal, setShowLatexModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        onImportJson(parsed);
      } catch (err) {
        alert("Invalid or corrupted JSON file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <header className="border-b border-stone-200/80 dark:border-stone-800/80 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30 shadow-2xs transition-colors">
      {/* Brand: Nano Banana Icon Button */}
      <div className="flex items-center">
        <button
          onClick={onOpenSetup}
          title="PAPYRUS — Setup & Overview"
          className="group cursor-pointer focus:outline-hidden"
        >
          <NanoBananaLogo size="md" glow />
        </button>
      </div>

      {/* Language Switcher, Theme Selector & Linter Badge */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Multilingual Selector */}
        <LanguageSwitcher
          activeLang={activeLang}
          availableLanguages={cv.availableLanguages}
          onSwitchLanguage={onSwitchLanguage}
          onAddLanguage={onAddLanguage}
        />

        {/* Global App Theme Chooser (Light / Dark / System) */}
        <ThemeSelector lang={activeLang} />

        {/* Quality Linter Badge */}
        <LinterBadge
          report={linterReport}
          onClick={() => setShowLinterModal(true)}
        />
      </div>

      {/* Actions: New/Setup, Presets, TeX & JSON with Charm Pill Geometry */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* New / Setup screen button */}
        {onOpenSetup && (
          <button
            onClick={onOpenSetup}
            title={tUI("newDoc", activeLang)}
            className="flex items-center gap-1.5 text-xs font-bold bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 px-3.5 py-1.5 rounded-full border border-stone-200 dark:border-stone-700 transition-all shadow-2xs"
          >
            <Plus size={13} className="text-amber-700 dark:text-amber-400" />
            <span>{tUI("newDoc", activeLang)}</span>
          </button>
        )}

        {/* Presets dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowPresets(!showPresets)}
            className="flex items-center gap-1.5 text-xs font-bold bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 px-3.5 py-1.5 rounded-full border border-stone-200 dark:border-stone-700 transition-all shadow-2xs"
          >
            <Layers size={13} />
            <span>{tUI("templates", activeLang)}</span>
            <ChevronDown size={12} />
          </button>

          {showPresets && (
            <div className="absolute right-0 mt-1.5 w-68 bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 p-2 z-50 animate-in fade-in duration-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-2 py-1 font-mono">
                {activeLang === "pt" ? "Carregar Modelo de Exemplo" : "Load Preset Template"}
              </p>
              {PRESET_SEEDS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onLoadPreset(p.id);
                    setShowPresets(false);
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-xs space-y-0.5"
                >
                  <p className="font-bold text-stone-800 dark:text-stone-200">{p.name}</p>
                  <p className="text-[10.5px] text-stone-500 line-clamp-1">
                    {p.description}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* TeX Modal Button */}
        <button
          onClick={() => setShowLatexModal(true)}
          title="Export TeX (.tex) or import from TeX"
          className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300 hover:text-amber-950 bg-amber-50/90 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 px-3.5 py-1.5 rounded-full transition-all shadow-2xs"
        >
          <Code2 size={13} className="text-amber-700 dark:text-amber-400" />
          <span>{tUI("texManagement", activeLang)}</span>
        </button>

        {/* Import JSON */}
        <button
          onClick={() => fileInputRef.current?.click()}
          title={tUI("importAction", activeLang)}
          className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-750 border border-stone-200 dark:border-stone-700 px-3 py-1.5 rounded-full transition-all shadow-2xs"
        >
          <FileUp size={13} />
          <span className="hidden sm:inline">{tUI("importAction", activeLang)}</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Export JSON */}
        <button
          onClick={onExportJson}
          title={tUI("jsonBackup", activeLang)}
          className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-750 border border-stone-200 dark:border-stone-700 px-3 py-1.5 rounded-full transition-all shadow-2xs"
        >
          <FileDown size={13} />
          <span className="hidden sm:inline">{tUI("jsonBackup", activeLang)}</span>
        </button>
      </div>

      {/* Linter Modal */}
      <LinterModal
        report={linterReport}
        isOpen={showLinterModal}
        onClose={() => setShowLinterModal(false)}
      />

      {/* TeX Modal */}
      <LatexModal
        open={showLatexModal}
        onOpenChange={setShowLatexModal}
        cv={cv}
        lang={activeLang}
        onImportCV={onImportJson}
      />
    </header>
  );
}
