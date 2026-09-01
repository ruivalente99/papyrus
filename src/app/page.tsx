"use client";

import React, { useState, useRef, useEffect } from "react";
import { useCV } from "@/hooks/useCV";
import { useTheme } from "@/context/ThemeContext";
import { BuilderHeader } from "@/components/builder/BuilderHeader";
import { SectionList } from "@/components/builder/SectionList";
import { CVPreviewContainer } from "@/components/preview/CVPreviewContainer";
import { SetupScreen } from "@/components/setup/SetupScreen";
import { CommandPalette } from "@/components/builder/CommandPalette";
import { CodeEditorPane } from "@/components/builder/code/CodeEditorPane";
import { createDylanAvatarDataUri } from "@/lib/avatar";
import { tUI } from "@/lib/i18n";
import { Pencil, Eye, Loader2, FileText, FileJson, Code2 } from "lucide-react";

export default function BuilderPage() {
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const [editorMode, setEditorMode] = useState<"form" | "json" | "latex">("form");
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [highlightedSectionId, setHighlightedSectionId] = useState<string | null>(null);
  const [splitRatio, setSplitRatio] = useState<number>(50);
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);
  const splitContainerRef = useRef<HTMLDivElement>(null);

  const { toggleTheme } = useTheme();

  useEffect(() => {
    try {
      const saved = localStorage.getItem("papyrus_split_ratio");
      if (saved) {
        const val = parseFloat(saved);
        if (!isNaN(val) && val >= 25 && val <= 75) {
          setSplitRatio(val);
        }
      }
    } catch (e) {}
  }, []);

  // Global shortcut for Command Palette: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDraggingSplit(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingSplit || !splitContainerRef.current) return;
    const rect = splitContainerRef.current.getBoundingClientRect();
    const newRatio = ((e.clientX - rect.left) / rect.width) * 100;
    const clamped = Math.max(25, Math.min(75, Number(newRatio.toFixed(1))));
    setSplitRatio(clamped);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingSplit) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {}
      setIsDraggingSplit(false);
      try {
        localStorage.setItem("papyrus_split_ratio", splitRatio.toString());
      } catch (err) {}
    }
  };

  const handleResetSplit = () => {
    setSplitRatio(50);
    try {
      localStorage.setItem("papyrus_split_ratio", "50");
    } catch (err) {}
  };

  const handleSelectSection = (sectionId: string) => {
    setHighlightedSectionId(sectionId);
    setMobileTab("edit");
    setEditorMode("form");

    setTimeout(() => {
      const targetId = sectionId === "personal" ? "section-personal" : `section-${sectionId}`;
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);

    setTimeout(() => {
      setHighlightedSectionId((curr) => (curr === sectionId ? null : curr));
    }, 2500);
  };

  const {
    cv,
    activeLang,
    switchLanguage,
    addLanguage,
    updatePersonalInfo,
    setTemplate,
    updateTheme,
    updateSection,
    toggleSectionVisibility,
    moveSection,
    deleteSection,
    addSection,
    loadPreset,
    importJson,
    exportJson,
    updateFromJson,
    undo,
    redo,
    canUndo,
    canRedo,
    saveStatus,
    linterReport,
    isLoaded,
    isSetupOpen,
    openSetup,
    resumeCV,
    duplicateCV,
    deleteCV,
    hasCachedDoc,
    completeSetup,
  } = useCV();

  const handleRerollDylan = () => {
    const baseName = cv.personalInfo?.fullName?.trim() || "Luna";
    const randomSuffix = Math.floor(Math.random() * 10000);
    const newSeed = `${baseName}-${randomSuffix}`;
    updatePersonalInfo({
      avatarSeed: newSeed,
      photoUrl: createDylanAvatarDataUri(newSeed),
      isCustomPhoto: false,
      showPhoto: true,
    });
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center charm-bg-dynamic text-stone-600 dark:text-stone-400 gap-2 transition-colors">
        <Loader2 size={18} className="animate-spin text-amber-600 dark:text-amber-500" />
        <span className="text-xs font-bold font-mono lowercase tracking-tight">papyrus</span>
      </div>
    );
  }

  // Show Setup / Welcome screen on initial onboarding or when triggered
  if (isSetupOpen) {
    return (
      <SetupScreen
        onComplete={completeSetup}
        onResume={resumeCV}
        onDuplicate={duplicateCV}
        onDelete={deleteCV}
        activeCv={cv}
        hasCachedDoc={hasCachedDoc}
        onImportJson={importJson}
        lang={activeLang}
        onSwitchLang={switchLanguage}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen max-w-full overflow-x-hidden charm-bg-dynamic text-stone-900 dark:text-stone-100 transition-colors duration-300">
      {/* Top Application Header */}
      <BuilderHeader
        cv={cv}
        activeLang={activeLang}
        onSwitchLanguage={switchLanguage}
        onAddLanguage={addLanguage}
        onLoadPreset={loadPreset}
        onOpenSetup={openSetup}
        onImportJson={importJson}
        onExportJson={exportJson}
        linterReport={linterReport}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        saveStatus={saveStatus}
      />

      {/* Split-Pane Main Body */}
      <div
        ref={splitContainerRef}
        style={
          {
            "--split-ratio": `${splitRatio}%`,
            "--split-inv": `${100 - splitRatio}%`,
          } as React.CSSProperties
        }
        className={`flex flex-col md:flex-row flex-1 min-h-0 overflow-x-hidden ${
          isDraggingSplit ? "select-none cursor-col-resize" : ""
        }`}
      >
        {/* Left Column: Form / Code Editor Pane */}
        <div
          className={`w-full md:w-[var(--split-ratio)] bg-stone-50/50 dark:bg-stone-900/30 border-r border-stone-200/70 dark:border-stone-800/70 overflow-y-auto h-[calc(100dvh-50px-58px)] md:h-[calc(100vh-53px)] md:max-h-[calc(100vh-53px)] p-3 sm:p-5 builder-form-pane overscroll-contain transition-colors ${
            mobileTab === "edit" ? "block" : "hidden md:block"
          }`}
        >
          <div className="max-w-2xl mx-auto space-y-3.5 pb-28 sm:pb-8">
            {/* Left Column Header Bar: Mode Switcher & Counter */}
            <div className="flex items-center justify-between px-1 py-0.5 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  {tUI("sectionsBuilder", activeLang)}
                </span>
                <span className="text-[10px] font-mono font-bold bg-stone-200/80 dark:bg-stone-800 text-stone-600 dark:text-stone-300 px-2 py-0.5 rounded-full">
                  {cv.sections.length + 1} {activeLang === "pt" ? "secções" : "sections"}
                </span>
              </div>

              {/* Editor Mode Selector: [ Form ] | [ JSON ] | [ LaTeX ] */}
              <div className="flex items-center bg-stone-200/80 dark:bg-stone-800 p-0.5 rounded-lg border border-stone-300/70 dark:border-stone-700/70 text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => setEditorMode("form")}
                  className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 font-bold ${
                    editorMode === "form"
                      ? "bg-white dark:bg-stone-700 text-stone-950 dark:text-stone-50 shadow-xs"
                      : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-200"
                  }`}
                >
                  <FileText size={12} />
                  <span>{activeLang === "pt" ? "Formulário" : "Form"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditorMode("json")}
                  className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 font-bold ${
                    editorMode === "json"
                      ? "bg-white dark:bg-stone-700 text-amber-700 dark:text-amber-400 shadow-xs"
                      : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-200"
                  }`}
                >
                  <FileJson size={12} />
                  <span>JSON</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditorMode("latex")}
                  className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 font-bold ${
                    editorMode === "latex"
                      ? "bg-white dark:bg-stone-700 text-cyan-700 dark:text-cyan-400 shadow-xs"
                      : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-200"
                  }`}
                >
                  <Code2 size={12} />
                  <span>LaTeX</span>
                </button>
              </div>
            </div>

            {/* Content: Form View or Split Code Editor */}
            {editorMode === "form" ? (
              <SectionList
                cv={cv}
                lang={activeLang}
                highlightedSectionId={highlightedSectionId}
                onUpdatePersonalInfo={updatePersonalInfo}
                onUpdateSection={updateSection}
                onToggleSectionVisibility={toggleSectionVisibility}
                onMoveSection={moveSection}
                onDeleteSection={deleteSection}
                onAddSection={addSection}
              />
            ) : (
              <div className="h-[calc(100dvh-175px)] md:h-[calc(100vh-145px)]">
                <CodeEditorPane
                  cv={cv}
                  lang={activeLang}
                  mode={editorMode}
                  onUpdateFromJson={updateFromJson}
                  onClose={() => setEditorMode("form")}
                />
              </div>
            )}
          </div>
        </div>

        {/* Draggable Split Resizer (Desktop only) */}
        <div
          role="separator"
          data-testid="split-resizer"
          aria-label="Redimensionar editor e pré-visualização"
          aria-orientation="vertical"
          aria-valuenow={Math.round(splitRatio)}
          aria-valuemin={25}
          aria-valuemax={75}
          tabIndex={0}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onDoubleClick={handleResetSplit}
          title={
            activeLang === "pt"
              ? "Arrastar para redimensionar (Duplo-clique para 50/50)"
              : "Drag to resize (Double-click for 50/50)"
          }
          className={`hidden md:flex items-center justify-center w-2.5 hover:w-3.5 -mx-1.5 cursor-col-resize z-20 transition-all select-none group relative shrink-0 ${
            isDraggingSplit
              ? "bg-amber-500 w-3.5 cursor-col-resize"
              : "bg-transparent hover:bg-stone-300 dark:hover:bg-stone-700"
          }`}
        >
          {/* Grip pill indicator */}
          <div
            className={`w-1 h-8 rounded-full transition-all flex items-center justify-center ${
              isDraggingSplit
                ? "bg-white shadow-sm"
                : "bg-stone-300 dark:bg-stone-700 group-hover:bg-amber-600 dark:group-hover:bg-amber-500"
            }`}
          />

          {/* Floating badge showing percentage on drag or hover */}
          <div
            className={`absolute top-4 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-stone-900/90 dark:bg-stone-800/90 text-white text-[10px] font-mono font-bold whitespace-nowrap pointer-events-none shadow-md transition-opacity duration-150 ${
              isDraggingSplit ? "opacity-100 scale-100" : "opacity-0 group-hover:opacity-100 scale-95"
            }`}
          >
            {Math.round(splitRatio)}% | {Math.round(100 - splitRatio)}%
          </div>
        </div>

        {/* Right Column: Live A4 Synchronized Preview Pane */}
        <div
          className={`w-full md:w-[var(--split-inv)] md:sticky md:top-[53px] h-[calc(100dvh-50px-58px)] md:h-[calc(100vh-53px)] overflow-hidden builder-preview-pane ${
            mobileTab === "preview" ? "block" : "hidden md:block"
          }`}
        >
          <CVPreviewContainer
            cv={cv}
            lang={activeLang}
            onSetTemplate={setTemplate}
            onUpdateTheme={updateTheme}
            onExportJson={exportJson}
            onSelectSection={handleSelectSection}
            mobileTab={mobileTab}
          />
        </div>
      </div>

      {/* Mobile Floating Bottom Bar (iOS Native Style) */}
      <div className="fixed md:hidden bottom-0 left-0 right-0 z-30 pb-safe px-4 py-2.5 bg-white/85 dark:bg-stone-900/85 backdrop-blur-lg border-t border-stone-200/70 dark:border-stone-800/70 shadow-lg flex justify-center">
        <div className="flex bg-stone-100 dark:bg-stone-800 p-1 rounded-full border border-stone-200 dark:border-stone-700 w-full max-w-xs shadow-2xs">
          <button
            onClick={() => setMobileTab("edit")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
              mobileTab === "edit"
                ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs"
                : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
            }`}
          >
            <Pencil size={13} />
            <span>{tUI("editTab", activeLang)}</span>
          </button>
          <button
            onClick={() => setMobileTab("preview")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
              mobileTab === "preview"
                ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs"
                : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
            }`}
          >
            <Eye size={13} />
            <span>{tUI("previewTab", activeLang)}</span>
          </button>
        </div>
      </div>

      {/* Global Command Palette (Cmd + K / Ctrl + K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        lang={activeLang}
        onSelectTemplate={setTemplate}
        onSetDensity={(d) => updateTheme({ fontSize: d })}
        onSwitchLanguage={switchLanguage}
        onToggleTheme={toggleTheme}
        onToggleGrid={() => {
          const gridBtn = document.querySelector(
            '[data-testid="canvas-floating-toolbar"] button[title*="grelha"], [data-testid="canvas-floating-toolbar"] button[title*="grid"]'
          ) as HTMLElement;
          gridBtn?.click();
        }}
        onResetCanvas={() => {
          const resetBtn = document.querySelector(
            '[data-testid="canvas-floating-toolbar"] button[title*="Repor"], [data-testid="canvas-floating-toolbar"] button[title*="Reset"]'
          ) as HTMLElement;
          resetBtn?.click();
        }}
        onOpenLinter={() => {
          const linterBadge = document.querySelector('[data-testid="linter-badge"]') as HTMLElement;
          linterBadge?.click();
        }}
        onOpenLatex={() => setEditorMode("latex")}
        onExportJson={exportJson}
        onExportPdf={() => {
          const pdfBtn = document.querySelector(
            'button[title*="PDF"], button:has-text("PDF")'
          ) as HTMLElement;
          pdfBtn?.click();
        }}
        onExportPng={() => {
          const pngBtn = document.querySelector(
            'button[title*="PNG"], button:has-text("PNG")'
          ) as HTMLElement;
          pngBtn?.click();
        }}
        onRerollDylan={handleRerollDylan}
        onJumpToSection={handleSelectSection}
        sections={cv.sections}
      />
    </div>
  );
}
