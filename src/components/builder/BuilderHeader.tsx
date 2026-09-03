"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import type { CVDocument, SupportedLanguage, LinterReport } from "@/types/cv";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { LinterBadge } from "./linter/LinterBadge";
import { LinterModal } from "./linter/LinterModal";
import { LatexModal } from "./latex/LatexModal";
import { ThemeSelector } from "@/components/common/ThemeSelector";
import { NanoBananaLogo } from "@/components/common/NanoBananaLogo";
import { PRESET_SEEDS } from "@/data/seeds";
import { tUI } from "@/lib/i18n";
import { useTranslation } from "@/hooks/useTranslation";
import {
  FileUp,
  FileDown,
  Layers,
  ChevronDown,
  Code2,
  Plus,
  BookOpen,
  Undo2,
  Redo2,
  Command,
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
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onOpenCommandPalette?: () => void;
  saveStatus?: "saved" | "saving";
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
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onOpenCommandPalette,
  saveStatus = "saved",
}: Props) {
  const [showPresets, setShowPresets] = useState(false);
  const [showLinterModal, setShowLinterModal] = useState(false);
  const [showLatexModal, setShowLatexModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t: tr } = useTranslation(activeLang);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        onImportJson(parsed);
      } catch (err) {
        alert("Invalid JSON file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <header className="border-b border-stone-200/70 dark:border-stone-800/70 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md px-2.5 sm:px-5 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-2.5 sm:pb-3 flex items-center justify-between gap-1.5 sm:gap-2.5 sticky top-0 z-30 shadow-2xs transition-colors">
      {/* Brand: Minimalist Logo + lowercase papyrus */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        <Link
          href="/"
          title="papyrus editor"
          className="group cursor-pointer focus:outline-hidden flex items-center gap-1.5 sm:gap-2"
        >
          <NanoBananaLogo size="sm" glow />
          <span className="font-mono text-sm font-bold tracking-tight lowercase text-stone-900 dark:text-stone-100 hidden sm:inline">
            papyrus
          </span>
        </Link>

        {/* Undo / Redo Controls (Desktop / Tablet) */}
        {onUndo && onRedo && (
          <div className="hidden lg:flex items-center gap-0.5 bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg border border-stone-200 dark:border-stone-700">
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              title={tr("common.actions.undoWithShortcut")}
              aria-label={tr("a11y.actions.undo")}
              className="p-1.5 rounded text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors min-w-[24px] min-h-[24px] flex items-center justify-center"
            >
              <Undo2 size={13} />
            </button>
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              title={tr("common.actions.redoWithShortcut")}
              aria-label={tr("a11y.actions.redo")}
              className="p-1.5 rounded text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors min-w-[24px] min-h-[24px] flex items-center justify-center"
            >
              <Redo2 size={13} />
            </button>
          </div>
        )}

        {/* Command Palette Button */}
        {onOpenCommandPalette && (
          <button
            type="button"
            onClick={onOpenCommandPalette}
            title={tr("common.shortcuts.commandPalette")}
            aria-label={tr("a11y.actions.commandPalette")}
            className="hidden xl:flex items-center gap-1.5 px-2 py-1 text-[11px] font-mono font-bold rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700 hover:border-amber-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors shadow-2xs active:scale-95"
          >
            <Command size={11} className="text-amber-600 dark:text-amber-400" />
            <span>⌘K</span>
          </button>
        )}

        {/* Save Status Indicator */}
        <div
          title={
            saveStatus === "saving"
              ? activeLang === "pt"
                ? "A guardar alterações..."
                : "Saving changes..."
              : activeLang === "pt"
              ? "Todas as alterações guardadas localmente"
              : "All changes saved locally"
          }
          className="hidden 2xl:flex items-center gap-1 text-[10px] font-mono text-stone-400 dark:text-stone-500 select-none"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              saveStatus === "saving" ? "bg-amber-500 animate-ping" : "bg-emerald-500"
            }`}
          />
          <span>
            {saveStatus === "saving"
              ? activeLang === "pt"
                ? "A guardar..."
                : "Saving..."
              : activeLang === "pt"
              ? "Guardado"
              : "Saved"}
          </span>
        </div>
      </div>

      {/* Center Controls: Language Switcher, Theme Selector, Linter Badge */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0 flex-nowrap">
        <LanguageSwitcher
          activeLang={activeLang}
          availableLanguages={cv.availableLanguages}
          onSwitchLanguage={onSwitchLanguage}
          onAddLanguage={onAddLanguage}
        />

        <ThemeSelector lang={activeLang} />

        <LinterBadge
          report={linterReport}
          onClick={() => setShowLinterModal(true)}
        />
      </div>

      {/* Actions: Presets, TeX, JSON */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Guide / Tutorial Link */}
        <Link
          href="/guide"
          title={activeLang === "pt" ? "Como construir um CV passo a passo" : "Step-by-step CV guide"}
          className="flex items-center gap-1 text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-400 px-2.5 sm:px-3 py-1.5 rounded-full border border-amber-500/20 transition-all shadow-2xs shrink-0 active:scale-95"
        >
          <BookOpen size={13} />
          <span className="hidden md:inline">{activeLang === "pt" ? "Guia" : "Guide"}</span>
        </Link>

        {/* Setup / Home screen button (Desktop / Tablet only) */}
        {onOpenSetup && (
          <button
            onClick={onOpenSetup}
            title={tUI("newDoc", activeLang)}
            className="hidden sm:flex items-center gap-1 text-xs font-bold bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 px-3 py-1.5 rounded-full border border-stone-200 dark:border-stone-700 transition-all shadow-2xs"
          >
            <Plus size={13} className="text-amber-700 dark:text-amber-400" />
            <span className="hidden md:inline">{tUI("newDoc", activeLang)}</span>
          </button>
        )}

        {/* Presets dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowPresets(!showPresets)}
            className="flex items-center gap-1 text-xs font-bold bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 px-2.5 sm:px-3 py-1.5 rounded-full border border-stone-200 dark:border-stone-700 transition-all shadow-2xs"
          >
            <Layers size={13} />
            <span className="hidden md:inline">{tUI("templates", activeLang)}</span>
            <ChevronDown size={11} />
          </button>

          {showPresets && (
            <div className="absolute right-0 mt-1.5 w-60 bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 p-1.5 z-50 animate-in fade-in duration-100">
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400 px-2 py-1">
                {activeLang === "pt" ? "Modelos" : "Presets"}
              </p>
              {PRESET_SEEDS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onLoadPreset(p.id);
                    setShowPresets(false);
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-xs"
                >
                  <p className="font-bold text-stone-800 dark:text-stone-200">{p.name}</p>
                </button>
              ))}

              {/* Mobile Extended Actions inside Dropdown */}
              <div className="sm:hidden border-t border-stone-150 dark:border-stone-800 my-1 pt-1 space-y-0.5">
                {onOpenSetup && (
                  <button
                    onClick={() => {
                      onOpenSetup();
                      setShowPresets(false);
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-xs flex items-center gap-2 text-stone-800 dark:text-stone-200 font-semibold"
                  >
                    <Plus size={13} className="text-amber-700 dark:text-amber-400" />
                    <span>{tUI("newDoc", activeLang)}</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowLatexModal(true);
                    setShowPresets(false);
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-xs flex items-center gap-2 text-stone-800 dark:text-stone-200 font-semibold"
                >
                  <Code2 size={13} className="text-amber-700 dark:text-amber-400" />
                  <span>TeX Import / Export</span>
                </button>
                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                    setShowPresets(false);
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-xs flex items-center gap-2 text-stone-800 dark:text-stone-200 font-semibold"
                >
                  <FileUp size={13} />
                  <span>{tUI("importAction", activeLang)}</span>
                </button>
                <button
                  onClick={() => {
                    onExportJson();
                    setShowPresets(false);
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-xs flex items-center gap-2 text-stone-800 dark:text-stone-200 font-semibold"
                >
                  <FileDown size={13} />
                  <span>{tUI("jsonBackup", activeLang)}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* TeX Modal Button (Desktop / Tablet) */}
        <button
          onClick={() => setShowLatexModal(true)}
          title={tr("a11y.actions.texManagement")}
          aria-label={tr("a11y.actions.texManagement")}
          className="hidden sm:flex items-center gap-1 text-xs font-bold text-amber-900 dark:text-amber-300 hover:text-amber-950 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-300/60 dark:border-amber-700/60 px-3 py-1.5 rounded-full transition-all shadow-2xs min-h-[28px]"
        >
          <Code2 size={13} className="text-amber-700 dark:text-amber-400" />
          <span className="hidden lg:inline">TeX</span>
        </button>

        {/* Import JSON (Desktop / Tablet) */}
        <button
          onClick={() => fileInputRef.current?.click()}
          title={tr("common.actions.import")}
          aria-label={tr("a11y.actions.importJson")}
          className="hidden sm:flex p-1.5 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 rounded-full transition-all shadow-2xs min-w-[28px] min-h-[28px] items-center justify-center"
        >
          <FileUp size={13} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Export JSON (Desktop / Tablet) */}
        <button
          onClick={onExportJson}
          title={tr("common.actions.export")}
          aria-label={tr("a11y.actions.exportJson")}
          className="hidden sm:flex p-1.5 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 rounded-full transition-all shadow-2xs min-w-[28px] min-h-[28px] items-center justify-center"
        >
          <FileDown size={13} />
        </button>
      </div>

      {/* Modals */}
      <LinterModal
        report={linterReport}
        isOpen={showLinterModal}
        onClose={() => setShowLinterModal(false)}
        lang={activeLang}
        cv={cv}
      />

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
