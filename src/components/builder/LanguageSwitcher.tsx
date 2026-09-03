"use client";

import React, { useState } from "react";
import type { SupportedLanguage } from "@/types/cv";
import { useTranslation } from "@/hooks/useTranslation";
import { Plus, Check } from "lucide-react";

interface Props {
  activeLang: SupportedLanguage;
  availableLanguages: Array<{ code: string; label: string }>;
  onSwitchLanguage: (lang: SupportedLanguage) => void;
  onAddLanguage: (code: string, label: string) => void;
}

export function LanguageSwitcher({
  activeLang,
  availableLanguages,
  onSwitchLanguage,
  onAddLanguage,
}: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const { t: tr } = useTranslation(activeLang);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newLabel) return;
    onAddLanguage(newCode.toLowerCase().trim(), newLabel.trim());
    setNewCode("");
    setNewLabel("");
    setShowAdd(false);
  };

  return (
    <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
      {/* Pill Language Group */}
      <div className="flex items-center bg-stone-100 dark:bg-[#0d1117] p-0.5 sm:p-1 rounded-full border border-stone-200 dark:border-[#363d47] shadow-2xs shrink-0">
        {availableLanguages.map((l) => (
          <button
            key={l.code}
            onClick={() => onSwitchLanguage(l.code)}
            className={`flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold uppercase transition-all ${
              activeLang === l.code
                ? "bg-white dark:bg-[#21262d] text-stone-900 dark:text-[#f0f3f6] shadow-xs"
                : "text-stone-500 dark:text-[#8b949e] hover:text-stone-900 dark:hover:text-[#f0f3f6]"
            }`}
          >
            <span>{l.code}</span>
          </button>
        ))}

        <button
          onClick={() => setShowAdd(!showAdd)}
          title={tr("common.languages.addNewToCV")}
          aria-label={tr("common.languages.addNewToCV")}
          aria-expanded={showAdd}
          className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-stone-600 dark:text-[#8b949e] hover:text-stone-800 dark:hover:text-[#f0f3f6] text-xs font-bold flex items-center justify-center rounded-full hover:bg-stone-200/60 dark:hover:bg-[#21262d] transition-colors shrink-0 min-w-[24px] min-h-[24px]"
        >
          <Plus size={12} />
        </button>
      </div>

      {showAdd && (
        <form
          onSubmit={handleAdd}
          className="flex items-center gap-1.5 bg-white dark:bg-[#161b22] p-1.5 rounded-full border border-stone-300 dark:border-[#30363d] shadow-md text-xs animate-in fade-in duration-100"
        >
          <input
            type="text"
            placeholder={tr("common.languages.codePlaceholder")}
            aria-label={tr("common.languages.code")}
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            className="w-14 px-2 py-1 border border-stone-200 dark:border-[#363d47] dark:bg-[#0d1117] text-stone-900 dark:text-[#f0f3f6] rounded-full text-xs text-center font-bold uppercase"
            maxLength={3}
            required
          />
          <input
            type="text"
            placeholder={tr("common.languages.namePlaceholder")}
            aria-label={tr("common.languages.name")}
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            className="w-24 px-2 py-1 border border-stone-200 dark:border-[#363d47] dark:bg-[#0d1117] text-stone-900 dark:text-[#f0f3f6] rounded-full text-xs font-medium"
            required
          />
          <button
            type="submit"
            title={tr("common.languages.confirmNew")}
            aria-label={tr("common.languages.confirmNew")}
            className="bg-amber-700 text-white p-1.5 rounded-full hover:bg-amber-800 font-bold transition-colors min-w-[24px] min-h-[24px] flex items-center justify-center"
          >
            <Check size={12} />
          </button>
        </form>
      )}
    </div>
  );
}
