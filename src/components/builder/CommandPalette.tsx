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
  Languages,
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
} from "lucide-react";

interface CommandItem {
  id: string;
  category: "templates" | "actions" | "navigation" | "preferences";
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  keywords?: string[];
  shortcut?: string;
  action: () => void;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: SupportedLanguage;
  onSelectTemplate: (id: TemplateId) => void;
  onSetDensity: (density: "compact" | "normal" | "spacious") => void;
  onSwitchLanguage: (lang: SupportedLanguage) => void;
  onToggleTheme: () => void;
  onToggleGrid?: () => void;
  onResetCanvas?: () => void;
  onOpenLinter: () => void;
  onOpenLatex: () => void;
  onExportJson: () => void;
  onExportPdf: () => void;
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
  onSwitchLanguage,
  onToggleTheme,
  onToggleGrid,
  onResetCanvas,
  onOpenLinter,
  onOpenLatex,
  onExportJson,
  onExportPdf,
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

  const isPt = lang === "pt";
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
        title: isPt ? "Modelo Lateralis (Barra lateral moderna)" : "Lateralis Template (Modern split column)",
        subtitle: isPt ? "Layout com timeline e paleta customizável" : "Timeline layout with accent palette",
        icon: Layers,
        keywords: ["sidebar", "modern", "design", "lateralis"],
        action: () => onSelectTemplate("lateralis"),
      },
      {
        id: "tpl-classic",
        category: "templates",
        title: isPt ? "Modelo Classic (Minimalista TeX / ATS)" : "Classic Template (Minimalist TeX / ATS)",
        subtitle: isPt ? "Padrão de engenharia otimizado para ATS" : "Engineering standard ATS-optimized",
        icon: Layers,
        keywords: ["latex", "ats", "classic", "minimalist"],
        action: () => onSelectTemplate("classic"),
      },
      {
        id: "tpl-matrix",
        category: "templates",
        title: isPt ? "Modelo Matrix (Grelha executiva)" : "Matrix Template (Executive grid)",
        subtitle: isPt ? "Grelha de competências e línguas CEFR" : "Skills grid and CEFR language competence",
        icon: Layers,
        keywords: ["executive", "matrix", "grid", "cefr"],
        action: () => onSelectTemplate("matrix"),
      },
      {
        id: "density-compact",
        category: "templates",
        title: isPt ? "Densidade: Compacto" : "Density: Compact",
        subtitle: isPt ? "Entrelinha densa para incluir mais conteúdo" : "Tighter spacing to fit more content",
        icon: Sparkles,
        keywords: ["compact", "size", "spacing", "densidade"],
        action: () => onSetDensity("compact"),
      },
      {
        id: "density-normal",
        category: "templates",
        title: isPt ? "Densidade: Normal" : "Density: Normal",
        subtitle: isPt ? "Espaçamento padrão equilibrado" : "Balanced standard spacing",
        icon: Sparkles,
        keywords: ["normal", "size", "spacing", "densidade"],
        action: () => onSetDensity("normal"),
      },
      {
        id: "density-spacious",
        category: "templates",
        title: isPt ? "Densidade: Espaçoso" : "Density: Spacious",
        subtitle: isPt ? "Tipografia arejada com margens generosas" : "Airy typography with generous margins",
        icon: Sparkles,
        keywords: ["spacious", "size", "spacing", "densidade"],
        action: () => onSetDensity("spacious"),
      },

      // ⚡ Quick Actions
      ...(onRerollDylan
        ? [
            {
              id: "act-reroll-dylan",
              category: "actions" as const,
              title: isPt ? "Sortear Novo Avatar Dylan (Re-roll)" : "Re-roll Dylan Avatar (DiceBear)",
              subtitle: isPt ? "Gera uma nova variação artística vetorial" : "Generates a fresh artistic vector avatar",
              icon: Dices,
              keywords: ["dylan", "dicebear", "avatar", "foto", "photo", "random"],
              action: onRerollDylan,
            },
          ]
        : []),
      {
        id: "act-export-pdf",
        category: "actions",
        title: isPt ? "Exportar PDF Vetorial A4" : "Export Vector A4 PDF",
        subtitle: isPt ? "Documento oficial pronto a entregar (210×297mm)" : "Official vector document ready to submit",
        icon: Download,
        keywords: ["pdf", "download", "export", "imprimir"],
        shortcut: "PDF",
        action: onExportPdf,
      },
      {
        id: "act-export-png",
        category: "actions",
        title: isPt ? "Exportar Imagem PNG em Alta Resolução" : "Export High-Res PNG Image",
        subtitle: isPt ? "Cartaz visual para partilha rápida" : "Visual asset for instant sharing",
        icon: Download,
        keywords: ["png", "image", "export", "foto"],
        action: onExportPng,
      },
      {
        id: "act-linter",
        category: "actions",
        title: isPt ? "Abrir Auditoria de Qualidade & Linter ATS" : "Open Quality Linter & ATS Audit",
        subtitle: isPt ? "Verificar pontuação, métricas e avisos" : "Check ATS score, impact metrics and tips",
        icon: ShieldCheck,
        keywords: ["linter", "score", "ats", "auditoria", "qualidade"],
        action: onOpenLinter,
      },
      {
        id: "act-latex",
        category: "actions",
        title: isPt ? "Ver / Exportar Código LaTeX (.tex)" : "View / Export LaTeX Code (.tex)",
        subtitle: isPt ? "Código-fonte TeX compilável no Overleaf" : "Compilable TeX source for Overleaf",
        icon: FileCode2,
        keywords: ["latex", "tex", "code", "overleaf"],
        action: onOpenLatex,
      },
      {
        id: "act-json",
        category: "actions",
        title: isPt ? "Descarregar Cópia de Segurança JSON" : "Download JSON Backup",
        subtitle: isPt ? "Exportar dados brutos do CV em formato JSON" : "Export raw CV document data as JSON",
        icon: FileJson,
        keywords: ["json", "backup", "save", "data"],
        action: onExportJson,
      },

      // 🧭 Canvas & Navigation
      ...(onToggleGrid
        ? [
            {
              id: "nav-grid",
              category: "navigation" as const,
              title: isPt ? "Alternar Grelha de Alinhamento (#)" : "Toggle Alignment Grid (#)",
              subtitle: isPt ? "Ligar/desligar grelha milimétrica atrás da folha" : "Show/hide alignment grid on canvas",
              icon: Grid,
              keywords: ["grid", "grelha", "alinhamento", "canvas"],
              action: onToggleGrid,
            },
          ]
        : []),
      ...(onResetCanvas
        ? [
            {
              id: "nav-reset-canvas",
              category: "navigation" as const,
              title: isPt ? "Repor Enquadramento do Canvas (Auto-Fit)" : "Reset Canvas View (Auto-Fit)",
              subtitle: isPt ? "Centraliza a folha A4 no ecrã" : "Centers the A4 document on screen",
              icon: Maximize2,
              keywords: ["reset", "zoom", "fit", "canvas", "repor"],
              action: onResetCanvas,
            },
          ]
        : []),

      // Jump to Sections
      {
        id: "sec-personal",
        category: "navigation",
        title: isPt ? "Saltar para: Dados Pessoais & Foto" : "Jump to: Personal Info & Photo",
        subtitle: isPt ? "Nome, contactos, links e biografia" : "Name, contact details, links and bio",
        icon: User,
        keywords: ["personal", "pessoal", "nome", "contacto", "foto"],
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
          title: `${isPt ? "Saltar para:" : "Jump to:"} ${titleStr}`,
          subtitle: `${isPt ? "Secção" : "Section"}: ${s.type}`,
          icon: IconComp,
          keywords: [s.type, titleStr.toLowerCase()],
          action: () => onJumpToSection?.(s.id),
        };
      }),

      // 🌐 Preferences
      {
        id: "pref-lang-pt",
        category: "preferences",
        title: isPt ? "Definir Idioma: Português (PT)" : "Switch Language: Portuguese (PT)",
        subtitle: isPt ? "Ativa a versão portuguesa do documento" : "Activate Portuguese version",
        icon: Languages,
        keywords: ["portugues", "portuguese", "pt", "idioma", "language"],
        action: () => onSwitchLanguage("pt"),
      },
      {
        id: "pref-lang-en",
        category: "preferences",
        title: isPt ? "Definir Idioma: Inglês (EN)" : "Switch Language: English (EN)",
        subtitle: isPt ? "Ativa a versão inglesa do documento" : "Activate English version",
        icon: Languages,
        keywords: ["ingles", "english", "en", "idioma", "language"],
        action: () => onSwitchLanguage("en"),
      },
      {
        id: "pref-theme",
        category: "preferences",
        title: isPt ? "Alternar Tema (Claro / Escuro)" : "Toggle Theme (Light / Dark)",
        subtitle: isPt ? "Muda entre modo dia e modo noite" : "Switch between light and dark mode",
        icon: Sun,
        keywords: ["theme", "dark", "light", "tema", "escuro", "claro"],
        action: onToggleTheme,
      },
    ];

    return list;
  }, [
    isPt,
    lang,
    sections,
    onSelectTemplate,
    onSetDensity,
    onSwitchLanguage,
    onToggleTheme,
    onToggleGrid,
    onResetCanvas,
    onOpenLinter,
    onOpenLatex,
    onExportJson,
    onExportPdf,
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
                {isPt ? "Tenta pesquisar por 'latex', 'pdf', 'tema', 'lateralis' ou uma secção." : "Try searching for 'latex', 'pdf', 'theme', 'lateralis' or a section."}
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
            <span>↑↓ {isPt ? "Navegar" : "Navigate"}</span>
            <span>↵ {isPt ? "Selecionar" : "Execute"}</span>
          </div>
          <span className="font-bold text-amber-600 dark:text-amber-400">PAPYRUS Actions</span>
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
