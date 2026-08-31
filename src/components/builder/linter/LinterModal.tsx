"use client";

import React from "react";
import type { LinterReport } from "@/types/cv";
import {
  X,
  AlertCircle,
  AlertTriangle,
  Info,
  ShieldCheck,
} from "lucide-react";

interface Props {
  report: LinterReport;
  isOpen: boolean;
  onClose: () => void;
}

export function LinterModal({ report, isOpen, onClose }: Props) {
  if (!isOpen) return null;

  const { score, issues, passedChecks, totalChecks } = report;

  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warning");
  const infos = issues.filter((i) => i.level === "info");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-900">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">Quality Audit & Scoring</h3>
              <p className="text-stone-500 dark:text-stone-400 text-xs">Real-time content validation and ATS compliance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Score Banner */}
        <div className="px-6 py-4 bg-stone-900 dark:bg-stone-950 text-white flex items-center justify-between border-b border-stone-800">
          <div>
            <div className="text-2xl font-black">{score}%</div>
            <div className="text-xs text-stone-300">
              {score >= 90
                ? "Excellent! Your resume is complete and ATS-optimized."
                : score >= 75
                ? "Good quality, with small actionable recommendations."
                : "Requires attention to fill missing fields and improve readability."}
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono bg-stone-800 px-2 py-1 rounded">
              {passedChecks}/{totalChecks} checks
            </span>
          </div>
        </div>

        {/* Issue List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1 text-xs">
          {issues.length === 0 ? (
            <div className="text-center py-8 space-y-2 text-stone-500 dark:text-stone-400">
              <p className="font-bold text-stone-800 dark:text-stone-200">No issues found!</p>
              <p className="text-xs">Your curriculum vitae meets all quality standards.</p>
            </div>
          ) : (
            <>
              {errors.map((issue) => (
                <div
                  key={issue.id}
                  className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl space-y-0.5 text-rose-900 dark:text-rose-200"
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertCircle size={14} className="text-rose-600 dark:text-rose-400 shrink-0" />
                    <span>{issue.title}</span>
                  </div>
                  <p className="text-[11px] text-rose-700 dark:text-rose-300 pl-5">{issue.message}</p>
                </div>
              ))}

              {warnings.map((issue) => (
                <div
                  key={issue.id}
                  className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl space-y-0.5 text-amber-900 dark:text-amber-200"
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>{issue.title}</span>
                  </div>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 pl-5">{issue.message}</p>
                </div>
              ))}

              {infos.map((issue) => (
                <div
                  key={issue.id}
                  className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl space-y-0.5 text-blue-900 dark:text-blue-200"
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    <Info size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>{issue.title}</span>
                  </div>
                  <p className="text-[11px] text-blue-700 dark:text-blue-300 pl-5">{issue.message}</p>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
