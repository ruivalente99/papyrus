"use client";

import React from "react";
import type { LinterReport } from "@/types/cv";
import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";

interface Props {
  report: LinterReport;
  onClick: () => void;
}

export function LinterBadge({ report, onClick }: Props) {
  const { score, issues } = report;

  const errorCount = issues.filter((i) => i.level === "error").length;
  const warningCount = issues.filter((i) => i.level === "warning").length;

  let colorClasses = "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60";
  let Icon = CheckCircle2;

  if (score < 60 || errorCount > 0) {
    colorClasses = "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/60";
    Icon = AlertCircle;
  } else if (score < 85 || warningCount > 0) {
    colorClasses = "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/60";
    Icon = AlertTriangle;
  }

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border text-[11px] sm:text-xs font-bold shadow-2xs transition-all shrink-0 ${colorClasses}`}
      title="Auditoria de qualidade e linter dinâmico"
    >
      <Icon size={12} className="shrink-0" />
      <span className="font-mono">{score}%</span>
      {issues.length > 0 && (
        <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-black/10 dark:bg-white/20 flex items-center justify-center text-[9px] sm:text-[10px] font-mono font-bold shrink-0">
          {issues.length}
        </span>
      )}
    </button>
  );
}
