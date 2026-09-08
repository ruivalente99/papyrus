"use client";

import React from "react";
import type { ATSComparisonMetric } from "@/types/diff";
import type { SupportedLanguage } from "@/types/cv";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  FileText,
  Zap,
  Target,
  Layers,
  ArrowRight,
} from "lucide-react";

interface Props {
  scoreA: number;
  scoreB: number;
  metrics: ATSComparisonMetric[];
  lang?: SupportedLanguage;
  labelA?: string;
  labelB?: string;
}

export function ATSCompareCard({
  scoreA,
  scoreB,
  metrics,
  lang = "en",
  labelA = "Version A (Active)",
  labelB = "Version B (Compare)",
}: Props) {
  const isPt = lang === "pt";
  const scoreDiff = scoreB - scoreA;

  const getMetricIcon = (name: string) => {
    switch (name) {
      case "ATS Quality Score":
        return <Award className="w-5 h-5 text-indigo-500" />;
      case "Total Word Count":
        return <FileText className="w-5 h-5 text-blue-500" />;
      case "Action Verbs Count":
        return <Zap className="w-5 h-5 text-amber-500" />;
      case "Quantifiable Metrics (%, $, €)":
        return <Target className="w-5 h-5 text-emerald-500" />;
      case "Active Sections":
      default:
        return <Layers className="w-5 h-5 text-purple-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Hero ATS Score Differential Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-zinc-50 dark:bg-zinc-800/60 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700/80 shadow-sm">
        {/* Version A Score */}
        <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
            {labelA}
          </span>
          <div className="text-4xl font-extrabold text-zinc-900 dark:text-white">
            {scoreA}%
          </div>
          <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-zinc-600 dark:bg-zinc-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(scoreA, 100)}%` }}
            />
          </div>
        </div>

        {/* Delta Indicator */}
        <div className="flex flex-col items-center justify-center p-4 text-center">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              {isPt ? "Diferença ATS" : "ATS Score Delta"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {scoreDiff > 0 ? (
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-2xl font-bold bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                <TrendingUp className="w-6 h-6" />
                <span>+{scoreDiff}%</span>
              </div>
            ) : scoreDiff < 0 ? (
              <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 text-2xl font-bold bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 rounded-full border border-rose-200 dark:border-rose-800">
                <TrendingDown className="w-6 h-6" />
                <span>{scoreDiff}%</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400 text-2xl font-bold bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700">
                <Minus className="w-6 h-6" />
                <span>0%</span>
              </div>
            )}
          </div>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
            {scoreDiff > 0
              ? isPt
                ? "A Versão B apresenta maior conformidade com normas ATS."
                : "Version B has higher overall ATS optimization."
              : scoreDiff < 0
              ? isPt
                ? "A Versão A possui melhor pontuação nos critérios avaliados."
                : "Version A scores higher on benchmark criteria."
              : isPt
              ? "Ambas as versões apresentam a mesma pontuação global."
              : "Both versions score identically on overall ATS criteria."}
          </p>
        </div>

        {/* Version B Score */}
        <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
            {labelB}
          </span>
          <div className="text-4xl font-extrabold text-zinc-900 dark:text-white">
            {scoreB}%
          </div>
          <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                scoreB >= scoreA ? "bg-emerald-500" : "bg-amber-500"
              }`}
              style={{ width: `${Math.min(scoreB, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Benchmark Metrics Grid */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          {isPt ? "Métricas Comparativas Detalhadas" : "Detailed Benchmark Metrics"}
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {metrics.map((metric, idx) => {
            const isPositive = metric.improved === true;
            const isNegative = metric.improved === false;

            return (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                    {getMetricIcon(metric.name)}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 block">
                      {metric.name}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      <span>{labelA}: <strong className="text-zinc-700 dark:text-zinc-300">{metric.valueA}</strong></span>
                      <ArrowRight className="w-3 h-3 text-zinc-400" />
                      <span>{labelB}: <strong className="text-zinc-700 dark:text-zinc-300">{metric.valueB}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                      isPositive
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                        : isNegative
                        ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800"
                        : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700"
                    }`}
                  >
                    {String(metric.diff).startsWith("+") || String(metric.diff).startsWith("-")
                      ? metric.diff
                      : `+${metric.diff}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
