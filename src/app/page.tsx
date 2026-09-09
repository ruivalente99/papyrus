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
import { CVCompareModal } from "@/components/comparator/CVCompareModal";
import { JobMatcherModal } from "@/components/matcher/JobMatcherModal";
import { CoverLetterForm } from "@/components/builder/forms/CoverLetterForm";
import { CoverLetterPreview } from "@/components/preview/CoverLetterPreview";
import { CVPage } from "@/components/preview/CVPage";
import { PdfSecurityModal } from "@/components/security/PdfSecurityModal";
import { ProfileManagerModal } from "@/components/profile/ProfileManagerModal";
import { exportToPdf, exportApplicationPackagePdf, type ExportPdfOptions } from "@/lib/pdfExport";
import { createDylanAvatarDataUri } from "@/lib/avatar";
import { I18nProvider } from "@/context/I18nContext";
import { translate } from "@/locales";
import { Pencil, Eye, Loader2, FileText, FileJson, Code2 } from "lucide-react";

export default function BuilderPage() {
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const [editorMode, setEditorMode] = useState<"form" | "json" | "latex">("form");
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isComparatorOpen, setIsComparatorOpen] = useState(false);
  const [isJobMatcherOpen, setIsJobMatcherOpen] = useState(false);
  const [isPdfSecurityOpen, setIsPdfSecurityOpen] = useState(false);
  const [isProfileManagerOpen, setIsProfileManagerOpen] = useState(false);
  const [highlightedSectionId, setHighlightedSectionId] = useState<string | null>(null);
  const [splitRatio, setSplitRatio] = useState<number>(50);
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);
  const splitContainerRef = useRef<HTMLElement>(null);

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
    } catch {}
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
      } catch {}
      setIsDraggingSplit(false);
      try {
        localStorage.setItem("papyrus_split_ratio", splitRatio.toString());
      } catch {}
    }
  };

  const handleResetSplit = () => {
    setSplitRatio(50);
    try {
      localStorage.setItem("papyrus_split_ratio", "50");
    } catch {}
  };

  const handleSelectSection = (sectionId: string) => {
    setHighlightedSectionId(sectionId);
    setMobileTab("edit");
    setEditorMode("form");

    const scrollToAndFocus = () => {
      const targetId = sectionId === "personal" ? "section-personal" : `section-${sectionId}`;
      const element = document.getElementById(targetId);
      const container = document.querySelector(".builder-form-pane");

      if (element) {
        if (container) {
          const containerRect = container.getBoundingClientRect();
          const elemRect = element.getBoundingClientRect();
          const currentScroll = container.scrollTop;
          const targetScroll = currentScroll + (elemRect.top - containerRect.top) - 16;
          container.scrollTo({
            top: Math.max(0, targetScroll),
            behavior: "smooth",
          });
        } else {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }

        element.focus?.({ preventScroll: true });

        setTimeout(() => {
          const focusable = element.querySelector<HTMLElement>(
            "input:not([disabled]):not([type='hidden']):not([type='file']), textarea:not([disabled])"
          );
          if (focusable) {
            focusable.focus?.({ preventScroll: true });
          }
        }, 100);
      }
    };

    setTimeout(scrollToAndFocus, 50);
    setTimeout(scrollToAndFocus, 180);

    setTimeout(() => {
      setHighlightedSectionId((curr) => (curr === sectionId ? null : curr));
    }, 2500);
  };

  const {
    cv,
    setCv,
    uiLang,
    setUiLang,
    cvLang,
    switchCvLanguage,
    addCvLanguage,
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
    exportJsonResume,
    exportEuropassXml,
    importAnyResume,
    updateFromJson,
    coverLetter,
    updateCoverLetter,
    activeDocTab,
    setActiveDocTab,
    undo,
    redo,
    canUndo,
    canRedo,
    history,
    restoreHistoryEntry,
    linterReport,
    isLoaded,
    isSetupOpen,
    openSetup,
    resumeCV,
    duplicateCV,
    deleteCV,
    hasCachedDoc,
    completeSetup,
    profiles,
    activeProfileId,
    switchProfile,
    createProfile,
    duplicateProfile,
    renameProfile,
    deleteProfile,
    exportProfilesBundle,
    importProfilesBundle,
  } = useCV();

  const handleExportCoverLetterPdf = async () => {
    const clEl = document.getElementById("offscreen-cover-letter") || document.getElementById("cover-letter-preview-wrapper");
    if (!clEl) return;
    const baseName = (cv.personalInfo.fullName || "document").toLowerCase().replace(/\s+/g, "_");
    await exportToPdf(clEl as HTMLElement, `${baseName}_cover_letter.pdf`);
  };

  const handleExportApplicationPackage = async () => {
    const clEl = document.getElementById("offscreen-cover-letter");
    const cvEl = document.getElementById("offscreen-cv");
    if (!clEl || !cvEl) return;
    const baseName = (cv.personalInfo.fullName || "document").toLowerCase().replace(/\s+/g, "_");
    await exportApplicationPackagePdf(clEl as HTMLElement, cvEl as HTMLElement, `${baseName}_application_package.pdf`, {
      cv,
      lang: cvLang,
      enablePdfUa: true,
    });
  };

  const handleExportSecurePdf = async (options: ExportPdfOptions) => {
    const pageEl = (activeDocTab === "cover-letter"
      ? document.getElementById("offscreen-cover-letter") || document.getElementById("cover-letter-preview-wrapper")
      : document.getElementById("offscreen-cv") || document.getElementById("cv-printable-page")) as HTMLElement;
    if (!pageEl) return;
    const baseName = (cv.personalInfo.fullName || "document").toLowerCase().replace(/\s+/g, "_");
    const filename = activeDocTab === "cover-letter" ? `${baseName}_cover_letter.pdf` : `${baseName}_cv.pdf`;
    await exportToPdf(pageEl, filename, options);
  };

  const handleExportSecurePackage = async (options: ExportPdfOptions) => {
    const clEl = document.getElementById("offscreen-cover-letter");
    const cvEl = document.getElementById("offscreen-cv");
    if (!clEl || !cvEl) return;
    const baseName = (cv.personalInfo.fullName || "document").toLowerCase().replace(/\s+/g, "_");
    await exportApplicationPackagePdf(clEl as HTMLElement, cvEl as HTMLElement, `${baseName}_application_package.pdf`, options);
  };

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
        uiLang={uiLang}
        cvLang={cvLang}
        onSwitchUiLang={setUiLang}
        onSwitchLang={switchCvLanguage}
      />
    );
  }

  return (
    <I18nProvider lang={uiLang} onLanguageChange={setUiLang}>
      <div className="flex flex-col min-h-screen max-w-full overflow-x-hidden charm-bg-dynamic text-stone-900 dark:text-stone-100 transition-colors duration-300">
        {/* Top Application Header */}
        <BuilderHeader
          cv={cv}
          uiLang={uiLang}
          cvLang={cvLang}
          onSwitchUiLang={setUiLang}
          onSwitchCvLang={switchCvLanguage}
          onAddCvLanguage={addCvLanguage}
          onLoadPreset={loadPreset}
          onOpenSetup={openSetup}
          onImportJson={importJson}
          onExportJson={exportJson}
          onExportJsonResume={exportJsonResume}
          onExportEuropassXml={exportEuropassXml}
          onImportAnyResume={importAnyResume}
          activeDocTab={activeDocTab}
          onSelectDocTab={(tab) => {
            setActiveDocTab(tab);
            if (tab === "cover-letter") setEditorMode("form");
          }}
          onExportCoverLetterPdf={handleExportCoverLetterPdf}
          onExportApplicationPackage={handleExportApplicationPackage}
          linterReport={linterReport}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
          history={history}
          onRestoreHistory={restoreHistoryEntry}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenComparator={() => setIsComparatorOpen(true)}
          onOpenJobMatcher={() => setIsJobMatcherOpen(true)}
          onOpenPdfSecurity={() => setIsPdfSecurityOpen(true)}
          profiles={profiles}
          activeProfileId={activeProfileId}
          onSwitchProfile={switchProfile}
          onOpenProfileManager={() => setIsProfileManagerOpen(true)}
          onCreateProfile={(name, templateId, fromCurrent) => createProfile(name, templateId, fromCurrent)}
        />

        {/* Split-Pane Main Body */}
        <main
          id="main-content"
          role="main"
          aria-label={translate("a11y.mainContent", uiLang)}
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
            className={`w-full md:w-[var(--split-ratio)] bg-stone-50/50 dark:bg-[#161b22] border-r border-stone-200/70 dark:border-[#30363d] overflow-y-auto h-[calc(100dvh-50px-58px)] md:h-[calc(100vh-53px)] md:max-h-[calc(100vh-53px)] p-3 sm:p-5 builder-form-pane overscroll-contain transition-colors ${
              mobileTab === "edit" ? "block" : "hidden md:block"
            }`}
          >
            <div className="max-w-2xl mx-auto space-y-3.5 pb-28 sm:pb-8">
              {/* Left Column Header Bar: Mode Switcher & Counter */}
              <div className="flex items-center justify-between px-1 py-0.5 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-600 dark:text-[#c9d1d9]">
                    {activeDocTab === "cover-letter"
                      ? translate("builder.coverLetter.tabTitle", uiLang)
                      : translate("builder.sections.title", uiLang)}
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-stone-200/80 dark:bg-[#21262d] dark:border dark:border-[#363d47] text-stone-700 dark:text-[#f0f3f6] px-2 py-0.5 rounded-full">
                    {activeDocTab === "cover-letter"
                      ? (coverLetter.preset ? coverLetter.preset.toUpperCase() : "A4")
                      : translate("builder.sections.counter", uiLang, { count: cv.sections.length + 1 })}
                  </span>
                </div>

                {/* Editor Mode Selector: [ Form ] | [ JSON ] | [ LaTeX ] (for CV mode) */}
                {activeDocTab === "cv" && (
                  <div className="flex items-center bg-stone-200/80 dark:bg-[#0d1117] p-0.5 rounded-lg border border-stone-300/70 dark:border-[#363d47] text-[11px] font-mono">
                    <button
                      type="button"
                      onClick={() => setEditorMode("form")}
                      className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 font-bold ${
                        editorMode === "form"
                          ? "bg-white dark:bg-[#21262d] text-stone-950 dark:text-[#f0f3f6] shadow-xs dark:border dark:border-[#484f58]"
                          : "text-stone-600 hover:text-stone-900 dark:text-[#8b949e] dark:hover:text-[#f0f3f6]"
                      }`}
                    >
                      <FileText size={12} />
                      <span>{translate("builder.modes.form", uiLang)}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorMode("json")}
                      className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 font-bold ${
                        editorMode === "json"
                          ? "bg-white dark:bg-[#21262d] text-amber-700 dark:text-amber-400 shadow-xs dark:border dark:border-[#484f58]"
                          : "text-stone-600 hover:text-stone-900 dark:text-[#8b949e] dark:hover:text-[#f0f3f6]"
                      }`}
                    >
                      <FileJson size={12} />
                      <span>{translate("builder.modes.json", uiLang)}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorMode("latex")}
                      className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 font-bold ${
                        editorMode === "latex"
                          ? "bg-white dark:bg-[#21262d] text-cyan-700 dark:text-cyan-400 shadow-xs dark:border dark:border-[#484f58]"
                          : "text-stone-600 hover:text-stone-900 dark:text-[#8b949e] dark:hover:text-[#f0f3f6]"
                      }`}
                    >
                      <Code2 size={12} />
                      <span>{translate("builder.modes.latex", uiLang)}</span>
                    </button>
                  </div>
                )}
              </div>

            {/* Content: Cover Letter Form, CV Form, or Split Code Editor */}
            {activeDocTab === "cover-letter" ? (
              <CoverLetterForm
                letter={coverLetter}
                onChange={updateCoverLetter}
                lang={cvLang}
              />
            ) : editorMode === "form" ? (
              <SectionList
                cv={cv}
                lang={cvLang}
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
                  lang={cvLang}
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
          aria-label={translate("a11y.splitResizer", uiLang)}
          aria-orientation="vertical"
          aria-valuenow={Math.round(splitRatio)}
          aria-valuemin={25}
          aria-valuemax={75}
          tabIndex={0}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onDoubleClick={handleResetSplit}
          title={translate("a11y.splitResizer", uiLang)}
          className={`hidden md:flex w-1.5 hover:w-2 -ml-0.5 -mr-0.5 z-20 cursor-col-resize items-center justify-center transition-all group ${
            isDraggingSplit
              ? "bg-amber-500 w-2"
              : "bg-transparent hover:bg-amber-500/30 active:bg-amber-500"
          }`}
        >
          {/* Grip pill indicator */}
          <div
            className={`w-1 h-8 rounded-full transition-all flex items-center justify-center ${
              isDraggingSplit
                ? "bg-white shadow-sm"
                : "bg-stone-300 dark:bg-[#363d47] group-hover:bg-amber-600 dark:group-hover:bg-amber-500"
            }`}
          />

          {/* Floating badge showing percentage on drag or hover */}
          <div
            className={`absolute top-4 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-stone-900/90 dark:bg-[#21262d] dark:border dark:border-[#363d47] text-white dark:text-[#f0f3f6] text-[10px] font-mono font-bold whitespace-nowrap pointer-events-none shadow-md transition-opacity duration-150 ${
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
            coverLetter={coverLetter}
            activeDocTab={activeDocTab}
            lang={cvLang}
            uiLang={uiLang}
            highlightedSectionId={highlightedSectionId}
            onSetTemplate={setTemplate}
            onUpdateTheme={updateTheme}
            onExportJson={exportJson}
            onSelectSection={handleSelectSection}
            mobileTab={mobileTab}
          />
        </div>
      </main>

      {/* Mobile Floating Bottom Bar - Centered Floating Capsule */}
      <div className="fixed md:hidden bottom-3 left-0 right-0 z-30 flex items-center justify-center pointer-events-none px-4 pb-safe">
        <div className="pointer-events-auto flex items-center bg-white/95 dark:bg-[#161b22]/95 backdrop-blur-xl p-1 rounded-full border border-stone-200/90 dark:border-[#363d47] shadow-xl w-[270px] max-w-[90vw]">
          <button
            type="button"
            onClick={() => setMobileTab("edit")}
            className={`w-1/2 py-1.5 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
              mobileTab === "edit"
                ? "bg-stone-100 dark:bg-[#21262d] text-amber-700 dark:text-amber-400 shadow-xs border border-stone-200 dark:border-[#484f58]"
                : "text-stone-500 dark:text-[#8b949e] hover:text-stone-900 dark:hover:text-[#f0f3f6]"
            }`}
          >
            <Pencil size={13} />
            <span>{translate("common.tabs.editor", uiLang)}</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("preview")}
            className={`w-1/2 py-1.5 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
              mobileTab === "preview"
                ? "bg-stone-100 dark:bg-[#21262d] text-amber-700 dark:text-amber-400 shadow-xs border border-stone-200 dark:border-[#484f58]"
                : "text-stone-500 dark:text-[#8b949e] hover:text-stone-900 dark:hover:text-[#f0f3f6]"
            }`}
          >
            <Eye size={13} />
            <span>{translate("common.tabs.preview", uiLang)}</span>
          </button>
        </div>
      </div>

      {/* Global Command Palette (Cmd + K / Ctrl + K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        lang={uiLang}
        onSelectTemplate={setTemplate}
        onSetDensity={(d) => updateTheme({ fontSize: d })}
        onSelectFont={(f) => updateTheme({ fontFamily: f })}
        onSwitchLanguage={setUiLang}
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
        onOpenComparator={() => setIsComparatorOpen(true)}
        onOpenJobMatcher={() => setIsJobMatcherOpen(true)}
        onExportJson={exportJson}
        onExportJsonResume={() => exportJsonResume(cvLang)}
        onExportEuropassXml={() => exportEuropassXml(cvLang)}
        onExportCoverLetterPdf={handleExportCoverLetterPdf}
        onExportApplicationPackage={handleExportApplicationPackage}
        onSwitchDocumentTab={(tab) => {
          setActiveDocTab(tab);
          if (tab === "cover-letter") setEditorMode("form");
        }}
        onOpenPdfSecurity={() => setIsPdfSecurityOpen(true)}
        onOpenProfileManager={() => setIsProfileManagerOpen(true)}
        profiles={profiles}
        activeProfileId={activeProfileId}
        onSwitchProfile={switchProfile}
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

      {/* Visual CV Comparator & Semantic Diff Modal */}
      <CVCompareModal
        activeCV={cv}
        isOpen={isComparatorOpen}
        onClose={() => setIsComparatorOpen(false)}
        lang={cvLang}
        onUpdateActiveCV={(updatedCV) => setCv(updatedCV)}
      />

      {/* ATS Job Vacancy Keyword Matcher Modal */}
      <JobMatcherModal
        cv={cv}
        isOpen={isJobMatcherOpen}
        onClose={() => setIsJobMatcherOpen(false)}
        lang={cvLang}
        onUpdateCV={(updatedCV) => setCv(updatedCV)}
      />

      {/* PDF Encryption & PDF/UA Accessibility Modal */}
      <PdfSecurityModal
        isOpen={isPdfSecurityOpen}
        onClose={() => setIsPdfSecurityOpen(false)}
        cv={cv}
        lang={cvLang}
        onExportPdf={handleExportSecurePdf}
        onExportPackage={handleExportSecurePackage}
      />

      {/* Multi-Profile CV Manager Modal */}
      <ProfileManagerModal
        isOpen={isProfileManagerOpen}
        onClose={() => setIsProfileManagerOpen(false)}
        profiles={profiles}
        activeProfileId={activeProfileId}
        onSwitchProfile={switchProfile}
        onCreateProfile={createProfile}
        onDuplicateProfile={duplicateProfile}
        onRenameProfile={renameProfile}
        onDeleteProfile={deleteProfile}
        onExportBundle={exportProfilesBundle}
        onImportBundle={importProfilesBundle}
      />

      {/* Hidden offscreen container for reliable combined PDF package generation */}
      <div
        id="offscreen-package-nodes"
        className="fixed -left-[9999px] top-0 pointer-events-none opacity-0 overflow-hidden"
        aria-hidden="true"
        tabIndex={-1}
      >
        <div id="offscreen-cover-letter">
          <CoverLetterPreview letter={coverLetter} cv={cv} lang={cvLang} />
        </div>
        <div id="offscreen-cv">
          <CVPage cv={cv} lang={cvLang} />
        </div>
      </div>
    </div>
  </I18nProvider>
);
}
