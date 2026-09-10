"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import type { CVDocument, SupportedLanguage } from "@/types/cv";
import { PRESET_SEEDS } from "@/data/seeds";
import { compareCVs, mergeItemIntoCV } from "@/lib/cvDiff";
import { CVPage } from "@/components/preview/CVPage";
import { SemanticDiffView } from "./SemanticDiffView";
import { ATSCompareCard } from "./ATSCompareCard";
import { A4_W_PX, A4_H_PX } from "@/lib/pdfExport";
import {
  X,
  GitCompare,
  Columns2,
  FileDiff,
  Award,
  Upload,
  Link,
  Unlink,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

interface Props {
  activeCV: CVDocument;
  isOpen: boolean;
  onClose: () => void;
  lang?: SupportedLanguage;
  onUpdateActiveCV?: (updatedCV: CVDocument) => void;
}

type ComparatorMode = "canvas" | "diff" | "ats";

export function CVCompareModal({
  activeCV,
  isOpen,
  onClose,
  lang = "en",
  onUpdateActiveCV,
}: Props) {
  const isPt = lang === "pt";
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<ComparatorMode>("canvas");
  const [syncScroll, setSyncScroll] = useState(true);
  const [scale, setScale] = useState(0.6);

  // Default comparison target: pick a preset different from active CV
  const defaultPresetSeed = useMemo(() => {
    return PRESET_SEEDS.find((s) => s.id !== activeCV.template) || PRESET_SEEDS[0];
  }, [activeCV.template]);

  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(defaultPresetSeed.id);
  const [compareCV, setCompareCV] = useState<CVDocument>(defaultPresetSeed.cv);
  const [compareSourceTitle, setCompareSourceTitle] = useState<string>(`${defaultPresetSeed.name} Preset`);

  const paneARef = useRef<HTMLDivElement>(null);
  const paneBRef = useRef<HTMLDivElement>(null);
  const isSyncingScroll = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update default compare CV if active CV template changes
  useEffect(() => {
    const alternate = PRESET_SEEDS.find((s) => s.id !== activeCV.template) || PRESET_SEEDS[0];
    setSelectedPresetId(alternate.id);
    setCompareCV(alternate.cv);
    setCompareSourceTitle(`${alternate.name} Preset`);
  }, [activeCV.template]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Synchronized scroll handlers
  const handleScrollA = () => {
    if (!syncScroll || isSyncingScroll.current || !paneARef.current || !paneBRef.current) return;
    isSyncingScroll.current = true;
    const { scrollTop, scrollHeight, clientHeight } = paneARef.current;
    const maxScrollA = scrollHeight - clientHeight;
    if (maxScrollA > 0) {
      const ratio = scrollTop / maxScrollA;
      const maxScrollB = paneBRef.current.scrollHeight - paneBRef.current.clientHeight;
      paneBRef.current.scrollTop = ratio * maxScrollB;
    }
    requestAnimationFrame(() => {
      isSyncingScroll.current = false;
    });
  };

  const handleScrollB = () => {
    if (!syncScroll || isSyncingScroll.current || !paneARef.current || !paneBRef.current) return;
    isSyncingScroll.current = true;
    const { scrollTop, scrollHeight, clientHeight } = paneBRef.current;
    const maxScrollB = scrollHeight - clientHeight;
    if (maxScrollB > 0) {
      const ratio = scrollTop / maxScrollB;
      const maxScrollA = paneARef.current.scrollHeight - paneARef.current.clientHeight;
      paneARef.current.scrollTop = ratio * maxScrollA;
    }
    requestAnimationFrame(() => {
      isSyncingScroll.current = false;
    });
  };

  // Perform full diff
  const diffResult = useMemo(() => {
    return compareCVs(activeCV, compareCV, lang);
  }, [activeCV, compareCV, lang]);

  // Preset switch handler
  const handleSelectPreset = (presetId: string) => {
    const found = PRESET_SEEDS.find((s) => s.id === presetId);
    if (found) {
      setSelectedPresetId(presetId);
      setCompareCV(found.cv);
      setCompareSourceTitle(`${found.name} Preset`);
    }
  };

  // File Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && typeof parsed === "object" && parsed.personalInfo) {
          setSelectedPresetId(null);
          setCompareCV(parsed);
          setCompareSourceTitle(file.name);
        } else {
          alert(isPt ? "Arquivo JSON inválido para CV." : "Invalid CV JSON structure.");
        }
      } catch (_err) {
        alert(isPt ? "Erro ao ler ficheiro JSON." : "Error reading JSON file.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Selective merge handler
  const handleMergeItem = (sectionType: string, item: any) => {
    if (!onUpdateActiveCV) return;
    const merged = mergeItemIntoCV(activeCV, sectionType, item);
    onUpdateActiveCV(merged);
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="compare-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4 overflow-hidden"
    >
      <div className="bg-white dark:bg-zinc-900 w-full max-w-7xl h-full max-h-[96vh] rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top App Bar */}
        <header className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h2 id="compare-modal-title" className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                {isPt ? "Comparador Visual de CVs" : "Visual CV Comparator & Diff Engine"}
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {diffResult.summary.totalChanges} {isPt ? "alterações" : "changes"}
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {isPt
                  ? "Comparação lado a lado, diff semântico e matriz de qualidade ATS"
                  : "Side-by-side synchronization, semantic diffing, and ATS audit matrix"}
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center bg-zinc-200/70 dark:bg-zinc-800 p-1 rounded-xl">
            <button
              onClick={() => setMode("canvas")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                mode === "canvas"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span>{isPt ? "Lado a Lado (A4)" : "Side-by-Side"}</span>
            </button>
            <button
              onClick={() => setMode("diff")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                mode === "diff"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <FileDiff className="w-3.5 h-3.5" />
              <span>{isPt ? "Diff Semântico" : "Semantic Diff"}</span>
            </button>
            <button
              onClick={() => setMode("ats")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                mode === "ats"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>{isPt ? "Matriz ATS" : "ATS Matrix"}</span>
            </button>
          </div>

          {/* Controls: Target Source Selection & Actions */}
          <div className="flex items-center gap-2">
            {/* Source B Preset Selector */}
            <div className="flex items-center gap-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1">
              <span className="text-[11px] text-zinc-400 font-medium">{isPt ? "Alvo:" : "Target:"}</span>
              <select
                aria-label={isPt ? "Selecionar versão de comparação" : "Select comparison target"}
                value={selectedPresetId || ""}
                onChange={(e) => handleSelectPreset(e.target.value)}
                className="text-xs bg-transparent border-none text-zinc-800 dark:text-zinc-200 focus:outline-hidden font-medium cursor-pointer"
              >
                {!selectedPresetId && (
                  <option value="" disabled className="dark:bg-zinc-800">
                    {compareSourceTitle}
                  </option>
                )}
                {PRESET_SEEDS.map((p) => (
                  <option key={p.id} value={p.id} className="dark:bg-zinc-800">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Upload JSON Button */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              title={isPt ? "Carregar ficheiro JSON para comparar" : "Upload JSON backup to compare"}
              className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <Upload className="w-4 h-4" />
            </button>

            {/* Canvas Mode Specific Controls */}
            {mode === "canvas" && (
              <>
                {/* Scroll Lock Toggle */}
                <button
                  onClick={() => setSyncScroll(!syncScroll)}
                  title={syncScroll ? (isPt ? "Desbloquear scroll" : "Unlock scroll") : (isPt ? "Bloquear scroll sincronizado" : "Lock synchronized scroll")}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    syncScroll
                      ? "bg-indigo-50 border-indigo-300 text-indigo-600 dark:bg-indigo-950/60 dark:border-indigo-800 dark:text-indigo-400"
                      : "border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-zinc-600"
                  }`}
                >
                  {syncScroll ? <Link className="w-4 h-4" /> : <Unlink className="w-4 h-4" />}
                </button>

                {/* Zoom Controls */}
                <div className="flex items-center bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg">
                  <button
                    onClick={() => setScale((s) => Math.max(0.4, Number((s - 0.05).toFixed(2))))}
                    className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                    title={isPt ? "Reduzir zoom" : "Zoom out"}
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-mono px-1 text-zinc-600 dark:text-zinc-400">
                    {Math.round(scale * 100)}%
                  </span>
                  <button
                    onClick={() => setScale((s) => Math.min(0.85, Number((s + 0.05).toFixed(2))))}
                    className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                    title={isPt ? "Aumentar zoom" : "Zoom in"}
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Modal Main Content */}
        <main className="flex-1 overflow-hidden bg-zinc-100/50 dark:bg-zinc-950/40 relative">
          {/* Mode 1: Dual Synchronized A4 Canvas */}
          {mode === "canvas" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 h-full divide-y lg:divide-y-0 lg:divide-x divide-zinc-200 dark:divide-zinc-800">
              {/* Left Pane: Active CV */}
              <div className="flex flex-col h-full overflow-hidden">
                <div className="px-4 py-2.5 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-900 dark:text-white">
                      {isPt ? "Versão A (CV Ativo)" : "Version A (Active CV)"}
                    </span>
                    <span className="text-zinc-400">•</span>
                    <span className="text-zinc-500 dark:text-zinc-400 capitalize">
                      {activeCV.template} template
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-zinc-400">ATS:</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">{diffResult.scoreA}%</span>
                  </div>
                </div>

                <div
                  ref={paneARef}
                  onScroll={handleScrollA}
                  className="flex-1 overflow-y-auto p-4 flex justify-center items-start"
                >
                  <div
                    style={{
                      transform: `scale(${scale})`,
                      transformOrigin: "top center",
                      width: `${A4_W_PX}px`,
                      minHeight: `${A4_H_PX}px`,
                      marginBottom: `${(scale - 1) * A4_H_PX}px`,
                    }}
                    className="transition-transform duration-75"
                  >
                    <CVPage cv={activeCV} lang={lang} id="compare-active-cv" />
                  </div>
                </div>
              </div>

              {/* Right Pane: Comparison CV */}
              <div className="flex flex-col h-full overflow-hidden">
                <div className="px-4 py-2.5 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-900 dark:text-white">
                      {isPt ? "Versão B (Comparação)" : "Version B (Compare Target)"}
                    </span>
                    <span className="text-zinc-400">•</span>
                    <span className="text-zinc-500 dark:text-zinc-400">
                      {compareSourceTitle}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-zinc-400">ATS:</span>
                    <span
                      className={`font-bold ${
                        diffResult.scoreB > diffResult.scoreA
                          ? "text-emerald-600 dark:text-emerald-400"
                          : diffResult.scoreB < diffResult.scoreA
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-zinc-800 dark:text-zinc-200"
                      }`}
                    >
                      {diffResult.scoreB}%
                    </span>
                  </div>
                </div>

                <div
                  ref={paneBRef}
                  onScroll={handleScrollB}
                  className="flex-1 overflow-y-auto p-4 flex justify-center items-start"
                >
                  <div
                    style={{
                      transform: `scale(${scale})`,
                      transformOrigin: "top center",
                      width: `${A4_W_PX}px`,
                      minHeight: `${A4_H_PX}px`,
                      marginBottom: `${(scale - 1) * A4_H_PX}px`,
                    }}
                    className="transition-transform duration-75"
                  >
                    <CVPage cv={compareCV} lang={lang} id="compare-target-cv" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mode 2: Semantic Diff Tree View */}
          {mode === "diff" && (
            <div className="h-full overflow-y-auto p-6 max-w-5xl mx-auto">
              <SemanticDiffView
                diffResult={diffResult}
                lang={lang}
                onMergeItem={handleMergeItem}
              />
            </div>
          )}

          {/* Mode 3: ATS Matrix View */}
          {mode === "ats" && (
            <div className="h-full overflow-y-auto p-6 max-w-4xl mx-auto">
              <ATSCompareCard
                scoreA={diffResult.scoreA}
                scoreB={diffResult.scoreB}
                metrics={diffResult.atsMetrics}
                lang={lang}
                labelA={isPt ? "CV Ativo" : "Active CV"}
                labelB={compareSourceTitle}
              />
            </div>
          )}
        </main>
      </div>
    </div>,
    document.body
  );
}
