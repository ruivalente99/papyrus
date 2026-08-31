"use client";

import React, { useState, useRef } from "react";
import type { CVDocument, SupportedLanguage } from "@/types/cv";
import { PRESET_SEEDS, emptySeed } from "@/data/seeds";
import { importFromLatex } from "@/lib/latexEngine";
import { tUI } from "@/lib/i18n";
import { ThemeSelector } from "@/components/common/ThemeSelector";
import {
  Upload,
  FileCode,
  FileDown,
  Sparkles,
  PlusCircle,
  CheckCircle2,
  FileText,
  AlertCircle,
  Code2,
  Layers,
} from "lucide-react";

interface Props {
  onComplete: (cv: CVDocument) => void;
  onImportJson: (cv: CVDocument) => void;
  lang?: SupportedLanguage;
  onSwitchLang?: (lang: SupportedLanguage) => void;
}

export function SetupScreen({ onComplete, onImportJson, lang = "en", onSwitchLang }: Props) {
  const [uiLang, setUiLang] = useState<SupportedLanguage>(lang);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [bilingual, setBilingual] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          setSuccessMessage(
            uiLang === "pt"
              ? `Ficheiro JSON "${file.name}" carregado com sucesso!`
              : `JSON file "${file.name}" loaded successfully!`
          );
          setTimeout(() => onImportJson(parsed), 600);
        } catch (err: any) {
          setErrorMessage(
            uiLang === "pt"
              ? "Ficheiro JSON inválido ou corrompido."
              : "Invalid or corrupted JSON file."
          );
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
          setSuccessMessage(
            uiLang === "pt"
              ? `Documento TeX "${file.name}" importado com sucesso!`
              : `TeX document "${file.name}" imported successfully!`
          );
          setTimeout(() => onComplete(merged), 600);
        } catch (err: any) {
          setErrorMessage(
            uiLang === "pt"
              ? "Erro ao analisar o documento TeX."
              : "Failed to parse TeX document."
          );
        }
      };
      reader.readAsText(file);
    } else {
      setErrorMessage(
        uiLang === "pt"
          ? "Formato não suportado. Por favor utilize ficheiros .json ou .tex."
          : "Unsupported format. Please upload a .json or .tex file."
      );
    }
  };

  const handleStartManual = (isDemo: boolean = false) => {
    let baseDoc: CVDocument;

    if (isDemo) {
      baseDoc = JSON.parse(JSON.stringify(PRESET_SEEDS[0].cv));
    } else {
      baseDoc = JSON.parse(JSON.stringify(emptySeed));
    }

    if (fullName.trim()) {
      baseDoc.personalInfo.fullName = fullName.trim();
      baseDoc.title = `CV ${fullName.trim()}`;
    }

    baseDoc.defaultLanguage = uiLang;
    baseDoc.currentLanguage = uiLang;

    if (bilingual) {
      baseDoc.availableLanguages = [
        { code: "en", label: "English" },
        { code: "pt", label: "Português" },
      ];
    } else {
      baseDoc.availableLanguages = [
        uiLang === "en" ? { code: "en", label: "English" } : { code: "pt", label: "Português" },
      ];
    }

    onComplete(baseDoc);
  };

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col justify-between selection:bg-amber-700 selection:text-white transition-colors duration-200">
      {/* Top Header */}
      <header className="border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-700 text-white flex items-center justify-center font-black text-base shadow-lg shadow-amber-900/30">
            P
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-widest text-stone-900 dark:text-stone-100 font-mono">
              PAPYRUS
            </h1>
            <p className="text-[10px] tracking-wider text-amber-700 dark:text-amber-500 font-mono">
              ARCHITECTURA VITAE
            </p>
          </div>
        </div>

        {/* Header Controls: Theme Selector & Language Switcher */}
        <div className="flex items-center gap-2">
          <ThemeSelector lang={uiLang} />

          <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-900 p-1 rounded-xl border border-stone-200 dark:border-stone-800">
            <button
              onClick={() => handleLanguageToggle("en")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                uiLang === "en"
                  ? "bg-amber-700 text-white shadow-xs"
                  : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => handleLanguageToggle("pt")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                uiLang === "pt"
                  ? "bg-amber-700 text-white shadow-xs"
                  : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
              }`}
            >
              PT
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12 flex-1 w-full flex flex-col justify-center space-y-8">
        {/* Title Header */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800/60 text-amber-900 dark:text-amber-400 text-xs font-semibold">
            <Sparkles size={13} />
            <span>{tUI("tagline", uiLang)}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
            {tUI("setupTitle", uiLang)}
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-400 max-w-lg mx-auto">
            {tUI("setupSubtitle", uiLang)}
          </p>
        </div>

        {/* Feedback Messages */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 rounded-xl text-xs flex items-center justify-center gap-2 animate-in fade-in duration-200">
            <AlertCircle size={15} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-center justify-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 size={15} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Primary Dropzone Area with Drag Animations */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center group ${
            isDragging
              ? "border-amber-500 bg-amber-50 dark:bg-amber-950/40 scale-[1.02] shadow-2xl shadow-amber-950/50 ring-4 ring-amber-500/20"
              : "border-stone-300 dark:border-stone-700 bg-white/70 dark:bg-stone-900/50 hover:border-amber-600 hover:bg-white dark:hover:bg-stone-900/80 hover:shadow-xl"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.tex,application/json,text/plain"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Animated upload icon circle */}
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-300 mb-4 ${
              isDragging
                ? "bg-amber-600 text-white scale-110 animate-bounce"
                : "bg-stone-100 dark:bg-stone-800 text-amber-700 dark:text-amber-400 group-hover:scale-110 group-hover:bg-amber-700 group-hover:text-white"
            }`}
          >
            <Upload size={28} />
          </div>

          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
            {tUI("dropzoneTitle", uiLang)}
          </h3>

          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-md leading-relaxed">
            {tUI("dropzoneSubtitle", uiLang)}
          </p>

          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 group-hover:bg-amber-700 text-xs font-semibold text-stone-700 dark:text-stone-200 group-hover:text-white transition-all shadow-xs border border-stone-200 dark:border-stone-700">
            <FileCode size={14} />
            <span>{tUI("browseFiles", uiLang)} (.json / .tex)</span>
          </div>
        </div>

        {/* Starter Template Download Boilerplates */}
        <div className="bg-white/80 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="space-y-0.5 text-center sm:text-left">
            <p className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center justify-center sm:justify-start gap-1.5">
              <FileDown size={14} className="text-amber-700 dark:text-amber-500" />
              <span>{tUI("orDownloadTemplate", uiLang)}</span>
            </p>
            <p className="text-[11px] text-stone-500">
              {uiLang === "pt"
                ? "Preencha no seu editor favorito e arraste o ficheiro de volta."
                : "Fill in your local text editor and drop the file back in."}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href="/template.json"
              download="template.json"
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold border border-stone-200 dark:border-stone-700 transition-all hover:border-stone-400"
            >
              <FileText size={13} className="text-amber-700 dark:text-amber-400" />
              <span>template.json</span>
            </a>

            <a
              href="/template.tex"
              download="template.tex"
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold border border-stone-200 dark:border-stone-700 transition-all hover:border-stone-400"
            >
              <Code2 size={13} className="text-amber-700 dark:text-amber-400" />
              <span>template.tex</span>
            </a>
          </div>
        </div>

        {/* Bottom Manual Setup / Demo exploration */}
        <div className="pt-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-px bg-stone-200 dark:bg-stone-800 flex-1" />
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {tUI("manualSetupTitle", uiLang)}
            </span>
            <div className="h-px bg-stone-200 dark:bg-stone-800 flex-1" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Blank Canvas option */}
            <button
              type="button"
              onClick={() => handleStartManual(false)}
              className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white/70 dark:bg-stone-900/40 hover:border-amber-600 hover:bg-white dark:hover:bg-stone-900/80 text-left transition-all group flex items-start gap-3.5 shadow-2xs"
            >
              <div className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 group-hover:bg-amber-700 group-hover:text-white transition-colors">
                <PlusCircle size={20} />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-stone-900 dark:text-stone-200 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                  {tUI("blankCanvas", uiLang)}
                </h4>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-snug">
                  {tUI("blankCanvasDesc", uiLang)}
                </p>
              </div>
            </button>

            {/* Demo dataset option */}
            <button
              type="button"
              onClick={() => handleStartManual(true)}
              className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white/70 dark:bg-stone-900/40 hover:border-amber-600 hover:bg-white dark:hover:bg-stone-900/80 text-left transition-all group flex items-start gap-3.5 shadow-2xs"
            >
              <div className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 group-hover:bg-amber-700 group-hover:text-white transition-colors">
                <Layers size={20} />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-stone-900 dark:text-stone-200 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                  {tUI("demoDataset", uiLang)}
                </h4>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-snug">
                  {tUI("demoDatasetDesc", uiLang)}
                </p>
              </div>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 py-3.5 px-6 text-center text-xs text-stone-500 font-mono">
        PAPYRUS • ARCHITECTURA VITAE • 100% Client-Side & Offline-Ready
      </footer>
    </div>
  );
}
