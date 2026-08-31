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
    completeSetup,
  } = useCV();

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-100 dark:bg-stone-950 text-stone-600 dark:text-stone-400 gap-2 transition-colors">
        <Loader2 size={24} className="animate-spin text-amber-600 dark:text-amber-500" />
        <span className="text-sm font-semibold font-mono">PAPYRUS • Loading...</span>
      </div>
    );
  }

  // Show Setup / Welcome screen on initial onboarding or when triggered
  if (isSetupOpen) {
    return (
      <SetupScreen
        onComplete={completeSetup}
        onImportJson={importJson}
        lang={activeLang}
        onSwitchLang={switchLanguage}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors duration-200">
      {/* Top Main Application Header (Navbar) */}
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

      {/* Mobile Segmented Switcher (Visible only on small screens) */}
      <div className="flex md:hidden border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 no-print sticky top-[57px] z-20">
        <button
          onClick={() => setMobileTab("edit")}
          className={`flex-1 py-2.5 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
            mobileTab === "edit"
              ? "bg-amber-700 text-white"
              : "bg-white dark:bg-stone-900 text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800"
          }`}
        >
          <Pencil size={13} />
          <span>{tUI("editTab", activeLang)}</span>
        </button>
        <button
          onClick={() => setMobileTab("preview")}
          className={`flex-1 py-2.5 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
            mobileTab === "preview"
              ? "bg-amber-700 text-white"
              : "bg-white dark:bg-stone-900 text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800"
          }`}
        >
          <Eye size={13} />
          <span>{tUI("previewTab", activeLang)}</span>
        </button>
      </div>

      {/* Split-Pane Main Body */}
      <div className="flex flex-col md:flex-row flex-1">
        {/* Left Column: Form Editor Pane */}
        <div
          className={`w-full md:w-1/2 bg-stone-50/80 dark:bg-stone-900/50 border-r border-stone-200 dark:border-stone-800 overflow-y-auto max-h-[calc(100vh-60px)] p-4 sm:p-6 builder-form-pane transition-colors ${
            mobileTab === "edit" ? "block" : "hidden md:block"
          }`}
        >
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400">
                {tUI("sectionsBuilder", activeLang)}
              </h2>
              <span className="text-[11px] text-stone-500 dark:text-stone-400">
                {tUI("editingIn", activeLang)}{" "}
                <strong className="uppercase text-amber-700 dark:text-amber-400">{activeLang}</strong>
              </span>
            </div>

            <SectionList
              cv={cv}
              lang={activeLang}
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
          className={`w-full md:w-1/2 md:sticky md:top-[57px] md:h-[calc(100vh-57px)] overflow-hidden builder-preview-pane ${
            mobileTab === "preview" ? "block" : "hidden md:block"
          }`}
        >
          <CVPreviewContainer
            cv={cv}
            lang={activeLang}
            onSetTemplate={setTemplate}
            onUpdateTheme={updateTheme}
            onExportJson={exportJson}
          />
        </div>
      </div>
    </div>
  );
}
