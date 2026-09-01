"use client";

import React, { useState } from "react";
import { useCV } from "@/hooks/useCV";
import { BuilderHeader } from "@/components/builder/BuilderHeader";
import { SectionList } from "@/components/builder/SectionList";
import { CVPreviewContainer } from "@/components/preview/CVPreviewContainer";
import { SetupScreen } from "@/components/setup/SetupScreen";
import { tUI } from "@/lib/i18n";
import { Pencil, Eye, Loader2 } from "lucide-react";

export default function BuilderPage() {
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const [highlightedSectionId, setHighlightedSectionId] = useState<string | null>(null);

  const handleSelectSection = (sectionId: string) => {
    setHighlightedSectionId(sectionId);
    setMobileTab("edit");

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
      />

      {/* Split-Pane Main Body */}
      <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-x-hidden">
        {/* Left Column: Form Editor Pane */}
        <div
          className={`w-full md:w-1/2 bg-stone-50/50 dark:bg-stone-900/30 border-r border-stone-200/70 dark:border-stone-800/70 overflow-y-auto h-[calc(100dvh-50px-58px)] md:h-[calc(100vh-53px)] md:max-h-[calc(100vh-53px)] p-3 sm:p-5 builder-form-pane overscroll-contain transition-colors ${
            mobileTab === "edit" ? "block" : "hidden md:block"
          }`}
        >
          <div className="max-w-2xl mx-auto space-y-3.5 pb-28 sm:pb-8">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                {tUI("sectionsBuilder", activeLang)}
              </span>
              <span className="text-[11px] text-stone-400 font-mono">
                <strong className="uppercase text-amber-700 dark:text-amber-400">{activeLang}</strong>
              </span>
            </div>

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
          </div>
        </div>

        {/* Right Column: Live A4 Synchronized Preview Pane */}
        <div
          className={`w-full md:w-1/2 md:sticky md:top-[53px] h-[calc(100dvh-50px-58px)] md:h-[calc(100vh-53px)] overflow-hidden builder-preview-pane ${
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
    </div>
  );
}
