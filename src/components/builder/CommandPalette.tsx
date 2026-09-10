"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import type { SupportedLanguage, TemplateId, CVSection } from "@/types/cv";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Search,
  Layers,
  Sparkles,
  Download,
  FileCode2,
  FileJson,
  ShieldCheck,
  Grid,
  Maximize2,
  Sun,
  Globe,
  ArrowRight,
  Command,
  Dices,
  FileText,
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  Globe2,
  Award,
  HeartHandshake,
  Kanban,
  BookOpen,
  GitCompare,
  Target,
  Type,
  Mail,
  Moon,
} from "lucide-react";
import { FONT_CATALOG, type FontFamilyId } from "@/lib/typography";
import type { CVProfileMeta } from "@/types/profile";

interface CommandItem {
  id: string;
  category: "templates" | "actions" | "navigation" | "preferences" | "sections";
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  keywords: string[];
  shortcut?: string;
  action: () => void;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: SupportedLanguage;
  onSelectTemplate: (id: TemplateId) => void;
  onSetDensity: (density: "compact" | "normal" | "spacious") => void;
  onSelectFont?: (fontId: FontFamilyId) => void;
  onSwitchLanguage: (lang: SupportedLanguage) => void;
  onToggleTheme: () => void;
  onToggleGrid?: () => void;
  onResetCanvas?: () => void;
  onOpenLinter: () => void;
  onOpenLatex: () => void;
  onOpenComparator?: () => void;
  onOpenJobMatcher?: () => void;
  onExportJson: () => void;
  onExportJsonResume?: () => void;
  onExportEuropassXml?: () => void;
  onExportCoverLetterPdf?: () => void;
  onExportApplicationPackage?: () => void;
  onSwitchDocumentTab?: (tab: "cv" | "cover-letter") => void;
  onOpenPdfSecurity?: () => void;
  onOpenProfileManager?: () => void;
  profiles?: CVProfileMeta[];
  activeProfileId?: string;
  onSwitchProfile?: (id: string) => void;
  onExportPdf: () => void;
  onExportDarkPdf?: () => void;
  onExportPng: () => void;
  onRerollDylan?: () => void;
  onJumpToSection?: (sectionId: string) => void;
  sections?: CVSection[];
}

export function CommandPalette({
  isOpen,
  onClose,
  lang,
  onSelectTemplate,
  onSetDensity,
  onSelectFont,
  onSwitchLanguage,
  onToggleTheme,
  onToggleGrid,
  onResetCanvas,
  onOpenLinter,
  onOpenLatex,
  onOpenComparator,
  onOpenJobMatcher,
  onExportJson,
  onExportJsonResume,
  onExportEuropassXml,
  onExportCoverLetterPdf,
  onExportApplicationPackage,
  onSwitchDocumentTab,
  onOpenPdfSecurity,
  onOpenProfileManager,
  profiles = [],
  activeProfileId,
  onSwitchProfile,
  onExportPdf,
  onExportDarkPdf,
  onExportPng,
  onRerollDylan,
  onJumpToSection,
  sections = [],
}: Props) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { t: tr } = useTranslation(lang);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const commands: CommandItem[] = useMemo(() => {
    const list: CommandItem[] = [
      // 🎨 Templates & Density
      {
        id: "tpl-lateralis",
        category: "templates",
        title: tr("builder.modals.commandPalette.commands.tplLateralis.title"),
        subtitle: tr("builder.modals.commandPalette.commands.tplLateralis.subtitle"),
        icon: Layers,
        keywords: tr("builder.modals.commandPalette.commands.tplLateralis.keywords").split(" "),
        action: () => onSelectTemplate("lateralis"),
      },
      {
        id: "tpl-classic",
        category: "templates",
        title: tr("builder.modals.commandPalette.commands.tplClassic.title"),
        subtitle: tr("builder.modals.commandPalette.commands.tplClassic.subtitle"),
        icon: Layers,
        keywords: tr("builder.modals.commandPalette.commands.tplClassic.keywords").split(" "),
        action: () => onSelectTemplate("classic"),
      },
      {
        id: "tpl-matrix",
        category: "templates",
        title: tr("builder.modals.commandPalette.commands.tplMatrix.title"),
        subtitle: tr("builder.modals.commandPalette.commands.tplMatrix.subtitle"),
        icon: Layers,
        keywords: tr("builder.modals.commandPalette.commands.tplMatrix.keywords").split(" "),
        action: () => onSelectTemplate("matrix"),
      },
      {
        id: "density-compact",
        category: "templates",
        title: tr("builder.modals.commandPalette.commands.densityCompact.title"),
        subtitle: tr("builder.modals.commandPalette.commands.densityCompact.subtitle"),
        icon: Sparkles,
        keywords: tr("builder.modals.commandPalette.commands.densityCompact.keywords").split(" "),
        action: () => onSetDensity("compact"),
      },
      {
        id: "density-normal",
        category: "templates",
        title: tr("builder.modals.commandPalette.commands.densityNormal.title"),
        subtitle: tr("builder.modals.commandPalette.commands.densityNormal.subtitle"),
        icon: Sparkles,
        keywords: tr("builder.modals.commandPalette.commands.densityNormal.keywords").split(" "),
        action: () => onSetDensity("normal"),
      },
      {
        id: "density-spacious",
        category: "templates",
        title: tr("builder.modals.commandPalette.commands.densitySpacious.title"),
        subtitle: tr("builder.modals.commandPalette.commands.densitySpacious.subtitle"),
        icon: Sparkles,
        keywords: tr("builder.modals.commandPalette.commands.densitySpacious.keywords").split(" "),
        action: () => onSetDensity("spacious"),
      },

      // 🔤 Typography Fonts
      ...(onSelectFont
        ? FONT_CATALOG.map((f) => ({
            id: `font-${f.id}`,
            category: "templates" as const,
            title: `${tr("preview.typography.title")}: ${f.name}`,
            subtitle: `${f.category.toUpperCase()} • ${f.atsRating === "optimal" ? tr("preview.typography.optimalAts") : tr("preview.typography.standardAts")} • ${f.sampleText}`,
            icon: Type,
            keywords: ["font", "fonte", "typography", "tipografia", f.name.toLowerCase(), f.category],
            action: () => onSelectFont(f.id),
          }))
        : []),

      // ⚡ Quick Actions
      ...(onRerollDylan
        ? [
            {
              id: "act-reroll-dylan",
              category: "actions" as const,
              title: tr("builder.modals.commandPalette.commands.rerollDylan.title"),
              subtitle: tr("builder.modals.commandPalette.commands.rerollDylan.subtitle"),
              icon: Dices,
              keywords: tr("builder.modals.commandPalette.commands.rerollDylan.keywords").split(" "),
              action: onRerollDylan,
            },
          ]
        : []),
      {
        id: "act-export-pdf",
        category: "actions",
        title: tr("builder.modals.commandPalette.commands.exportPdf.title"),
        subtitle: tr("builder.modals.commandPalette.commands.exportPdf.subtitle"),
        icon: Download,
        keywords: tr("builder.modals.commandPalette.commands.exportPdf.keywords").split(" "),
        shortcut: "PDF",
        action: onExportPdf,
      },
      {
        id: "act-export-dark-pdf",
        category: "actions",
        title: tr("builder.modals.commandPalette.commands.exportDarkPdf.title") || "Export Dark Mode PDF",
        subtitle: tr("builder.modals.commandPalette.commands.exportDarkPdf.subtitle") || "High-contrast dark theme for creative portfolios",
        icon: Moon,
        keywords: (tr("builder.modals.commandPalette.commands.exportDarkPdf.keywords") || "export dark mode pdf creative portfolio night theme").split(" "),
        action: () => {
          if (onExportDarkPdf) onExportDarkPdf();
          else onExportPdf();
        },
      },
      {
        id: "act-export-png",
        category: "actions",
        title: tr("builder.modals.commandPalette.commands.exportPng.title"),
        subtitle: tr("builder.modals.commandPalette.commands.exportPng.subtitle"),
        icon: Download,
        keywords: tr("builder.modals.commandPalette.commands.exportPng.keywords").split(" "),
        action: onExportPng,
      },
      {
        id: "act-linter",
        category: "actions",
        title: tr("builder.modals.commandPalette.commands.linter.title"),
        subtitle: tr("builder.modals.commandPalette.commands.linter.subtitle"),
        icon: ShieldCheck,
        keywords: tr("builder.modals.commandPalette.commands.linter.keywords").split(" "),
        action: onOpenLinter,
      },
      {
        id: "act-latex",
        category: "actions",
        title: tr("builder.modals.commandPalette.commands.latex.title"),
        subtitle: tr("builder.modals.commandPalette.commands.latex.subtitle"),
        icon: FileCode2,
        keywords: tr("builder.modals.commandPalette.commands.latex.keywords").split(" "),
        action: onOpenLatex,
      },
      {
        id: "act-json",
        category: "actions",
        title: tr("builder.modals.commandPalette.commands.json.title"),
        subtitle: tr("builder.modals.commandPalette.commands.json.subtitle"),
        icon: FileJson,
        keywords: tr("builder.modals.commandPalette.commands.json.keywords").split(" "),
        action: onExportJson,
      },
      ...(onExportJsonResume
        ? [
            {
              id: "act-export-jsonresume",
              category: "actions" as const,
              title: tr("builder.modals.commandPalette.commands.exportJsonResume.title"),
              subtitle: tr("builder.modals.commandPalette.commands.exportJsonResume.subtitle"),
              icon: FileJson,
              keywords: (tr("builder.modals.commandPalette.commands.exportJsonResume.keywords") || "export json resume jsonresume").split(" "),
              action: onExportJsonResume,
            },
          ]
        : []),
      ...(onExportEuropassXml
        ? [
            {
              id: "act-export-europass",
              category: "actions" as const,
              title: tr("builder.modals.commandPalette.commands.exportEuropass.title"),
              subtitle: tr("builder.modals.commandPalette.commands.exportEuropass.subtitle"),
              icon: FileCode2,
              keywords: (tr("builder.modals.commandPalette.commands.exportEuropass.keywords") || "export europass xml europe").split(" "),
              action: onExportEuropassXml,
            },
          ]
        : []),
      ...(onSwitchDocumentTab
        ? [
            {
              id: "act-switch-cv",
              category: "actions" as const,
              title: tr("builder.modals.commandPalette.commands.docCv.title"),
              subtitle: tr("builder.modals.commandPalette.commands.docCv.subtitle"),
              icon: FileText,
              keywords: (tr("builder.modals.commandPalette.commands.docCv.keywords") || "cv resume").split(" "),
              action: () => onSwitchDocumentTab("cv"),
            },
            {
              id: "act-switch-cover-letter",
              category: "actions" as const,
              title: tr("builder.modals.commandPalette.commands.docCoverLetter.title"),
              subtitle: tr("builder.modals.commandPalette.commands.docCoverLetter.subtitle"),
              icon: Mail,
              keywords: (tr("builder.modals.commandPalette.commands.docCoverLetter.keywords") || "cover letter application").split(" "),
              action: () => onSwitchDocumentTab("cover-letter"),
            },
          ]
        : []),
      ...(onExportCoverLetterPdf
        ? [
            {
              id: "act-export-cover-letter",
              category: "actions" as const,
              title: tr("builder.modals.commandPalette.commands.exportCoverLetter.title"),
              subtitle: tr("builder.modals.commandPalette.commands.exportCoverLetter.subtitle"),
              icon: Mail,
              keywords: (tr("builder.modals.commandPalette.commands.exportCoverLetter.keywords") || "export cover letter pdf").split(" "),
              action: onExportCoverLetterPdf,
            },
          ]
        : []),
      ...(onExportApplicationPackage
        ? [
            {
              id: "act-export-package",
              category: "actions" as const,
              title: tr("builder.modals.commandPalette.commands.exportPackage.title"),
              subtitle: tr("builder.modals.commandPalette.commands.exportPackage.subtitle"),
              icon: Layers,
              keywords: (tr("builder.modals.commandPalette.commands.exportPackage.keywords") || "export package letter cv combined").split(" "),
              action: onExportApplicationPackage,
            },
          ]
        : []),
      ...(onOpenPdfSecurity
        ? [
            {
              id: "act-pdf-security",
              category: "actions" as const,
              title: tr("pdfSecurity.modalTitle"),
              subtitle: tr("pdfSecurity.modalSubtitle"),
              icon: ShieldCheck,
              keywords: ["pdf", "security", "password", "encrypt", "a11y", "pdf/ua", "accessibility"],
              action: onOpenPdfSecurity,
            },
          ]
        : []),
      ...(onOpenComparator
        ? [
            {
              id: "act-compare",
              category: "actions" as const,
              title: tr("builder.modals.commandPalette.commands.compare.title"),
              subtitle: tr("builder.modals.commandPalette.commands.compare.subtitle"),
              icon: GitCompare,
              keywords: (tr("builder.modals.commandPalette.commands.compare.keywords") || "diff compare semantic ats merge version").split(" "),
              action: onOpenComparator,
            },
          ]
        : []),
      ...(onOpenJobMatcher
        ? [
            {
              id: "act-job-matcher",
              category: "actions" as const,
              title: tr("builder.modals.commandPalette.commands.jobMatcher.title"),
              subtitle: tr("builder.modals.commandPalette.commands.jobMatcher.subtitle"),
              icon: Target,
              keywords: (tr("builder.modals.commandPalette.commands.jobMatcher.keywords") || "job vacancy ats match keyword scanner requirements vaga").split(" "),
              action: onOpenJobMatcher,
            },
          ]
        : []),

      // 🧭 Canvas & Navigation
      ...(onToggleGrid
        ? [
            {
              id: "nav-grid",
              category: "navigation" as const,
              title: tr("builder.modals.commandPalette.commands.navGrid.title"),
              subtitle: tr("builder.modals.commandPalette.commands.navGrid.subtitle"),
              icon: Grid,
              keywords: tr("builder.modals.commandPalette.commands.navGrid.keywords").split(" "),
              action: onToggleGrid,
            },
          ]
        : []),
      ...(onResetCanvas
        ? [
            {
              id: "nav-reset-canvas",
              category: "navigation" as const,
              title: tr("builder.modals.commandPalette.commands.navResetCanvas.title"),
              subtitle: tr("builder.modals.commandPalette.commands.navResetCanvas.subtitle"),
              icon: Maximize2,
              keywords: tr("builder.modals.commandPalette.commands.navResetCanvas.keywords").split(" "),
              action: onResetCanvas,
            },
          ]
        : []),

      // Navigation: External Pages
      ...(process.env.NODE_ENV === "development" || process.env.ENABLE_DEV_BOARD === "true"
        ? [
            {
              id: "nav-board",
              category: "navigation" as const,
              title: tr("builder.modals.commandPalette.commands.navBoard.title"),
              subtitle: tr("builder.modals.commandPalette.commands.navBoard.subtitle"),
              icon: Kanban,
              keywords: tr("builder.modals.commandPalette.commands.navBoard.keywords").split(" "),
              action: () => {
                window.location.href = "/board";
              },
            },
          ]
        : []),
      {
        id: "nav-guide",
        category: "navigation" as const,
        title: tr("builder.modals.commandPalette.commands.navGuide.title"),
        subtitle: tr("builder.modals.commandPalette.commands.navGuide.subtitle"),
        icon: BookOpen,
        keywords: tr("builder.modals.commandPalette.commands.navGuide.keywords").split(" "),
        action: () => {
          window.location.href = "/guide";
        },
      },

      // Jump to Sections
      {
        id: "sec-personal",
        category: "navigation",
        title: tr("builder.modals.commandPalette.commands.secPersonal.title"),
        subtitle: tr("builder.modals.commandPalette.commands.secPersonal.subtitle"),
        icon: User,
        keywords: tr("builder.modals.commandPalette.commands.secPersonal.keywords").split(" "),
        action: () => onJumpToSection?.("personal"),
      },
      ...sections.map((s) => {
        let IconComp = FileText;
        if (s.type === "experience") IconComp = Briefcase;
        else if (s.type === "education") IconComp = GraduationCap;
        else if (s.type === "skills") IconComp = Wrench;
        else if (s.type === "languages") IconComp = Globe2;
        else if (s.type === "certifications") IconComp = Award;
        else if (s.type === "hobbies") IconComp = HeartHandshake;

        const titleStr = s.title?.[lang] || s.title?.en || s.type;
        return {
          id: `sec-${s.id}`,
          category: "navigation" as const,
          title: tr("builder.modals.commandPalette.commands.secJumpPrefix", { name: titleStr }),
          subtitle: tr("builder.modals.commandPalette.commands.secSectionPrefix", { type: s.type }),
          icon: IconComp,
          keywords: [s.type, titleStr.toLowerCase()],
          action: () => onJumpToSection?.(s.id),
        };
      }),

      // 🌐 Preferences
      ...(onOpenProfileManager
        ? [
            {
              id: "act-manage-profiles",
              category: "preferences" as const,
              title: tr("profiles.modalTitle"),
              subtitle: tr("profiles.modalSubtitle"),
              icon: Briefcase,
              keywords: ["profile", "perfil", "profiles", "perfis", "manage", "gerir"],
              action: onOpenProfileManager,
            },
          ]
        : []),
      ...profiles.map((p) => ({
        id: `switch-profile-${p.id}`,
        category: "preferences" as const,
        title: `${tr("profiles.switch")}: ${p.name}`,
        subtitle: `${p.template.toUpperCase()} • ${p.targetRole || "CV Profile"}${p.id === activeProfileId ? ` (${tr("profiles.active")})` : ""}`,
        icon: Briefcase,
        keywords: ["profile", "perfil", "switch", "mudar", p.name.toLowerCase()],
        action: () => onSwitchProfile?.(p.id),
      })),
      {
        id: "pref-lang-pt",
        category: "preferences",
        title: tr("builder.modals.commandPalette.commands.prefLangPt.title"),
        subtitle: tr("builder.modals.commandPalette.commands.prefLangPt.subtitle"),
        icon: Globe,
        keywords: tr("builder.modals.commandPalette.commands.prefLangPt.keywords").split(" "),
        action: () => onSwitchLanguage("pt"),
      },
      {
        id: "pref-lang-en",
        category: "preferences",
        title: tr("builder.modals.commandPalette.commands.prefLangEn.title"),
        subtitle: tr("builder.modals.commandPalette.commands.prefLangEn.subtitle"),
        icon: Globe,
        keywords: tr("builder.modals.commandPalette.commands.prefLangEn.keywords").split(" "),
        action: () => onSwitchLanguage("en"),
      },
      {
        id: "pref-theme",
        category: "preferences",
        title: tr("builder.modals.commandPalette.commands.prefTheme.title"),
        subtitle: tr("builder.modals.commandPalette.commands.prefTheme.subtitle"),
        icon: Sun,
        keywords: tr("builder.modals.commandPalette.commands.prefTheme.keywords").split(" "),
        action: onToggleTheme,
      },
    ];

    return list;
  }, [
    tr,
    lang,
    sections,
    onSelectTemplate,
    onSetDensity,
    onSelectFont,
    onSwitchLanguage,
    onToggleTheme,
    onToggleGrid,
    onResetCanvas,
    onOpenLinter,
    onOpenLatex,
    onOpenComparator,
    onOpenJobMatcher,
    onExportJson,
    onExportJsonResume,
    onExportEuropassXml,
    onExportCoverLetterPdf,
    onExportApplicationPackage,
    onSwitchDocumentTab,
    onOpenPdfSecurity,
    onOpenProfileManager,
    profiles,
    activeProfileId,
    onSwitchProfile,
    onExportPdf,
    onExportDarkPdf,
    onExportPng,
    onRerollDylan,
    onJumpToSection,
  ]);

  type PaletteCategory = "all" | "templates" | "sections" | "actions" | "preferences";
  const [selectedCategory, setSelectedCategory] = useState<PaletteCategory>("all");

  const normalizeText = (text: string) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const categoryLabels: Record<string, string> = useMemo(
    () => ({
      all: tr("builder.modals.commandPalette.categories.all"),
      templates: tr("builder.modals.commandPalette.categories.templates"),
      sections: tr("builder.modals.commandPalette.categories.sections"),
      actions: tr("builder.modals.commandPalette.categories.actions"),
      preferences: tr("builder.modals.commandPalette.categories.preferences"),
    }),
    [tr]
  );

  const filteredCommands = useMemo(() => {
    let list = commands;

    // Filter by Category tab if not "all"
    if (selectedCategory === "sections") {
      list = list.filter((c) => c.category === "navigation" && c.id.startsWith("sec-"));
    } else if (selectedCategory === "actions") {
      list = list.filter(
        (c) =>
          c.category === "actions" ||
          (c.category === "navigation" && !c.id.startsWith("sec-"))
      );
    } else if (selectedCategory !== "all") {
      list = list.filter((c) => c.category === selectedCategory);
    }

    if (!query.trim()) return list;

    const tokens = normalizeText(query)
      .split(/\s+/)
      .filter(Boolean);

    return list.filter((c) => {
      const searchBlob = normalizeText(
        `${c.title} ${c.subtitle || ""} ${(c.keywords || []).join(" ")} ${
          categoryLabels[c.category] || ""
        }`
      );
      return tokens.every((token) => searchBlob.includes(token));
    });
  }, [commands, query, selectedCategory, categoryLabels]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCommands, selectedCategory]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = filteredCommands[selectedIndex];
      if (selected) {
        selected.action();
        onClose();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  useEffect(() => {
    const activeEl = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    activeEl?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  if (!isOpen || !mounted) return null;

  const categoryPills: Array<{ id: PaletteCategory; label: string; icon: React.ElementType }> = [
    { id: "all", label: categoryLabels.all, icon: Command },
    { id: "templates", label: categoryLabels.templates, icon: Layers },
    { id: "sections", label: categoryLabels.sections, icon: FileText },
    { id: "actions", label: categoryLabels.actions, icon: Sparkles },
    { id: "preferences", label: categoryLabels.preferences, icon: Sun },
  ];

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-[#161b22] rounded-3xl shadow-2xl border border-stone-200 dark:border-[#30363d] overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Header - Integrated and clean with zero harsh outlines */}
        <div className="border-b border-stone-200 dark:border-[#30363d] bg-stone-50/70 dark:bg-[#161b22]">
          <div className="flex items-center gap-3 px-4 py-3.5">
            <Search size={18} className="text-amber-600 dark:text-amber-400 shrink-0" />
            <input
              ref={inputRef}
              data-testid="command-palette-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tr("builder.modals.commandPalette.placeholder")}
              aria-label={tr("builder.modals.commandPalette.searchAria")}
              className="w-full bg-transparent border-0 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 shadow-none text-sm text-stone-900 dark:text-[#f0f3f6] placeholder-stone-400 dark:placeholder-[#6e7681] font-sans"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                title={tr("common.actions.clear")}
                aria-label={tr("builder.modals.commandPalette.clearAria")}
                className="text-[11px] font-mono text-stone-500 hover:text-stone-700 dark:text-[#8b949e] dark:hover:text-[#f0f3f6] min-w-[24px] min-h-[24px] flex items-center justify-center rounded-full hover:bg-stone-200/60 dark:hover:bg-[#21262d] transition-colors"
              >
                Esc
              </button>
            )}
            <span className="hidden sm:inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-stone-200 dark:bg-[#21262d] text-stone-600 dark:text-[#c9d1d9] border border-stone-300/80 dark:border-[#363d47]">
              ESC
            </span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 px-4 pb-2.5 overflow-x-auto no-scrollbar">
            {categoryPills.map((tab) => {
              const IconComp = tab.icon;
              const isCatActive = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-2xs shrink-0 active:scale-95 ${
                    isCatActive
                      ? "bg-amber-700 text-white shadow-xs"
                      : "bg-white dark:bg-[#0d1117] text-stone-600 dark:text-[#c9d1d9] hover:bg-stone-100 dark:hover:bg-[#21262d] border border-stone-200 dark:border-[#363d47]"
                  }`}
                >
                  <IconComp size={12} className={isCatActive ? "text-white" : "text-amber-600 dark:text-amber-400"} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Command Items List */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2.5 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="py-14 text-center text-stone-400 dark:text-[#8b949e] text-xs">
              <p className="font-bold">{tr("builder.modals.commandPalette.noResults")}</p>
              <p className="text-[11px] mt-1 text-stone-500">
                {tr("builder.modals.commandPalette.noResultsHint")}
              </p>
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              const IconComponent = cmd.icon;

              return (
                <button
                  key={cmd.id}
                  type="button"
                  data-index={idx}
                  onClick={() => {
                    cmd.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left px-3 py-2.5 rounded-2xl flex items-center justify-between gap-3 transition-all ${
                    isSelected
                      ? "bg-amber-500/10 dark:bg-[#21262d] text-stone-900 dark:text-[#f0f3f6] border border-amber-500/40 shadow-xs ring-1 ring-amber-500/20"
                      : "hover:bg-stone-100 dark:hover:bg-[#21262d]/60 text-stone-700 dark:text-[#c9d1d9] border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? "bg-amber-700 text-white shadow-2xs"
                          : "bg-stone-100 dark:bg-[#0d1117] text-stone-600 dark:text-[#8b949e]"
                      }`}
                    >
                      <IconComponent size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate flex items-center gap-2">
                        <HighlightMatch text={cmd.title} query={query} />
                        <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-stone-200/70 dark:bg-[#0d1117] text-stone-600 dark:text-[#8b949e] border border-stone-300/40 dark:border-[#363d47]/60 shrink-0">
                          {cmd.category === "navigation" && cmd.id.startsWith("sec-")
                            ? categoryLabels.sections
                            : categoryLabels[cmd.category]}
                        </span>
                      </div>
                      {cmd.subtitle && (
                        <div className="text-[11px] text-stone-400 dark:text-[#8b949e] truncate mt-0.5">
                          <HighlightMatch text={cmd.subtitle} query={query} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {cmd.shortcut && (
                      <span className="text-[10px] font-mono bg-stone-200 dark:bg-[#0d1117] px-2 py-0.5 rounded-md text-stone-600 dark:text-[#c9d1d9] border border-stone-300/60 dark:border-[#363d47]">
                        {cmd.shortcut}
                      </span>
                    )}
                    {isSelected && (
                      <ArrowRight size={14} className="text-amber-600 dark:text-amber-400 animate-pulse" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="px-4 py-2.5 border-t border-stone-200 dark:border-[#30363d] bg-stone-50/50 dark:bg-[#161b22] flex items-center justify-between text-[11px] text-stone-500 dark:text-[#8b949e] font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ {tr("builder.modals.commandPalette.footer.navigate")}</span>
            <span>↵ {tr("builder.modals.commandPalette.footer.execute")}</span>
          </div>
          <span className="font-bold text-amber-600 dark:text-amber-400">{tr("builder.modals.commandPalette.footer.brand")}</span>
        </div>
      </div>
    </div>,
    document.body
  );
}

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <span className="truncate">{text}</span>;
  const rawTokens = query.trim().split(/\s+/).filter(Boolean);
  if (rawTokens.length === 0) return <span className="truncate">{text}</span>;

  const escapedTokens = rawTokens.map((t) =>
    t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );
  const regex = new RegExp(`(${escapedTokens.join("|")})`, "gi");
  const parts = text.split(regex);

  return (
    <span className="truncate">
      {parts.map((part, i) => {
        const isMatch = rawTokens.some(
          (t) => t.toLowerCase() === part.toLowerCase()
        );
        return isMatch ? (
          <mark
            key={i}
            className="bg-amber-400/25 dark:bg-amber-400/30 text-amber-900 dark:text-amber-300 font-black rounded-xs px-0.5"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </span>
  );
}
