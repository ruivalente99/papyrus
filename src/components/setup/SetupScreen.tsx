"use client";

import React, { useState, useRef } from "react";
import type { CVDocument, SupportedLanguage } from "@/types/cv";
import { PRESET_SEEDS, emptySeed } from "@/data/seeds";
import { importFromLatex } from "@/lib/latexEngine";
import { ThemeSelector } from "@/components/common/ThemeSelector";
import { NanoBananaLogo } from "@/components/common/NanoBananaLogo";
import { HelpTooltip } from "@/components/common/HelpTooltip";
import {
  Upload,
  FileCode,
  FileDown,
  PlusCircle,
  CheckCircle2,
  FileText,
  AlertCircle,
  Code2,
  Layers,
  ArrowRight,
  Copy,
  Trash2,
  Play,
} from "lucide-react";

interface Props {
  onComplete: (cv: CVDocument) => void;
  onResume?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  activeCv?: CVDocument;
  hasCachedDoc?: boolean;
  onImportJson: (cv: CVDocument) => void;
  lang?: SupportedLanguage;
  onSwitchLang?: (lang: SupportedLanguage) => void;
}

export function SetupScreen({
  onComplete,
  onResume,
  onDuplicate,
  onDelete,
  activeCv,
  hasCachedDoc = false,
  onImportJson,
  lang = "en",
  onSwitchLang,
}: Props) {
  const [uiLang, setUiLang] = useState<SupportedLanguage>(lang);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPt = uiLang === "pt";

  const handleLanguageToggle = (newLang: SupportedLanguage) => {
    setUiLang(newLang);
    if (onSwitchLang) onSwitchLang(newLang);
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const fileName = file.name.toLowerCase();
    const reader = new FileReader();

    if (fileName.endsWith(".json")) {
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target?.result as string) as CVDocument;
          if (!parsed.personalInfo || !parsed.sections) {
            throw new Error("Invalid CV Document schema");
          }
          setSuccessMessage(isPt ? `"${file.name}" carregado!` : `"${file.name}" loaded!`);
          setTimeout(() => onImportJson(parsed), 500);
        } catch (err: any) {
          setErrorMessage(isPt ? "JSON inválido." : "Invalid JSON file.");
        }
      };
      reader.readAsText(file);
    } else if (fileName.endsWith(".tex") || file.type.includes("tex") || file.type.includes("plain")) {
      reader.onload = (ev) => {
        try {
          const content = ev.target?.result as string;
          const parsed = importFromLatex(content);
          const base = PRESET_SEEDS[0].cv;
          const merged: CVDocument = {
            ...base,
            ...parsed,
            personalInfo: {
              ...base.personalInfo,
              ...(parsed.personalInfo || {}),
            },
            sections: parsed.sections || base.sections,
            updatedAt: new Date().toISOString(),
          };
          setSuccessMessage(isPt ? `"${file.name}" importado!` : `"${file.name}" imported!`);
          setTimeout(() => onComplete(merged), 500);
        } catch (err: any) {
          setErrorMessage(isPt ? "Erro ao ler TeX." : "Failed to parse TeX.");
        }
      };
      reader.readAsText(file);
    } else {
      setErrorMessage(isPt ? "Formato inválido (.json ou .tex)." : "Unsupported format (.json or .tex).");
    }
  };

  const handleStartManual = (isDemo: boolean = false) => {
    const baseDoc: CVDocument = isDemo
      ? JSON.parse(JSON.stringify(PRESET_SEEDS[0].cv))
      : JSON.parse(JSON.stringify(emptySeed));

    baseDoc.defaultLanguage = uiLang;
    baseDoc.currentLanguage = uiLang;
    onComplete(baseDoc);
  };

  const activeName = activeCv?.personalInfo?.fullName || activeCv?.title || "curriculum";

  return (
    <div className="min-h-screen charm-bg-dynamic text-stone-900 dark:text-stone-100 flex flex-col justify-between selection:bg-amber-700 selection:text-white transition-colors duration-300">
      {/* Top Header - Minimalist */}
      <header className="border-b border-stone-200/70 dark:border-stone-800/70 bg-white/70 dark:bg-stone-900/70 backdrop-blur-md px-4 sm:px-6 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-3 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <NanoBananaLogo size="md" glow />
          <span className="font-mono text-sm font-bold tracking-tight lowercase text-stone-900 dark:text-stone-100">
            papyrus
          </span>
        </div>

        {/* Controls: Theme & Language */}
        <div className="flex items-center gap-2">
          <ThemeSelector lang={uiLang} />

          <div className="flex items-center gap-0.5 bg-stone-100 dark:bg-stone-800 p-0.5 rounded-full border border-stone-200 dark:border-stone-700">
            <button
              onClick={() => handleLanguageToggle("en")}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition-all ${
                uiLang === "en"
                  ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs"
                  : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => handleLanguageToggle("pt")}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition-all ${
                uiLang === "pt"
                  ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs"
                  : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
              }`}
            >
              PT
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-xl mx-auto px-4 py-8 sm:py-10 flex-1 w-full flex flex-col justify-center space-y-6 animate-fade-scale">
        {/* Feedback Messages */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 rounded-2xl text-xs flex items-center justify-center gap-2 animate-in fade-in">
            <AlertCircle size={14} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs flex items-center justify-center gap-2 animate-in fade-in">
            <CheckCircle2 size={14} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 1. Resume Active Document Card (if cached document exists) */}
        {hasCachedDoc && onResume && (
          <div className="p-4 sm:p-5 rounded-3xl bg-white/90 dark:bg-stone-900/90 border border-amber-300/80 dark:border-amber-700/60 shadow-md shadow-amber-500/5 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400">
                  <Play size={18} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-700 dark:text-amber-400 font-bold">
                    {isPt ? "Em Edição" : "Active Session"}
                  </span>
                  <h3 className="text-sm font-bold truncate text-stone-900 dark:text-stone-100">
                    {activeName}
                  </h3>
                </div>
              </div>

              {/* Resume Primary Action */}
              <button
                onClick={onResume}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-full shadow-xs transition-all active:scale-95"
              >
                <span>{isPt ? "Retomar" : "Resume"}</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {/* Sub-actions: Duplicate & Delete */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800/80 text-xs">
              <span className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                {activeCv?.template} • {activeCv?.sections?.length || 0} {isPt ? "secções" : "sections"}
              </span>

              <div className="flex items-center gap-2">
                {onDuplicate && (
                  <button
                    onClick={onDuplicate}
                    className="flex items-center gap-1 text-[11px] font-bold text-stone-600 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-400 px-2.5 py-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                  >
                    <Copy size={12} />
                    <span>{isPt ? "Duplicar" : "Duplicate"}</span>
                  </button>
                )}

                {onDelete && (
                  <button
                    onClick={() => {
                      if (confirm(isPt ? "Eliminar este CV e recomeçar?" : "Reset and clear this CV?")) {
                        onDelete();
                      }
                    }}
                    className="flex items-center gap-1 text-[11px] font-bold text-stone-400 hover:text-red-600 dark:hover:text-red-400 px-2.5 py-1 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 size={12} />
                    <span>{isPt ? "Eliminar" : "Delete"}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. Primary Dropzone Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center group ${
            isDragging
              ? "border-amber-500 bg-amber-500/10 scale-[1.01] shadow-lg shadow-amber-500/10 ring-2 ring-amber-500/20"
              : "border-stone-300 dark:border-stone-700 bg-white/70 dark:bg-stone-900/50 hover:border-amber-500 hover:bg-white dark:hover:bg-stone-900/80 shadow-xs"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.tex,application/json,text/plain"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 mb-3 ${
              isDragging
                ? "bg-amber-600 text-white scale-110"
                : "bg-amber-500/10 text-amber-700 dark:text-amber-400 group-hover:scale-105 group-hover:bg-amber-700 group-hover:text-white"
            }`}
          >
            <Upload size={22} />
          </div>

          <div className="flex items-center gap-1.5 font-bold text-xs text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400">
            <span>{isPt ? "Arraste ou carregue .json / .tex" : "Drop or upload .json / .tex"}</span>
            <HelpTooltip
              content={
                isPt
                  ? "Importe ficheiros JSON gerados pelo papyrus ou ficheiros TeX padrão."
                  : "Import papyrus JSON backups or standard TeX curriculum files."
              }
            />
          </div>

          <div className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800 group-hover:bg-amber-700 text-[11px] font-bold text-stone-700 dark:text-stone-200 group-hover:text-white transition-all shadow-2xs border border-stone-200 dark:border-stone-700">
            <FileCode size={13} />
            <span>{isPt ? "Procurar Ficheiro" : "Browse File"}</span>
          </div>
        </div>

        {/* 3. Starter Templates & Manual Options */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            {/* Blank Canvas */}
            <button
              type="button"
              onClick={() => handleStartManual(false)}
              className="p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white/70 dark:bg-stone-900/40 hover:border-amber-500 hover:bg-white dark:hover:bg-stone-900/80 text-left transition-all group flex items-center gap-3 shadow-2xs"
            >
              <div className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 group-hover:bg-amber-700 group-hover:text-white transition-colors">
                <PlusCircle size={16} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400">
                  {isPt ? "Em Branco" : "Blank"}
                </h4>
                <p className="text-[10.5px] text-stone-500 dark:text-stone-400">
                  {isPt ? "Sem dados" : "Clean canvas"}
                </p>
              </div>
            </button>

            {/* Demo Template */}
            <button
              type="button"
              onClick={() => handleStartManual(true)}
              className="p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white/70 dark:bg-stone-900/40 hover:border-amber-500 hover:bg-white dark:hover:bg-stone-900/80 text-left transition-all group flex items-center gap-3 shadow-2xs"
            >
              <div className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 group-hover:bg-amber-700 group-hover:text-white transition-colors">
                <Layers size={16} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400">
                  {isPt ? "Exemplo" : "Demo"}
                </h4>
                <p className="text-[10.5px] text-stone-500 dark:text-stone-400">
                  {isPt ? "Com mock data" : "With mock data"}
                </p>
              </div>
            </button>
          </div>

          {/* Boilerplate downloads (Minimalist) */}
          <div className="flex items-center justify-center gap-2 pt-1">
            <span className="text-[11px] text-stone-400 font-mono">
              {isPt ? "Modelos locais:" : "Local templates:"}
            </span>
            <a
              href="/template.json"
              download="template.json"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-amber-700 text-[10.5px] font-mono font-bold border border-stone-200 dark:border-stone-700 transition-colors"
            >
              <FileText size={11} />
              <span>.json</span>
            </a>
            <a
              href="/template.tex"
              download="template.tex"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-amber-700 text-[10.5px] font-mono font-bold border border-stone-200 dark:border-stone-700 transition-colors"
            >
              <Code2 size={11} />
              <span>.tex</span>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200/70 dark:border-stone-800/70 bg-white/60 dark:bg-stone-950/60 py-3 px-6 text-center text-[11px] text-stone-400 font-mono lowercase pb-safe">
        papyrus • offline-ready
      </footer>
    </div>
  );
}
