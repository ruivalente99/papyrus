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
  Moon,
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

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase().trim();
    return commands.filter((c) => {
      return (
        c.title.toLowerCase().includes(q) ||
        c.subtitle?.toLowerCase().includes(q) ||
        c.keywords?.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [commands, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCommands]);

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

  const categoryLabels = {
    templates: isPt ? "Modelos & Estilo" : "Templates & Style",
    actions: isPt ? "Ações Rápidas" : "Quick Actions",
    navigation: isPt ? "Navegação & Canvas" : "Navigation & Canvas",
    preferences: isPt ? "Preferências" : "Preferences",
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[75vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/70">
          <Command size={18} className="text-amber-600 dark:text-amber-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tr("builder.modals.commandPalette.placeholder")}
            aria-label={tr("builder.modals.commandPalette.searchAria")}
            className="flex-1 bg-transparent border-none outline-hidden text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 font-sans"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              title={tr("common.actions.clear")}
              aria-label={tr("builder.modals.commandPalette.clearAria")}
              className="text-[11px] font-mono text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 min-w-[24px] min-h-[24px] flex items-center justify-center rounded"
            >
              Esc
            </button>
          )}
          <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-300 dark:border-stone-700">
            ESC
          </span>
        </div>

        {/* Command Items List */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 divide-y divide-transparent space-y-0.5">
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-xs">
              {tr("builder.modals.commandPalette.noResults")}
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
                  className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between gap-3 transition-colors ${
                    isSelected
                      ? "bg-amber-500/15 text-stone-950 dark:text-stone-50 border border-amber-500/30"
                      : "hover:bg-stone-100 dark:hover:bg-stone-800/60 text-stone-700 dark:text-stone-300 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-amber-500 text-white"
                          : "bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400"
                      }`}
                    >
                      <IconComponent size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate flex items-center gap-2">
                        <span>{cmd.title}</span>
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded-sm bg-stone-200/70 dark:bg-stone-800 text-stone-500">
                          {categoryLabels[cmd.category]}
                        </span>
                      </div>
                      {cmd.subtitle && (
                        <div className="text-[11px] text-stone-400 dark:text-stone-500 truncate">
                          {cmd.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {cmd.shortcut && (
                      <span className="text-[10px] font-mono bg-stone-200 dark:bg-stone-800 px-1.5 py-0.5 rounded text-stone-600 dark:text-stone-300">
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
        <div className="px-4 py-2 border-t border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ {isPt ? "Navegar" : "Navigate"}</span>
            <span>↵ {isPt ? "Selecionar" : "Execute"}</span>
          </div>
          <span>PAPYRUS Spotlight</span>
        </div>
      </div>
    </div>,
    document.body
  );
}
