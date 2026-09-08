"use client";

import React, { useState } from "react";
import type { CVDiffResult, DiffStatus } from "@/types/diff";
import type { SupportedLanguage } from "@/types/cv";
import {
  PlusCircle,
  MinusCircle,
  AlertCircle,
  GitMerge,
  Search,
  Check,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface Props {
  diffResult: CVDiffResult;
  lang?: SupportedLanguage;
  onMergeItem?: (sectionType: string, item: any) => void;
}

type FilterMode = "all" | "added" | "modified" | "removed";

export function SemanticDiffView({
  diffResult,
  lang = "en",
  onMergeItem,
}: Props) {
  const isPt = lang === "pt";
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [mergedIds, setMergedIds] = useState<Set<string>>(new Set());
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const { personalInfoDiff, sectionsDiff, summary } = diffResult;

  const handleMerge = (sectionType: string, item: any) => {
    if (!onMergeItem) return;
    onMergeItem(sectionType, item);
    setMergedIds((prev) => new Set(prev).add(item.id));
  };

  const toggleCollapse = (secId: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(secId)) next.delete(secId);
      else next.add(secId);
      return next;
    });
  };

  const matchesFilter = (status: DiffStatus) => {
    if (filterMode === "all") return true;
    return status === filterMode;
  };

  const matchesSearch = (text: string) => {
    if (!searchQuery.trim()) return true;
    return text.toLowerCase().includes(searchQuery.toLowerCase());
  };

  const getStatusBadge = (status: DiffStatus) => {
    switch (status) {
      case "added":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <PlusCircle className="w-3 h-3" />
            {isPt ? "Adicionado" : "Added"}
          </span>
        );
      case "removed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <MinusCircle className="w-3 h-3" />
            {isPt ? "Removido" : "Removed"}
          </span>
        );
      case "modified":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <AlertCircle className="w-3 h-3" />
            {isPt ? "Modificado" : "Modified"}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            {isPt ? "Sem alterações" : "Unchanged"}
          </span>
        );
    }
  };

  // Filter personal info
  const filteredPersonalInfo = personalInfoDiff.filter(
    (f) =>
      f.status !== "unchanged" &&
      matchesFilter(f.status) &&
      (matchesSearch(f.label) || matchesSearch(f.valueA || "") || matchesSearch(f.valueB || ""))
  );

  return (
    <div className="space-y-6">
      {/* Summary Badges & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700/80">
        {/* Change metrics */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 shadow-xs">
            {isPt ? "Total de Alterações" : "Total Changes"}:{" "}
            <strong className="text-zinc-900 dark:text-white font-bold">{summary.totalChanges}</strong>
          </div>
          <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-medium text-emerald-700 dark:text-emerald-300">
            + {summary.additions} {isPt ? "adições" : "additions"}
          </div>
          <div className="px-3 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-xs font-medium text-amber-700 dark:text-amber-300">
            ~ {summary.modifications} {isPt ? "modificações" : "modifications"}
          </div>
          <div className="px-3 py-1 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg text-xs font-medium text-rose-700 dark:text-rose-300">
            - {summary.deletions} {isPt ? "remoções" : "deletions"}
          </div>
        </div>

        {/* Filter toggles & Search */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isPt ? "Filtrar por texto..." : "Filter by keyword..."}
              className="pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400"
            />
          </div>

          <div className="flex items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-0.5">
            {(["all", "added", "modified", "removed"] as FilterMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                  filterMode === mode
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                {mode === "all"
                  ? isPt ? "Todos" : "All"
                  : mode === "added"
                  ? isPt ? "Adições" : "Additions"
                  : mode === "modified"
                  ? isPt ? "Modificações" : "Modified"
                  : isPt ? "Remoções" : "Removals"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Personal Info Diff */}
      {filteredPersonalInfo.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
          <div className="flex items-center justify-between px-5 py-3.5 bg-zinc-50/70 dark:bg-zinc-800/40 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 font-semibold text-sm text-zinc-900 dark:text-zinc-100">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>{isPt ? "Informações Pessoais" : "Personal Information"}</span>
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {filteredPersonalInfo.length} {isPt ? "alterações" : "changes"}
            </span>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filteredPersonalInfo.map((field) => (
              <div key={field.field} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                <div className="flex items-center gap-3">
                  {getStatusBadge(field.status)}
                  <span className="font-medium text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    {field.label}
                  </span>
                </div>

                <div className="flex-1 max-w-2xl text-xs space-y-1 md:space-y-0 md:flex md:items-center md:gap-4">
                  {field.valueA && (
                    <div className="flex-1 p-2 bg-rose-50/70 dark:bg-rose-950/20 rounded border border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-200 line-through">
                      {field.valueA}
                    </div>
                  )}
                  {field.valueB && (
                    <div className="flex-1 p-2 bg-emerald-50/70 dark:bg-emerald-950/20 rounded border border-emerald-200 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200 font-medium">
                      {field.valueB}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sections Diff Tree */}
      <div className="space-y-4">
        {sectionsDiff.map((sec) => {
          const isCollapsed = collapsedSections.has(sec.sectionId);
          const visibleItems = sec.itemsDiff.filter((it) => {
            if (it.status === "unchanged") return false;
            if (!matchesFilter(it.status)) return false;
            if (!matchesSearch(it.title) && !matchesSearch(it.subtitle || "")) return false;
            return true;
          });

          if (sec.status === "unchanged" && visibleItems.length === 0) return null;

          return (
            <div
              key={sec.sectionId}
              className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs"
            >
              {/* Section Header */}
              <button
                onClick={() => toggleCollapse(sec.sectionId)}
                className="w-full flex items-center justify-between px-5 py-3.5 bg-zinc-50/80 dark:bg-zinc-800/40 border-b border-zinc-200 dark:border-zinc-800 text-left hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isCollapsed ? (
                    <ChevronRight className="w-4 h-4 text-zinc-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                  )}
                  <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                    {sec.titleB || sec.titleA || sec.type.toUpperCase()}
                  </span>
                  {getStatusBadge(sec.status)}
                </div>

                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {visibleItems.length} {isPt ? "itens alterados" : "items changed"}
                </span>
              </button>

              {/* Section Items */}
              {!isCollapsed && (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {visibleItems.length === 0 ? (
                    <div className="p-4 text-center text-xs text-zinc-400">
                      {isPt ? "Nenhum item alterado neste filtro." : "No changed items match current filter."}
                    </div>
                  ) : (
                    visibleItems.map((item) => {
                      const isMerged = mergedIds.has(item.id);

                      return (
                        <div
                          key={item.id}
                          className="p-5 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors space-y-3"
                        >
                          {/* Item Title & Actions */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              {getStatusBadge(item.status)}
                              <div>
                                <h5 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                  {item.title}
                                </h5>
                                {item.subtitle && (
                                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                    {item.subtitle}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Selective Merge Button */}
                            {onMergeItem && item.rawItemB && (
                              <button
                                onClick={() => handleMerge(sec.type, item.rawItemB)}
                                disabled={isMerged}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                  isMerged
                                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 cursor-default"
                                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs active:scale-95"
                                }`}
                              >
                                {isMerged ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    {isPt ? "Aplicado ao CV Ativo" : "Applied to Active CV"}
                                  </>
                                ) : (
                                  <>
                                    <GitMerge className="w-3.5 h-3.5" />
                                    {isPt ? "Aplicar ao CV Ativo" : "Apply to Active CV"}
                                  </>
                                )}
                              </button>
                            )}
                          </div>

                          {/* Field level changes */}
                          {item.fieldChanges && item.fieldChanges.length > 0 && (
                            <div className="space-y-1.5 pl-6 border-l-2 border-zinc-200 dark:border-zinc-700">
                              {item.fieldChanges.map((fc) => (
                                <div key={fc.field} className="text-xs flex items-center gap-2">
                                  <span className="font-semibold text-zinc-500 dark:text-zinc-400">{fc.label}:</span>
                                  {fc.valueA && (
                                    <span className="line-through text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded">
                                      {fc.valueA}
                                    </span>
                                  )}
                                  {fc.valueB && (
                                    <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded font-medium">
                                      {fc.valueB}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Bullet level LCS diff */}
                          {item.bulletsDiff && item.bulletsDiff.length > 0 && (
                            <div className="space-y-1 pl-6 pt-1">
                              {item.bulletsDiff.map((b, bIdx) => {
                                if (b.type === "keep") return null;
                                return (
                                  <div
                                    key={bIdx}
                                    className={`flex items-start gap-2 text-xs p-2 rounded ${
                                      b.type === "add"
                                        ? "bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 border-l-2 border-emerald-500"
                                        : "bg-rose-50/80 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 line-through border-l-2 border-rose-500"
                                    }`}
                                  >
                                    <span className="font-mono font-bold text-xs select-none">
                                      {b.type === "add" ? "+" : "-"}
                                    </span>
                                    <span>{b.text}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
