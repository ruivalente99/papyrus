"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import type { CVDocument, SupportedLanguage, LinterReport } from "@/types/cv";
import type { HistoryEntry } from "@/hooks/useCV";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { LinterBadge } from "./linter/LinterBadge";
import { LinterModal } from "./linter/LinterModal";
import { ThemeSelector } from "@/components/common/ThemeSelector";
import { NanoBananaLogo } from "@/components/common/NanoBananaLogo";
import { PRESET_SEEDS } from "@/data/seeds";
import { useTranslation } from "@/hooks/useTranslation";
import { useToast } from "@/context/ToastContext";
import { exportToLatex } from "@/lib/latexEngine";
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
  History,
  Clock,
  Download,
  Kanban,
  GitCompare,
  Target,
  FileText,
  Mail,
  ShieldCheck,
  Briefcase,
} from "lucide-react";
import { ProfileSwitcherDropdown } from "@/components/profile/ProfileSwitcherDropdown";
import type { CVProfileMeta } from "@/types/profile";
import type { TemplateId } from "@/types/cv";

interface Props {
  cv: CVDocument;
  uiLang?: SupportedLanguage;
  cvLang?: SupportedLanguage;
  onSwitchUiLang?: (lang: SupportedLanguage) => void;
  onSwitchCvLang?: (lang: SupportedLanguage) => void;
  onAddCvLanguage?: (code: string, label: string) => void;
  activeLang?: SupportedLanguage;
  onSwitchLanguage?: (lang: SupportedLanguage) => void;
  onAddLanguage?: (code: string, label: string) => void;
  onLoadPreset: (id: string) => void;
  onOpenSetup?: () => void;
  onImportJson: (data: CVDocument) => void;
  onExportJson: () => void;
  onExportJsonResume?: (lang?: SupportedLanguage) => void;
  onExportEuropassXml?: (lang?: SupportedLanguage) => void;
  onImportAnyResume?: (content: string, defaultLang?: SupportedLanguage) => { success: boolean; format?: string; error?: string };
  activeDocTab?: "cv" | "cover-letter";
  onSelectDocTab?: (tab: "cv" | "cover-letter") => void;
  onExportCoverLetterPdf?: () => void;
  onExportApplicationPackage?: () => void;
  onOpenPdfSecurity?: () => void;
  profiles?: CVProfileMeta[];
  activeProfileId?: string;
  onSwitchProfile?: (id: string) => void;
  onOpenProfileManager?: () => void;
  onCreateProfile?: (name: string, templateId?: TemplateId, fromCurrent?: boolean) => void;
  linterReport: LinterReport;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  history?: HistoryEntry[];
  onRestoreHistory?: (id: string) => void;
  onOpenCommandPalette?: () => void;
  onOpenComparator?: () => void;
  onOpenJobMatcher?: () => void;
  saveStatus?: "saved" | "saving";
}

export function BuilderHeader({
  cv,
  uiLang,
  cvLang,
  onSwitchUiLang,
  onSwitchCvLang,
  onAddCvLanguage,
  activeLang,
  onSwitchLanguage,
  onAddLanguage,
  onLoadPreset,
  onOpenSetup,
  onImportJson,
  onExportJson,
  onExportJsonResume,
  onExportEuropassXml,
  onImportAnyResume,
  activeDocTab = "cv",
  onSelectDocTab,
  onExportCoverLetterPdf,
  onExportApplicationPackage,
  onOpenPdfSecurity,
  linterReport,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  history = [],
  onRestoreHistory,
  onOpenCommandPalette,
  onOpenComparator,
  onOpenJobMatcher,
  profiles,
  activeProfileId,
  onSwitchProfile,
  onOpenProfileManager,
  onCreateProfile,
}: Props) {
  const currentUiLang = uiLang || activeLang || "pt";
  const currentCvLang = cvLang || cv.currentLanguage || activeLang || "en";
  const handleSwitchUiLang = onSwitchUiLang || onSwitchLanguage || (() => {});
  const handleSwitchCvLang = onSwitchCvLang || onSwitchLanguage || (() => {});
  const handleAddCvLang = onAddCvLanguage || onAddLanguage || (() => {});

  const [showPresets, setShowPresets] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showLinterModal, setShowLinterModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t: tr } = useTranslation(currentUiLang);
  const { showToast } = useToast();

  const handleDownloadTex = () => {
    try {
      const texContent = exportToLatex(cv, currentCvLang);
      const blob = new Blob([texContent], { type: "application/x-tex;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const safeName = (cv.personalInfo?.fullName || "curriculum_vitae")
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, "_");
      a.href = url;
      a.download = `${safeName}_resume.tex`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(
        tr("builder.header.texDownloaded"),
        "success"
      );
    } catch {
      showToast(
        tr("builder.header.texError"),
        "error"
      );
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      if (onImportAnyResume) {
        const res = onImportAnyResume(content, currentCvLang);
        if (res.success) {
          showToast(
            tr("builder.header.resumeImported", { format: (res.format || "OK").toUpperCase() }),
            "success"
          );
          return;
        } else {
          showToast(
            res.error || tr("builder.header.resumeImportError"),
            "error"
          );
          return;
        }
      }

      try {
        const parsed = JSON.parse(content);
        onImportJson(parsed);
        showToast(
          tr("builder.header.jsonImported"),
          "success"
        );
      } catch {
        showToast(
          tr("builder.header.jsonInvalid"),
          "error"
        );
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <header className="border-b border-stone-200/70 dark:border-[#30363d] bg-white/80 dark:bg-[#161b22]/95 backdrop-blur-md px-2 sm:px-5 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-2.5 sm:pb-3 flex items-center justify-between gap-1 sm:gap-2.5 sticky top-0 z-30 shadow-2xs transition-colors max-w-full overflow-hidden sm:overflow-visible">
      {/* Brand: Minimalist Logo + lowercase papyrus */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        <Link
          href="/"
          title="papyrus editor"
          className="group cursor-pointer focus:outline-hidden flex items-center gap-1.5 sm:gap-2"
        >
          <NanoBananaLogo size="sm" glow />
          <span className="font-mono text-sm font-bold tracking-tight lowercase text-stone-900 dark:text-[#f0f3f6] hidden sm:inline">
            papyrus
          </span>
        </Link>

        {/* Document Switcher: Resume / CV vs Cover Letter */}
        <div className="flex items-center p-0.5 bg-stone-100 dark:bg-[#21262d] rounded-lg border border-stone-200 dark:border-[#363d47]">
          <button
            type="button"
            onClick={() => onSelectDocTab?.("cv")}
            className={`px-2 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeDocTab === "cv"
                ? "bg-white dark:bg-[#30363d] text-stone-900 dark:text-[#f0f3f6] shadow-2xs"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
            }`}
          >
            <FileText size={12} className={activeDocTab === "cv" ? "text-amber-600 dark:text-amber-400" : ""} />
            <span>CV</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectDocTab?.("cover-letter")}
            className={`px-2 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeDocTab === "cover-letter"
                ? "bg-white dark:bg-[#30363d] text-stone-900 dark:text-[#f0f3f6] shadow-2xs"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
            }`}
          >
            <Mail size={12} className={activeDocTab === "cover-letter" ? "text-amber-600 dark:text-amber-400" : ""} />
            <span className="hidden md:inline">{tr("builder.coverLetter.tabTitle")}</span>
            <span className="md:hidden">Letter</span>
          </button>
        </div>

        {/* Profile Switcher Dropdown */}
        {profiles && profiles.length > 0 && activeProfileId && onSwitchProfile && onOpenProfileManager && (
          <div className="hidden sm:block">
            <ProfileSwitcherDropdown
              profiles={profiles}
              activeProfileId={activeProfileId}
              onSwitchProfile={onSwitchProfile}
              onOpenProfileManager={onOpenProfileManager}
              onCreateProfile={() => (onCreateProfile ? onCreateProfile("New Profile") : onOpenProfileManager())}
            />
          </div>
        )}

        {/* Undo / Redo / History Controls (Desktop / Tablet) */}
        {onUndo && onRedo && (
          <div className="hidden lg:flex items-center gap-0.5 bg-stone-100 dark:bg-[#21262d] p-0.5 rounded-lg border border-stone-200 dark:border-[#363d47] relative">
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              title={tr("common.actions.undoWithShortcut")}
              aria-label={tr("a11y.actions.undo")}
              className="p-1.5 rounded text-stone-600 dark:text-[#c9d1d9] hover:text-stone-900 dark:hover:text-[#f0f3f6] dark:hover:bg-[#30363d] disabled:opacity-30 disabled:pointer-events-none transition-colors min-w-[24px] min-h-[24px] flex items-center justify-center"
            >
              <Undo2 size={13} />
            </button>
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              title={tr("common.actions.redoWithShortcut")}
              aria-label={tr("a11y.actions.redo")}
              className="p-1.5 rounded text-stone-600 dark:text-[#c9d1d9] hover:text-stone-900 dark:hover:text-[#f0f3f6] dark:hover:bg-[#30363d] disabled:opacity-30 disabled:pointer-events-none transition-colors min-w-[24px] min-h-[24px] flex items-center justify-center"
            >
              <Redo2 size={13} />
            </button>

            {/* History Tracker Popover */}
            {history.length > 0 && onRestoreHistory && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowHistory(!showHistory)}
                  title={tr("builder.header.recentHistory")}
                  aria-label={tr("builder.header.recentHistory")}
                  className={`p-1.5 rounded transition-colors min-w-[24px] min-h-[24px] flex items-center justify-center ${
                    showHistory
                      ? "bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold"
                      : "text-stone-600 dark:text-[#c9d1d9] hover:text-stone-900 dark:hover:text-[#f0f3f6] dark:hover:bg-[#30363d]"
                  }`}
                >
                  <History size={13} />
                </button>

                {showHistory && (
                  <div
                    className="absolute left-0 mt-2 w-64 bg-white dark:bg-[#161b22] border border-stone-200 dark:border-[#30363d] rounded-2xl shadow-xl p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100"
                    onMouseLeave={() => setShowHistory(false)}
                  >
                    <div className="px-2 py-1 font-bold text-stone-500 dark:text-[#8b949e] uppercase text-[10px] tracking-wider border-b border-stone-100 dark:border-[#30363d] mb-1 flex items-center justify-between">
                      <span>{tr("builder.header.recentEdits")}</span>
                      <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">{history.length}</span>
                    </div>
                    <div className="space-y-1">
                      {history.slice(0, 5).map((entry, idx) => {
                        const elapsedMin = Math.max(0, Math.round((Date.now() - entry.timestamp) / 60000));
                        const timeText =
                          elapsedMin === 0
                            ? tr("builder.header.justNow")
                            : tr("builder.header.minutesAgo", { count: elapsedMin });

                        return (
                          <button
                            key={entry.id}
                            type="button"
                            onClick={() => {
                              onRestoreHistory(entry.id);
                              setShowHistory(false);
                              showToast(
                                tr("builder.header.versionRestored"),
                                "success"
                              );
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-[#21262d] text-stone-700 dark:text-[#c9d1d9] transition-colors flex items-center justify-between gap-2 group"
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-medium truncate group-hover:text-amber-700 dark:group-hover:text-amber-400">
                                {idx === 0
                                  ? tr("builder.header.previousVersion")
                                  : entry.label}
                              </p>
                              <p className="text-[10px] text-stone-400 dark:text-[#8b949e] flex items-center gap-1">
                                <Clock size={10} />
                                <span>{timeText}</span>
                              </p>
                            </div>
                            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              {tr("builder.header.restore")}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Command Palette Button */}
        {onOpenCommandPalette && (
          <button
            type="button"
            onClick={onOpenCommandPalette}
            title={tr("common.shortcuts.commandPalette")}
            aria-label={tr("a11y.actions.commandPalette")}
            className="hidden xl:flex items-center gap-1.5 px-2 py-1 text-[11px] font-mono font-bold rounded-lg bg-stone-100 dark:bg-[#21262d] text-stone-600 dark:text-[#c9d1d9] border border-stone-200 dark:border-[#363d47] hover:border-amber-500 hover:text-stone-900 dark:hover:text-[#f0f3f6] transition-colors shadow-2xs active:scale-95"
          >
            <Command size={11} className="text-amber-600 dark:text-amber-400" />
            <span>⌘K</span>
          </button>
        )}
      </div>

      {/* Center Controls: CV Language, UI Language / Nationality, Theme Selector, Linter Badge */}
      <div className="flex items-center gap-1 sm:gap-2 shrink min-w-0 flex-nowrap">
        {/* CV Document Content Language */}
        <LanguageSwitcher
          variant="cv"
          activeLang={currentCvLang}
          uiLang={currentUiLang}
          availableLanguages={cv.availableLanguages}
          onSwitchLanguage={handleSwitchCvLang}
          onAddLanguage={handleAddCvLang}
        />

        {/* App UI Language & Nationality */}
        <LanguageSwitcher
          variant="ui"
          activeLang={currentUiLang}
          uiLang={currentUiLang}
          onSwitchLanguage={handleSwitchUiLang}
        />

        <ThemeSelector lang={currentUiLang} />

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
          title={tr("builder.header.guideTitle")}
          aria-label={tr("builder.header.guideTitle")}
          className="flex items-center justify-center gap-1 text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-400 p-1.5 sm:px-3 sm:py-1.5 rounded-full border border-amber-500/20 transition-all shadow-2xs shrink-0 active:scale-95 min-w-[28px] min-h-[28px]"
        >
          <BookOpen size={13} />
          <span className="hidden md:inline">{tr("builder.header.guide")}</span>
        </Link>

        {/* Board / Roadmap Link */}
        <Link
          href="/board"
          title={tr("builder.header.boardTitle")}
          aria-label={tr("builder.header.boardTitle")}
          className="flex items-center justify-center gap-1 text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-400 p-1.5 sm:px-3 sm:py-1.5 rounded-full border border-amber-500/20 transition-all shadow-2xs shrink-0 active:scale-95 min-w-[28px] min-h-[28px]"
        >
          <Kanban size={13} />
          <span className="hidden md:inline">{tr("builder.header.board")}</span>
        </Link>

        {/* Visual CV Comparator Button */}
        {onOpenComparator && (
          <button
            type="button"
            onClick={onOpenComparator}
            title={tr("builder.header.compareTitle")}
            aria-label={tr("builder.header.compareTitle")}
            className="flex items-center justify-center gap-1 text-xs font-bold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 p-1.5 sm:px-3 sm:py-1.5 rounded-full border border-indigo-500/20 transition-all shadow-2xs shrink-0 active:scale-95 min-w-[28px] min-h-[28px]"
          >
            <GitCompare size={13} />
            <span className="hidden md:inline">{tr("builder.header.compareCV")}</span>
          </button>
        )}

        {/* ATS Job Vacancy Matcher Button */}
        {onOpenJobMatcher && (
          <button
            type="button"
            onClick={onOpenJobMatcher}
            title={tr("builder.header.jobMatcherTitle")}
            aria-label={tr("builder.header.jobMatcherTitle")}
            className="flex items-center justify-center gap-1 text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 p-1.5 sm:px-3 sm:py-1.5 rounded-full border border-amber-500/20 transition-all shadow-2xs shrink-0 active:scale-95 min-w-[28px] min-h-[28px]"
          >
            <Target size={13} />
            <span className="hidden md:inline">{tr("builder.header.jobMatcher")}</span>
          </button>
        )}

        {/* Setup / Home screen button (Desktop / Tablet only) */}
        {onOpenSetup && (
          <button
            onClick={onOpenSetup}
            title={tr("builder.header.newDoc")}
            className="hidden sm:flex items-center gap-1 text-xs font-bold bg-stone-100 dark:bg-[#21262d] hover:bg-stone-200 dark:hover:bg-[#30363d] text-stone-800 dark:text-[#f0f3f6] px-3 py-1.5 rounded-full border border-stone-200 dark:border-[#363d47] transition-all shadow-2xs"
          >
            <Plus size={13} className="text-amber-700 dark:text-amber-400" />
            <span className="hidden md:inline">{tr("builder.header.newDoc")}</span>
          </button>
        )}

        {/* Presets dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowPresets(!showPresets)}
            aria-label={tr("builder.header.templates")}
            title={tr("builder.header.templates")}
            className="flex items-center justify-center gap-1 text-xs font-bold bg-stone-100 dark:bg-[#21262d] hover:bg-stone-200 dark:hover:bg-[#30363d] text-stone-700 dark:text-[#f0f3f6] p-1.5 sm:px-3 sm:py-1.5 rounded-full border border-stone-200 dark:border-[#363d47] transition-all shadow-2xs shrink-0 min-w-[28px] min-h-[28px]"
          >
            <Layers size={13} />
            <span className="hidden md:inline">{tr("builder.header.templates")}</span>
            <ChevronDown size={11} className="hidden sm:inline" />
          </button>

          {showPresets && (
            <div className="absolute right-0 mt-1.5 w-60 bg-white dark:bg-[#21262d] rounded-2xl shadow-xl border border-stone-200 dark:border-[#363d47] p-1.5 z-50 animate-in fade-in duration-100">
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400 dark:text-[#8b949e] px-2 py-1">
                {tr("builder.header.presets")}
              </p>
              {PRESET_SEEDS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onLoadPreset(p.id);
                    setShowPresets(false);
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-[#30363d] transition-colors text-xs"
                >
                  <p className="font-bold text-stone-800 dark:text-[#f0f3f6]">{p.name}</p>
                </button>
              ))}

              {/* Mobile Extended Actions inside Dropdown */}
              <div className="sm:hidden border-t border-stone-150 dark:border-[#363d47] my-1 pt-1 space-y-0.5">
                <Link
                  href="/board"
                  onClick={() => setShowPresets(false)}
                  className="w-full text-left p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-[#30363d] transition-colors text-xs flex items-center gap-2 text-stone-800 dark:text-[#f0f3f6] font-semibold"
                >
                  <Kanban size={13} className="text-amber-700 dark:text-amber-400" />
                  <span>{tr("builder.header.boardTitle")}</span>
                </Link>
                {onOpenComparator && (
                  <button
                    onClick={() => {
                      onOpenComparator();
                      setShowPresets(false);
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-[#30363d] transition-colors text-xs flex items-center gap-2 text-stone-800 dark:text-[#f0f3f6] font-semibold"
                  >
                    <GitCompare size={13} className="text-indigo-600 dark:text-indigo-400" />
                    <span>{tr("builder.header.compareTitle")}</span>
                  </button>
                )}
                {onOpenJobMatcher && (
                  <button
                    onClick={() => {
                      onOpenJobMatcher();
                      setShowPresets(false);
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-[#30363d] transition-colors text-xs flex items-center gap-2 text-stone-800 dark:text-[#f0f3f6] font-semibold"
                  >
                    <Target size={13} className="text-amber-600 dark:text-amber-400" />
                    <span>{tr("builder.header.jobMatcherTitle")}</span>
                  </button>
                )}
                {onOpenSetup && (
                  <button
                    onClick={() => {
                      onOpenSetup();
                      setShowPresets(false);
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-[#30363d] transition-colors text-xs flex items-center gap-2 text-stone-800 dark:text-[#f0f3f6] font-semibold"
                  >
                    <Plus size={13} className="text-amber-700 dark:text-amber-400" />
                    <span>{tr("builder.header.newDoc")}</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    handleDownloadTex();
                    setShowPresets(false);
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-[#30363d] transition-colors text-xs flex items-center gap-2 text-stone-800 dark:text-[#f0f3f6] font-semibold"
                >
                  <Code2 size={13} className="text-amber-700 dark:text-amber-400" />
                  <span>{tr("builder.header.downloadTex")}</span>
                </button>
                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                    setShowPresets(false);
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-[#30363d] transition-colors text-xs flex items-center gap-2 text-stone-800 dark:text-[#f0f3f6] font-semibold"
                >
                  <FileUp size={13} />
                  <span>{tr("common.actions.import")}</span>
                </button>
                <button
                  onClick={() => {
                    onExportJson();
                    setShowPresets(false);
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-[#30363d] transition-colors text-xs flex items-center gap-2 text-stone-800 dark:text-[#f0f3f6] font-semibold"
                >
                  <FileDown size={13} />
                  <span>{tr("builder.header.jsonBackup")}</span>
                </button>
                {onExportJsonResume && (
                  <button
                    onClick={() => {
                      onExportJsonResume(currentCvLang);
                      setShowPresets(false);
                      showToast(tr("builder.header.jsonResumeDownloaded"), "success");
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-[#30363d] transition-colors text-xs flex items-center gap-2 text-stone-800 dark:text-[#f0f3f6] font-semibold"
                  >
                    <FileDown size={13} className="text-amber-600 dark:text-amber-400" />
                    <span>{tr("builder.header.exportJsonResume")}</span>
                  </button>
                )}
                {onExportEuropassXml && (
                  <button
                    onClick={() => {
                      onExportEuropassXml(currentCvLang);
                      setShowPresets(false);
                      showToast(tr("builder.header.europassDownloaded"), "success");
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-[#30363d] transition-colors text-xs flex items-center gap-2 text-stone-800 dark:text-[#f0f3f6] font-semibold"
                  >
                    <FileDown size={13} className="text-blue-600 dark:text-blue-400" />
                    <span>{tr("builder.header.exportEuropassXml")}</span>
                  </button>
                )}
                {onExportCoverLetterPdf && (
                  <button
                    onClick={() => {
                      onExportCoverLetterPdf();
                      setShowPresets(false);
                      showToast(tr("builder.coverLetter.letterDownloaded"), "success");
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-[#30363d] transition-colors text-xs flex items-center gap-2 text-stone-800 dark:text-[#f0f3f6] font-semibold"
                  >
                    <Mail size={13} className="text-amber-600 dark:text-amber-400" />
                    <span>{tr("builder.coverLetter.exportPdf")}</span>
                  </button>
                )}
                {onExportApplicationPackage && (
                  <button
                    onClick={() => {
                      onExportApplicationPackage();
                      setShowPresets(false);
                      showToast(tr("builder.coverLetter.packageDownloaded"), "success");
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-[#30363d] transition-colors text-xs flex items-center gap-2 text-stone-800 dark:text-[#f0f3f6] font-semibold"
                  >
                    <Layers size={13} className="text-emerald-600 dark:text-emerald-400" />
                    <span>{tr("builder.coverLetter.exportPackage")}</span>
                  </button>
                )}
                {onOpenPdfSecurity && (
                  <button
                    onClick={() => {
                      onOpenPdfSecurity();
                      setShowPresets(false);
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-[#30363d] transition-colors text-xs flex items-center gap-2 text-stone-800 dark:text-[#f0f3f6] font-semibold border-t border-stone-200/60 dark:border-[#363d47] mt-1 pt-2"
                  >
                    <ShieldCheck size={13} className="text-amber-600 dark:text-amber-400" />
                    <span>{tr("pdfSecurity.modalTitle")}</span>
                  </button>
                )}
                {onOpenProfileManager && (
                  <button
                    onClick={() => {
                      onOpenProfileManager();
                      setShowPresets(false);
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-[#30363d] transition-colors text-xs flex items-center gap-2 text-stone-800 dark:text-[#f0f3f6] font-semibold"
                  >
                    <Briefcase size={13} className="text-primary" />
                    <span>{tr("profiles.modalTitle")}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Direct TeX Download Button (Desktop / Tablet) */}
        <button
          type="button"
          onClick={handleDownloadTex}
          title={tr("builder.header.downloadTex")}
          aria-label={tr("builder.header.downloadTex")}
          className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300 hover:text-amber-950 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-300/60 dark:border-amber-500/40 px-3 py-1.5 rounded-full transition-all shadow-2xs min-h-[28px] active:scale-95"
        >
          <Download size={13} className="text-amber-700 dark:text-amber-400" />
          <span className="hidden lg:inline">.tex</span>
        </button>

        {/* Import Document (JSON, XML, TeX) (Desktop / Tablet) */}
        <button
          onClick={() => fileInputRef.current?.click()}
          title={tr("common.actions.import")}
          aria-label={tr("a11y.actions.importJson")}
          className="hidden sm:flex p-1.5 text-stone-600 dark:text-[#c9d1d9] hover:text-stone-900 dark:hover:text-[#f0f3f6] bg-white dark:bg-[#21262d] hover:bg-stone-50 dark:hover:bg-[#30363d] border border-stone-200 dark:border-[#363d47] rounded-full transition-all shadow-2xs min-w-[28px] min-h-[28px] items-center justify-center"
        >
          <FileUp size={13} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.xml,.tex,application/json,text/xml,application/xml,application/x-tex"
          onChange={handleFileUpload}
          aria-label={tr("builder.header.importFileAria")}
          className="hidden"
        />

        {/* Export Dropdown Menu (Desktop / Tablet) */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            title={tr("common.actions.export")}
            aria-label={tr("a11y.actions.exportJson")}
            className="flex p-1.5 text-stone-600 dark:text-[#c9d1d9] hover:text-stone-900 dark:hover:text-[#f0f3f6] bg-white dark:bg-[#21262d] hover:bg-stone-50 dark:hover:bg-[#30363d] border border-stone-200 dark:border-[#363d47] rounded-full transition-all shadow-2xs min-w-[28px] min-h-[28px] items-center justify-center"
          >
            <FileDown size={13} />
          </button>

          {showExportMenu && (
            <div className="absolute right-0 mt-1.5 w-56 bg-white dark:bg-[#21262d] rounded-2xl shadow-xl border border-stone-200 dark:border-[#363d47] p-1.5 z-50 animate-in fade-in duration-100">
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400 dark:text-[#8b949e] px-2 py-1">
                {tr("common.actions.export")}
              </p>
              <button
                onClick={() => {
                  onExportJson();
                  setShowExportMenu(false);
                }}
                className="w-full text-left p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-[#30363d] transition-colors text-xs flex items-center justify-between"
              >
                <span className="font-semibold text-stone-800 dark:text-[#f0f3f6]">{tr("builder.header.jsonBackup")}</span>
                <span className="text-[10px] font-mono text-stone-400 dark:text-[#8b949e]">.json</span>
              </button>
              {onExportJsonResume && (
                <button
                  onClick={() => {
                    onExportJsonResume(currentCvLang);
                    setShowExportMenu(false);
                    showToast(tr("builder.header.jsonResumeDownloaded"), "success");
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-[#30363d] transition-colors text-xs flex items-center justify-between"
                >
                  <span className="font-semibold text-stone-800 dark:text-[#f0f3f6]">{tr("builder.header.exportJsonResume")}</span>
                  <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">JSON Resume</span>
                </button>
              )}
              {onExportEuropassXml && (
                <button
                  onClick={() => {
                    onExportEuropassXml(currentCvLang);
                    setShowExportMenu(false);
                    showToast(tr("builder.header.europassDownloaded"), "success");
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-[#30363d] transition-colors text-xs flex items-center justify-between"
                >
                  <span className="font-semibold text-stone-800 dark:text-[#f0f3f6]">{tr("builder.header.exportEuropassXml")}</span>
                  <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold">.xml</span>
                </button>
              )}
              <button
                onClick={() => {
                  handleDownloadTex();
                  setShowExportMenu(false);
                }}
                className="w-full text-left p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-[#30363d] transition-colors text-xs flex items-center justify-between"
              >
                <span className="font-semibold text-stone-800 dark:text-[#f0f3f6]">LaTeX / TeX</span>
                <span className="text-[10px] font-mono text-stone-400 dark:text-[#8b949e]">.tex</span>
              </button>
              {onExportCoverLetterPdf && (
                <button
                  onClick={() => {
                    onExportCoverLetterPdf();
                    setShowExportMenu(false);
                    showToast(tr("builder.coverLetter.letterDownloaded"), "success");
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-[#30363d] transition-colors text-xs flex items-center justify-between"
                >
                  <span className="font-semibold text-stone-800 dark:text-[#f0f3f6]">{tr("builder.coverLetter.exportPdf")}</span>
                  <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">PDF</span>
                </button>
              )}
              {onExportApplicationPackage && (
                <button
                  onClick={() => {
                    onExportApplicationPackage();
                    setShowExportMenu(false);
                    showToast(tr("builder.coverLetter.packageDownloaded"), "success");
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-[#30363d] transition-colors text-xs flex items-center justify-between"
                >
                  <span className="font-semibold text-stone-800 dark:text-[#f0f3f6]">{tr("builder.coverLetter.exportPackage")}</span>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">Package</span>
                </button>
              )}
              {onOpenPdfSecurity && (
                <button
                  onClick={() => {
                    onOpenPdfSecurity();
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-[#30363d] transition-colors text-xs flex items-center justify-between border-t border-stone-200/60 dark:border-[#363d47] mt-1 pt-2"
                >
                  <span className="font-semibold text-stone-800 dark:text-[#f0f3f6]">{tr("pdfSecurity.modalTitle")}</span>
                  <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">PDF/UA</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <LinterModal
        report={linterReport}
        isOpen={showLinterModal}
        onClose={() => setShowLinterModal(false)}
        lang={currentUiLang}
        cv={cv}
      />
    </header>
  );
}
