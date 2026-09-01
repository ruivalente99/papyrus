"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { LinterReport, SupportedLanguage, LinterIssue } from "@/types/cv";
import { NanoBananaLogo } from "@/components/common/NanoBananaLogo";
import {
  X,
  AlertCircle,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Check,
} from "lucide-react";

interface Props {
  report: LinterReport;
  isOpen: boolean;
  onClose: () => void;
  lang?: SupportedLanguage;
}

type FilterLevel = "all" | "error" | "warning" | "info";

export function LinterModal({ report, isOpen, onClose, lang = "en" }: Props) {
  const [filter, setFilter] = useState<FilterLevel>("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const isPt = lang === "pt";
  const { score, issues, passedChecks, totalChecks } = report;

  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warning");
  const infos = issues.filter((i) => i.level === "info");

  const filteredIssues =
    filter === "all"
      ? issues
      : issues.filter((i) => i.level === filter);

  // Score visual configuration
  const scoreConfig =
    score >= 90
      ? {
          color: "text-emerald-600 dark:text-emerald-400",
          bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
          border: "border-emerald-500/30",
          label: isPt ? "Excelente" : "Excellent",
          desc: isPt
            ? "O currículo está completo e altamente otimizado para ATS."
            : "Complete and highly ATS-optimized.",
        }
      : score >= 75
      ? {
          color: "text-amber-600 dark:text-amber-400",
          bg: "bg-amber-500/10 dark:bg-amber-500/15",
          border: "border-amber-500/30",
          label: isPt ? "Boa Qualidade" : "Good Quality",
          desc: isPt
            ? "Bom nível geral com recomendações para maior impacto."
            : "Good overall with actionable suggestions to increase impact.",
        }
      : {
          color: "text-rose-600 dark:text-rose-400",
          bg: "bg-rose-500/10 dark:bg-rose-500/15",
          border: "border-rose-500/30",
          label: isPt ? "Atenção" : "Needs Attention",
          desc: isPt
            ? "Campos essenciais em falta para passar filtros de recrutamento."
            : "Essential fields missing to pass recruiter screening.",
        };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-stone-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border-t sm:border border-stone-200/80 dark:border-stone-800 w-full sm:max-w-xl max-h-[90dvh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 mx-auto"
      >
        {/* iOS Drag handle on mobile */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center shrink-0">
          <div className="w-10 h-1 rounded-full bg-stone-300 dark:bg-stone-700" />
        </div>

        {/* Pinned Header */}
        <div className="px-5 py-3 border-b border-stone-200/70 dark:border-stone-800/70 flex items-center justify-between bg-stone-50/70 dark:bg-stone-900/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <NanoBananaLogo size="sm" />
            <div>
              <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm leading-tight">
                {isPt ? "Auditoria de Qualidade" : "Quality Audit"}
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                {passedChecks} / {totalChecks} {isPt ? "critérios cumpridos" : "criteria met"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={isPt ? "Fechar" : "Close"}
            className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1.5 rounded-full hover:bg-stone-200/80 dark:hover:bg-stone-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Score Card Banner - Clean Charm */}
        <div className="px-5 py-3.5 bg-stone-50/50 dark:bg-stone-800/40 border-b border-stone-200/70 dark:border-stone-800/70 flex items-center gap-3.5 shrink-0">
          {/* Circular Score Badge */}
          <div
            className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex flex-col items-center justify-center border shrink-0 ${scoreConfig.bg} ${scoreConfig.border}`}
          >
            <span className={`text-xl font-black font-mono leading-none ${scoreConfig.color}`}>
              {score}%
            </span>
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mt-0.5">
              Score
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold ${scoreConfig.color}`}>
                {scoreConfig.label}
              </span>
              <span className="text-[10px] font-mono bg-stone-200/70 dark:bg-stone-700/60 text-stone-600 dark:text-stone-300 px-2 py-0.5 rounded-full font-bold">
                {issues.length === 0
                  ? isPt ? "Perfeito" : "Perfect"
                  : `${issues.length} ${issues.length === 1 ? (isPt ? "nota" : "note") : (isPt ? "notas" : "notes")}`}
              </span>
            </div>
            <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-0.5 leading-snug">
              {scoreConfig.desc}
            </p>
          </div>
        </div>

        {/* Filter Pills (Segmented filter bar) */}
        {issues.length > 0 && (
          <div className="px-5 py-2 border-b border-stone-200/60 dark:border-stone-800/60 bg-white dark:bg-stone-900 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all shrink-0 ${
                filter === "all"
                  ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-2xs"
                  : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
              }`}
            >
              {isPt ? "Todos" : "All"} ({issues.length})
            </button>

            {errors.length > 0 && (
              <button
                onClick={() => setFilter("error")}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 shrink-0 ${
                  filter === "error"
                    ? "bg-rose-600 text-white shadow-2xs"
                    : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40"
                }`}
              >
                <AlertCircle size={12} />
                <span>{isPt ? "Erros" : "Errors"} ({errors.length})</span>
              </button>
            )}

            {warnings.length > 0 && (
              <button
                onClick={() => setFilter("warning")}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 shrink-0 ${
                  filter === "warning"
                    ? "bg-amber-600 text-white shadow-2xs"
                    : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40"
                }`}
              >
                <AlertTriangle size={12} />
                <span>{isPt ? "Avisos" : "Warnings"} ({warnings.length})</span>
              </button>
            )}

            {infos.length > 0 && (
              <button
                onClick={() => setFilter("info")}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 shrink-0 ${
                  filter === "info"
                    ? "bg-sky-600 text-white shadow-2xs"
                    : "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/40"
                }`}
              >
                <Lightbulb size={12} />
                <span>{isPt ? "Dicas" : "Tips"} ({infos.length})</span>
              </button>
            )}
          </div>
        )}

        {/* Issue Cards Scrollable Viewport */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-2 flex-1 overscroll-contain">
          {issues.length === 0 ? (
            <div className="text-center py-10 space-y-2 text-stone-500 dark:text-stone-400">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={24} />
              </div>
              <p className="font-bold text-stone-800 dark:text-stone-200 text-sm">
                {isPt ? "Excelente! Nenhum problema encontrado" : "Excellent! No issues found"}
              </p>
              <p className="text-xs max-w-xs mx-auto">
                {isPt
                  ? "O seu curriculum vitae cumpre todos os critérios de qualidade para recrutamento."
                  : "Your curriculum vitae meets all recruitment quality standards."}
              </p>
            </div>
          ) : filteredIssues.length === 0 ? (
            <div className="text-center py-8 text-stone-500 text-xs">
              {isPt ? "Nenhum item nesta categoria." : "No items in this category."}
            </div>
          ) : (
            filteredIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} isPt={isPt} />
            ))
          )}
        </div>

        {/* Pinned Footer with iOS Safe-Area */}
        <div className="px-5 py-3 border-t border-stone-200/80 dark:border-stone-800/80 bg-stone-50/70 dark:bg-stone-900/80 flex items-center justify-end pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-bold rounded-full transition-all shadow-xs active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Check size={14} />
            <span>{isPt ? "Concluído" : "Done"}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function IssueCard({ issue, isPt }: { issue: LinterIssue; isPt: boolean }) {
  const isError = issue.level === "error";
  const isWarning = issue.level === "warning";

  // Context pill styling based on severity
  const theme = isError
    ? {
        border: "border-rose-200 dark:border-rose-900/60",
        bg: "bg-rose-50/60 dark:bg-rose-950/25",
        badgeBg: "bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300",
        iconColor: "text-rose-600 dark:text-rose-400",
        badgeText: isPt ? "Crítico" : "Critical",
        Icon: AlertCircle,
      }
    : isWarning
    ? {
        border: "border-amber-200 dark:border-amber-900/60",
        bg: "bg-amber-50/60 dark:bg-amber-950/25",
        badgeBg: "bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300",
        iconColor: "text-amber-600 dark:text-amber-400",
        badgeText: isPt ? "Aviso" : "Warning",
        Icon: AlertTriangle,
      }
    : {
        border: "border-sky-200 dark:border-sky-900/60",
        bg: "bg-sky-50/60 dark:bg-sky-950/25",
        badgeBg: "bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-300",
        iconColor: "text-sky-600 dark:text-sky-400",
        badgeText: isPt ? "Dica" : "Tip",
        Icon: Lightbulb,
      };

  const { Icon } = theme;

  // Extract quoted context if present, e.g. Dica de Impacto em "Auxiliar de Ação Direta"
  const match = issue.title.match(/["“](.+?)["”]/);
  const targetTag = match ? match[1] : null;
  const cleanTitle = targetTag
    ? issue.title.replace(/["“].+?["”]/, "").replace(/em\s*$/i, "").replace(/on\s*$/i, "").trim()
    : issue.title;

  return (
    <div
      className={`p-3 rounded-2xl border transition-all ${theme.border} ${theme.bg} space-y-1.5`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${theme.badgeBg}`}
          >
            <Icon size={11} className={theme.iconColor} />
            <span>{theme.badgeText}</span>
          </span>

          <span className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
            {cleanTitle}
          </span>
        </div>

        {targetTag && (
          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-white/80 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700/80 shrink-0 max-w-[160px] truncate">
            {targetTag}
          </span>
        )}
      </div>

      <p className="text-[11.5px] text-stone-600 dark:text-stone-400 leading-relaxed pl-0.5">
        {issue.message}
      </p>
    </div>
  );
}
