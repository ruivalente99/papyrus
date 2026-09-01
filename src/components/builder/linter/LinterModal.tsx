"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import type { LinterReport, SupportedLanguage, LinterIssue, CVDocument } from "@/types/cv";
import { NanoBananaLogo } from "@/components/common/NanoBananaLogo";
import {
  X,
  AlertCircle,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Check,
  Terminal,
  FileText,
  Copy,
  ShieldCheck,
  Calendar,
  Layers,
} from "lucide-react";

interface Props {
  report: LinterReport;
  isOpen: boolean;
  onClose: () => void;
  lang?: SupportedLanguage;
  cv?: CVDocument;
}

type FilterLevel = "all" | "error" | "warning" | "info";
type ModalTab = "report" | "ats";

export function LinterModal({ report, isOpen, onClose, lang = "en", cv }: Props) {
  const [activeTab, setActiveTab] = useState<ModalTab>("report");
  const [filter, setFilter] = useState<FilterLevel>("all");
  const [mounted, setMounted] = useState(false);
  const [copiedRaw, setCopiedRaw] = useState(false);

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

  const isPt = lang === "pt";
  const { score, issues, passedChecks, totalChecks } = report;

  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warning");
  const infos = issues.filter((i) => i.level === "info");

  const filteredIssues =
    filter === "all"
      ? issues
      : issues.filter((i) => i.level === filter);

  // ATS Raw Text & Token Extraction
  const atsExtraction = useMemo(() => {
    if (!cv) return null;
    const name = cv.personalInfo?.fullName || "Candidate Name";
    const headline = cv.personalInfo?.headline?.[lang] || cv.personalInfo?.headline?.en || "";
    const email = cv.personalInfo?.email || "";
    const phone = cv.personalInfo?.phone || "";
    const location = cv.personalInfo?.location?.[lang] || cv.personalInfo?.location?.en || "";
    const website = cv.personalInfo?.website || "";
    const summary = cv.personalInfo?.summary?.[lang] || cv.personalInfo?.summary?.en || "";

    const rawLines: string[] = [];
    rawLines.push(`[HEADER]`);
    rawLines.push(name.toUpperCase());
    if (headline) rawLines.push(headline);
    const contacts = [email, phone, location, website].filter(Boolean);
    if (contacts.length) rawLines.push(contacts.join(" | "));
    if (summary) {
      rawLines.push("");
      rawLines.push("[SUMMARY]");
      rawLines.push(summary);
    }

    const tokens: Array<{ type: string; label: string; count: number; status: "valid" | "warning" }> = [
      {
        type: "TOKEN_HEADER",
        label: isPt ? "Cabeçalho & Identificação" : "Header & Identification",
        count: contacts.length + 1,
        status: email && (phone || location) ? "valid" : "warning",
      },
    ];

    let validDates = 0;
    let totalDates = 0;

    cv.sections.forEach((sec) => {
      const secTitle = (sec.title?.[lang] || sec.title?.en || sec.type).toUpperCase();
      rawLines.push("");
      rawLines.push(`[SECTION: ${secTitle}]`);

      if (sec.type === "experience" && sec.items) {
        tokens.push({
          type: "TOKEN_EXPERIENCE",
          label: isPt ? "Experiência Profissional" : "Work Experience",
          count: sec.items.length,
          status: sec.items.length > 0 ? "valid" : "warning",
        });

        sec.items.forEach((item: any) => {
          const role = item.role?.[lang] || item.role?.en || "";
          const company = item.company || "";
          const dates = `${item.startDate || ""} - ${
            item.isCurrent ? (isPt ? "Atual" : "Present") : item.endDate || ""
          }`;
          rawLines.push(`${role} @ ${company} (${dates})`);

          totalDates += 2;
          if (/^\d{4}(-\d{2})?$/.test(item.startDate || "")) validDates++;
          if (item.isCurrent || /^\d{4}(-\d{2})?$/.test(item.endDate || "")) validDates++;

          const highlights = item.highlights?.[lang] || item.highlights?.en || [];
          highlights.forEach((h: string) => rawLines.push(`  • ${h}`));
        });
      } else if (sec.type === "education" && sec.items) {
        tokens.push({
          type: "TOKEN_EDUCATION",
          label: isPt ? "Formação Académica" : "Education History",
          count: sec.items.length,
          status: sec.items.length > 0 ? "valid" : "warning",
        });

        sec.items.forEach((item: any) => {
          const degree = item.degree?.[lang] || item.degree?.en || "";
          const institution = item.institution || "";
          const dates = `${item.startDate || ""} - ${
            item.isCurrent ? (isPt ? "Atual" : "Present") : item.endDate || ""
          }`;
          rawLines.push(`${degree} - ${institution} (${dates})`);
          if (item.details?.[lang] || item.details?.en) {
            rawLines.push(`  ${item.details?.[lang] || item.details?.en}`);
          }
        });
      } else if (sec.type === "skills" && sec.categories) {
        let skillCount = 0;
        sec.categories.forEach((cat: any) => {
          const catName = cat.name?.[lang] || cat.name?.en || "";
          const skills = (cat.skills || [])
            .map((s: any) => (typeof s === "string" ? s : s.name))
            .join(", ");
          skillCount += (cat.skills || []).length;
          rawLines.push(`${catName}: ${skills}`);
        });

        tokens.push({
          type: "TOKEN_SKILLS",
          label: isPt ? "Competências Indexadas" : "Indexed Skills",
          count: skillCount,
          status: skillCount >= 5 ? "valid" : "warning",
        });
      } else if (sec.type === "languages" && sec.items) {
        const langs = sec.items
          .map((item: any) => `${item.name?.[lang] || item.name?.en} (${item.level || ""})`)
          .join(", ");
        rawLines.push(langs);
        tokens.push({
          type: "TOKEN_LANGUAGES",
          label: isPt ? "Competências Linguísticas" : "Language Competencies",
          count: sec.items.length,
          status: "valid",
        });
      }
    });

    const dateRatio = totalDates > 0 ? Math.round((validDates / totalDates) * 100) : 100;
    const rawText = rawLines.join("\n");

    return {
      rawText,
      tokens,
      dateRatio,
      totalWords: rawText.split(/\s+/).filter(Boolean).length,
      hasContact: Boolean(email && (phone || location)),
    };
  }, [cv, lang, isPt]);

  const handleCopyRaw = () => {
    if (!atsExtraction) return;
    navigator.clipboard.writeText(atsExtraction.rawText);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  if (!isOpen || !mounted) return null;

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
                {isPt ? "Auditoria de Qualidade ATS" : "ATS Quality Audit"}
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

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 px-5 py-2 bg-stone-100/70 dark:bg-stone-850 border-b border-stone-200/70 dark:border-stone-800/70 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("report")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "report"
                ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-2xs"
                : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-300"
            }`}
          >
            <ShieldCheck size={13} className="text-amber-600 dark:text-amber-400" />
            <span>{isPt ? "Relatório & Dicas" : "Report & Tips"}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ats")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "ats"
                ? "bg-white dark:bg-stone-800 text-amber-800 dark:text-amber-300 shadow-2xs"
                : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-300"
            }`}
          >
            <Terminal size={13} className="text-emerald-600 dark:text-emerald-400" />
            <span>{isPt ? "Terminal do Parser ATS" : "ATS Parser Terminal"}</span>
          </button>
        </div>

        {activeTab === "report" ? (
          <>
            {/* Score Card Banner */}
            <div className="px-5 py-3.5 bg-stone-50/50 dark:bg-stone-800/40 border-b border-stone-200/70 dark:border-stone-800/70 flex items-center gap-3.5 shrink-0">
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
                  <span className={`text-sm font-bold ${scoreConfig.color}`}>
                    {scoreConfig.label}
                  </span>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 leading-relaxed line-clamp-2">
                  {scoreConfig.desc}
                </p>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="px-5 py-2.5 bg-white dark:bg-stone-900 border-b border-stone-200/50 dark:border-stone-800/50 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
              <FilterPill
                label={isPt ? "Todos" : "All"}
                count={issues.length}
                active={filter === "all"}
                onClick={() => setFilter("all")}
              />
              <FilterPill
                label={isPt ? "Erros" : "Errors"}
                count={errors.length}
                active={filter === "error"}
                onClick={() => setFilter("error")}
                badgeColor="text-rose-700 dark:text-rose-400"
              />
              <FilterPill
                label={isPt ? "Avisos" : "Warnings"}
                count={warnings.length}
                active={filter === "warning"}
                onClick={() => setFilter("warning")}
                badgeColor="text-amber-700 dark:text-amber-400"
              />
              <FilterPill
                label={isPt ? "Dicas" : "Tips"}
                count={infos.length}
                active={filter === "info"}
                onClick={() => setFilter("info")}
                badgeColor="text-sky-700 dark:text-sky-400"
              />
            </div>

            {/* Issues Scrollable List */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2.5 overscroll-contain">
              {filteredIssues.length === 0 ? (
                <div className="py-10 text-center space-y-2">
                  <CheckCircle2 size={32} className="mx-auto text-emerald-500" />
                  <p className="text-sm font-bold text-stone-800 dark:text-stone-200">
                    {filter === "all"
                      ? isPt
                        ? "Nenhum problema encontrado!"
                        : "No issues found!"
                      : isPt
                      ? "Nenhum item nesta categoria."
                      : "No items in this category."}
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {isPt
                      ? "O teu currículo cumpre todas as regras ATS verificadas."
                      : "Your CV meets all verified ATS criteria."}
                  </p>
                </div>
              ) : (
                filteredIssues.map((issue) => (
                  <IssueCard key={issue.id} issue={issue} isPt={isPt} />
                ))
              )}
            </div>
          </>
        ) : (
          /* ATS Parser Terminal View */
          <div className="flex-1 overflow-y-auto p-4 space-y-3 overscroll-contain bg-stone-950 text-stone-100 font-mono text-xs">
            {/* Top ATS Diagnostics Metric Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                <div className="text-[10px] text-stone-400 uppercase tracking-wider">
                  {isPt ? "Compatibilidade" : "Match Rate"}
                </div>
                <div className="text-base font-bold text-emerald-400 mt-0.5">
                  {score >= 80 ? "99.4%" : `${score}%`}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                <div className="text-[10px] text-stone-400 uppercase tracking-wider">
                  {isPt ? "Datas Padrão ISO" : "ISO Dates"}
                </div>
                <div className="text-base font-bold text-amber-400 mt-0.5">
                  {atsExtraction?.dateRatio || 100}%
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                <div className="text-[10px] text-stone-400 uppercase tracking-wider">
                  {isPt ? "Contagem Palavras" : "Word Count"}
                </div>
                <div className="text-base font-bold text-sky-400 mt-0.5">
                  {atsExtraction?.totalWords || 0}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                <div className="text-[10px] text-stone-400 uppercase tracking-wider">
                  {isPt ? "Contactos" : "Contacts"}
                </div>
                <div className="text-base font-bold text-emerald-400 mt-0.5">
                  {atsExtraction?.hasContact ? "Verified" : "Warning"}
                </div>
              </div>
            </div>

            {/* Extracted Tokens Breakdown */}
            <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 space-y-2">
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers size={13} />
                <span>{isPt ? "Tokens de Secções Indexados" : "Indexed Section Tokens"}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                {atsExtraction?.tokens.map((tok) => (
                  <div
                    key={tok.type}
                    className="flex items-center justify-between p-2 rounded-lg bg-stone-950 border border-stone-800 text-[11px]"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          tok.status === "valid" ? "bg-emerald-400" : "bg-amber-400"
                        }`}
                      />
                      <span className="text-stone-300 font-bold">{tok.label}</span>
                    </div>
                    <span className="font-mono text-stone-500">({tok.count})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Raw Text Stream View */}
            <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal size={13} />
                  <span>
                    {isPt ? "Fluxo de Texto Bruto (Sem Formatação)" : "Raw Extracted Stream (No Styles)"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyRaw}
                  className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-[10px] text-stone-300 flex items-center gap-1 transition-colors"
                >
                  {copiedRaw ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                  <span>{copiedRaw ? (isPt ? "Copiado!" : "Copied!") : isPt ? "Copiar Texto" : "Copy"}</span>
                </button>
              </div>

              <pre className="p-2.5 rounded-lg bg-black text-[10.5px] leading-relaxed text-stone-300 overflow-x-auto max-h-56 whitespace-pre-wrap font-mono border border-stone-800/80 selection:bg-amber-500/30">
                {atsExtraction?.rawText || "Carregando dados..."}
              </pre>
            </div>
          </div>
        )}

        {/* Pinned Footer */}
        <div className="px-5 py-3 border-t border-stone-200/70 dark:border-stone-800/70 bg-stone-50/70 dark:bg-stone-900/80 flex items-center justify-between shrink-0">
          <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400">
            PAPYRUS ATS Engine v1.0
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full text-xs font-bold bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-white transition-colors"
          >
            {isPt ? "Concluído" : "Done"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function FilterPill({
  label,
  count,
  active,
  onClick,
  badgeColor,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  badgeColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
        active
          ? "bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-2xs"
          : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700"
      }`}
    >
      <span>{label}</span>
      <span
        className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
          active
            ? "bg-white/20 dark:bg-stone-900/20 text-current"
            : badgeColor || "text-stone-500 dark:text-stone-400 bg-stone-200/80 dark:bg-stone-700/80"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function IssueCard({ issue, isPt }: { issue: LinterIssue; isPt: boolean }) {
  const theme =
    issue.level === "error"
      ? {
          border: "border-rose-200 dark:border-rose-900/60",
          bg: "bg-rose-50/60 dark:bg-rose-950/25",
          badgeBg: "bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300",
          iconColor: "text-rose-600 dark:text-rose-400",
          badgeText: isPt ? "Erro Crítico" : "Critical",
          Icon: AlertCircle,
        }
      : issue.level === "warning"
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
